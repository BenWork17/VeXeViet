import apiClient from './client';
import {
  ApiResponse,
  Route,
  SearchRoutesResponse,
  City,
  API_ENDPOINTS,
} from '@vexeviet/types';

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
  data?:
    | BackendRoute[]
    | {
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
    operator:
      route.operator ??
      (route.operatorName ? { id: route.operatorId, name: route.operatorName } : undefined),
  };
}

function buildSearchResponse(apiData: SearchApiResponse): SearchRoutesResponse {
  const dataRoutes = Array.isArray(apiData.data) ? apiData.data : apiData.data?.routes;
  const routes = apiData.routes ?? dataRoutes;
  const dataPagination = Array.isArray(apiData.data) ? undefined : apiData.data?.pagination;
  const pagination = apiData.pagination ?? dataPagination;

  if (!Array.isArray(routes)) {
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
    fromCity: params.origin,
    toCity: params.destination,
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    passengers: params.passengers,
    busType: params.busType,
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

  return buildSearchResponse(response.data);
}

export async function getPopularRoutes(limit?: number): Promise<Route[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return limit ? fallbackPopularRoutes.slice(0, limit) : fallbackPopularRoutes;
  }

  const url = limit
    ? `${API_ENDPOINTS.SEARCH_POPULAR}?limit=${limit}`
    : API_ENDPOINTS.SEARCH_POPULAR;

  const response = await apiClient.get<ApiResponse<Route[]>>(url);
  return response.data.data.map(normalizeRoute);
}

export async function getSearchSuggestions(
  field: 'origin' | 'destination',
  query: string
): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    `${API_ENDPOINTS.SEARCH_SUGGESTIONS}?field=${field}&query=${encodeURIComponent(query)}`
  );
  return response.data.data;
}

export async function getRouteById(id: string): Promise<Route> {
  const response = await apiClient.get<ApiResponse<Route>>(API_ENDPOINTS.ROUTES_BY_ID(id));
  return response.data.data;
}

export async function getCities(): Promise<City[]> {
  const response = await apiClient.get<ApiResponse<City[]>>(API_ENDPOINTS.CITIES);
  return response.data.data;
}
