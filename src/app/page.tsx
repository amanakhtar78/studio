
'use client';
import { Banner } from '@/components/banner';
// import { CategorySelector } from '@/components/category-selector'; // Keep for now, maybe remove later
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages } from '@/lib/mock-data'; 
import { useSearch } from '@/context/search-context';
import { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, Loader2, FilterIcon } from 'lucide-react';
import { AboutTimeline } from '@/components/about-timeline';
import { WhyChooseUs } from '@/components/why-choose-us';
import { FilterSidebar } from '@/components/filter-sidebar';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { Product, Category as CategoryType } from '@/types'; 

export default function HomePage() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  // Filter and Sort States
  const [selectedGlobalCategory, setSelectedGlobalCategory] = useState<string>('all'); 
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);


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

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value);
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGlobalCategory('all');
    setSortOption('relevance');
    setMinPrice('');
    setMaxPrice('');
    setIsFilterSidebarOpen(false); // Close sidebar after clearing
  };

  const processedProducts = useMemo(() => {
    let products = [...allProducts];

    if (searchQuery && searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(lowercasedQuery) ||
        product.description.toLowerCase().includes(lowercasedQuery)
      );
    }

    if (selectedGlobalCategory !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === selectedGlobalCategory.toLowerCase());
    }

    const numMinPrice = parseFloat(minPrice);
    const numMaxPrice = parseFloat(maxPrice);
    if (!isNaN(numMinPrice) && numMinPrice >= 0) {
      products = products.filter(p => p.price >= numMinPrice);
    }
    if (!isNaN(numMaxPrice) && numMaxPrice >= 0) {
      products = products.filter(p => p.price <= numMaxPrice);
    }

    switch (sortOption) {
      case 'name-asc':
        products.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        products.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        products.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      default: 
        break;
    }
    return products;
  }, [allProducts, searchQuery, selectedGlobalCategory, minPrice, maxPrice, sortOption]);
  
  const displayableSections = useMemo(() => {
    const relevantCategories = selectedGlobalCategory !== 'all'
      ? allCategories.filter(c => c.name.toLowerCase() === selectedGlobalCategory.toLowerCase())
      : allCategories;

    return relevantCategories
      .map(category => {
        const productsForCategory = processedProducts.filter(p => p.category.toLowerCase() === category.name.toLowerCase());
        const hasActiveFilters = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || selectedGlobalCategory !== 'all' || sortOption !== 'relevance';

        if (selectedGlobalCategory !== 'all') {
          return { category, products: productsForCategory, shouldRender: category.name.toLowerCase() === selectedGlobalCategory.toLowerCase() };
        } else {
          return { category, products: productsForCategory, shouldRender: productsForCategory.length > 0 || !hasActiveFilters };
        }
      })
      .filter(section => section.shouldRender);
  }, [allCategories, selectedGlobalCategory, processedProducts, searchQuery, minPrice, maxPrice, sortOption]);


  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isLoadingData = productStatus === 'loading' || categoryStatus === 'loading';
  const hasFailed = productStatus === 'failed' || categoryStatus === 'failed';
  const hasActiveFilters = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || selectedGlobalCategory !== 'all' || sortOption !== 'relevance';


  if (isLoadingData && !isMounted) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Loading goodies...</p>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="container max-w-screen-lg mx-auto px-2 md:px-4 py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-3">Oops! Something went wrong.</h1>
        <p className="text-muted-foreground mb-6 text-sm">
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
      <div className="container max-w-screen-2xl px-2 md:px-4 py-4 md:py-6">
        <Banner images={bannerImages} />
      </div>

      {/* Search and Filter Trigger Section */}
      <div className="container max-w-screen-2xl mx-auto px-2 md:px-4 py-3 md:py-4 sticky top-16 bg-background/95 backdrop-blur-sm z-40 shadow-sm -mx-2 md:-mx-4 site-padding-override-sm">
         <style jsx global>{`
            .site-padding-override-sm {
              padding-left: 0.5rem !important; 
              padding-right: 0.5rem !important; 
            }
            @media (min-width: 768px) { 
              .site-padding-override-sm {
                padding-left: 1rem !important; 
                padding-right: 1rem !important; 
              }
            }
          `}</style>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Label htmlFor="search-input" className="sr-only">Search products</Label>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-input"
              type="search"
              placeholder="Search treats..."
              className="pl-8 pr-3 py-2 text-sm w-full h-10 rounded-md border-2 border-input focus:border-primary focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
          </div>
          {/* Filter Trigger Button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsFilterSidebarOpen(true)} 
            className="h-10 w-10 flex-shrink-0"
            aria-label="Open filters"
          >
            <FilterIcon className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
      
      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onOpenChange={setIsFilterSidebarOpen}
        sortOption={sortOption}
        setSortOption={setSortOption}
        selectedGlobalCategory={selectedGlobalCategory}
        setSelectedGlobalCategory={setSelectedGlobalCategory}
        allCategories={allCategories}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onClearFilters={handleClearFilters}
        categoryStatus={categoryStatus}
      />
      
      {/* Product Display Area */}
      <div className="mt-0"> 
        {isLoadingData && isMounted && (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-3 text-muted-foreground text-sm">Applying filters...</p>
            </div>
        )}

        {!isLoadingData && displayableSections.length === 0 && hasActiveFilters && (
          <div className="container max-w-screen-2xl px-2 md:px-4 py-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-3">No products match your criteria</h2>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
          </div>
        )}

        {!isLoadingData && displayableSections.map(({ category, products: productsForSection }, index) => (
          <div key={category.id}>
            <ProductList
              category={category}
              products={productsForSection}
              className={index === 0 ? "pt-0 md:pt-0 pb-4 md:pb-6" : "py-4 md:py-6"} 
            />
            {index < displayableSections.length - 1 && (
              <div className="container max-w-screen-2xl px-2 md:px-4">
                <Separator className="my-6 md:my-8" />
              </div>
            )}
          </div>
        ))}
        
        {!isLoadingData && allProducts.length === 0 && productStatus === 'succeeded' && !hasActiveFilters && (
           <div className="container max-w-screen-2xl px-2 md:px-4 py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-3">No products available</h2>
            <p className="text-muted-foreground text-sm">Please check back later.</p>
          </div>
        )}
      </div>


      <div className="container max-w-screen-2xl px-2 md:px-4 py-6 md:py-8">
        <Separator className="mb-6 md:mb-8" />
        <AboutTimeline />
      </div>

      <div className="bg-muted/30">
        <div className="container max-w-screen-2xl px-2 md:px-4 py-6 md:py-8">
          <WhyChooseUs />
        </div>
      </div>

    </div>
  );
}
