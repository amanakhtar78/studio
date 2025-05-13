
'use client';
import type { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { loadAdminFromSession, logoutAdmin } from '@/store/slices/adminAuthSlice';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, PanelLeft, LogOut } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Button } from '@/components/ui/button';
// import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';
// import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, isLoading: authLoading, adminUser } = useSelector((state: RootState) => state.adminAuth);
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

    if (pathname === '/admin/login') {
      if (isAdminAuthenticated) {
        router.replace('/admin/dashboard');
      }
      return; 
    }

    if (!isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAdminAuthenticated, authLoading, router, isMounted, pathname]);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    router.push('/admin/login');
  };

  if (!isMounted || (authLoading && pathname !== '/admin/login')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying admin session...</p>
      </div>
    );
  }
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAdminAuthenticated && pathname !== '/admin/login') {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
       </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm">
            <div className="flex items-center gap-2">
               <div className="md:hidden">
                 <SidebarTrigger asChild>
                   <Button variant="outline" size="icon" className="h-8 w-8">
                     <PanelLeft className="h-4 w-4" />
                     <span className="sr-only">Toggle Menu</span>
                   </Button>
                 </SidebarTrigger>
              </div>
              <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {adminUser && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {adminUser.userCode} ({adminUser.traineeOrTrainer})
                  </span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="h-8">
                <LogOut className="h-4 w-4 sm:mr-2"/>
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          <SidebarInset> {/* This ensures content is offset correctly by the sidebar */}
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
            <footer className="border-t p-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Zahra Sweet Rolls Admin
            </footer>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
