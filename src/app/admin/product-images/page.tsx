
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { fetchGlobalViewDataAPI } from '@/services/adminApi';
import type { AdminProduct, ImageFilterStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Loader2, AlertTriangle, Search, Filter, UploadCloud, Trash2, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLUMNS_TO_DISPLAY: (keyof AdminProduct)[] = ["ITEM CODE", "ITEM NAME", "ITEM DESCRIPTION", "ITEM CATEGORY", "ITEM SUB CATEGORY", "ITEM CLASSIFICATION", "IMAGEPATH"];

export default function ProductImagesPage() {
  const sClientSecret = useSelector((state: RootState) => state.adminAuth.sClientSecret);
  
  const [initialProductsLoad, setInitialProductsLoad] = useState<AdminProduct[]>([]); // For populating filters initially
  const [displayedProducts, setDisplayedProducts] = useState<AdminProduct[]>([]);
  
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // For initial full load
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false); // For classification-based load
  const [error, setError] = useState<string | null>(null);

  const [selectedClassification, setSelectedClassification] = useState<string>(''); // Empty means none selected

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');
  const [imageStatusFilter, setImageStatusFilter] = useState<ImageFilterStatus>('all');

  // Fetch all products once to populate filter dropdowns
  useEffect(() => {
    let isMountedGuard = true;
    const fetchInitialData = async () => {
      if (!sClientSecret) {
        if (isMountedGuard) setError('Authentication secret not found. Please log in again.');
        setIsLoadingInitial(false);
        return;
      }
      if(isMountedGuard) {
        setIsLoadingInitial(true);
        setError(null);
      }
      try {
        const response = await fetchGlobalViewDataAPI('792', sClientSecret); // No classification filter here
        if (isMountedGuard) {
          if (Array.isArray(response.data)) {
            setInitialProductsLoad(response.data);
          } else {
            setInitialProductsLoad([]);
            setError('Received invalid initial product data.');
          }
        }
      } catch (err: any) {
        if (isMountedGuard) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch initial product data.');
          setInitialProductsLoad([]);
        }
      } finally {
        if (isMountedGuard) setIsLoadingInitial(false);
      }
    };
    fetchInitialData();
    return () => { isMountedGuard = false; };
  }, [sClientSecret]);

  // Fetch products based on selected classification
  useEffect(() => {
    let isMountedGuard = true;
    const fetchProductsByClassification = async () => {
      if (!sClientSecret || !selectedClassification || selectedClassification === 'all') {
        if(selectedClassification === 'all' && initialProductsLoad.length > 0) {
            if(isMountedGuard) setDisplayedProducts(initialProductsLoad); // Show all if 'all' is chosen and initial load is done
        } else {
            if(isMountedGuard) setDisplayedProducts([]); // Clear if no classification or 'all' without initial data
        }
        return;
      }
      if(isMountedGuard) {
        setIsLoadingFiltered(true);
        setError(null);
      }
      try {
        const response = await fetchGlobalViewDataAPI('792', sClientSecret, selectedClassification);
        if (isMountedGuard) {
          if (Array.isArray(response.data)) {
            setDisplayedProducts(response.data);
          } else {
            setDisplayedProducts([]);
            setError('Received invalid product data for classification.');
          }
        }
      } catch (err: any) {
        if (isMountedGuard) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch products for classification.');
          setDisplayedProducts([]);
        }
      } finally {
        if (isMountedGuard) setIsLoadingFiltered(false);
      }
    };

    if (selectedClassification) { // Only fetch if a classification is selected
        fetchProductsByClassification();
    } else {
        if(isMountedGuard) setDisplayedProducts([]); // Clear products if no classification selected
    }
    return () => { isMountedGuard = false; };
  }, [selectedClassification, sClientSecret, initialProductsLoad]);


  const distinctClassifications = useMemo(() => {
    return ['all', ...new Set(initialProductsLoad.map(p => p["ITEM CLASSIFICATION"] || 'N/A').filter(Boolean))];
  }, [initialProductsLoad]);

  const distinctCategories = useMemo(() => {
    const source = selectedClassification && selectedClassification !== 'all' && displayedProducts.length > 0 ? displayedProducts : initialProductsLoad;
    return ['all', ...new Set(source.map(p => p["ITEM CATEGORY"] || 'N/A').filter(Boolean))];
  }, [initialProductsLoad, displayedProducts, selectedClassification]);

  const distinctSubCategories = useMemo(() => {
    const source = selectedClassification && selectedClassification !== 'all' && displayedProducts.length > 0 ? displayedProducts : initialProductsLoad;
    let relevantSubCategories: string[];
    if (categoryFilter === 'all') {
        relevantSubCategories = source.map(p => p["ITEM SUB CATEGORY"] || 'N/A');
    } else {
        relevantSubCategories = source
            .filter(p => p["ITEM CATEGORY"] === categoryFilter)
            .map(p => p["ITEM SUB CATEGORY"] || 'N/A');
    }
    return ['all', ...new Set(relevantSubCategories.filter(Boolean))];
  }, [initialProductsLoad, displayedProducts, selectedClassification, categoryFilter]);
  
  useEffect(() => {
    setSubCategoryFilter('all'); 
  }, [categoryFilter, selectedClassification]);


  const clientFilteredProducts = useMemo(() => {
    // These filters operate on `displayedProducts` which are already server-filtered by classification (or all if 'all' classification)
    return displayedProducts.filter(product => {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.trim() !== '');
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
        Object.values(product).some(value => 
          String(value).toLowerCase().includes(term)
        )
      );
      const matchesCategory = categoryFilter === 'all' || product["ITEM CATEGORY"] === categoryFilter;
      const matchesSubCategory = subCategoryFilter === 'all' || product["ITEM SUB CATEGORY"] === subCategoryFilter;
      
      const hasImage = product["IMAGEPATH"] && product["IMAGEPATH"].trim() !== '';
      const matchesImageStatus = 
        imageStatusFilter === 'all' ||
        (imageStatusFilter === 'uploaded' && hasImage) ||
        (imageStatusFilter === 'not-uploaded' && !hasImage);

      return matchesSearch && matchesCategory && matchesSubCategory && matchesImageStatus;
    });
  }, [displayedProducts, searchQuery, categoryFilter, subCategoryFilter, imageStatusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    // setSelectedClassification(''); // Keep classification, or clear it? For now, keep.
    setCategoryFilter('all');
    setSubCategoryFilter('all');
    setImageStatusFilter('all');
  };
  
  const isLoading = isLoadingInitial || isLoadingFiltered;

  if (isLoadingInitial && !sClientSecret) { // Show specific message if not authenticated
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
        <p className="text-muted-foreground">Session token not found. Please log in again.</p>
      </div>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Product Image Management</CardTitle>
        <CardDescription>Select an item classification to load products. Then, manage images and details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2 xl:col-span-1">
              <label htmlFor="classification-filter" className="block text-sm font-medium text-muted-foreground mb-1">Item Classification <span className="text-destructive">*</span></label>
              <Select 
                value={selectedClassification} 
                onValueChange={setSelectedClassification}
                disabled={isLoadingInitial || distinctClassifications.length <= 1}
              >
                <SelectTrigger id="classification-filter" className="h-10">
                  <SelectValue placeholder="Select Classification" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingInitial ? <SelectItem value="loading" disabled>Loading classifications...</SelectItem> :
                    distinctClassifications.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Classifications' : cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2 xl:col-span-2">
              <label htmlFor="search-products" className="block text-sm font-medium text-muted-foreground mb-1">Search Products</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-products"
                  placeholder="Search loaded products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-10"
                  disabled={!selectedClassification || isLoadingFiltered || displayedProducts.length === 0}
                />
              </div>
            </div>
            
            <div className="xl:col-span-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={!selectedClassification || isLoadingFiltered || distinctCategories.length <=1 || displayedProducts.length === 0}>
                <SelectTrigger id="category-filter" className="h-10">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {distinctCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-1">
              <label htmlFor="subcategory-filter" className="block text-sm font-medium text-muted-foreground mb-1">Sub-Category</label>
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter} disabled={!selectedClassification || isLoadingFiltered || distinctSubCategories.length <=1 || displayedProducts.length === 0}>
                <SelectTrigger id="subcategory-filter" className="h-10">
                  <SelectValue placeholder="Filter by sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {distinctSubCategories.map(subcat => (
                    <SelectItem key={subcat} value={subcat}>{subcat === 'all' ? 'All Sub-Categories' : subcat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="xl:col-span-1">
              <label htmlFor="image-status-filter" className="block text-sm font-medium text-muted-foreground mb-1">Image Status</label>
              <Select value={imageStatusFilter} onValueChange={setImageStatusFilter as (value: string) => void} disabled={!selectedClassification || isLoadingFiltered || displayedProducts.length === 0}>
                <SelectTrigger id="image-status-filter" className="h-10">
                  <SelectValue placeholder="Filter by image status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="not-uploaded">Not Uploaded</SelectItem>
                </SelectContent>
              </Select>
            </div>

             <div className="xl:col-span-1">
                <Button onClick={handleClearFilters} variant="outline" className="w-full h-10" disabled={!selectedClassification || isLoadingFiltered || displayedProducts.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            </div>
          </div>
        </div>

        {error && (
            <div className="my-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-center">
                <AlertTriangle className="inline-block mr-2 h-5 w-5" /> {error}
            </div>
        )}

        {isLoading && (
             <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading products...</p>
            </div>
        )}

        {!isLoading && !selectedClassification && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ListFilter className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Please select an ITEM CLASSIFICATION to view products.</p>
          </div>
        )}

        {!isLoading && selectedClassification && clientFilteredProducts.length === 0 && displayedProducts.length > 0 && (
             <div className="flex flex-col items-center justify-center h-40 text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products match your current filters for '{selectedClassification}'.</p>
            </div>
        )}
         {!isLoading && selectedClassification && displayedProducts.length === 0 && !error && (
             <div className="flex flex-col items-center justify-center h-40 text-center">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products found for classification '{selectedClassification}'.</p>
            </div>
        )}


        {!isLoading && selectedClassification && clientFilteredProducts.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS_TO_DISPLAY.map(colName => (
                      <TableHead key={colName} className="whitespace-nowrap">{colName.replace("ITEM ", "")}</TableHead>
                    ))}
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientFilteredProducts.map((product) => (
                    <TableRow key={product["ITEM CODE"]}>
                      {COLUMNS_TO_DISPLAY.map(colName => (
                        <TableCell key={colName} className="whitespace-nowrap py-2 text-xs">
                          {colName === "IMAGEPATH" ? (
                            product["IMAGEPATH"] ? (
                              <div className="relative h-12 w-12 rounded overflow-hidden border bg-white">
                                <Image 
                                  src={product["IMAGEPATH"]} 
                                  alt={product["ITEM NAME"]} 
                                  layout="fill" 
                                  objectFit="contain"
                                  data-ai-hint="product image"
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">No Image</span>
                            )
                          ) : (
                            product[colName] ?? 'N/A'
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center py-2">
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => alert(`Upload for ${product["ITEM CODE"]}`)}>
                          <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Showing {clientFilteredProducts.length} of {displayedProducts.length} products for '{selectedClassification}'.
              {initialProductsLoad.length > 0 && selectedClassification === 'all' && ` (Total ${initialProductsLoad.length} products in system)`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
