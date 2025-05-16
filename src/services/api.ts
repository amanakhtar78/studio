
'use client';
import type { AdminProduct, Product, UserSignupPayload, UserSignupResponse, ApiUserDetail, NextPurchaseOrderNumberResponse, SalesEnquiryHeaderPayload, SalesEnquiryItemPayload, SalesEnquiryResponse } from '@/types';
import axios from 'axios';

// This apiClient is for public-facing API calls
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ensure this is the latest, correct token.
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
  return apiClient.post<UserSignupResponse>(
    'https://devapi.tech23.net/global/globalSPHandler?spname=128', 
    payload,
    {
      headers: {
        'session-token': HARDCODED_SESSION_TOKEN, 
        'Content-Type': 'application/json',
      }
    }
  );
};

// API to check if user exists (View 610 by Email)
export const checkUserExistsAPI = (email: string) => {
  return apiClient.get<ApiUserDetail[]>( 
    `https://devapi.tech23.net/global/globalViewHandler?viewname=610&EMAILADDRESS=${encodeURIComponent(email)}`,
    {
      headers: {
        'session-token': HARDCODED_SESSION_TOKEN,
      }
    }
  );
};

// API to fetch authenticated user details (View 610 by Email and Password)
export const fetchAuthenticatedUserAPI = (email: string, password?: string) => { 
  let url = `https://devapi.tech23.net/global/globalViewHandler?viewname=610&EMAILADDRESS=${encodeURIComponent(email)}`;
  if (password) {
    url += `&PASSWORD=${encodeURIComponent(password)}`;
  }
  return apiClient.get<ApiUserDetail[]>(url, { 
    headers: {
      'session-token': HARDCODED_SESSION_TOKEN,
    }
  });
};

// --- START CHECKOUT ORDER SAVING API FUNCTIONS ---
export const fetchNextSalesEnquiryNoAPI = () => {
  return apiClient.get<NextPurchaseOrderNumberResponse>(
    `https://devapi.tech23.net/global/globalViewHandler?viewname=408`,
    {
      headers: {
        "session-token": HARDCODED_SESSION_TOKEN,
      },
    }
  );
};

export const saveSalesEnquiryHeaderAPI = (payload: SalesEnquiryHeaderPayload) => {
  return apiClient.post<SalesEnquiryResponse>(
    `https://devapi.tech23.net/global/globalSPHandler?spname=205`,
    payload,
    {
      headers: {
        "session-token": HARDCODED_SESSION_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const saveSalesEnquiryItemAPI = (payload: SalesEnquiryItemPayload) => {
  return apiClient.post<SalesEnquiryResponse>(
    `https://devapi.tech23.net/global/globalSPHandler?spname=206`, 
    payload,
    {
      headers: {
        "session-token": HARDCODED_SESSION_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );
};
// --- END CHECKOUT ORDER SAVING API FUNCTIONS ---


export default apiClient;
