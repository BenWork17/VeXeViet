export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
}

export interface Booking {
  id: string;
  userId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  departureLocation: string;
  arrivalLocation: string;
  operatorName: string;
  totalPrice: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  seatNumbers: string[];
}

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
  rating: number;
  totalReviews: number;
}

export interface Route {
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
