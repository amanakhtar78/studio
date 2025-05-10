
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
  // Navbar (4rem/64px) + FilterBar (approx. (py-3/12px * 2) + h-10/40px input = ~64px). Total ~128px
  const stickyOffset = 'top-[8rem] md:top-[8rem]'; // Approx 128px

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScrollToCategory = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      // Navbar height (64px) + Filter bar height (~64px) + some padding (16px)
      const headerOffset = 64 + 64 + 16; // Approx 144px
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };


  if (!isMounted || !categories || categories.length === 0) {
    return (
      <div className={`py-2 md:py-3 sticky ${stickyOffset} bg-background/90 backdrop-blur-sm z-30 shadow-sm -mx-2 px-2 md:-mx-4 md:px-4`}> {/* Reduced padding */}
        <div className="container max-w-screen-2xl px-0">
          <div className="flex space-x-2 overflow-x-auto pb-1.5 no-scrollbar"> {/* Reduced spacing */}
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-md" /> 
            ))}
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className={`py-2 md:py-3 sticky ${stickyOffset} bg-background/90 backdrop-blur-sm z-30 shadow-sm -mx-2 px-2 md:-mx-4 md:px-4`}> {/* Reduced padding */}
      <div className="container max-w-screen-2xl px-0">
        <div className="flex space-x-2 overflow-x-auto pb-1.5 no-scrollbar"> {/* Reduced spacing */}
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm" // Already sm, which is h-9
              className="whitespace-nowrap border-primary/50 text-primary hover:bg-primary/10 focus:bg-primary/10 focus:ring-2 focus:ring-primary/50 active:bg-primary/20 px-2.5 text-xs" // Adjusted padding and text size
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
