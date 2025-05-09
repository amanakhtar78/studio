
'use client';
import { Banner } from '@/components/banner';
import { CategorySelector } from '@/components/category-selector';
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages, categories, products } from '@/lib/mock-data';
import { useSearch } from '@/context/search-context';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AboutTimeline } from '@/components/about-timeline';
import { WhyChooseUs } from '@/components/why-choose-us';

export default function HomePage() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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
      <div className="container max-w-screen-2xl px-4 md:px-6 py-8 md:py-12">
        <Banner images={bannerImages} />
      </div>

      <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for delicious treats..."
            className="pl-10 pr-4 py-2 text-base md:text-lg w-full h-12 rounded-md border-2 border-input focus:border-primary focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search products"
          />
        </div>
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
            products={products} 
            searchQuery={searchQuery} 
            className={index === 0 ? "pt-10 md:pt-16 pb-8 md:pb-12" : "py-8 md:py-12"} 
          />
          {index < categoriesToDisplay.length - 1 && (
            <div className="container max-w-screen-2xl px-4 md:px-6">
              <Separator className="my-10 md:my-16" />
            </div>
          )}
        </div>
      ))}

      <div className="container max-w-screen-2xl px-4 md:px-6 py-10 md:py-16">
        <Separator className="mb-10 md:mb-16" />
        <AboutTimeline />
      </div>

      <div className="bg-muted/30">
        <div className="container max-w-screen-2xl px-4 md:px-6 py-10 md:py-16">
          <WhyChooseUs />
        </div>
      </div>

    </div>
  );
}

