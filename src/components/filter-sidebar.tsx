
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category } from '@/types';
import { Trash2 } from 'lucide-react';
import { FilterControls } from '@/components/filter-controls'; // Import FilterControls

interface FilterSidebarProps {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  sortOption: string;
  setSortOption: Dispatch<SetStateAction<string>>;
  selectedGlobalCategory: string;
  setSelectedGlobalCategory: Dispatch<SetStateAction<string>>;
  allCategories: Category[];
  minPrice: string;
  setMinPrice: Dispatch<SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: Dispatch<SetStateAction<string>>;
  onClearFilters: () => void;
  categoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

export function FilterSidebar({
  isOpen,
  onOpenChange,
  sortOption,
  setSortOption,
  selectedGlobalCategory,
  setSelectedGlobalCategory,
  allCategories,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onClearFilters,
  categoryStatus,
}: FilterSidebarProps) {
  
  const filterControlsProps = {
    sortOption, setSortOption,
    selectedGlobalCategory, setSelectedGlobalCategory,
    allCategories,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    categoryStatus
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-lg">Filters</SheetTitle>
          <SheetDescription className="text-xs">
            Refine your search for the perfect treat.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-5">
            <FilterControls {...filterControlsProps} />
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t mt-auto">
          <div className="flex w-full gap-2">
            <Button variant="outline" onClick={onClearFilters} className="flex-grow text-sm">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear Filters
            </Button>
            <SheetClose asChild>
              <Button type="button" className="flex-grow text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                Apply & Close
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

