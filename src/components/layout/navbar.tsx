
'use client';

import Link from 'next/link';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/lib/mock-data'; 
import { Menu, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';

export function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const { totalItemsCount } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScrollToCategory = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <SweetRollsLogo />
            <span className="font-bold text-xl">Zahra Sweet Rolls</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
             <Button variant="ghost" disabled>Loading...</Button>
          </nav>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="relative mr-2" disabled>
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" disabled><Menu className="h-6 w-6" /></Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = (closeSheet?: () => void) => (
    <>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          onClick={() => {
            handleScrollToCategory(category.slug);
            closeSheet?.();
          }}
          className="text-sm font-medium text-foreground/80 hover:text-foreground w-full justify-start md:w-auto md:justify-center"
        >
          {category.name}
        </Button>
      ))}
      <Link href="/track-order" legacyBehavior passHref>
        <Button 
          variant="ghost" 
          className="text-sm font-medium text-foreground/80 hover:text-foreground w-full justify-start md:w-auto md:justify-center"
          onClick={closeSheet}
        >
          Track Order
        </Button>
      </Link>
    </>
  );

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

        <div className="flex items-center">
          <Link href="/checkout" legacyBehavior passHref>
            <Button variant="ghost" size="icon" aria-label={`Cart (${totalItemsCount} items)`} className="relative mr-2">
              <ShoppingCart className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {totalItemsCount}
                </Badge>
              )}
            </Button>
          </Link>
        
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-4">
                <SheetTrigger asChild> 
                  <nav className="flex flex-col space-y-3 pt-6">
                    {navLinks(() => {
                      // This is a bit of a hack to close the sheet.
                      // A more robust solution might involve managing sheet open state here.
                      const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLElement;
                      closeButton?.click();
                    })}
                  </nav>
                </SheetTrigger>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
