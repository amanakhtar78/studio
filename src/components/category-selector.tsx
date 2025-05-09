
'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface CategorySelectorProps {
  categories: Category[];
}

export function CategorySelector({ categories }: CategorySelectorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScrollToCategory = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      // Adjust scroll offset if navbar is sticky
      const navbarHeight = 64; // Approximate height of the navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight - 20; // Extra 20px padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };


  if (!isMounted || !categories || categories.length === 0) { // Check if categories are loaded
    return (
      <div className="py-4 md:py-6 sticky top-16 bg-background/90 backdrop-blur-sm z-40 shadow-sm -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="container max-w-screen-2xl px-0">
          <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="py-4 md:py-6 sticky top-16 bg-background/90 backdrop-blur-sm z-40 shadow-sm -mx-4 px-4 md:-mx-6 md:px-6">
      <div className="container max-w-screen-2xl px-0">
        <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              className="whitespace-nowrap border-primary/50 text-primary hover:bg-primary/10 focus:bg-primary/10 focus:ring-2 focus:ring-primary/50 active:bg-primary/20"
              onClick={() => handleScrollToCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
