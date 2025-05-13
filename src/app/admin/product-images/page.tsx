
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
        // Initially fetch only distinct classifications to populate the first dropdown
        // Or fetch all for "all" option if that's the initial state.
        // For now, let's assume it fetches classifications first if possible, or a small subset of products.
        // If the API only gives all products, we must fetch all.
        const response = await fetchGlobalViewDataAPI('792', sClientSecret); 
        if (isMountedGuard) {
          if (response.data && Array.isArray(response.data.data)) { // API wraps data in a 'data' property
            setInitialProductsLoad(response.data.data);
            // if no classification selected initially, don't set displayedProducts yet
            // if a default classification should be active, filter and setDisplayedProducts here
          } else {
            setInitialProductsLoad([]);
            setError('Received invalid initial product data format.');
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


  useEffect(() => {
    let isMountedGuard = true;
    const fetchProductsByClassification = async () => {
      if (!sClientSecret || !selectedClassification) {
         if (isMountedGuard) setDisplayedProducts([]); 
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
        const response = await fetchGlobalViewDataAPI('792', sClientSecret, selectedClassification);
        if (isMountedGuard) {
          if (response.data && Array.isArray(response.data.data)) {
            setDisplayedProducts(response.data.data);
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

    if (selectedClassification) {
        fetchProductsByClassification();
    } else {
        // If no classification is selected and initialProductsLoad is populated, 
        // this implies we might want to show all products or a message.
        // For now, clearing displayed products if no specific classification is chosen
        // (unless 'all' is handled above).
        if (isMountedGuard && selectedClassification !== 'all') setDisplayedProducts([]);
    }
    return () => { isMountedGuard = false; };
  }, [selectedClassification, sClientSecret, initialProductsLoad]);


  const distinctClassifications = useMemo(() => {
    return ['all', ...new Set(initialProductsLoad.map(p => p["ITEM CLASSIFICATION"] || 'N/A').filter(Boolean).sort())];
  }, [initialProductsLoad]);

  const distinctCategories = useMemo(() => {
    const source = displayedProducts.length > 0 ? displayedProducts : initialProductsLoad;
    return ['all', ...new Set(source.map(p => p["ITEM CATEGORY"] || 'N/A').filter(Boolean).sort())];
  }, [initialProductsLoad, displayedProducts]);

  const distinctSubCategories = useMemo(() => {
    const source = displayedProducts.length > 0 ? displayedProducts : initialProductsLoad;
    let relevantSubCategories: string[];
    if (categoryFilter === 'all') {
        relevantSubCategories = source.map(p => p["ITEM SUB CATEGORY"] || 'N/A');
    } else {
        relevantSubCategories = source
            .filter(p => p["ITEM CATEGORY"] === categoryFilter)
            .map(p => p["ITEM SUB CATEGORY"] || 'N/A');
    }
    return ['all', ...new Set(relevantSubCategories.filter(Boolean).sort())];
  }, [initialProductsLoad, displayedProducts, categoryFilter]);
  
  useEffect(() => {
    setSubCategoryFilter('all'); 
  }, [categoryFilter, selectedClassification]);


  const clientFilteredProducts = useMemo(() => {
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
  };

  const handleOpenUploadDialog = (product: AdminProduct) => {
    setSelectedProductForUpload(product);
    setIsUploadDialogOpen(true);
  };

  const handleUploadSuccess = (itemCode: string, newImagePath: string) => {
    const updateProductList = (list: AdminProduct[]) => 
      list.map(p => p["ITEM CODE"] === itemCode ? { ...p, "IMAGEPATH": newImagePath } : p);

    setDisplayedProducts(prev => updateProductList(prev));
    if (selectedClassification === 'all') { // Also update initialProductsLoad if "All Classifications" is active
        setInitialProductsLoad(prev => updateProductList(prev));
    }
    
    setIsUploadDialogOpen(false);
    setSelectedProductForUpload(null);
    // Toast is handled within the dialog
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

          {!isLoading && !selectedClassification && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ListFilter className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Please select an ITEM CLASSIFICATION to view products.</p>
            </div>
          )}

          {!isLoading && selectedClassification && clientFilteredProducts.length === 0 && displayedProducts.length > 0 && !error && (
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
                Showing {clientFilteredProducts.length} of {displayedProducts.length} products for '{selectedClassification}'.
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

