
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category } from '@/types'; // Category is ITEM CATEGORY

interface FilterControlsProps {
  sortOption: string;
  setSortOption: Dispatch<SetStateAction<string>>;
  
  selectedGlobalCategory: string; // For ITEM CATEGORY
  setSelectedGlobalCategory: Dispatch<SetStateAction<string>>;
  allCategories: Category[]; // These are ITEM CATEGORIES

  selectedClassification: string; // For ITEM CLASSIFICATION
  setSelectedClassification: Dispatch<SetStateAction<string>>;
  distinctClassifications: string[]; // Unique ITEM CLASSIFICATION strings

  minPrice: string;
  setMinPrice: Dispatch<SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: Dispatch<SetStateAction<string>>;
  
  categoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed'; // For ITEM CATEGORY loading
  productStatus: 'idle' | 'loading' | 'succeeded' | 'failed'; // For ITEM CLASSIFICATION (derived from products)
}

export function FilterControls({
  sortOption, setSortOption,
  selectedGlobalCategory, setSelectedGlobalCategory, allCategories,
  selectedClassification, setSelectedClassification, distinctClassifications,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  categoryStatus, productStatus
}: FilterControlsProps) {
  return (
    <>
      <div>
        <Label htmlFor="sort-select-controls" className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Sort by
        </Label>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger id="sort-select-controls" className="h-10 text-sm">
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

      {/* ITEM CLASSIFICATION Filter */}
      {productStatus === 'succeeded' && distinctClassifications.length > 1 && (
        <div>
          <Label htmlFor="classification-filter-controls" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Classification
          </Label>
          <Select value={selectedClassification} onValueChange={setSelectedClassification}>
            <SelectTrigger id="classification-filter-controls" className="h-10 text-sm">
              <SelectValue placeholder="All Classifications" />
            </SelectTrigger>
            <SelectContent>
              {distinctClassifications.map((clf) => (
                <SelectItem key={clf} value={clf}>
                  {clf === 'all' ? 'All Classifications' : clf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
       {productStatus === 'loading' && (
          <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Classification</Label>
              <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
          </div>
      )}


      {/* ITEM CATEGORY Filter */}
      {categoryStatus === 'succeeded' && allCategories.length > 0 && (
        <div>
          <Label htmlFor="category-filter-select-controls" className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Category
          </Label>
          <Select value={selectedGlobalCategory} onValueChange={setSelectedGlobalCategory}>
            <SelectTrigger id="category-filter-select-controls" className="h-10 text-sm">
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
        <Label htmlFor="min-price-controls" className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Min Price (KES)
        </Label>
        <Input
          id="min-price-controls"
          type="number"
          placeholder="e.g. 100"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="h-10 text-sm"
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="max-price-controls" className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Max Price (KES)
        </Label>
        <Input
          id="max-price-controls"
          type="number"
          placeholder="e.g. 1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="h-10 text-sm"
          min="0"
        />
      </div>
    </>
  );
}
