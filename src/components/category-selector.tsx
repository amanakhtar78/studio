
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
  // Approximate height of Navbar (4rem = 64px) + FilterBar (variable, ~6rem or more = ~96px). Total ~10rem = 160px
  // Let's try a fixed value or calculate dynamically if needed. For now, fixed.
  const stickyOffset = 'top-[10rem] md:top-[10rem]'; // Adjust this value as needed based on actual combined height

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScrollToCategory = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      // Navbar height + Filter bar height + some padding
      const headerOffset = 160 + 20; // Approx 160px for navbar + filter bar, 20px for padding
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
      <div className={`py-4 md:py-6 sticky ${stickyOffset} bg-background/90 backdrop-blur-sm z-30 shadow-sm -mx-4 px-4 md:-mx-6 md:px-6`}>
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
    <div className={`py-4 md:py-6 sticky ${stickyOffset} bg-background/90 backdrop-blur-sm z-30 shadow-sm -mx-4 px-4 md:-mx-6 md:px-6`}>
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

```