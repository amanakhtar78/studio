'use client';

import Link from 'next/link';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/mock-data'; // Assuming categories are defined here
import { Menu, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [isMounted, setIsMounted] = useState(false);

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
          {/* Placeholder for desktop nav to maintain layout */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
             <Button variant="ghost" disabled>Loading...</Button>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" disabled><Menu className="h-6 w-6" /></Button>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = (
    <>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          onClick={() => handleScrollToCategory(category.slug)}
          className="text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          {category.name}
        </Button>
      ))}
      <Link href="/track-order" legacyBehavior passHref>
        <Button variant="ghost" className="text-sm font-medium text-foreground/80 hover:text-foreground">
          Track Order
        </Button>
      </Link>
       <Button variant="ghost" size="icon" aria-label="Cart (0 items)">
         <ShoppingCart className="h-5 w-5" />
       </Button>
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
          {navLinks}
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-4">
              <nav className="flex flex-col space-y-3 pt-6">
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
