/**
 * Presentation view-models exclusively for the Route Detail screen.
 * Domain DTOs (`User`, `Booking`, `Route`, `Review`, etc.) live in `@vexeviet/types`.
 */

export interface PickupPoint {
  id: string;
  time: string;
  location: string;
  address: string;
}

export interface DropoffPoint {
  id: string;
  time: string;
  location: string;
  address: string;
}

export interface Policy {
  type: 'CANCELLATION' | 'PAYMENT' | 'LUGGAGE' | 'OTHER';
  title: string;
  description: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Operator {
  id: string;
  name: string;
  logoUrl: string;
  interiorImages?: string[];
  exteriorImages?: string[];
  rating: number;
  totalReviews: number;
}

export interface RouteDetailViewModel {
  id: string;
  operator: Operator;
  busType: string;
  licensePlate: string;
  departureTime: string;
  arrivalTime: string;
  departureLocation: string;
  arrivalLocation: string;
  duration: string;
  price: number;
  availableSeats: number;
  amenities: Amenity[];
  pickupPoints: PickupPoint[];
  dropoffPoints: DropoffPoint[];
  policies: Policy[];
  images: string[];
}

export type Route = RouteDetailViewModel;
