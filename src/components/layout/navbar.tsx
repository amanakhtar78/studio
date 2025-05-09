
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { categories } from '@/lib/mock-data';
import { Menu, ShoppingCart, User as UserIcon, LogOut, Package, Edit3, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const { totalItemsCount } = useCart();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { openModal: openAuthModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScrollToCategory = (slug: string, closeSheet?: () => void) => {
    closeSheet?.();
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(slug);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const element = document.getElementById(slug);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrackOrderClick = (closeSheet?: () => void) => {
    closeSheet?.();
    if (isAuthenticated) {
      router.push('/my-orders');
    } else {
      openAuthModal();
    }
  };
  
  const handleLogout = (closeSheet?: () => void) => {
    closeSheet?.();
    logout();
    router.push('/'); // Redirect to home on logout
  };


  const navLinks = (closeSheet?: () => void) => (
    <>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          onClick={() => handleScrollToCategory(category.slug, closeSheet)}
          className="text-sm font-medium text-foreground/80 hover:text-foreground w-full justify-start md:w-auto md:justify-center"
        >
          {category.name}
        </Button>
      ))}
      <Button
        variant="ghost"
        className="text-sm font-medium text-foreground/80 hover:text-foreground w-full justify-start md:w-auto md:justify-center"
        onClick={() => handleTrackOrderClick(closeSheet)}
      >
        Track Order
      </Button>
    </>
  );

  if (!isMounted) {
    // Simplified skeleton for navbar
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-3">
            <SweetRollsLogo />
            <span className="font-bold text-xl">Zahra Sweet Rolls</span>
          </Link>
          <div className="flex items-center space-x-2">
             <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div> {/* Placeholder for auth button */}
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div> {/* Placeholder for cart */}
             <div className="md:hidden h-8 w-8 bg-muted rounded-md animate-pulse"></div> {/* Placeholder for menu */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <SweetRollsLogo />
          <span className="self-center text-xl font-semibold whitespace-nowrap text-primary hover:text-primary/80 transition-colors">
            Zahra Sweet Rolls
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks()}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-3">
          <Link href="/checkout" legacyBehavior passHref>
            <Button variant="ghost" size="icon" aria-label={`Cart (${totalItemsCount} items)`} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {totalItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {authLoading ? (
             <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/my-orders')}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled> {/* Placeholder */}
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={openAuthModal} className="hidden md:flex text-sm h-9">
              <UserIcon className="mr-2 h-4 w-4" /> Login
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-4">
                <nav className="flex flex-col space-y-2 pt-6">
                  <SheetClose asChild>
                    <div>{navLinks(() => {})}</div>
                  </SheetClose>
                  
                  {!isAuthenticated && !authLoading && (
                    <SheetClose asChild>
                      <Button variant="outline" onClick={openAuthModal} className="w-full justify-start">
                        <UserIcon className="mr-2 h-4 w-4" /> Login / Sign Up
                      </Button>
                    </SheetClose>
                  )}
                   {isAuthenticated && user && ( // Add logout to mobile menu too
                     <SheetClose asChild>
                        <Button variant="ghost" onClick={() => handleLogout()} className="w-full justify-start text-destructive hover:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                     </SheetClose>
                   )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}