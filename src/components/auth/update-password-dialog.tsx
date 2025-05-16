
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
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
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface UpdatePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePasswordDialog({ isOpen, onOpenChange }: UpdatePasswordDialogProps) {
  const { changePassword, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit: SubmitHandler<UpdatePasswordFormData> = async (data) => {
    const success = await changePassword(data.currentPassword, data.newPassword);
    if (success) {
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
      });
      form.reset();
      onOpenChange(false); // Close dialog on success
    }
    // Failure toast is handled within changePassword in AuthContext
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset(); // Reset form when dialog is closed
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                {...form.register('currentPassword')}
                className="mt-1 pr-10"
                disabled={authIsLoading}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showCurrentPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
             <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...form.register('newPassword')}
                className="mt-1 pr-10"
                disabled={authIsLoading}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showNewPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showConfirmNewPassword ? 'text' : 'password'}
                {...form.register('confirmNewPassword')}
                className="mt-1 pr-10"
                disabled={authIsLoading}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showConfirmNewPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
            {form.formState.errors.confirmNewPassword && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.confirmNewPassword.message}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={authIsLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={authIsLoading || form.formState.isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {authIsLoading || form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
