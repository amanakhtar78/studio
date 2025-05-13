'use client';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Assuming Geist is preferred
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/cart-context';
import { SearchProvider } from '@/context/search-context';
import { AuthProvider } from '@/context/auth-context';
import { AuthModal } from '@/components/auth/auth-modal';
import { StoreProvider } from '@/components/store-provider';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme, isMounted]);

  if (!isMounted) {
    // To prevent hydration mismatch, render a basic page with a loader until theme and client-side logic are ready
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
              <title>Zahra Sweet Rolls - Loading...</title>
              <meta name="description" content="Loading delicious treats from Zahra Sweet Rolls." />
              {/* Minimal critical CSS or font links could go here if necessary */}
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen items-center justify-center bg-background text-foreground`}>
                <div className="flex flex-col items-center justify-center">
                    {/* Simple inline SVG loader to avoid dependency on lucide-react before full mount */}
                    <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-muted-foreground">Initializing Application...</p>
                </div>
            </body>
        </html>
    );
  }

  return (
    <html lang="en" className={theme} style={{ colorScheme: theme }} suppressHydrationWarning>
      <head>
        <title>Zahra Sweet Rolls - Cafe Ordering</title>
        <meta name="description" content="Order delicious sweet rolls, cakes, cookies, and beverages from Zahra Sweet Rolls." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        <StoreProvider>
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
                <Toaster />
                <AuthModal />
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
