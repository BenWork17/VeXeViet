/**
 * Route API functions
 */

import apiClient from './client';
import {
  ApiResponse,
  Route,
  SearchRoutesRequest,
  SearchRoutesResponse,
  City,
  API_ENDPOINTS,
} from '@vexeviet/types';

// ========================
// Route Search API
// ========================

/**
 * Search for routes (POST /api/v1/search/routes)
 */
export async function searchRoutes(params: {
  origin: string;
  destination: string;
  departureDate?: string;
  passengers?: number;
  busType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<SearchRoutesResponse> {
  const requestBody: SearchRoutesRequest = {
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    passengers: params.passengers,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sortBy: params.sortBy as SearchRoutesRequest['sortBy'],
    sortOrder: params.sortOrder,
    page: params.page,
    pageSize: params.pageSize,
  };

  const response = await apiClient.post<any>(
    API_ENDPOINTS.SEARCH_ROUTES,
    requestBody
  );
  
  console.log('[searchRoutes] API Response:', response.data);
  
  // API returns { success: true, routes: [], total, page, pageSize, totalPages }
  // We need to transform to { routes, pagination } format
  const apiData = response.data;
  
  // Handle the actual API response format
  if (apiData && apiData.routes) {
    return {
      routes: apiData.routes,
      pagination: {
        page: apiData.page || 1,
        limit: apiData.pageSize || 20,
        total: apiData.total || 0,
        totalPages: apiData.totalPages || 0
      }
    };
  }
  
  // Handle wrapped format { success, data: { routes, pagination } }
  if (apiData && apiData.data && apiData.data.routes) {
    return apiData.data;
  }
  
  // Fallback: return empty result
  console.warn('[searchRoutes] Unexpected response format, returning empty result');
  return {
    routes: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
  };
}

/**
 * Get popular routes (GET /api/v1/search/popular)
 */
export async function getPopularRoutes(limit?: number): Promise<Route[]> {
  const url = limit 
    ? `${API_ENDPOINTS.SEARCH_POPULAR}?limit=${limit}`
    : API_ENDPOINTS.SEARCH_POPULAR;
    
  const response = await apiClient.get<ApiResponse<Route[]>>(url);
  return response.data.data;
}

/**
 * Get search suggestions (GET /api/v1/search/suggestions)
 */
export async function getSearchSuggestions(field: 'origin' | 'destination', query: string): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    `${API_ENDPOINTS.SEARCH_SUGGESTIONS}?field=${field}&query=${encodeURIComponent(query)}`
  );
  return response.data.data;
}

/**
 * Get route by ID
 */
export async function getRouteById(id: string): Promise<Route> {
  const response = await apiClient.get<ApiResponse<Route>>(
    API_ENDPOINTS.ROUTES_BY_ID(id)
  );
  return response.data.data;
}

/**
 * Get all cities
 */
export async function getCities(): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<City[]>>(
    API_ENDPOINTS.CITIES
  );
  return response.data.data;
}
