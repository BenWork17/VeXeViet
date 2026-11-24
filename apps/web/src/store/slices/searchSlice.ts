import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setFilters, setSortBy, setSortOrder, resetFilters } = searchSlice.actions;

export default searchSlice.reducer;
