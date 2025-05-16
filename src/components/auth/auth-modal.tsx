
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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

const signupFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required."}),
  lastName: z.string().min(1, { message: "Last name is required."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, {message: "Confirm password must be at least 6 characters."}),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,14}$/, { message: "Invalid phone number format. e.g. +254712345678" }).optional().or(z.literal('')),
  addressStreet: z.string().min(5, { message: "Street address must be at least 5 characters." }).optional().or(z.literal('')),
  addressCity: z.string().min(2, { message: "City must be at least 2 characters." }).optional().or(z.literal('')),
  addressPinCode: z.string().regex(/^[0-9]{4,6}$/, { message: "Invalid pin code." }).optional().or(z.literal('')),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }).optional().or(z.literal('')),
  addressType: z.enum(['home', 'office', 'other'], { required_error: "Please select an address type." }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});
type SignupFormData = z.infer<typeof signupFormSchema>;


export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { login, signup, isLoading: authIsLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<SignupFormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema), 
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
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
  
  const onSignupFormSubmit: SubmitHandler<SignupFormData> = (data) => {
    setPendingSignupData(data);
    setIsConfirmAlertOpen(true);
  };

  const handleConfirmSignup = async () => {
    if (!pendingSignupData) return;
    setIsConfirmAlertOpen(false);
    setIsSubmitting(true);
    
    const signupPayload: SignupData = {
      firstName: pendingSignupData.firstName,
      lastName: pendingSignupData.lastName,
      email: pendingSignupData.email,
      password: pendingSignupData.password,
      // confirmPassword is not sent to API but validated client-side
      phoneNumber: pendingSignupData.phoneNumber || undefined, // Ensure optional fields are handled
      addressStreet: pendingSignupData.addressStreet || undefined,
      addressCity: pendingSignupData.addressCity || undefined,
      addressPinCode: pendingSignupData.addressPinCode || undefined,
      country: pendingSignupData.country || undefined,
      addressType: pendingSignupData.addressType || undefined,
    };

    const success = await signup(signupPayload);
    if (success) {
      signupForm.reset();
      closeModalAndReset();
    }
    setIsSubmitting(false);
    setPendingSignupData(null);
  };
  
  const closeModalAndReset = () => {
    closeModal();
    setActiveTab('login');
    loginForm.reset();
    signupForm.reset();
    loginForm.clearErrors();
    signupForm.clearErrors();
    setIsConfirmAlertOpen(false);
    setPendingSignupData(null);
    setShowPassword(false);
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
  };

  const currentFormLoading = isSubmitting || authIsLoading;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModalAndReset()}>
      <DialogContent className="sm:max-w-md bg-card p-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {activeTab === 'login' 
              ? "Log in to continue or create an account if you're new!"
              : "Join us to enjoy delicious treats and track orders."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as 'login' | 'signup'); signupForm.reset(); loginForm.reset();}} className="w-full">
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
                <div className="relative">
                  <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...loginForm.register('password')} className="mt-0.5 h-9 text-sm pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                {loginForm.formState.errors.password && <p className="text-xs text-destructive mt-0.5">{loginForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm" disabled={currentFormLoading}>
                {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit(onSignupFormSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="signup-firstName" className="text-xs">First Name</Label>
                  <Input id="signup-firstName" placeholder="Zahra" {...signupForm.register('firstName')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.firstName && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-lastName" className="text-xs">Last Name</Label>
                  <Input id="signup-lastName" placeholder="Ali" {...signupForm.register('lastName')} className="mt-0.5 h-9 text-sm" />
                  {signupForm.formState.errors.lastName && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="signup-email" className="text-xs">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" {...signupForm.register('email')} className="mt-0.5 h-9 text-sm" />
                {signupForm.formState.errors.email && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-xs">Password</Label>
                <div className="relative">
                  <Input id="signup-password" type={showSignupPassword ? 'text' : 'password'} placeholder="Choose a strong password" {...signupForm.register('password')} className="mt-0.5 h-9 text-sm pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     <span className="sr-only">{showSignupPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                {signupForm.formState.errors.password && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="signup-confirmPassword" className="text-xs">Confirm Password</Label>
                 <div className="relative">
                  <Input id="signup-confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" {...signupForm.register('confirmPassword')} className="mt-0.5 h-9 text-sm pr-10" />
                   <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                {signupForm.formState.errors.confirmPassword && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.confirmPassword.message}</p>}
              </div>
              
              <h4 className="text-sm font-medium text-muted-foreground pt-2 border-t mt-4">Contact & Address (Optional)</h4>
              
              <div>
                <Label htmlFor="signup-phone" className="text-xs">Phone Number</Label>
                <Input id="signup-phone" type="tel" placeholder="+254712345678" {...signupForm.register('phoneNumber')} className="mt-0.5 h-9 text-sm" />
                {signupForm.formState.errors.phoneNumber && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.phoneNumber.message}</p>}
              </div>
              <div>
                <Label htmlFor="signup-street" className="text-xs">Street Address</Label>
                <Input id="signup-street" placeholder="123 Bakery Lane, Apt 4B" {...signupForm.register('addressStreet')} className="mt-0.5 h-9 text-sm" />
                {signupForm.formState.errors.addressStreet && <p className="text-xs text-destructive mt-0.5">{signupForm.formState.errors.addressStreet.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

              <Button type="submit" size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm" disabled={currentFormLoading}>
                  {currentFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-3">
           {activeTab === 'login' && (
            <p className="text-[10px] text-muted-foreground text-center w-full">
                For demo: use email <strong className="text-foreground">test78@gmail.com</strong> and password <strong className="text-foreground">test78</strong> to login.
            </p>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isConfirmAlertOpen} onOpenChange={setIsConfirmAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Signup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these details and create your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSignupData(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSignup} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
    
