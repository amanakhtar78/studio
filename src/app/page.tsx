
'use client';
import { Banner } from '@/components/banner';
import { CategorySelector } from '@/components/category-selector';
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages } from '@/lib/mock-data'; // Banner images can still be mock
import { useSearch } from '@/context/search-context';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, Loader2 } from 'lucide-react';
import { AboutTimeline } from '@/components/about-timeline';
import { WhyChooseUs } from '@/components/why-choose-us';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { Product, Category } from '@/types';

export default function HomePage() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { items: allProducts, status: productStatus, error: productError } = useSelector((state: RootState) => state.products);
  const { items: allCategories, status: categoryStatus, error: categoryError } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    setIsMounted(true);
    if (productStatus === 'idle') {
      dispatch(fetchProducts());
    }
    if (categoryStatus === 'idle') {
      dispatch(fetchCategories());
    }
  }, [dispatch, productStatus, categoryStatus]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredProductsBySearch = searchQuery && searchQuery.trim() !== ''
    ? allProducts.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allProducts;

  const categoriesToDisplay = searchQuery && searchQuery.trim() !== ''
    ? allCategories.filter(category =>
        // API product.category is a string, category.name is string
        filteredProductsBySearch.some(p => p.category.toLowerCase() === category.name.toLowerCase())
      )
    : allCategories;

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (productStatus === 'loading' || categoryStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading goodies...</p>
      </div>
    );
  }

  if (productStatus === 'failed' || categoryStatus === 'failed') {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 md:px-6 py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't load our products or categories at the moment. Please try again later.
        </p>
        <p className="text-xs text-muted-foreground">
          {productError && `Product Error: ${productError}`}
          {categoryError && `Category Error: ${categoryError}`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* havt to make it sticky */}
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
      
      <CategorySelector categories={allCategories} />
      
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
            allProducts={allProducts} // Pass all products from store
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
      
      {allProducts.length === 0 && productStatus === 'succeeded' && (
         <div className="container max-w-screen-2xl px-4 md:px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">No products available</h2>
          <p className="text-muted-foreground">Please check back later.</p>
        </div>
      )}


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
