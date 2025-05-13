
'use client';

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, XCircle, ImagePlus } from 'lucide-react';
import { uploadImageAPI, updateProductImagePathAPI } from '@/services/adminApi';
import type { UpdateProductImagePathPayload, UpdateProductImagePathResponse } from '@/types';

interface UploadImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemCode: string;
  itemName: string;
  sClientSecret: string | null; // This is the session token
  onUploadSuccess: (itemCode: string, newImagePath: string) => void;
}

export function UploadImageDialog({
  isOpen,
  onOpenChange,
  itemCode,
  itemName,
  sClientSecret,
  onUploadSuccess,
}: UploadImageDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('File size exceeds 5MB limit.');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setUploadError('Invalid file type. Please select a JPG, PNG, WEBP, or GIF image.');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setUploadError(null);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('No file selected.');
      return;
    }
    if (!sClientSecret) {
      setUploadError('Session token is missing. Please log in again.');
      toast({
        title: 'Authentication Error',
        description: 'Session token is missing. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Step 1: Upload image to get URL
      // uploadImageAPI now directly returns the URL string or throws an error
      const imagePath = await uploadImageAPI(selectedFile);

      if (!imagePath || typeof imagePath !== 'string') {
        throw new Error('Failed to upload image or received an invalid URL.');
      }

      // Step 2: Update product image path
      const updatePayload: UpdateProductImagePathPayload = {
        ITEMCODE: itemCode,
        IMAGEPATH: imagePath,
        SUCCESS_STATUS: '', // API expects these, typically empty from client
        ERROR_STATUS: '',   // API expects these, typically empty from client
      };
      
      const updateResponse = await updateProductImagePathAPI(updatePayload, sClientSecret);

      // Check for SUCCESS_STATUS in the response from the SP handler
      // The exact structure of updateResponse needs to be confirmed. Common patterns:
      // 1. updateResponse.SUCCESS_STATUS directly
      // 2. updateResponse.data.SUCCESS_STATUS if data is an object
      // Assuming updateResponse directly contains SUCCESS_STATUS/ERROR_STATUS as per UpdateProductImagePathResponse type
      if (updateResponse && (updateResponse.SUCCESS_STATUS && updateResponse.SUCCESS_STATUS.toLowerCase().includes('success'))) {
        toast({
          title: 'Upload Successful',
          description: `Image for ${itemName} (Code: ${itemCode}) updated. New path: ${imagePath}`,
        });
        onUploadSuccess(itemCode, imagePath);
        handleDialogClose(false); // Close dialog on success
      } else {
        // If no explicit SUCCESS_STATUS or if ERROR_STATUS is present
        throw new Error(updateResponse?.ERROR_STATUS || 'Failed to update product image path in the database.');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      // Try to get a more specific error message
      let errorMessage = 'An unknown error occurred during upload.';
      if (error.response && error.response.data) {
        // If the error response is an object with a message field
        if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data.ERROR_STATUS === 'string' && error.response.data.ERROR_STATUS.trim() !== '') {
             errorMessage = error.response.data.ERROR_STATUS;
        } else if (typeof error.response.data === 'string') { // If error.response.data is a string
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image for: {itemName}</DialogTitle>
          <DialogDescription>
            Item Code: {itemCode}. Select an image (JPG, PNG, WEBP, GIF, max 5MB).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="image-file" className="sr-only">Choose image</Label>
            <Input
              id="image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          {previewUrl && (
            <div className="mt-4 border rounded-md p-2 bg-muted/50 relative aspect-video max-h-64">
              <Image src={previewUrl} alt="Selected image preview" layout="fill" objectFit="contain" />
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-destructive flex items-center">
              <XCircle className="mr-2 h-4 w-4" />
              {uploadError}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={resetDialog} disabled={isUploading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || !!uploadError}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Upload Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

