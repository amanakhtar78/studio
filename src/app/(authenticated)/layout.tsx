
'use client';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      openModal();
      router.replace('/'); // Redirect to home, modal will pop up
    }
  }, [isAuthenticated, isLoading, openModal, router, isMounted]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust min-h as needed */}
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect and global modal,
    // but as a fallback or during transition:
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}