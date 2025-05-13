
'use client';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { adminLoginAPI } from '@/services/adminApi';
import type { AdminAuthState, AdminUser, AdminLoginResponse } from '@/types';

const initialState: AdminAuthState = {
  adminUser: null,
  adminToken: null,
  sClientSecret: null,
  isAdminAuthenticated: false,
  isLoading: false,
  error: null,
};

interface AdminLoginCredentials {
  email: string;
  password?: string; 
}

export const loginAdmin = createAsyncThunk<AdminLoginResponse, AdminLoginCredentials, { rejectValue: string }>(
  'adminAuth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminLoginAPI({
        MODULENAME: "ECOMMERCE",
        email: credentials.email, // Changed from email0 to email
        password: credentials.password,
      });
      if (response.data && response.data.authenticationToken) {
        // Store tokens in session storage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('adminAuthToken', response.data.authenticationToken);
            sessionStorage.setItem('adminSClientSecret', response.data.sclientSecret);
        }
        return response.data;
      } else {
        // Handle cases where API response is successful but doesn't contain expected data
        return rejectWithValue(response.data.user?.userCode || 'Login failed: Invalid response from server');
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);


const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      state.adminUser = null;
      state.adminToken = null;
      state.sClientSecret = null;
      state.isAdminAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('adminAuthToken');
        sessionStorage.removeItem('adminSClientSecret');
      }
    },
    loadAdminFromSession: (state) => {
        if (typeof window !== 'undefined') {
            const token = sessionStorage.getItem('adminAuthToken');
            const sSecret = sessionStorage.getItem('adminSClientSecret');
            // Potentially load user details from session/local storage if you save them there too
            // For this example, we'll just rely on token presence for isAuthenticated
            if (token && sSecret) {
                state.adminToken = token;
                state.sClientSecret = sSecret;
                state.isAdminAuthenticated = true;
                // You might want to fetch user details based on the token here or expect them to be re-fetched/passed
            }
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<AdminLoginResponse>) => {
        state.isLoading = false;
        state.adminUser = action.payload.user;
        state.adminToken = action.payload.authenticationToken;
        state.sClientSecret = action.payload.sclientSecret;
        state.isAdminAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'An unknown error occurred';
        state.isAdminAuthenticated = false;
        state.adminUser = null;
        state.adminToken = null;
        state.sClientSecret = null;
      });
  },
});

export const { logoutAdmin, loadAdminFromSession } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;

