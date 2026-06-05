/**
 * React Query hooks for Routes
 */

import { useQuery } from '@tanstack/react-query';
import {
  searchRoutes,
  getRouteById,
  getPopularRoutes,
  getCities,
} from '@/lib/api/routes';
import { parseApiError } from '@/lib/api/client';
import { SearchRoutesParams, type Route } from '@vexeviet/types';

// ========================
// Query Keys
// ========================

export const routeKeys = {
  all: ['routes'] as const,
  search: (params: SearchRoutesParams) => [...routeKeys.all, 'search', params] as const,
  detail: (id: string) => [...routeKeys.all, 'detail', id] as const,
  popular: () => [...routeKeys.all, 'popular'] as const,
  cities: () => ['cities'] as const,
};

// ========================
// Hooks
// ========================

/**
 * Hook to search routes
 */
export function useSearchRoutes(params: SearchRoutesParams | null) {
  return useQuery({
    queryKey: params ? routeKeys.search(params) : ['routes', 'search', 'disabled'],
    queryFn: () => {
      if (!params) {
        throw new Error('Search params are required');
      }

      return searchRoutes({
        origin: params.from,
        destination: params.to,
        departureDate: params.date,
        passengers: params.passengers,
        page: params.page,
        pageSize: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        busType: params.vehicleType,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      });
    },
    enabled: !!params?.from && !!params?.to && !!params?.date,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      const parsed = parseApiError(error);
      if (parsed.code === 'VALIDATION_ERROR') return false;
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get route details
 */
export function useRoute(routeId: string | null) {
  return useQuery({
    queryKey: routeId ? routeKeys.detail(routeId) : ['routes', 'detail', 'disabled'],
    queryFn: () => getRouteById(routeId!),
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get popular routes
 */
export function usePopularRoutes() {
  return useQuery({
    queryKey: routeKeys.popular(),
    queryFn: () => getPopularRoutes() as Promise<Route[]>,
    staleTime: 10 * 60 * 1000, // 10 minutes - popular routes don't change often
  });
}

/**
 * Hook to get cities
 */
export function useCities() {
  return useQuery({
    queryKey: routeKeys.cities(),
    queryFn: getCities,
    staleTime: 30 * 60 * 1000, // 30 minutes - cities rarely change
  });
}
