
'use client';
import { Banner } from '@/components/banner';
import { ProductList } from '@/components/product-list';
import { Separator } from '@/components/ui/separator';
import { bannerImages } from '@/lib/mock-data';
import { useSearch } from '@/context/search-context';
import { useEffect, useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, Loader2, FilterIcon, Trash2 } from 'lucide-react';
import { AboutTimeline } from '@/components/about-timeline';
import { WhyChooseUs } from '@/components/why-choose-us';
import { FilterSidebar } from '@/components/filter-sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { Product, Category as CategoryType } from '@/types'; // Product type is updated

export default function HomePage() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedGlobalCategory, setSelectedGlobalCategory] = useState<string>('all'); // ITEM CATEGORY
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { items: allProducts, status: productStatus, error: productError } = useSelector((state: RootState) => state.products);
  const { items: allCategories, status: categoryStatus, error: categoryError } = useSelector((state: RootState) => state.categories); // ITEM CATEGORY derived

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

  const distinctClassifications = useMemo(() => {
    if (productStatus !== 'succeeded') return ['all'];
    return ['all', ...new Set(allProducts.map(p => p.classification).filter(Boolean).sort())];
  }, [allProducts, productStatus]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedClassification('all');
    setSelectedGlobalCategory('all');
    setSortOption('relevance');
    setMinPrice('');
    setMaxPrice('');
    setIsFilterSidebarOpen(false);
  };

  const filterSidebarProps = {
    isOpen: isFilterSidebarOpen,
    onOpenChange: setIsFilterSidebarOpen,
    sortOption, setSortOption,
    selectedGlobalCategory, setSelectedGlobalCategory,
    allCategories, // These are "ITEM CATEGORY"
    distinctClassifications, // These are "ITEM CLASSIFICATION"
    selectedClassification, setSelectedClassification,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    categoryStatus, // For "ITEM CATEGORY"
    productStatus, // For "ITEM CLASSIFICATION"
    onClearFilters: handleClearFilters
  };

  const processedProducts = useMemo(() => {
    let products = [...allProducts];
    if (searchQuery && searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(lowercasedQuery) ||
        product.description.toLowerCase().includes(lowercasedQuery) ||
        product.category.toLowerCase().includes(lowercasedQuery) || // ITEM CATEGORY
        product.classification.toLowerCase().includes(lowercasedQuery) // ITEM CLASSIFICATION
      );
    }
    if (selectedClassification !== 'all') {
      products = products.filter(p => p.classification === selectedClassification);
    }
    if (selectedGlobalCategory !== 'all') {
      products = products.filter(p => p.category === selectedGlobalCategory); // ITEM CATEGORY
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
      case 'name-asc': products.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'name-desc': products.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'rating-desc': products.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)); break;
      default: break;
    }
    return products;
  }, [allProducts, searchQuery, selectedGlobalCategory, selectedClassification, minPrice, maxPrice, sortOption]);

  const displayableSections = useMemo(() => {
    // Group products by ITEM CATEGORY for display
    const relevantItemCategories = selectedGlobalCategory !== 'all'
      ? allCategories.filter(c => c.name === selectedGlobalCategory)
      : allCategories;

    return relevantItemCategories
      .map(categoryObj => { // categoryObj is {id, name, slug} for ITEM CATEGORY
        const productsForCategory = processedProducts.filter(p => p.category === categoryObj.name);
        const hasActiveFilters = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || selectedGlobalCategory !== 'all' || selectedClassification !== 'all' || sortOption !== 'relevance';
        
        // If a specific ITEM CATEGORY is selected, only render that section
        if (selectedGlobalCategory !== 'all') {
          return { category: categoryObj, products: productsForCategory, shouldRender: categoryObj.name === selectedGlobalCategory };
        } else {
        // If "All Categories" is selected, render section if it has products or if no filters are active (to show all empty categories too)
          return { category: categoryObj, products: productsForCategory, shouldRender: productsForCategory.length > 0 || !hasActiveFilters };
        }
      })
      .filter(section => section.shouldRender);
  }, [allCategories, selectedGlobalCategory, processedProducts, searchQuery, minPrice, maxPrice, sortOption, selectedClassification]);


  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isLoadingData = productStatus === 'loading' || categoryStatus === 'loading';
  const hasFailed = productStatus === 'failed' || categoryStatus === 'failed';
  const hasActiveFilters = searchQuery.trim() !== '' || minPrice !== '' || maxPrice !== '' || selectedGlobalCategory !== 'all' || selectedClassification !== 'all' || sortOption !== 'relevance';

  if (isLoadingData) {
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto md:flex-grow-0 md:min-w-[200px] lg:min-w-[250px] xl:min-w-[300px]">
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
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFilterSidebarOpen(true)}
                    className="h-10 w-10 flex-shrink-0 md:hidden"
                    aria-label="Open filters"
                >
                    <FilterIcon className="h-4.5 w-4.5" />
                </Button>
            </div>

            <div className="hidden md:flex flex-wrap items-center gap-2 lg:gap-3 flex-grow justify-start mt-2 md:mt-0">
                <div className="flex-shrink-0">
                    <Label htmlFor="sort-select-desktop" className="sr-only">Sort by</Label>
                    <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger id="sort-select-desktop" className="h-10 text-sm w-auto min-w-[130px] lg:min-w-[150px]">
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
                
                {/* ITEM CLASSIFICATION Filter - Desktop */}
                {productStatus === 'succeeded' && distinctClassifications.length > 1 && (
                    <div className="flex-shrink-0">
                    <Label htmlFor="classification-filter-desktop" className="sr-only">Classification</Label>
                    <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                        <SelectTrigger id="classification-filter-desktop" className="h-10 text-sm w-auto min-w-[140px] lg:min-w-[160px]">
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
                    <div className="h-10 w-[140px] lg:w-[160px] bg-muted rounded-md animate-pulse flex-shrink-0"></div>
                )}


                {/* ITEM CATEGORY Filter - Desktop */}
                {categoryStatus === 'succeeded' && allCategories.length > 0 && (
                    <div className="flex-shrink-0">
                    <Label htmlFor="category-filter-desktop" className="sr-only">Category</Label>
                    <Select value={selectedGlobalCategory} onValueChange={setSelectedGlobalCategory}>
                        <SelectTrigger id="category-filter-desktop" className="h-10 text-sm w-auto min-w-[130px] lg:min-w-[150px]">
                        <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {allCategories.map((cat) => ( // allCategories are derived "ITEM CATEGORY"
                            <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                )}
                {categoryStatus === 'loading' && (
                    <div className="h-10 w-[130px] lg:w-[150px] bg-muted rounded-md animate-pulse flex-shrink-0"></div>
                )}


                <div className="flex-shrink-0">
                    <Label htmlFor="min-price-desktop" className="sr-only">Min Price</Label>
                    <Input
                    id="min-price-desktop"
                    type="number"
                    placeholder="Min KES"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-10 text-sm w-24 lg:w-28"
                    min="0"
                    />
                </div>

                <div className="flex-shrink-0">
                    <Label htmlFor="max-price-desktop" className="sr-only">Max Price</Label>
                    <Input
                    id="max-price-desktop"
                    type="number"
                    placeholder="Max KES"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-10 text-sm w-24 lg:w-28"
                    min="0"
                    />
                </div>

                <div className="flex-shrink-0">
                    <Button variant="outline" onClick={handleClearFilters} className="h-10 text-sm">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Clear Filters
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <FilterSidebar {...filterSidebarProps} />

      <div className="container max-w-screen-2xl mx-auto px-2 md:px-4 mt-4 md:mt-6">
        <main className="flex-grow min-w-0">
            {displayableSections.length === 0 && hasActiveFilters && (
                <div className="py-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-3">No products match your criteria</h2>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
                </div>
            )}

            {displayableSections.map(({ category, products: productsForSection }, index) => ( // category here is "ITEM CATEGORY" object
                <div key={category.id}>
                <ProductList
                    category={category} // Pass the "ITEM CATEGORY" object
                    products={productsForSection}
                    className={index === 0 ? "pt-0 md:pt-0 pb-4 md:pb-6" : "py-4 md:py-6"}
                />
                {index < displayableSections.length - 1 && (
                    <Separator className="my-6 md:my-8" />
                )}
                </div>
            ))}

            {allProducts.length === 0 && productStatus === 'succeeded' && !hasActiveFilters && (
                <div className="py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-3">No products available</h2>
                <p className="text-muted-foreground text-sm">Please check back later.</p>
                </div>
            )}
        </main>
      </div>

      <div className="container max-w-screen-2xl px-2 md:px-4 py-6 md:py-8 mt-6">
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
