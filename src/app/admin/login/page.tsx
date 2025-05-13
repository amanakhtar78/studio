
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { loginAdmin } from '@/store/slices/adminAuthSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { isAdminAuthenticated, isLoading, error } = useSelector((state: RootState) => state.adminAuth);

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAdminAuthenticated, router]);

  const onSubmit: SubmitHandler<AdminLoginFormData> = async (data) => {
    const resultAction = await dispatch(loginAdmin(data));
    if (loginAdmin.fulfilled.match(resultAction)) {
      toast({
        title: 'Login Successful',
        description: `Welcome, ${resultAction.payload.user.userCode}!`,
      });
      // Navigation is handled by useEffect
    } else if (loginAdmin.rejected.match(resultAction)) {
      toast({
        title: 'Login Failed',
        description: resultAction.payload || 'An error occurred during login.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center p-6">
          <SweetRollsLogo />
          <CardTitle className="text-2xl font-bold mt-2">Admin Portal</CardTitle>
          <CardDescription>Log in to manage Zahra Sweet Rolls.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...form.register('email')}
                className="mt-1"
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
                className="mt-1"
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            {error && !isLoading && (
                 <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{error}</p>
            )}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        This is the ECOMMERCE module admin login. <br/> For demo: use email <strong className="text-foreground">zahra@gbsafrica.net</strong> and password <strong className="text-foreground">zahra</strong>.
      </p>
    </div>
  );
}
