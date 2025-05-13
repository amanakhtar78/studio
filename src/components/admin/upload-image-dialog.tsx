
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
      const imagePath = await uploadImageAPI(selectedFile);

      if (!imagePath || typeof imagePath !== 'string') {
        throw new Error('Failed to upload image or received an invalid URL.');
      }

      // Step 2: Update product image path
      const updatePayload: UpdateProductImagePathPayload = {
        ITEMCODE: itemCode,
        IMAGEPATH: imagePath,
        SUCCESS_STATUS: '', 
        ERROR_STATUS: '',   
      };
      
      const updateResponse = await updateProductImagePathAPI(updatePayload, sClientSecret);

      // Check if the response indicates success (e.g., message includes "Document Saved")
      // The API returns HTTP 201 with { "message": "Document Saved" } on success
      if (updateResponse && updateResponse.message && updateResponse.message.toLowerCase().includes('document saved')) {
        toast({
          title: 'Upload Successful',
          description: `Image for ${itemName} (Code: ${itemCode}) updated.`,
        });
        onUploadSuccess(itemCode, imagePath);
        handleDialogClose(false); // Close dialog on success
      } else {
        // This case handles 2xx responses that aren't the expected success message
        const errorMessage = updateResponse?.message || 'Failed to update product image path. Unexpected response from server.';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Upload error details:', error);
      let displayErrorMessage = 'An unknown error occurred during the update phase.';

      if (error.response && error.response.data && error.response.data.message) {
        // Error from Axios (e.g., 4xx, 5xx from the SP handler API)
        displayErrorMessage = error.response.data.message;
      } else if (error.message) {
        // Error thrown manually (e.g., from the 'else' block above) or other JS errors
        displayErrorMessage = error.message;
      }
      
      setUploadError(displayErrorMessage);
      toast({
        title: 'Update Failed',
        description: displayErrorMessage,
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

