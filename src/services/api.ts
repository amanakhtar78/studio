'use client';
import type { AdminProduct } from '@/types'; // Use AdminProduct for raw API response
import axios from 'axios';

// This apiClient is for public-facing API calls (e.g., fetching products for display)
const apiClient = axios.create({
  // Base URL can be more generic if other public endpoints are added later
  // For now, specific endpoint is used directly in fetchProductsAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetches products from viewname=792. 
// This function assumes the endpoint is publicly accessible without a session token.
// The response is expected to be AdminProduct[], which will be mapped in productSlice.
export const fetchProductsAPI = () => 
  apiClient.get<AdminProduct[]>('https://devapi.tech23.net/global/globalViewHandler?viewname=792');

// Categories are now derived from products, so a separate API call might not be needed.
// If categories were from a different endpoint, it would be here.
// For now, commenting out or removing, as categorySlice will handle derivation.
// export const fetchCategoriesAPI = () => apiClient.get<string[]>('/products/categories'); 

// Fetching a single product by ID might require a different approach or endpoint
// with the new API. For now, this is based on fakestoreapi structure and might
// need to be adapted or removed if not applicable to viewname=792.
// export const fetchProductByIdAPI = (id: string) => apiClient.get<AdminProduct>(`/products/${id}`); // Assuming AdminProduct for single fetch too
