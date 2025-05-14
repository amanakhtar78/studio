
import type { Category, AdminProduct } from '@/types';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { fetchProductsAPI } from '@/services/api'; // We need products to derive categories

interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
};

const generateSlug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');

// Fetch categories by first fetching products and then deriving unique categories from them
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const productResponse = await fetchProductsAPI(); // Fetches AdminProduct[]
  const uniqueCategoryNames = new Set<string>();
  productResponse.data.forEach((product: AdminProduct) => {
    if (product["ITEM CATEGORY"]) {
      uniqueCategoryNames.add(product["ITEM CATEGORY"]);
    }
  });
  
  return Array.from(uniqueCategoryNames).map((name) => {
    const slug = generateSlug(name);
    return {
      id: `cat-${slug}`,
      name: name, // API provides capitalized names usually, otherwise: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      slug: slug,
    };
  });
});

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export default categorySlice.reducer;
