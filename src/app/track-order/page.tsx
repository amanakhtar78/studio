
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function TrackOrderPage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || authIsLoading) return;

    if (isAuthenticated) {
      router.replace('/my-orders'); // Use replace to avoid adding to history
    } else {
      // If not authenticated, the AuthModal will be triggered by Navbar or other interactions.
      // This page can show a prompt to login.
      // Or, we can directly open the modal here if preferred.
      // For now, let's ensure the modal is opened if not authenticated.
      openModal();
    }
  }, [isAuthenticated, authIsLoading, router, openModal, isMounted]);
  
  if (!isMounted || authIsLoading) {
    return (
      <div className="container max-w-screen-md mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }


  // This content will briefly show if not authenticated and not yet redirected, or if modal is closed without login.
  return (
    <div className="container max-w-screen-md mx-auto px-4 md:px-6 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl text-center">Track Your Order</CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-2">
            Please log in to view your order history and track active orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-6">
          <p className="text-center">
            If you don't have an account, creating one is quick and easy!
          </p>
          <Button onClick={openModal} className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground">
            Login or Create Account
          </Button>
          <Button asChild variant="link" className="text-primary">
            <Link href="/">Back to Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Metadata removed as it cannot be exported from a client component.
// export const metadata = {
//   title: 'Track Your Order - Zahra Sweet Rolls',
//   description: 'Log in to check the status of your order from Zahra Sweet Rolls.',
// };
