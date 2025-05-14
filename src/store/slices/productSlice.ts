
import type { Product, AdminProduct } from '@/types';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { fetchProductsAPI } from '@/services/api';

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await fetchProductsAPI();
  // Map AdminProduct[] from API to Product[] for the application
  return response.data.map((adminProduct: AdminProduct): Product => ({
    id: adminProduct["ITEM CODE"],
    title: adminProduct["ITEM NAME"],
    price: adminProduct["SELLINGPRICE"] ?? 0, // Default to 0 if null
    description: adminProduct["ITEM DESCRIPTION"],
    category: adminProduct["ITEM CATEGORY"],
    image: adminProduct["IMAGEPATH"], // Can be string or null
    classification: adminProduct["ITEM CLASSIFICATION"],
    rating: {
      rate: adminProduct["RATING"] ?? 0, // Default to 0 if null
      count: 0, // New API doesn't provide count, so default
    },
    stockAvailability: true, // Defaulting to true as API doesn't provide this
    // Optionally map other fields if needed by the Product type
    PART_NO: adminProduct["PART NO"],
    ITEM_BASE_UOM: adminProduct["ITEM BASE UOM"],
    // ... other raw fields if necessary
  }));
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export default productSlice.reducer;
