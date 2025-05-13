
'use client';
import axios from 'axios';
import type { AdminLoginResponse } from '@/types';

const adminApiClient = axios.create({
  baseURL: 'https://devapi.tech23.net/cpanel', 
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AdminLoginPayload {
  MODULENAME: "ECOMMERCE";
  email0: string; // API expects email0
  password?: string; // API expects password, can be optional if not always sent
}


export const adminLoginAPI = (payload: AdminLoginPayload) => 
  adminApiClient.post<AdminLoginResponse>('/login', payload);

export default adminApiClient;
