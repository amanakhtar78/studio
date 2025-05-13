
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
import { Loader2, AlertTriangle, Search, Filter, UploadCloud, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLUMNS_TO_DISPLAY: (keyof AdminProduct)[] = ["ITEM CODE", "ITEM NAME", "ITEM DESCRIPTION", "ITEM CATEGORY", "ITEM SUB CATEGORY", "IMAGEPATH"];

export default function ProductImagesPage() {
  const sClientSecret = useSelector((state: RootState) => state.adminAuth.sClientSecret);
  
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state is true
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');
  const [imageStatusFilter, setImageStatusFilter] = useState<ImageFilterStatus>('all');

  useEffect(() => {
    let isMountedGuard = true;

    const fetchData = async () => {
      if (!sClientSecret) {
        if (isMountedGuard) {
          setError('Authentication secret not found. Please log in again.');
          setProducts([]);
          setIsLoading(false);
        }
        return;
      }

      if (isMountedGuard) {
        setIsLoading(true); // Set loading to true before starting the fetch
        setError(null); // Clear previous errors
      }
      
      try {
        const response = await fetchGlobalViewDataAPI('792', sClientSecret);
        if (isMountedGuard) {
          if (Array.isArray(response.data)) {
            setProducts(response.data);
          } else {
            setProducts([]);
            setError('Received invalid product data from server.');
            console.warn("API response for products was not an array:", response.data);
          }
        }
      } catch (err: any) {
        if (isMountedGuard) {
          console.error("Error fetching product data:", err);
          setError(err.response?.data?.message || err.message || 'Failed to fetch product data.');
          setProducts([]); // Clear products on error
        }
      } finally {
        if (isMountedGuard) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMountedGuard = false; // Cleanup function to prevent state updates if component unmounts
    };
  }, [sClientSecret]);

  const distinctCategories = useMemo(() => {
    return ['all', ...new Set(products.map(p => p["ITEM CATEGORY"] || 'N/A').filter(cat => cat !== 'N/A'))];
  }, [products]);

  const distinctSubCategories = useMemo(() => {
    let relevantSubCategories: string[];
    if (categoryFilter === 'all') {
        relevantSubCategories = products.map(p => p["ITEM SUB CATEGORY"] || 'N/A');
    } else {
        relevantSubCategories = products
            .filter(p => p["ITEM CATEGORY"] === categoryFilter)
            .map(p => p["ITEM SUB CATEGORY"] || 'N/A');
    }
    return ['all', ...new Set(relevantSubCategories.filter(subcat => subcat !== 'N/A'))];
  }, [products, categoryFilter]);
  
  useEffect(() => {
    setSubCategoryFilter('all'); 
  }, [categoryFilter]);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
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
  }, [products, searchQuery, categoryFilter, subCategoryFilter, imageStatusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSubCategoryFilter('all');
    setImageStatusFilter('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading product data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Products</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Product Image Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="search-products" className="block text-sm font-medium text-muted-foreground mb-1">Search Products</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-products"
                  placeholder="Search by code, name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            <div>
              <label htmlFor="subcategory-filter" className="block text-sm font-medium text-muted-foreground mb-1">Sub-Category</label>
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter} disabled={(categoryFilter === 'all' && distinctSubCategories.length <=1) || distinctSubCategories.length <= 1}>
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
            <div>
              <label htmlFor="image-status-filter" className="block text-sm font-medium text-muted-foreground mb-1">Image Status</label>
              <Select value={imageStatusFilter} onValueChange={setImageStatusFilter as (value: string) => void}>
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
             <div className="lg:col-start-5">
                <Button onClick={handleClearFilters} variant="outline" className="w-full h-10">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            </div>
          </div>
        </div>

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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={COLUMNS_TO_DISPLAY.length + 1} className="h-24 text-center text-muted-foreground">
                    No products match your current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
         {products.length > 0 && ( // Show total count based on all products, not just filtered ones
          <p className="text-xs text-muted-foreground mt-4">
            Showing {filteredProducts.length} of {products.length} products.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

