
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import type { User } from '@/types';
import { useAuth } from '@/context/auth-context'; // For verifying password

const confirmPasswordSchema = z.object({
  password: z.string().min(1, { message: "Password is required." }),
});
type ConfirmPasswordFormData = z.infer<typeof confirmPasswordSchema>;

interface ConfirmPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileDataToSave: Partial<User>;
  onConfirmedSave: (password: string, data: Partial<User>) => Promise<boolean>;
}

export function ConfirmPasswordDialog({
  isOpen,
  onOpenChange,
  profileDataToSave,
  onConfirmedSave,
}: ConfirmPasswordDialogProps) {
  const { toast } = useToast();
  const { user, isLoading: authIsLoading } = useAuth(); // To get current user's email for verification
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<ConfirmPasswordFormData>({
    resolver: zodResolver(confirmPasswordSchema),
    defaultValues: { password: '' },
  });

  const onSubmit: SubmitHandler<ConfirmPasswordFormData> = async (data) => {
    if (!user) {
        toast({ title: "Error", description: "User not found.", variant: "destructive" });
        return;
    }
    setIsVerifying(true);
    
    // Use the login function's internal API call for verification,
    // or if you have a dedicated verifyPassword function, use that.
    // For now, we'll assume `fetchAuthenticatedUserAPI` is suitable if exposed or similar logic is available.
    // This part is conceptual; actual verification API call depends on your `AuthContext` setup.

    try {
        // Simulate verification - in a real app, call an API like:
        // const isValid = await verifyCurrentUserPassword(data.password); 
        // For now, let's call the onConfirmedSave directly, assuming the parent handles actual full update.
        // The parent (EditProfilePage) will call the actual `updateUserProfile` which includes the password.
        
        const success = await onConfirmedSave(data.password, profileDataToSave);
        if (success) {
          toast({
            title: 'Profile Update Initiated',
            description: 'Your profile changes are being saved.',
          });
          form.reset();
          onOpenChange(false); // Close dialog on success
        } else {
           // Error toast is handled by onConfirmedSave or updateUserProfile
        }
    } catch (error: any) {
         toast({
            title: 'Verification Failed',
            description: error.message || 'An error occurred during password verification.',
            variant: 'destructive',
        });
    } finally {
        setIsVerifying(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset(); 
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Confirm Changes
          </DialogTitle>
          <DialogDescription>
            To save your profile changes, please enter your current password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="confirm-dialog-password">Current Password</Label>
            <div className="relative mt-1">
              <Input
                id="confirm-dialog-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                {...form.register('password')}
                className="pr-10"
                disabled={isVerifying || authIsLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying || authIsLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isVerifying || authIsLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isVerifying || authIsLoading || form.formState.isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isVerifying || authIsLoading || form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm & Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
