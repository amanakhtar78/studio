
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Save } from 'lucide-react';
import type { User, AddressType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }), // Will be read-only
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format." }).optional().or(z.literal('')),
  alternatePhoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format." }).optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(5, { message: "Street address must be at least 5 characters." }).optional().or(z.literal('')),
    city: z.string().min(2, { message: "City must be at least 2 characters." }).optional().or(z.literal('')),
    pinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }).optional().or(z.literal('')),
    addressType: z.enum(['home', 'office', 'other']).optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { user, updateUserProfile, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      address: {
        street: '',
        city: '',
        pinCode: '',
        addressType: undefined,
      },
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        alternatePhoneNumber: user.alternatePhoneNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          pinCode: user.address?.pinCode || '',
          addressType: user.address?.addressType || undefined,
        },
      });
    }
  }, [user, form]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user) return;

    // Prepare data for update, ensuring empty strings for optional fields are handled if necessary
    const updateData: Partial<User> = {
      name: data.name,
      // email is not updated typically, or needs verification flow
      phoneNumber: data.phoneNumber || undefined,
      alternatePhoneNumber: data.alternatePhoneNumber || undefined,
      address: data.address ? {
        street: data.address.street || '',
        city: data.address.city || '',
        pinCode: data.address.pinCode || '',
        addressType: data.address.addressType || 'home', // default if undefined
      } : undefined,
    };
    
    const success = await updateUserProfile(updateData);
    if (success) {
      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully updated.',
      });
    } else {
      toast({
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authIsLoading && !user) {
    return (
      <div className="container max-w-screen-md mx-auto px-4 md:px-6 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This should ideally be handled by AuthenticatedLayout redirecting to login
    return (
      <div className="container max-w-screen-md mx-auto px-4 md:px-6 py-12 text-center">
        <p>Please log in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-md mx-auto px-4 md:px-6 py-8 md:py-12">
      <Card className="shadow-xl">
        <CardHeader className="items-center">
          <UserCircle className="h-16 w-16 text-primary mb-3" />
          <CardTitle className="text-2xl md:text-3xl text-center">Edit Profile</CardTitle>
          <CardDescription className="text-center">Update your personal information and address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register('name')} className="mt-1" />
                  {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" {...form.register('email')} readOnly className="mt-1 bg-muted/50 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Primary Phone Number</Label>
                  <Input id="phoneNumber" type="tel" {...form.register('phoneNumber')} className="mt-1" placeholder="+254700111222" />
                  {form.formState.errors.phoneNumber && <p className="text-sm text-destructive mt-1">{form.formState.errors.phoneNumber.message}</p>}
                </div>
                <div>
                  <Label htmlFor="alternatePhoneNumber">Alternate Phone Number (Optional)</Label>
                  <Input id="alternatePhoneNumber" type="tel" {...form.register('alternatePhoneNumber')} className="mt-1" placeholder="+254700333444" />
                  {form.formState.errors.alternatePhoneNumber && <p className="text-sm text-destructive mt-1">{form.formState.errors.alternatePhoneNumber.message}</p>}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-3">Address Information</h3>
              <div>
                <Label htmlFor="address.street">Street Address</Label>
                <Input id="address.street" {...form.register('address.street')} className="mt-1" placeholder="e.g. 123 Bakery St, Apt 4B" />
                {form.formState.errors.address?.street && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.street.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address.city">City</Label>
                  <Input id="address.city" {...form.register('address.city')} className="mt-1" placeholder="Nairobi" />
                  {form.formState.errors.address?.city && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.city.message}</p>}
                </div>
                <div>
                  <Label htmlFor="address.pinCode">Pin Code</Label>
                  <Input id="address.pinCode" {...form.register('address.pinCode')} className="mt-1" placeholder="00100"/>
                  {form.formState.errors.address?.pinCode && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.pinCode.message}</p>}
                </div>
                <div>
                  <Label htmlFor="address.addressType">Address Type</Label>
                  <Controller
                    control={form.control}
                    name="address.addressType"
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange(value as AddressType)}
                        value={field.value}
                      >
                        <SelectTrigger id="address.addressType" className="mt-1">
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
                  {form.formState.errors.address?.addressType && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.addressType.message}</p>}
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3" disabled={form.formState.isSubmitting || authIsLoading}>
              {form.formState.isSubmitting || authIsLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
