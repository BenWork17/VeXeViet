import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  getCities,
  getPopularRoutes,
  getRouteById,
  searchRoutes,
} from '@/lib/api/routes';
import { parseApiError } from '@/lib/api/client';
import type { Route, SearchRoutesParams } from '@vexeviet/types';

export const routeKeys = {
  all: ['routes'] as const,
  search: (params: SearchRoutesParams) => [...routeKeys.all, 'search', params] as const,
  detail: (id: string) => [...routeKeys.all, 'detail', id] as const,
  popular: (limit?: number) => [...routeKeys.all, 'popular', limit ?? 'all'] as const,
  cities: () => ['cities'] as const,
};

export const routeQueries = {
  all: () => routeKeys.all,
  search: (params: SearchRoutesParams) =>
    queryOptions({
      queryKey: routeKeys.search(params),
      queryFn: () =>
        searchRoutes({
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
        }),
      staleTime: 2 * 60 * 1000,
      retry: (failureCount: number, error: unknown) => {
        const parsed = parseApiError(error);
        if (parsed.code === 'VALIDATION_ERROR') return false;
        return failureCount < 3;
      },
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: routeKeys.detail(id),
      queryFn: () => getRouteById(id),
      staleTime: 5 * 60 * 1000,
    }),
  popular: (limit?: number) =>
    queryOptions({
      queryKey: routeKeys.popular(limit),
      queryFn: () => getPopularRoutes(limit) as Promise<Route[]>,
      staleTime: 10 * 60 * 1000,
    }),
  cities: () =>
    queryOptions({
      queryKey: routeKeys.cities(),
      queryFn: getCities,
      staleTime: 30 * 60 * 1000,
    }),
};

export function useSearchRoutes(params: SearchRoutesParams | null) {
  return useQuery({
    queryKey: params ? routeKeys.search(params) : (['routes', 'search', 'disabled'] as const),
    queryFn: () => {
      if (!params) throw new Error('Search params are required');
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
    enabled: Boolean(params?.from && params?.to && params?.date),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRoute(routeId: string | null) {
  return useQuery({
    ...routeQueries.detail(routeId ?? ''),
    enabled: Boolean(routeId),
  });
}

export function usePopularRoutes(limit?: number) {
  return useQuery(routeQueries.popular(limit));
}

export function useCities() {
  return useQuery(routeQueries.cities());
}
