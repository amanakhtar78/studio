
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Save, KeyRound } from 'lucide-react';
import type { User, AddressType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdatePasswordDialog } from '@/components/auth/update-password-dialog'; // New component

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }), // Will be read-only
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254700111222" }).optional().or(z.literal('')),
  alternatePhoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format." }).optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(5, { message: "Street address must be at least 5 characters." }).optional().or(z.literal('')),
    city: z.string().min(2, { message: "City must be at least 2 characters." }).optional().or(z.literal('')),
    pinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }).optional().or(z.literal('')),
    country: z.string().min(2, { message: "Country must be at least 2 characters." }).optional().or(z.literal('')),
    addressType: z.enum(['home', 'office', 'other']).optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { user, updateUserProfile, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      address: {
        street: '',
        city: '',
        pinCode: '',
        country: '',
        addressType: undefined,
      },
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        alternatePhoneNumber: user.alternatePhoneNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          pinCode: user.address?.pinCode || '',
          country: user.address?.country || '',
          addressType: user.address?.addressType || undefined,
        },
      });
    }
  }, [user, form]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user) return;

    const updateData: Partial<User> = {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`.trim(), // Update full name
      phoneNumber: data.phoneNumber || undefined,
      alternatePhoneNumber: data.alternatePhoneNumber || undefined,
      address: data.address ? {
        street: data.address.street || '',
        city: data.address.city || '',
        pinCode: data.address.pinCode || '',
        country: data.address.country || '',
        addressType: data.address.addressType || 'home', 
      } : undefined,
    };
    
    const success = await updateUserProfile(updateData); // This will call the updated API logic
    if (success) {
      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully updated.',
      });
    } else {
      // Toast for failure is handled within updateUserProfile in AuthContext
    }
  };

  if (authIsLoading && !user) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center">
        <p className="text-sm">Please log in to edit your profile.</p>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-4 md:py-6">
        <Card className="shadow-lg">
          <CardHeader className="items-center p-4">
            <UserCircle className="h-12 w-12 text-primary mb-2.5" />
            <CardTitle className="text-xl md:text-2xl text-center">Edit Profile</CardTitle>
            <CardDescription className="text-center text-xs">Update your personal information and address.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground border-b pb-1.5 mb-2.5">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input id="firstName" {...form.register('firstName')} className="mt-1 h-9 text-sm" />
                    {form.formState.errors.firstName && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input id="lastName" {...form.register('lastName')} className="mt-1 h-9 text-sm" />
                    {form.formState.errors.lastName && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input id="email" {...form.register('email')} readOnly className="mt-1 h-9 text-sm bg-muted/50 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground mt-0.5">Email cannot be changed.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm">Primary Phone Number</Label>
                    <Input id="phoneNumber" type="tel" {...form.register('phoneNumber')} className="mt-1 h-9 text-sm" placeholder="+254700111222" />
                    {form.formState.errors.phoneNumber && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.phoneNumber.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="alternatePhoneNumber" className="text-sm">Alternate Phone (Optional)</Label>
                    <Input id="alternatePhoneNumber" type="tel" {...form.register('alternatePhoneNumber')} className="mt-1 h-9 text-sm" placeholder="+254700333444" />
                    {form.formState.errors.alternatePhoneNumber && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.alternatePhoneNumber.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-base font-semibold text-foreground border-b pb-1.5 mb-2.5">Address Information</h3>
                <div>
                  <Label htmlFor="address.street" className="text-sm">Street Address</Label>
                  <Input id="address.street" {...form.register('address.street')} className="mt-1 h-9 text-sm" placeholder="e.g. 123 Bakery St, Apt 4B" />
                  {form.formState.errors.address?.street && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.street.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="address.city" className="text-sm">City</Label>
                    <Input id="address.city" {...form.register('address.city')} className="mt-1 h-9 text-sm" placeholder="Nairobi" />
                    {form.formState.errors.address?.city && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.city.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="address.pinCode" className="text-sm">Pin Code</Label>
                    <Input id="address.pinCode" {...form.register('address.pinCode')} className="mt-1 h-9 text-sm" placeholder="00100"/>
                    {form.formState.errors.address?.pinCode && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.pinCode.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="address.country" className="text-sm">Country</Label>
                        <Input id="address.country" {...form.register('address.country')} className="mt-1 h-9 text-sm" placeholder="Kenya"/>
                        {form.formState.errors.address?.country && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.country.message}</p>}
                    </div>
                    <div>
                    <Label htmlFor="address.addressType" className="text-sm">Address Type</Label>
                    <Controller
                        control={form.control}
                        name="address.addressType"
                        render={({ field }) => (
                        <Select
                            onValueChange={(value) => field.onChange(value as AddressType)}
                            value={field.value}
                        >
                            <SelectTrigger id="address.addressType" className="mt-1 h-9 text-sm">
                            <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {form.formState.errors.address?.addressType && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.addressType.message}</p>}
                    </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2.5" disabled={form.formState.isSubmitting || authIsLoading}>
                  {form.formState.isSubmitting || authIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPasswordDialogOpen(true)} className="flex-1 text-sm py-2.5" disabled={authIsLoading}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <UpdatePasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
    </>
  );
}
