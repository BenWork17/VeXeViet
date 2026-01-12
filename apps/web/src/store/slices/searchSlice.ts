import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Route } from '@vexeviet/types';

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  busTypes?: string[];
  departureTimeRange?: {
    start: string;
    end: string;
  };
  amenities?: string[];
}

export interface SearchState {
  filters: SearchFilters;
  sortBy: 'price' | 'duration' | 'departure' | 'rating';
  sortOrder: 'asc' | 'desc';
  results: Route[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  filters: {
    minPrice: 0,
    maxPrice: 10000000,
    busTypes: [],
    departureTimeRange: undefined,
    amenities: [],
  },
  sortBy: 'price',
  sortOrder: 'asc',
  results: [],
  loading: false,
  error: null,
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSortBy: (state, action: PayloadAction<'price' | 'duration' | 'departure' | 'rating'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setResults: (state, action: PayloadAction<Route[]>) => {
      state.results = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { 
  setFilters, 
  setSortBy, 
  setSortOrder, 
  setResults, 
  setLoading, 
  setError, 
  resetFilters 
} = searchSlice.actions;

export default searchSlice.reducer;
