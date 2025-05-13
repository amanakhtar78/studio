
'use client';
import axios from 'axios';
import type { AdminLoginResponse, AdminProduct, UpdateProductImagePathPayload, UpdateProductImagePathResponse } from '@/types';

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
  // Expect the API to return AdminProduct[] directly in response.data
  return axios.get<AdminProduct[]>(url, { 
    headers: {
      'session-token': token,
      'Content-Type': 'application/json',
    },
  });
};

// Updated to return Promise<string> and expect string in response.data
export const uploadImageAPI = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("imageValue", file);
  const response = await axios.post<string>( // Expecting the response data to be the URL string directly
    "https://devapi.tech23.net/fileupload/uploadImage",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data; // response.data is now the URL string
};

export const updateProductImagePathAPI = async (
  payload: UpdateProductImagePathPayload,
  sessionToken: string
): Promise<UpdateProductImagePathResponse> => {
  const response = await axios.post<UpdateProductImagePathResponse>(
    `https://devapi.tech23.net/global/globalSPHandler?spname=912`,
    payload,
    { headers: { "session-token": sessionToken } }
  );
  return response.data;
};


export default adminApiClient;

