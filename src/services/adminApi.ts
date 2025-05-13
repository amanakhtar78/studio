
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

export const fetchGlobalViewDataAPI = async (viewname: string, token: string) => {
  return axios.get<AdminProduct[]>(`https://devapi.tech23.net/global/globalViewHandler?viewname=${viewname}`, {
    headers: {
      'session-token': token,
      'Content-Type': 'application/json',
    },
  });
};


export default adminApiClient;
