
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
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Simple validation for demo
});
type LoginFormData = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type SignupFormData = z.infer<typeof signupSchema>;


export function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();
  const { login, /*signup,*/ isLoading: authIsLoading } = useAuth(); // Renamed isLoading to authIsLoading
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  const [isSubmitting, setIsSubmitting] = useState(false);


  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    if (success) {
      loginForm.reset();
      closeModal();
    }
    setIsSubmitting(false);
  };

  const handleSignup: SubmitHandler<SignupFormData> = async (data) => {
    setIsSubmitting(true);
    // const success = await signup(data.email, data.password, data.name);
    // For now, signup is mocked as successful and logs in the test user.
    // In a real app, replace with actual signup logic.
    console.log("Signup attempt (mocked):", data);
    const success = await login(data.email, "test"); // Simulate successful signup by logging in test user
    if (success) {
      signupForm.reset();
      closeModal();
    } else {
       // If login (as mock signup) fails, it means the email might not be the test user's
       signupForm.setError("email", { type: "manual", message: "Mock signup failed. Try test@gmail.com with any password for demo." });
    }
    setIsSubmitting(false);
  };

  const currentFormLoading = isSubmitting || authIsLoading;


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {activeTab === 'login' 
              ? "Please log in to continue or create an account if you're new!"
              : "Join us to enjoy delicious treats and track your orders easily."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
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
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
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
                Create Account
              </Button>
            </form>
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