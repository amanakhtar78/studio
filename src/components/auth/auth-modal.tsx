
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { AddressType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
type LoginFormData = z.infer<typeof loginSchema>;

const signupCredentialSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type SignupCredentialFormData = z.infer<typeof signupCredentialSchema>;

const signupAddressSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254712345678" }),
  addressStreet: z.string().min(5, { message: "Street address must be at least 5 characters." }),
  addressCity: z.string().min(2, { message: "City must be at least 2 characters." }),
  addressPinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }),
  addressType: z.enum(['home', 'office', 'other'], { required_error: "Please select an address type." }),
});
type SignupAddressFormData = z.infer<typeof signupAddressSchema>;

// Combined type for the full signup process
type FullSignupFormData = SignupCredentialFormData & SignupAddressFormData;


export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { login, signup, isLoading: authIsLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1); // 1 for credentials, 2 for address
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentialData, setCredentialData] = useState<SignupCredentialFormData | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Use a single form for multi-step signup, validating progressively
  const signupForm = useForm<FullSignupFormData>({
    resolver: zodResolver(signupCredentialSchema.merge(signupAddressSchema)), // Merge schemas for full validation if needed
    defaultValues: {
      name: '', email: '', password: '',
      phoneNumber: '', addressStreet: '', addressCity: '', addressPinCode: '', addressType: undefined,
    },
  });

  const handleLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    if (success) {
      loginForm.reset();
      closeModalAndReset();
    }
    setIsSubmitting(false);
  };

  const handleSignupNextStep: SubmitHandler<SignupCredentialFormData> = async (data) => {
    // This is called when "Next" is clicked in step 1
    // Validate only credential fields first
    const isValid = await signupForm.trigger(['name', 'email', 'password']);
    if (isValid) {
      setCredentialData(data);
      setSignupStep(2);
    }
  };

  const handleFullSignupSubmit: SubmitHandler<FullSignupFormData> = async (data) => {
    // This is called when "Create Account" is clicked in step 2
    setIsSubmitting(true);
    const fullData = { ...credentialData, ...data }; // Combine data from both steps

    const success = await signup(fullData); // Call the auth context signup
    if (success) {
      signupForm.reset();
      closeModalAndReset();
    }
    setIsSubmitting(false);
  };
  
  const closeModalAndReset = () => {
    closeModal();
    setSignupStep(1);
    setCredentialData(null);
    // Consider resetting forms if they are not reset by submit handlers on success
    loginForm.reset();
    signupForm.reset();
  };


  const currentFormLoading = isSubmitting || authIsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModalAndReset()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            {activeTab === 'login' ? 'Welcome Back!' : 
             (signupStep === 1 ? 'Create Your Account' : 'Delivery Information')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {activeTab === 'login' 
              ? "Log in to continue or create an account if you're new!"
              : (signupStep === 1 
                  ? "Join us to enjoy delicious treats and track orders."
                  : "Tell us where to send your goodies!")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as 'login' | 'signup'); setSignupStep(1);}} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" {...loginForm.register('email')} className="mt-1" />
                {loginForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="••••••••" {...loginForm.register('password')} className="mt-1" />
                {loginForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={currentFormLoading}>
                {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            {signupStep === 1 && (
              <form onSubmit={signupForm.handleSubmit(handleSignupNextStep)} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" placeholder="Zahra Ali" {...signupForm.register('name')} className="mt-1" />
                  {signupForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" {...signupForm.register('email')} className="mt-1" />
                  {signupForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Choose a strong password" {...signupForm.register('password')} className="mt-1" />
                  {signupForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={currentFormLoading}>
                  {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Next
                </Button>
              </form>
            )}

            {signupStep === 2 && (
              <form onSubmit={signupForm.handleSubmit(handleFullSignupSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input id="signup-phone" type="tel" placeholder="+254712345678" {...signupForm.register('phoneNumber')} className="mt-1" />
                  {signupForm.formState.errors.phoneNumber && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.phoneNumber.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-street">Street Address</Label>
                  <Input id="signup-street" placeholder="123 Bakery Lane, Apt 4B" {...signupForm.register('addressStreet')} className="mt-1" />
                  {signupForm.formState.errors.addressStreet && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.addressStreet.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-city">City</Label>
                    <Input id="signup-city" placeholder="Nairobi" {...signupForm.register('addressCity')} className="mt-1" />
                    {signupForm.formState.errors.addressCity && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.addressCity.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="signup-pincode">Pin Code</Label>
                    <Input id="signup-pincode" placeholder="00100" {...signupForm.register('addressPinCode')} className="mt-1" />
                    {signupForm.formState.errors.addressPinCode && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.addressPinCode.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-address-type">Address Type</Label>
                   <Select 
                      onValueChange={(value) => signupForm.setValue('addressType', value as AddressType, { shouldValidate: true })}
                      defaultValue={signupForm.getValues('addressType')}
                    >
                    <SelectTrigger id="signup-address-type" className="mt-1">
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {signupForm.formState.errors.addressType && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.addressType.message}</p>}
                </div>

                <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={() => setSignupStep(1)} className="w-1/3">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button type="submit" className="w-2/3 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={currentFormLoading}>
                        {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Account
                    </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
            <p className="text-xs text-muted-foreground text-center w-full">
                For demo: use <strong className="text-foreground">test@gmail.com</strong> and password <strong className="text-foreground">test</strong> to login.
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
