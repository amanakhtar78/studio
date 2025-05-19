
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
      <div className="container max-w-screen-sm mx-auto px-2 md:px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]"> {/* Reduced padding and max-width */}
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" /> {/* Reduced icon size and margin */}
        <p className="text-base text-muted-foreground">Loading authentication status...</p> {/* Reduced font size */}
      </div>
    );
  }


  // This content will briefly show if not authenticated and not yet redirected, or if modal is closed without login.
  return (
    <div className="container max-w-screen-sm mx-auto px-2 md:px-4 py-8"> {/* Reduced padding and max-width */}
      <Card className="shadow-md"> {/* Reduced shadow */}
        <CardHeader className="p-4"> {/* Reduced padding */}
          <CardTitle className="text-xl md:text-2xl text-center">Track Your Order</CardTitle> {/* Reduced font size */}
          <CardDescription className="text-center text-muted-foreground pt-1.5 text-xs"> {/* Reduced padding and font size */}
            Please log in to view your order history and track active orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 p-4 pt-2"> {/* Reduced spacing, padding */}
          <p className="text-center text-sm"> {/* Reduced font size */}
            If you don't have an account, creating one is quick and easy!
          </p>
          <Button onClick={openModal} size="sm" className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground text-sm"> {/* Smaller button, text size */}
            Login or Create Account
          </Button>
          <Button asChild variant="link" size="sm" className="text-primary text-xs">
            <Link href="/">Back to Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

