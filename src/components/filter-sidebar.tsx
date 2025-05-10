
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category } from '@/types';
import { Trash2 } from 'lucide-react';

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
            <div>
              <Label htmlFor="sort-select-sidebar" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Sort by
              </Label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger id="sort-select-sidebar" className="h-10 text-sm">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="price-asc">Price: Low-High</SelectItem>
                  <SelectItem value="price-desc">Price: High-Low</SelectItem>
                  <SelectItem value="rating-desc">Rating: High-Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categoryStatus === 'succeeded' && allCategories.length > 0 && (
              <div>
                <Label htmlFor="category-filter-select-sidebar" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Category
                </Label>
                <Select value={selectedGlobalCategory} onValueChange={setSelectedGlobalCategory}>
                  <SelectTrigger id="category-filter-select-sidebar" className="h-10 text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
             {categoryStatus === 'loading' && (
                <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Category</Label>
                    <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                </div>
            )}


            <div>
              <Label htmlFor="min-price-sidebar" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Min Price (KES)
              </Label>
              <Input
                id="min-price-sidebar"
                type="number"
                placeholder="e.g. 100"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10 text-sm"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="max-price-sidebar" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Max Price (KES)
              </Label>
              <Input
                id="max-price-sidebar"
                type="number"
                placeholder="e.g. 1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10 text-sm"
                min="0"
              />
            </div>
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
