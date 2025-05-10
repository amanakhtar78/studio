
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
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 flex justify-center"> {/* Reduced padding */}
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This should ideally be handled by AuthenticatedLayout redirecting to login
    return (
      <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-8 text-center"> {/* Reduced padding */}
        <p className="text-sm">Please log in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-md mx-auto px-2 md:px-4 py-4 md:py-6"> {/* Reduced padding */}
      <Card className="shadow-lg">
        <CardHeader className="items-center p-4"> {/* Reduced padding */}
          <UserCircle className="h-12 w-12 text-primary mb-2.5" /> {/* Reduced icon size and margin */}
          <CardTitle className="text-xl md:text-2xl text-center">Edit Profile</CardTitle> {/* Reduced font size */}
          <CardDescription className="text-center text-xs">Update your personal information and address.</CardDescription> {/* Reduced font size */}
        </CardHeader>
        <CardContent className="p-4"> {/* Reduced padding */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5"> {/* Reduced spacing */}
            {/* Personal Information Section */}
            <div className="space-y-3"> {/* Reduced spacing */}
              <h3 className="text-base font-semibold text-foreground border-b pb-1.5 mb-2.5">Personal Information</h3> {/* Reduced font size, padding, margin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Reduced gap */}
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input id="name" {...form.register('name')} className="mt-1 h-9 text-sm" /> {/* Reduced height, font size */}
                  {form.formState.errors.name && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.name.message}</p>} {/* Reduced font size and margin */}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input id="email" {...form.register('email')} readOnly className="mt-1 h-9 text-sm bg-muted/50 cursor-not-allowed" /> {/* Reduced height, font size */}
                  <p className="text-xs text-muted-foreground mt-0.5">Email cannot be changed.</p> {/* Reduced font size and margin */}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Reduced gap */}
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm">Primary Phone Number</Label>
                  <Input id="phoneNumber" type="tel" {...form.register('phoneNumber')} className="mt-1 h-9 text-sm" placeholder="+254700111222" /> {/* Reduced height, font size */}
                  {form.formState.errors.phoneNumber && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.phoneNumber.message}</p>} {/* Reduced font size and margin */}
                </div>
                <div>
                  <Label htmlFor="alternatePhoneNumber" className="text-sm">Alternate Phone (Optional)</Label>
                  <Input id="alternatePhoneNumber" type="tel" {...form.register('alternatePhoneNumber')} className="mt-1 h-9 text-sm" placeholder="+254700333444" /> {/* Reduced height, font size */}
                  {form.formState.errors.alternatePhoneNumber && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.alternatePhoneNumber.message}</p>} {/* Reduced font size and margin */}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-3"> {/* Reduced spacing */}
               <h3 className="text-base font-semibold text-foreground border-b pb-1.5 mb-2.5">Address Information</h3> {/* Reduced font size, padding, margin */}
              <div>
                <Label htmlFor="address.street" className="text-sm">Street Address</Label>
                <Input id="address.street" {...form.register('address.street')} className="mt-1 h-9 text-sm" placeholder="e.g. 123 Bakery St, Apt 4B" /> {/* Reduced height, font size */}
                {form.formState.errors.address?.street && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.street.message}</p>} {/* Reduced font size and margin */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3"> {/* Reduced gap */}
                <div>
                  <Label htmlFor="address.city" className="text-sm">City</Label>
                  <Input id="address.city" {...form.register('address.city')} className="mt-1 h-9 text-sm" placeholder="Nairobi" /> {/* Reduced height, font size */}
                  {form.formState.errors.address?.city && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.city.message}</p>} {/* Reduced font size and margin */}
                </div>
                <div>
                  <Label htmlFor="address.pinCode" className="text-sm">Pin Code</Label>
                  <Input id="address.pinCode" {...form.register('address.pinCode')} className="mt-1 h-9 text-sm" placeholder="00100"/> {/* Reduced height, font size */}
                  {form.formState.errors.address?.pinCode && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.pinCode.message}</p>} {/* Reduced font size and margin */}
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
                        <SelectTrigger id="address.addressType" className="mt-1 h-9 text-sm"> {/* Reduced height, font size */}
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
                  {form.formState.errors.address?.addressType && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.addressType.message}</p>} {/* Reduced font size and margin */}
                </div>
              </div>
            </div>
            
            <Button type="submit" size="sm" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2.5" disabled={form.formState.isSubmitting || authIsLoading}> {/* Reduced size, font size, padding */}
              {form.formState.isSubmitting || authIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
