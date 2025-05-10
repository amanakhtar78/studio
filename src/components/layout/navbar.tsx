
'use client';

import Link from 'next/link';
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
import { Menu, ShoppingCart, User as UserIcon, LogOut, Package, Edit3, Loader2, Sun, Moon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { useRouter } from 'next/navigation';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import type { Category } from '@/types';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { totalItemsCount } = useCart();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { openModal: openAuthModal } = useAuthModal();
  const router = useRouter();

  const categoriesFromStore = useSelector((state: RootState) => state.categories.items);
  const categoryStatus = useSelector((state: RootState) => state.categories.status);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScrollToCategory = (slug: string, closeSheet?: () => void) => {
    closeSheet?.();

    const element = document.getElementById(slug);
    if (element) {
        const headerOffset = 64 + 64 + 20; 
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset; 

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    } else {
        router.push('/');
        setTimeout(() => {
            const el = document.getElementById(slug);
            if (el) {
                const headerOffset = 64 + 64 + 20;
                const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth'});
            }
        }, 300); 
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
    router.push('/'); 
  };

  const handleEditProfileClick = (closeSheet?: () => void) => {
    closeSheet?.();
    router.push('/edit-profile');
  };


  const navLinks = (categoriesToUse: Category[], closeSheet?: () => void) => (
    <>
      {categoriesToUse.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          size="sm" 
          onClick={() => handleScrollToCategory(category.slug, closeSheet)}
          className="text-xs font-medium text-foreground/80 hover:text-foreground w-full justify-start md:w-auto md:justify-center px-2"
        >
          {category.name}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm" 
        className="text-xs font-medium text-foreground/80 hover:text-foreground w-full justify-start md:w-auto md:justify-center px-2"
        onClick={() => handleTrackOrderClick(closeSheet)}
      >
        Track Order
      </Button>
    </>
  );

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-2 md:px-4"> 
          <Link href="/" className="flex items-center space-x-2"> 
            <SweetRollsLogo />
            <span className="font-bold text-lg">Zahra Sweet Rolls</span> 
          </Link>
          <div className="flex items-center space-x-1.5"> 
             <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
             <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div> 
             <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
             <div className="md:hidden h-8 w-8 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }
  
  const currentCategories = categoryStatus === 'succeeded' ? categoriesFromStore : [];


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-2 md:px-4"> 
        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse"> 
          <SweetRollsLogo />
          <span className="self-center text-lg font-semibold whitespace-nowrap text-primary hover:text-primary/80 transition-colors"> 
            Zahra Sweet Rolls
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1"> 
          {navLinks(currentCategories)}
        </nav>

        <div className="flex items-center space-x-1.5 md:space-x-2"> 
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-9 w-9">
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </Button>

          <Link href="/checkout" legacyBehavior passHref>
            <Button variant="ghost" size="icon" aria-label={`Cart (${totalItemsCount} items)`} className="relative h-9 w-9"> 
              <ShoppingCart className="h-4.5 w-4.5" /> 
              {totalItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 p-0 flex items-center justify-center text-[10px] rounded-full"> 
                  {totalItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {authLoading ? (
             <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" /> 
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0"> 
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback> 
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end" forceMount> 
                <DropdownMenuLabel className="font-normal py-1 px-2"> 
                  <div className="flex flex-col space-y-0.5"> 
                    <p className="text-xs font-medium leading-none">{user.name}</p>
                    <p className="text-[10px] leading-none text-muted-foreground"> 
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1"/>
                <DropdownMenuItem onClick={() => router.push('/my-orders')} className="text-xs py-1 px-2"> 
                  <Package className="mr-1.5 h-3.5 w-3.5" />
                  <span>My Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditProfileClick()} className="text-xs py-1 px-2">
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1"/>
                <DropdownMenuItem onClick={() => handleLogout()} className="text-xs py-1 px-2">
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={openAuthModal} className="hidden md:flex text-xs h-8 px-2.5"> 
              <UserIcon className="mr-1.5 h-3.5 w-3.5" /> Login
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9"> 
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[260px] bg-background p-3"> 
                <nav className="flex flex-col space-y-1.5 pt-4"> 
                   {isAuthenticated && user && (
                    <div className="px-2 py-1 mb-1.5">
                       <p className="text-xs font-medium leading-none">{user.name}</p>
                       <p className="text-[10px] leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  )}
                  <SheetClose asChild>
                    <div>{navLinks(currentCategories, () => {})}</div>
                  </SheetClose>
                  
                  {isAuthenticated && user && (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/my-orders')} className="w-full justify-start text-xs px-2">
                            <Package className="mr-1.5 h-3.5 w-3.5" /> My Orders
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                         <Button variant="ghost" size="sm" onClick={() => handleEditProfileClick()} className="w-full justify-start text-xs px-2">
                            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleLogout()} className="w-full justify-start text-destructive hover:text-destructive text-xs px-2">
                            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
                        </Button>
                     </SheetClose>
                    </>
                   )}

                  {!isAuthenticated && !authLoading && (
                    <SheetClose asChild>
                      <Button variant="outline" size="sm" onClick={openAuthModal} className="w-full justify-start text-xs px-2">
                        <UserIcon className="mr-1.5 h-3.5 w-3.5" /> Login / Sign Up
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

