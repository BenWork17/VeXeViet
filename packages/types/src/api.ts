export interface SearchRoutesRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    departureTimeRange?: {
      start: string;
      end: string;
    };
    busTypes?: string[];
    amenities?: string[];
  };
  sort?: {
    by: "price" | "duration" | "departure" | "rating";
    order: "asc" | "desc";
  };
  page?: number;
  limit?: number;
}

export interface Location {
  city: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  time: string;
}

export interface DropoffPoint {
  id: string;
  name: string;
  address: string;
  time: string;
}

export interface Route {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorLogo: string;
  operatorRating: number;
  origin: Location;
  destination: Location;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  totalSeats: number;
  busType: string;
  amenities: string[];
  images: string[];
  pickupPoints: PickupPoint[];
  dropoffPoints: DropoffPoint[];
  cancellationPolicy: string;
}

export interface SearchRoutesResponse {
  success: boolean;
  data: {
    routes: Route[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      priceRange: { min: number; max: number };
      departureTimeRange: { min: string; max: string };
      availableBusTypes: string[];
      availableAmenities: string[];
    };
  };
  metadata: {
    searchId: string;
    timestamp: string;
  };
}
