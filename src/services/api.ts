
'use client';
import type { AdminProduct, Product, UserSignupPayload, UserSignupResponse } from '@/types';
import axios from 'axios';

// This apiClient is for public-facing API calls
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const HARDCODED_SESSION_TOKEN = "MjU3OTU0ZTAxNWJlNTNkN2M5MTE2MTI3NzM3YzhmZDY6N2RhZWE2NmNhMzRjYzIyMzQ1OWU0NjAwODI4NDVmNzU1NmUwMmM0MjdjMGQ3MTMxYWRkZDE4NDU4NTI5OWIwMy8yNTc5NTRlMDE1YmU1M2Q3YzkxMTYxMjc3MzdjOGZkNjplZGZlNDY3M2M0YzQ4MGVjYzg1NjFmZTM1MDFmZTI2NS8yNTc5NTRlMDE1YmU1M2Q3YzkxMTYxMjc3MzdjOGZkNjo3MjQ3YmZmOWMxZWEyMWRkYTQwZDA1OGU2ZTM0MDAyNi8yNTc5NTRlMDE1YmU1M2Q3YzkxMTYxMjc3MzdjOGZkNjo3YjYyZjgxMTA4ZjI4NzRjNDRiM2EwZWMwNGVlYzQzNw==";

// Fetches products from viewname=792 for public display
export const fetchProductsAPI = () => {
  return apiClient.get<AdminProduct[]>('https://devapi.tech23.net/global/globalViewHandler?viewname=792', {
    headers: {
      'session-token': HARDCODED_SESSION_TOKEN,
    }
  });
};

// API for User Signup (SP 128)
export const userSignupAPI = (payload: UserSignupPayload) => {
  // Per user request, using the same hardcoded token for signup.
  // This is unusual for a public signup.
  return apiClient.post<UserSignupResponse>(
    'https://devapi.tech23.net/global/globalSPHandler?spname=128', 
    payload,
    {
      headers: {
        'session-token': HARDCODED_SESSION_TOKEN,
      }
    }
  );
};

export default apiClient;
