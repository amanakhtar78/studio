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
import { Loader2, AlertTriangle, Search, ListFilter, UploadCloud, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadImageDialog } from '@/components/admin/upload-image-dialog'; // Import the dialog
import { useToast } from '@/hooks/use-toast';

const COLUMNS_TO_DISPLAY: (keyof AdminProduct)[] = ["ITEM CODE", "ITEM NAME", "ITEM DESCRIPTION", "ITEM CATEGORY", "ITEM SUB CATEGORY", "ITEM CLASSIFICATION", "IMAGEPATH"];

export default function ProductImagesPage() {
  const sClientSecret = useSelector((state: RootState) => state.adminAuth.sClientSecret);
  const { toast } = useToast();
  
  const [initialProductsLoad, setInitialProductsLoad] = useState<AdminProduct[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<AdminProduct[]>([]);
  
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedClassification, setSelectedClassification] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');
  const [imageStatusFilter, setImageStatusFilter] = useState<ImageFilterStatus>('all');

  // State for upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedProductForUpload, setSelectedProductForUpload] = useState<AdminProduct | null>(null);


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
        // Fetch all products initially to populate classifications and potentially "All Classifications" view
        const response = await fetchGlobalViewDataAPI('792', sClientSecret); 
        if (isMountedGuard) {
          // API returns an array directly in response.data
          if (response.data && Array.isArray(response.data)) { 
            setInitialProductsLoad(response.data);
            // If no classification is selected initially, or "all" is selected,
            // set displayedProducts to the full initial load.
            if (!selectedClassification || selectedClassification === 'all') {
              setDisplayedProducts(response.data);
            }
          } else {
            setInitialProductsLoad([]);
            setDisplayedProducts([]);
            setError('Received invalid initial product data format.');
          }
        }
      } catch (err: any) {
        if (isMountedGuard) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch initial product data.');
          setInitialProductsLoad([]);
          setDisplayedProducts([]);
        }
      } finally {
        if (isMountedGuard) setIsLoadingInitial(false);
      }
    };
    fetchInitialData();
    return () => { isMountedGuard = false; };
  }, [sClientSecret]); // Removed selectedClassification from deps to prevent re-fetch on its change before full filter logic runs


  useEffect(() => {
    let isMountedGuard = true;
    const fetchProductsByClassification = async () => {
      if (!sClientSecret || !selectedClassification) {
         if (isMountedGuard) setDisplayedProducts(initialProductsLoad); // Show all if no specific class selected
        return;
      }
      if (selectedClassification === 'all') {
        if (isMountedGuard) setDisplayedProducts(initialProductsLoad);
        return;
      }

      if(isMountedGuard) {
        setIsLoadingFiltered(true);
        setError(null);
      }
      try {
        // The API is called with the classification parameter
        const response = await fetchGlobalViewDataAPI('792', sClientSecret, selectedClassification);
        if (isMountedGuard) {
          // API returns an array directly in response.data
          if (response.data && Array.isArray(response.data)) {
            setDisplayedProducts(response.data);
          } else {
            setDisplayedProducts([]);
            setError('Received invalid product data format for classification.');
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

    // Only fetch if a specific classification (not 'all' and not empty) is selected
    if (selectedClassification && selectedClassification !== 'all') {
        fetchProductsByClassification();
    } else if (selectedClassification === 'all') {
        // If 'all' is selected, use the initially loaded full list
        if (isMountedGuard) setDisplayedProducts(initialProductsLoad);
    } else {
        // If no classification is selected (initial state before user interaction), 
        // use the initially loaded full list (which might be empty if initial load hasn't finished)
         if (isMountedGuard) setDisplayedProducts(initialProductsLoad);
    }
    return () => { isMountedGuard = false; };
  }, [selectedClassification, sClientSecret, initialProductsLoad]);


  const distinctClassifications = useMemo(() => {
    // Populate classifications from the full initial load, ensuring 'all' is an option
    return ['all', ...new Set(initialProductsLoad.map(p => p["ITEM CLASSIFICATION"] || 'N/A').filter(Boolean).sort())];
  }, [initialProductsLoad]);

  const distinctCategories = useMemo(() => {
    // Categories should be derived from the currently displayedProducts (after classification filter)
    return ['all', ...new Set(displayedProducts.map(p => p["ITEM CATEGORY"] || 'N/A').filter(Boolean).sort())];
  }, [displayedProducts]);

  const distinctSubCategories = useMemo(() => {
    let sourceForSubCategories = displayedProducts;
    if (categoryFilter !== 'all') {
        sourceForSubCategories = displayedProducts.filter(p => p["ITEM CATEGORY"] === categoryFilter);
    }
    return ['all', ...new Set(sourceForSubCategories.map(p => p["ITEM SUB CATEGORY"] || 'N/A').filter(Boolean).sort())];
  }, [displayedProducts, categoryFilter]);
  
  useEffect(() => {
    // Reset sub-category filter when category or classification changes
    setSubCategoryFilter('all'); 
  }, [categoryFilter, selectedClassification]);


  const clientFilteredProducts = useMemo(() => {
    // This filtering happens client-side on `displayedProducts`
    return displayedProducts.filter(product => {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.trim() !== '');
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
        Object.values(product).some(value => 
          String(value).toLowerCase().includes(term)
        )
      );
      const matchesCategory = categoryFilter === 'all' || product["ITEM CATEGORY"] === categoryFilter;
      const matchesSubCategory = subCategoryFilter === 'all' || product["ITEM SUB CATEGORY"] === subCategoryFilter;
      
      const hasImage = product["IMAGEPATH"] && product["IMAGEPATH"].trim() !== '' && product["IMAGEPATH"].toLowerCase() !== 'null';
      const matchesImageStatus = 
        imageStatusFilter === 'all' ||
        (imageStatusFilter === 'uploaded' && hasImage) ||
        (imageStatusFilter === 'not-uploaded' && !hasImage);

      return matchesSearch && matchesCategory && matchesSubCategory && matchesImageStatus;
    });
  }, [displayedProducts, searchQuery, categoryFilter, subCategoryFilter, imageStatusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSubCategoryFilter('all');
    setImageStatusFilter('all');
    // Optionally, reset selectedClassification to 'all' or empty if desired
    // setSelectedClassification('all'); // This would re-trigger data fetching for all
  };

  const handleOpenUploadDialog = (product: AdminProduct) => {
    setSelectedProductForUpload(product);
    setIsUploadDialogOpen(true);
  };

  const handleUploadSuccess = (itemCode: string, newImagePath: string) => {
    const updateProductList = (list: AdminProduct[]) => 
      list.map(p => p["ITEM CODE"] === itemCode ? { ...p, "IMAGEPATH": newImagePath } : p);

    setDisplayedProducts(prev => updateProductList(prev));
    // If "All Classifications" was active OR if the updated product matches the current classification,
    // also update the initialProductsLoad to reflect the change globally.
    if (selectedClassification === 'all' || 
        initialProductsLoad.find(p => p["ITEM CODE"] === itemCode && p["ITEM CLASSIFICATION"] === selectedClassification)) {
      setInitialProductsLoad(prev => updateProductList(prev));
    }
    
    setIsUploadDialogOpen(false);
    setSelectedProductForUpload(null);
  };
  
  const isLoading = isLoadingInitial || isLoadingFiltered;

  if (isLoadingInitial && !sClientSecret) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
        <p className="text-muted-foreground">Session token not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Product Image Management</CardTitle>
          <CardDescription>Select an item classification to load products. Then, manage images and details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-6 gap-4 items-end">
              <div className="lg:col-span-2 xl:col-span-1">
                <label htmlFor="classification-filter" className="block text-sm font-medium text-muted-foreground mb-1">Item Classification <span className="text-destructive">*</span></label>
                <Select 
                  value={selectedClassification} 
                  onValueChange={setSelectedClassification}
                  disabled={isLoadingInitial && distinctClassifications.length <= 1} // Disable if still loading initial or only 'all'
                >
                  <SelectTrigger id="classification-filter" className="h-10">
                    <SelectValue placeholder="Select Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingInitial && distinctClassifications.length <= 1 ? <SelectItem value="loading" disabled>Loading classifications...</SelectItem> :
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
                  <Button onClick={handleClearFilters} variant="outline" className="w-full h-10 mt-5" disabled={!selectedClassification || isLoadingFiltered || displayedProducts.length === 0}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
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

          {!isLoading && !selectedClassification && initialProductsLoad.length > 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ListFilter className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Please select an ITEM CLASSIFICATION to view specific products, or 'All Classifications' is currently active.</p>
            </div>
          )}
           {!isLoading && !selectedClassification && initialProductsLoad.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ListFilter className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Please select an ITEM CLASSIFICATION to view products.</p>
            </div>
          )}


          {!isLoading && selectedClassification && clientFilteredProducts.length === 0 && displayedProducts.length > 0 && !error && (
               <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No products match your current filters for '{selectedClassification === 'all' ? 'All Classifications' : selectedClassification}'.</p>
              </div>
          )}
           {!isLoading && selectedClassification && displayedProducts.length === 0 && !error && (
               <div className="flex flex-col items-center justify-center h-40 text-center">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No products found for classification '{selectedClassification === 'all' ? 'All Classifications' : selectedClassification}'.</p>
              </div>
          )}

          {!isLoading && selectedClassification && clientFilteredProducts.length > 0 && (
            <>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {COLUMNS_TO_DISPLAY.map(colName => (
                        <TableHead key={colName} className="whitespace-nowrap bg-muted/50 text-xs font-semibold">
                            {colName.replace(/ITEM\s/g, "")}
                        </TableHead>
                      ))}
                      <TableHead className="text-center whitespace-nowrap bg-muted/50 text-xs font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientFilteredProducts.map((product) => (
                      <TableRow key={product["ITEM CODE"]} className="hover:bg-muted/20">
                        {COLUMNS_TO_DISPLAY.map(colName => (
                          <TableCell key={colName} className="whitespace-nowrap py-2 text-xs">
                            {colName === "IMAGEPATH" ? (
                              product["IMAGEPATH"] && product["IMAGEPATH"].trim() !== '' && product["IMAGEPATH"].toLowerCase() !== 'null' ? (
                                <div className="relative h-12 w-12 rounded overflow-hidden border bg-white p-0.5">
                                  <Image 
                                    src={product["IMAGEPATH"]} 
                                    alt={product["ITEM NAME"]} 
                                    layout="fill" 
                                    objectFit="contain"
                                    data-ai-hint="product image"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/64/64?grayscale'; (e.target as HTMLImageElement).alt="Error loading image"; }}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic text-[10px]">No Image</span>
                              )
                            ) : (
                              <span title={String(product[colName])} className="block max-w-xs truncate">{product[colName] ?? 'N/A'}</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center py-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-8" 
                            onClick={() => handleOpenUploadDialog(product)}
                          >
                            <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Showing {clientFilteredProducts.length} of {displayedProducts.length} products for '{selectedClassification === 'all' ? "All Classifications" : selectedClassification}'.
                {initialProductsLoad.length > 0 && selectedClassification === 'all' && ` (Total ${initialProductsLoad.length} products in system)`}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {selectedProductForUpload && sClientSecret && (
        <UploadImageDialog
          isOpen={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          itemCode={selectedProductForUpload["ITEM CODE"]}
          itemName={selectedProductForUpload["ITEM NAME"]}
          sClientSecret={sClientSecret}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
