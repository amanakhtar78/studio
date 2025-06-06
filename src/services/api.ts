
'use client';
import type { AdminProduct, UserSignupPayload, UserSignupResponse, ApiUserDetail, NextPurchaseOrderNumberResponse, SalesEnquiryHeaderPayload, SalesEnquiryItemPayload, SalesEnquiryResponse, ApiOrderHeader, ApiOrderItemDetail } from '@/types';
import axios from 'axios';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const HARDCODED_SESSION_TOKEN = "MjU3OTU0ZTAxNWJlNTNkN2M5MTE2MTI3NzM3YzhmZDY6N2RhZWE2NmNhMzRjYzIyMzQ1OWU0NjAwODI4NDVmNzU1NmUwMmM0MjdjMGQ3MTMxYWRkZDE4NDU4NTI5OWIwMy8yNTc5NTRlMDE1YmU1M2Q3YzkxMTYxMjc3MzdjOGZkNjplZGZlNDY3M2M0YzQ4MGVjYzg1NjFmZTM1MDFmZTI2NS8yNTc5NTRlMDE1YmU1M2Q3YzkxMTYxMjc3MzdjOGZkNjo3MjQ3YmZmOWMxZWEyMWRkYTQwZDA1OGU2ZTM0MDAyNi8yNTc5NTRlMDE1YmU1M2Q3YzkxMTYxMjc3MzdjOGZkNjo3YjYyZjgxMTA4ZjI4NzRjNDRiM2EwZWMwNGVlYzQzNw==";

export const fetchProductsAPI = () => {
  return apiClient.get<AdminProduct[]>('https://devapi.tech23.net/global/globalViewHandler?viewname=792', {
    headers: {
      'session-token': HARDCODED_SESSION_TOKEN,
    }
  });
};

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

export const fetchOrderHistoryAPI = (clientEmail: string) => {
  return apiClient.get<ApiOrderHeader[]>(
    `https://devapi.tech23.net/global/globalViewHandler?viewname=655&CLIENTEMAIL=${encodeURIComponent(clientEmail)}`,
    {
      headers: {
        'session-token': HARDCODED_SESSION_TOKEN,
      }
    }
  );
};

// New API to fetch order items for a specific order
export const fetchOrderItemsAPI = (orderId: string) => {
  return apiClient.get<ApiOrderItemDetail[]>(
    `https://devapi.tech23.net/global/globalViewHandler?viewname=654&ENQUIRYNO=${encodeURIComponent(orderId)}`,
    {
      headers: {
        'session-token': HARDCODED_SESSION_TOKEN,
      }
    }
  );
};

export default apiClient;
