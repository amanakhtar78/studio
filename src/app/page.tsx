
'use client';
import { Banner } from '@/components/banner';
import { CategorySelector } from '@/components/category-selector';
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages, categories, products } from '@/lib/mock-data';
import { useSearch } from '@/context/search-context';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { searchQuery } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If there's a search query, we display all products matching the search,
  // potentially grouped by category or just as a flat list.
  // For this iteration, we'll filter within each category section.
  // If no search query, display all categories and their products.

  const allProductsFilteredBySearch = searchQuery && searchQuery.trim() !== '' 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const categoriesToDisplay = searchQuery && searchQuery.trim() !== ''
    ? categories.filter(category => 
        allProductsFilteredBySearch.some(p => p.categorySlug === category.slug)
      )
    : categories;
  
  if (!isMounted) {
    // You can return a loading skeleton here if needed
    return null; 
  }


  return (
    <div className="flex flex-col">
      <div className="container max-w-screen-2xl px-4 md:px-6 py-6 md:py-8">
        <Banner images={bannerImages} />
      </div>
      
      <CategorySelector categories={categories} />
      
      {categoriesToDisplay.length === 0 && searchQuery && searchQuery.trim() !== '' && (
        <div className="container max-w-screen-2xl px-4 md:px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">No results found for "{searchQuery}"</h2>
          <p className="text-muted-foreground">Try a different search term or browse our categories.</p>
        </div>
      )}

      {categoriesToDisplay.map((category, index) => (
        <div key={category.id}>
          <ProductList 
            category={category} 
            products={products} // Pass all products, ProductList will filter by category AND search
            searchQuery={searchQuery} 
          />
          {index < categoriesToDisplay.length - 1 && (
            <div className="container max-w-screen-2xl px-4 md:px-6">
              <Separator className="my-8 md:my-12" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
