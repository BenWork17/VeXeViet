/**
 * Route API functions
 */

import apiClient from './client';
import {
  ApiResponse,
  Route,
  SearchRoutesResponse,
  City,
  API_ENDPOINTS,
} from '@vexeviet/types';

// ========================
// Route Search API
// ========================

type BackendRoute = Route & {
  fromCity?: string;
  toCity?: string;
  departureCity?: string;
  arrivalCity?: string;
  operatorName?: string;
  seatsAvailable?: number;
  bookedSeats?: number;
};

type SearchApiPagination = Partial<SearchRoutesResponse['pagination']> & {
  pageSize?: number;
};

type SearchApiResponse = {
  routes?: BackendRoute[];
  data?: BackendRoute[] | {
    routes?: BackendRoute[];
    pagination?: SearchApiPagination;
  };
  pagination?: SearchApiPagination;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

const fallbackPopularRoutes: Route[] = [
  {
    id: 'fallback-hcm-da-lat',
    operatorId: 'fallback-operator-1',
    origin: 'TP. Hồ Chí Minh',
    destination: 'Đà Lạt',
    departureTime: '22:00',
    arrivalTime: '04:30',
    duration: 390,
    price: 320000,
    availableSeats: 18,
    totalSeats: 34,
    busType: 'SLEEPER_BUS',
    amenities: ['Wifi', 'Nước uống', 'Chăn'],
    status: 'ACTIVE',
    pickupPoints: [],
    dropoffPoints: [],
    distance: 310,
    operator: { id: 'fallback-operator-1', name: 'VeXeViet Express' },
  },
  {
    id: 'fallback-hcm-nha-trang',
    operatorId: 'fallback-operator-2',
    origin: 'TP. Hồ Chí Minh',
    destination: 'Nha Trang',
    departureTime: '21:30',
    arrivalTime: '06:00',
    duration: 510,
    price: 360000,
    availableSeats: 14,
    totalSeats: 34,
    busType: 'LIMOUSINE',
    amenities: ['Wifi', 'Ghế massage', 'Sạc USB'],
    status: 'ACTIVE',
    pickupPoints: [],
    dropoffPoints: [],
    distance: 430,
    operator: { id: 'fallback-operator-2', name: 'Biển Xanh Limousine' },
  },
  {
    id: 'fallback-ha-noi-sapa',
    operatorId: 'fallback-operator-3',
    origin: 'Hà Nội',
    destination: 'Sa Pa',
    departureTime: '22:15',
    arrivalTime: '05:45',
    duration: 450,
    price: 380000,
    availableSeats: 10,
    totalSeats: 22,
    busType: 'VIP',
    amenities: ['Cabin riêng', 'Wifi', 'Nước uống'],
    status: 'ACTIVE',
    pickupPoints: [],
    dropoffPoints: [],
    distance: 315,
    operator: { id: 'fallback-operator-3', name: 'Tây Bắc VIP' },
  },
  {
    id: 'fallback-da-nang-hue',
    operatorId: 'fallback-operator-4',
    origin: 'Đà Nẵng',
    destination: 'Huế',
    departureTime: '08:00',
    arrivalTime: '10:30',
    duration: 150,
    price: 140000,
    availableSeats: 26,
    totalSeats: 45,
    busType: 'STANDARD',
    amenities: ['Máy lạnh', 'Nước uống'],
    status: 'ACTIVE',
    pickupPoints: [],
    dropoffPoints: [],
    distance: 95,
    operator: { id: 'fallback-operator-4', name: 'Miền Trung Bus' },
  },
];

function parseDurationToMinutes(duration: unknown): number {
  if (typeof duration === 'number') return duration;
  if (typeof duration !== 'string') return 0;

  const hourMatch = duration.match(/(\d+)\s*(?:h|giờ)/i);
  const minuteMatch = duration.match(/(\d+)\s*(?:m|phút)/i);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  if (hours || minutes) return hours * 60 + minutes;

  const numericDuration = Number(duration);
  return Number.isFinite(numericDuration) ? numericDuration : 0;
}

function normalizeRoute(route: BackendRoute): Route {
  const totalSeats = route.totalSeats ?? 0;
  const availableSeats =
    route.availableSeats ??
    route.seatsAvailable ??
    (typeof route.bookedSeats === 'number' ? Math.max(totalSeats - route.bookedSeats, 0) : totalSeats);

  return {
    ...route,
    origin: route.origin ?? route.fromCity ?? route.departureCity ?? '',
    destination: route.destination ?? route.toCity ?? route.arrivalCity ?? '',
    duration: parseDurationToMinutes(route.duration),
    price: typeof route.price === 'string' ? Number(route.price) : route.price,
    availableSeats,
    totalSeats,
    busType: route.busType ?? route.vehicleType ?? 'STANDARD',
    amenities: Array.isArray(route.amenities) ? route.amenities : [],
    pickupPoints: Array.isArray(route.pickupPoints) ? route.pickupPoints : [],
    dropoffPoints: Array.isArray(route.dropoffPoints) ? route.dropoffPoints : [],
    operator: route.operator ?? (route.operatorName ? { id: route.operatorId, name: route.operatorName } : undefined),
  };
}

function buildSearchResponse(apiData: SearchApiResponse): SearchRoutesResponse {
  const dataRoutes = Array.isArray(apiData.data) ? apiData.data : apiData.data?.routes;
  const routes = apiData.routes ?? dataRoutes;
  const dataPagination = Array.isArray(apiData.data) ? undefined : apiData.data?.pagination;
  const pagination = apiData.pagination ?? dataPagination;

  if (!Array.isArray(routes)) {
    console.warn('[searchRoutes] Unexpected response format, returning empty result');
    return {
      routes: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }

  const page = pagination?.page ?? apiData?.page ?? 1;
  const limit = pagination?.limit ?? pagination?.pageSize ?? apiData?.pageSize ?? 20;
  const total = pagination?.total ?? apiData?.total ?? routes.length;

  return {
    routes: routes.map(normalizeRoute),
    pagination: {
      page,
      limit,
      total,
      totalPages: pagination?.totalPages ?? apiData?.totalPages ?? Math.ceil(total / limit),
    },
  };
}

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
  const requestBody = {
    // New backend format
    fromCity: params.origin,
    toCity: params.destination,
    // Also send old format for backwards compatibility
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    passengers: params.passengers,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    page: params.page,
    pageSize: params.pageSize,
  };

  const response = await apiClient.post<SearchApiResponse>(
    API_ENDPOINTS.SEARCH_ROUTES,
    requestBody
  );
  
  console.log('[searchRoutes] API Response:', response.data);
  
  return buildSearchResponse(response.data);
}

/**
 * Get popular routes (GET /api/v1/search/popular)
 */
export async function getPopularRoutes(limit?: number): Promise<Route[]> {
  const fallbackRoutes = limit ? fallbackPopularRoutes.slice(0, limit) : fallbackPopularRoutes;

  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_LIVE_POPULAR_ROUTES !== 'true') {
    return fallbackRoutes;
  }

  const url = limit 
    ? `${API_ENDPOINTS.SEARCH_POPULAR}?limit=${limit}`
    : API_ENDPOINTS.SEARCH_POPULAR;

  try {
    const response = await apiClient.get<ApiResponse<Route[]>>(url);
    return response.data.data.map(normalizeRoute);
  } catch (error) {
    console.warn('[getPopularRoutes] Backend unavailable, using fallback routes', error);
    return fallbackRoutes;
  }
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
