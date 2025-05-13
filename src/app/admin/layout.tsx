
'use client';
import type { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { loadAdminFromSession } from '@/store/slices/adminAuthSlice';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.adminAuth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    dispatch(loadAdminFromSession());
  }, [dispatch]);

  useEffect(() => {
    if (!isMounted || authLoading) {
      return;
    }

    // Allow access to login page regardless of auth state
    if (pathname === '/admin/login') {
      if (isAdminAuthenticated) {
        // If on login page but already authenticated, redirect to dashboard
        router.replace('/admin/dashboard');
      }
      return; 
    }

    // For all other admin pages, require authentication
    if (!isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAdminAuthenticated, authLoading, router, isMounted, pathname]);

  if (!isMounted || authLoading) {
    // Show a loader only if not on the login page or if auth state is critical
    if (pathname !== '/admin/login') {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verifying admin session...</p>
        </div>
        );
    }
  }
  
  // If on login page and not yet redirected (or loading), allow login page to render
  if (pathname === '/admin/login' && !isAdminAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated and not on login page, or if loading but on login page, render children
  if (isAdminAuthenticated || (pathname === '/admin/login' && (isMounted && !authLoading))) {
     return <>{children}</>;
  }
  
  // Fallback for scenarios where conditions above aren't met, typically shows loader
  // This helps prevent brief flashes of content if redirection logic is still processing.
  return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
     </div>
  );
}
