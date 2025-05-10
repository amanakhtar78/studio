
'use client';
import { Banner } from '@/components/banner';
import { CategorySelector } from '@/components/category-selector';
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages } from '@/lib/mock-data'; 
import { useSearch } from '@/context/search-context';
import { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertTriangle, Loader2 } from 'lucide-react';
import { AboutTimeline } from '@/components/about-timeline';
import { WhyChooseUs } from '@/components/why-choose-us';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { Product, Category as CategoryType } from '@/types'; // Renamed Category to CategoryType to avoid conflict

export default function HomePage() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  // Filter and Sort States
  const [selectedGlobalCategory, setSelectedGlobalCategory] = useState<string>('all'); // Stores category NAME or 'all'
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');


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
      default: // 'relevance' or unknown
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
        // A section is displayable if:
        // 1. A specific global category is chosen, and it's this one. ProductList will show "no items for filter" if productsForCategory is empty.
        // 2. No specific global category is chosen ('all'), and this category has products OR no filters are active.
        const hasActiveFilters = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || selectedGlobalCategory !== 'all' || sortOption !== 'relevance';

        if (selectedGlobalCategory !== 'all') {
          return { category, products: productsForCategory, shouldRender: category.name.toLowerCase() === selectedGlobalCategory.toLowerCase() };
        } else {
          // if 'all' categories selected, show section if it has products, or if no filters active (to show all original sections)
          return { category, products: productsForCategory, shouldRender: productsForCategory.length > 0 || !hasActiveFilters };
        }
      })
      .filter(section => section.shouldRender);
  }, [allCategories, selectedGlobalCategory, processedProducts, searchQuery, minPrice, maxPrice, sortOption]);


  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isLoadingData = productStatus === 'loading' || categoryStatus === 'loading';
  const hasFailed = productStatus === 'failed' || categoryStatus === 'failed';
  const hasActiveFilters = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || selectedGlobalCategory !== 'all' || sortOption !== 'relevance';


  if (isLoadingData && !isMounted) { // Show loading if not mounted and still loading
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading goodies...</p>
      </div>
    );
  }

  if (hasFailed) {
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
      <div className="container max-w-screen-2xl px-4 md:px-6 py-8 md:py-12">
        <Banner images={bannerImages} />
      </div>

      {/* Search and Filter Section */}
      <div className="container max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-8 sticky top-16 bg-background/95 backdrop-blur-sm z-40 shadow-sm -mx-4 md:-mx-6 site-padding-override">
         <style jsx global>{`
            .site-padding-override {
              padding-left: 1rem !important; /* Corresponds to px-4 */
              padding-right: 1rem !important; /* Corresponds to px-4 */
            }
            @media (min-width: 768px) { /* md breakpoint */
              .site-padding-override {
                padding-left: 1.5rem !important; /* Corresponds to md:px-6 */
                padding-right: 1.5rem !important; /* Corresponds to md:px-6 */
              }
            }
          `}</style>
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          {/* Search Input */}
          <div className="relative flex-grow w-full md:max-w-xs lg:max-w-sm xl:max-w-md">
            <Label htmlFor="search-input" className="sr-only">Search products</Label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-input"
              type="search"
              placeholder="Search for delicious treats..."
              className="pl-10 pr-4 py-2 text-base w-full h-12 rounded-md border-2 border-input focus:border-primary focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-grow md:justify-start md:items-end">
            <div className="flex-grow sm:flex-grow-0 sm:w-48">
              <Label htmlFor="sort-select" className="text-sm font-medium text-muted-foreground">Sort by</Label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger id="sort-select" className="h-12 text-base mt-1">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categoryStatus === 'succeeded' && allCategories.length > 0 && (
              <div className="flex-grow sm:flex-grow-0 sm:w-48">
                <Label htmlFor="category-filter-select" className="text-sm font-medium text-muted-foreground">Category</Label>
                <Select value={selectedGlobalCategory} onValueChange={setSelectedGlobalCategory}>
                  <SelectTrigger id="category-filter-select" className="h-12 text-base mt-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
             <div className="flex-grow sm:flex-grow-0 sm:w-32">
              <Label htmlFor="min-price" className="text-sm font-medium text-muted-foreground">Min Price</Label>
              <Input id="min-price" type="number" placeholder="KES" value={minPrice} onChange={handleMinPriceChange} className="h-12 text-base mt-1" min="0" />
            </div>
            <div className="flex-grow sm:flex-grow-0 sm:w-32">
              <Label htmlFor="max-price" className="text-sm font-medium text-muted-foreground">Max Price</Label>
              <Input id="max-price" type="number" placeholder="KES" value={maxPrice} onChange={handleMaxPriceChange} className="h-12 text-base mt-1" min="0"/>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Quick Jump - this might be less useful if global category filter is prominent */}
      {/* <CategorySelector categories={allCategories} /> */}
      
      {/* Product Display Area */}
      <div className="mt-0"> {/* Removed top margin as sticky filter bar handles spacing */}
        {isLoadingData && isMounted && ( // Show loading if mounted and still loading subsequent data
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Applying filters...</p>
            </div>
        )}

        {!isLoadingData && displayableSections.length === 0 && hasActiveFilters && (
          <div className="container max-w-screen-2xl px-4 md:px-6 py-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">No products match your criteria</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}

        {!isLoadingData && displayableSections.map(({ category, products: productsForSection }, index) => (
          <div key={category.id}>
            <ProductList
              category={category}
              products={productsForSection}
              className={index === 0 ? "pt-0 md:pt-0 pb-8 md:pb-12" : "py-8 md:py-12"} // Adjusted pt for first item
            />
            {index < displayableSections.length - 1 && (
              <div className="container max-w-screen-2xl px-4 md:px-6">
                <Separator className="my-10 md:my-16" />
              </div>
            )}
          </div>
        ))}
        
        {!isLoadingData && allProducts.length === 0 && productStatus === 'succeeded' && !hasActiveFilters && (
           <div className="container max-w-screen-2xl px-4 md:px-6 py-12 text-center">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">No products available</h2>
            <p className="text-muted-foreground">Please check back later.</p>
          </div>
        )}
      </div>


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
