
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
  email: string; // Changed from email0 to email
  password?: string; 
}


export const adminLoginAPI = (payload: AdminLoginPayload) => 
  adminApiClient.post<AdminLoginResponse>('/login', payload);

export default adminApiClient;

