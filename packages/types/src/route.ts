export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type BusType = 'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER';
export type VehicleType = BusType | 'SLEEPER_BUS';

export interface RoutePickupPoint {
  id?: string;
  time: string;
  address: string;
  location: string;
}

export interface RouteDropoffPoint {
  id?: string;
  time: string;
  address: string;
  location: string;
}

export interface RouteOperator {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  logo?: string;
  operatorAvatarUrl?: string | null;
  interiorImages?: string[] | null;
  exteriorImages?: string[] | null;
  rating?: number | null;
  reviewCount?: number;
  totalTrips?: number;
}

export interface Route {
  id: string;
  name?: string;
  description?: string;
  operatorId: string;
  origin: string;
  destination: string;
  departureLocation?: string;
  arrivalLocation?: string;
  distance?: number;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number | string;
  availableSeats: number;
  totalSeats: number;
  busType: VehicleType;
  vehicleType?: VehicleType;
  amenities: string[];
  status: RouteStatus;
  licensePlate?: string;
  images?: string[] | null;
  policies?: {
    luggage?: string;
    cancellation?: string;
  };
  pickupPoints: RoutePickupPoint[];
  dropoffPoints: RouteDropoffPoint[];
  operator?: RouteOperator;
  createdAt?: string;
  updatedAt?: string;

  departureCity?: string;
  arrivalCity?: string;
  departureCitySlug?: string;
  arrivalCitySlug?: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  time: string;
  latitude?: number;
  longitude?: number;
}

export interface DropoffPoint {
  id: string;
  name: string;
  address: string;
  time: string;
  latitude?: number;
  longitude?: number;
}

export interface Operator {
  id: string;
  name: string;
  logo?: string;
  rating?: number | null;
  reviewCount?: number;
  totalTrips?: number;
}

export interface SearchRoutesRequest {
  origin: string;
  destination: string;
  departureDate?: string;
  passengers?: number;
  busType?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'departureTime' | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SearchRoutesParams {
  from: string;
  to: string;
  date: string;
  passengers?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'departureTime' | 'rating';
  sortOrder?: 'asc' | 'desc';
  vehicleType?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  amenities?: string[];
}

export interface SearchRoutesResponse {
  routes: Route[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  departureTimeRange?: {
    start: string;
    end: string;
  };
  busTypes?: string[];
  amenities?: string[];
}

export interface RouteDetail extends Route {
  cancellationPolicy?: string;
  images?: string[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  province?: string;
}

export const VEHICLE_TYPES: VehicleType[] = ['LIMOUSINE', 'SLEEPER_BUS', 'STANDARD', 'VIP', 'SLEEPER'];
