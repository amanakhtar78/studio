
'use client';
import axios from 'axios';
import type { AdminLoginResponse, AdminProduct } from '@/types';

const adminApiClient = axios.create({
  baseURL: 'https://devapi.tech23.net/cpanel', 
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AdminLoginPayload {
  MODULENAME: "ECOMMERCE";
  email: string;
  password?: string; 
}


export const adminLoginAPI = (payload: AdminLoginPayload) => 
  adminApiClient.post<AdminLoginResponse>('/login', payload);

export const fetchGlobalViewDataAPI = async (
  viewname: string, 
  token: string,
  classification?: string
) => {
  let url = `https://devapi.tech23.net/global/globalViewHandler?viewname=${viewname}`;
  if (classification && classification !== 'all') {
    url += `&ITEM CLASSIFICATION=${encodeURIComponent(classification)}`;
  }
  return axios.get<AdminProduct[]>(url, {
    headers: {
      'session-token': token,
      'Content-Type': 'application/json',
    },
  });
};


export default adminApiClient;
