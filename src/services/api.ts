'use client';
import type { Product } from '@/types';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://fakestoreapi.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProductsAPI = () => apiClient.get<Product[]>('/products');
export const fetchCategoriesAPI = () => apiClient.get<string[]>('/products/categories');
export const fetchProductByIdAPI = (id: number) => apiClient.get<Product>(`/products/${id}`);
