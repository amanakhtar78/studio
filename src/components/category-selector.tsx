'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';

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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isMounted) {
    return (
      <div className="py-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {[...Array(4)].map((_, i) => (
            <Button key={i} variant="outline" className="bg-muted/50 animate-pulse w-24 h-10" disabled>
              &nbsp;
            </Button>
          ))}
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

// Helper CSS to hide scrollbar (add to globals.css or use Tailwind plugin if available)
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
// This is already handled by Tailwind usually, but good to note.
