
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import type { AddressType, SignupData } from '@/types';
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
  name: z.string().min(2, { message: "Name must be at least 2 characters."}), // Full Name
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type SignupCredentialFormData = z.infer<typeof signupCredentialSchema>;

const signupAddressSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254712345678" }).optional().or(z.literal('')),
  addressStreet: z.string().min(5, { message: "Street address must be at least 5 characters." }),
  addressCity: z.string().min(2, { message: "City must be at least 2 characters." }),
  addressPinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  addressType: z.enum(['home', 'office', 'other'], { required_error: "Please select an address type." }),
});
type SignupAddressFormData = z.infer<typeof signupAddressSchema>;

// Combined schema for full validation if done in one go, or for type `FullSignupFormData`
const fullSignupFormSchema = signupCredentialSchema.merge(signupAddressSchema);
type FullSignupFormData = z.infer<typeof fullSignupFormSchema>;


export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { login, signup, isLoading: authIsLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1); // 1 for credentials, 2 for address
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Store step 1 data temporarily
  const [credentialData, setCredentialData] = useState<Partial<SignupData>>({});


  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<FullSignupFormData>({
    resolver: zodResolver(fullSignupFormSchema), 
    defaultValues: {
      name: '', email: '', password: '',
      phoneNumber: '', addressStreet: '', addressCity: '', addressPinCode: '', country: '', addressType: undefined,
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

  // Handle "Next" from step 1 (credentials)
  const handleSignupNextStep = async () => {
    const isValid = await signupForm.trigger(['name', 'email', 'password']);
    if (isValid) {
      setCredentialData({
        name: signupForm.getValues('name'),
        email: signupForm.getValues('email'),
        password: signupForm.getValues('password'),
      });
      setSignupStep(2);
    }
  };
  
  // Handle final "Create Account" from step 2 (address)
  const handleFullSignupSubmit: SubmitHandler<FullSignupFormData> = async (dataFromStep2) => {
    setIsSubmitting(true);
    // Combine data from step 1 (credentialData) and step 2 (dataFromStep2)
    const fullSignupPayload: SignupData = {
      ...credentialData, // name, email, password
      phoneNumber: dataFromStep2.phoneNumber,
      addressStreet: dataFromStep2.addressStreet,
      addressCity: dataFromStep2.addressCity,
      addressPinCode: dataFromStep2.addressPinCode,
      country: dataFromStep2.country,
      addressType: dataFromStep2.addressType,
    };

    const success = await signup(fullSignupPayload);
    if (success) {
      signupForm.reset();
      closeModalAndReset();
    }
    setIsSubmitting(false);
  };
  
  const closeModalAndReset = () => {
    closeModal();
    setActiveTab('login'); // Reset to login tab
    setSignupStep(1);
    setCredentialData({});
    loginForm.reset();
    signupForm.reset();
    // Clear any errors manually if needed, though reset usually does this
    loginForm.clearErrors();
    signupForm.clearErrors();
  };

  const currentFormLoading = isSubmitting || authIsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModalAndReset()}>
      <DialogContent className="sm:max-w-sm bg-card p-5">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            {activeTab === 'login' ? 'Welcome Back!' : 
             (signupStep === 1 ? 'Create Your Account' : 'Delivery Information')}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {activeTab === 'login' 
              ? "Log in to continue or create an account if you're new!"
              : (signupStep === 1 
                  ? "Join us to enjoy delicious treats and track orders."
                  : "Tell us where to send your goodies!")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as 'login' | 'signup'); setSignupStep(1); setCredentialData({}); signupForm.reset();}} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
            <TabsTrigger value="login" className="text-xs">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
              <div>
                <Label htmlFor="login-email" className="text-xs">Email</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" {...loginForm.register('email')} className="mt-0.5 h-9 text-sm" />
                {loginForm.formState.errors.email && <p className="text-xs text-destructive mt-0.5">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="login-password" className="text-xs">Password</Label>
                <Input id="login-password" type="password" placeholder="••••••••" {...loginForm.register('password')} className="mt-0.5 h-9 text-sm" />
                {loginForm.formState.errors.password && <p className="text-xs text-destructive mt-0.5">{loginForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm" disabled={currentFormLoading}>
                {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            {signupStep === 1 && (
              <form onSubmit={signupForm.handleSubmit(handleSignupNextStep)} className="space-y-3">
                <div>
                  <Label htmlFor="signup-name" className="text-xs">Full Name</Label>
                  <Input id="signup-name" placeholder="Zahra Ali" {...signupForm.register('name')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.name && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-xs">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" {...signupForm.register('email')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.email && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-xs">Password</Label>
                  <Input id="signup-password" type="password" placeholder="Choose a strong password" {...signupForm.register('password')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.password && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm" disabled={currentFormLoading}>
                  {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Next
                </Button>
              </form>
            )}

            {signupStep === 2 && (
              <form onSubmit={signupForm.handleSubmit(handleFullSignupSubmit)} className="space-y-3">
                <div>
                  <Label htmlFor="signup-phone" className="text-xs">Phone Number (Optional)</Label>
                  <Input id="signup-phone" type="tel" placeholder="+254712345678" {...signupForm.register('phoneNumber')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.phoneNumber && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.phoneNumber.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-street" className="text-xs">Street Address</Label>
                  <Input id="signup-street" placeholder="123 Bakery Lane, Apt 4B" {...signupForm.register('addressStreet')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.addressStreet && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.addressStreet.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="signup-city" className="text-xs">City</Label>
                    <Input id="signup-city" placeholder="Nairobi" {...signupForm.register('addressCity')} className="mt-0.5 h-9 text-sm" />
                    {signupForm.formState.errors.addressCity && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.addressCity.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="signup-pincode" className="text-xs">Pin Code</Label>
                    <Input id="signup-pincode" placeholder="00100" {...signupForm.register('addressPinCode')} className="mt-0.5 h-9 text-sm" />
                    {signupForm.formState.errors.addressPinCode && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.addressPinCode.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-country" className="text-xs">Country</Label>
                  <Input id="signup-country" placeholder="Kenya" {...signupForm.register('country')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.country && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.country.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-address-type" className="text-xs">Address Type</Label>
                   <Controller
                        control={signupForm.control}
                        name="addressType"
                        render={({ field }) => (
                           <Select 
                              onValueChange={(value) => field.onChange(value as AddressType)}
                              value={field.value}
                            >
                            <SelectTrigger id="signup-address-type" className="mt-0.5 h-9 text-sm">
                              <SelectValue placeholder="Select address type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home" className="text-sm">Home</SelectItem>
                              <SelectItem value="office" className="text-sm">Office</SelectItem>
                              <SelectItem value="other" className="text-sm">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                    />
                  {signupForm.formState.errors.addressType && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.addressType.message}</p>}
                </div>

                <div className="flex space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSignupStep(1)} className="w-1/3 text-sm">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Previous
                    </Button>
                    <Button type="submit" size="sm" className="w-2/3 bg-accent hover:bg-accent/90 text-accent-foreground text-sm" disabled={currentFormLoading}>
                        {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Account
                    </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-3">
           <p className="text-[10px] text-muted-foreground text-center w-full">
             For demo: use email <strong className="text-foreground">test@gmail.com</strong> and password <strong className="text-foreground">test</strong> to login.
           </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
