
'use client';
import axios from 'axios';
import type { AdminLoginResponse, AdminProduct, UploadImageApiResponse, UpdateProductImagePathPayload, UpdateProductImagePathResponse } from '@/types';

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
  return axios.get<{ data: AdminProduct[] }>(url, { // Adjusting to expect { data: AdminProduct[] } based on previous usage
    headers: {
      'session-token': token,
      'Content-Type': 'application/json',
    },
  });
};

export const uploadImageAPI = async (file: File): Promise<UploadImageApiResponse> => {
  const formData = new FormData();
  formData.append("imageValue", file);
  const response = await axios.post<UploadImageApiResponse>(
    "https://devapi.tech23.net/fileupload/uploadImage",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
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

