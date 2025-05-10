
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

// Metadata can't be exported from a 'use client' component.
// It should be defined in a server component or here if this was a server component.
// For now, as this is becoming a client component for theme, we'll remove explicit metadata export.
// export const metadata: Metadata = {
//   title: 'Zahra Sweet Rolls - Cafe Ordering',
//   description: 'Order delicious sweet rolls, cakes, cookies, and beverages from Zahra Sweet Rolls.',
// };

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

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  if (!isMounted) {
    // To prevent hydration mismatch, render nothing or a placeholder until theme is determined
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
                {/* Optional: Add a loading spinner or skeleton here */}
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

