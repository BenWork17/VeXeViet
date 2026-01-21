/**
 * Type Adapters - Bridge between old FE types and new BE types
 * 
 * These adapters help with gradual migration from mock data to real API.
 * Once migration is complete, these can be removed.
 */

import type {
  Route as BERoute,
  RouteDetail as BERouteDetail,
  Operator as BEOperator,
  PickupPoint as BEPickupPoint,
  DropoffPoint as BEDropoffPoint,
  Booking as BEBooking,
  User as BEUser,
} from '@vexeviet/types';

import type {
  Route as FERoute,
  Operator as FEOperator,
  PickupPoint as FEPickupPoint,
  DropoffPoint as FEDropoffPoint,
  Booking as FEBooking,
  User as FEUser,
  Amenity,
  Policy,
} from '@/types/models';

// ========================
// Route Adapters
// ========================

/**
 * Convert BE Route to FE Route format
 */
export function adaptBERouteToFE(beRoute: BERoute): FERoute {
  return {
    id: beRoute.id,
    operator: {
      id: beRoute.operator?.id ?? beRoute.operatorId,
      name: beRoute.operator?.name ?? 'Unknown Operator',
      logoUrl: beRoute.operator?.logo ?? '/images/default-operator.png',
      rating: beRoute.operator?.rating ?? 0,
      totalReviews: beRoute.operator?.totalTrips ?? 0,
    },
    busType: beRoute.vehicleType,
    licensePlate: '', // Not provided by BE yet
    departureTime: `2026-01-01T${beRoute.departureTime}:00Z`, // Convert HH:mm to ISO
    arrivalTime: `2026-01-01T${beRoute.arrivalTime}:00Z`,
    departureLocation: beRoute.departureCity,
    arrivalLocation: beRoute.arrivalCity,
    duration: formatDurationMinutes(beRoute.duration),
    price: beRoute.price,
    availableSeats: beRoute.availableSeats,
    amenities: beRoute.amenities.map((name, idx) => ({
      id: `amenity-${idx}`,
      name,
      icon: getAmenityIcon(name),
    })),
    pickupPoints: beRoute.pickupPoints.map(adaptBEPickupPointToFE),
    dropoffPoints: beRoute.dropoffPoints.map(adaptBEDropoffPointToFE),
    policies: [], // Not provided by BE in basic Route
    images: [], // Not provided by BE in basic Route
  };
}

/**
 * Convert BE RouteDetail to FE Route format
 */
export function adaptBERouteDetailToFE(beRoute: BERouteDetail): FERoute {
  const base = adaptBERouteToFE(beRoute);
  return {
    ...base,
    policies: beRoute.cancellationPolicy 
      ? [{ type: 'CANCELLATION' as const, title: 'Cancellation Policy', description: beRoute.cancellationPolicy }]
      : [],
    images: beRoute.images ?? [],
  };
}

/**
 * Convert FE Route back to BE format (for API calls)
 */
export function adaptFERouteToBE(feRoute: FERoute): Partial<BERoute> {
  return {
    id: feRoute.id,
    operatorId: feRoute.operator.id,
    departureCity: feRoute.departureLocation,
    arrivalCity: feRoute.arrivalLocation,
    departureTime: extractTimeFromISO(feRoute.departureTime),
    arrivalTime: extractTimeFromISO(feRoute.arrivalTime),
    duration: parseDurationToMinutes(feRoute.duration),
    price: feRoute.price,
    availableSeats: feRoute.availableSeats,
    vehicleType: feRoute.busType as BERoute['vehicleType'],
    amenities: feRoute.amenities.map(a => a.name),
    pickupPoints: feRoute.pickupPoints.map(adaptFEPickupPointToBE),
    dropoffPoints: feRoute.dropoffPoints.map(adaptFEDropoffPointToBE),
  };
}

// ========================
// Pickup/Dropoff Adapters
// ========================

function adaptBEPickupPointToFE(bePoint: BEPickupPoint): FEPickupPoint {
  return {
    id: bePoint.id,
    time: bePoint.time,
    location: bePoint.name,
    address: bePoint.address,
  };
}

function adaptBEDropoffPointToFE(bePoint: BEDropoffPoint): FEDropoffPoint {
  return {
    id: bePoint.id,
    time: bePoint.time,
    location: bePoint.name,
    address: bePoint.address,
  };
}

function adaptFEPickupPointToBE(fePoint: FEPickupPoint): BEPickupPoint {
  return {
    id: fePoint.id,
    name: fePoint.location,
    address: fePoint.address,
    time: fePoint.time,
  };
}

function adaptFEDropoffPointToBE(fePoint: FEDropoffPoint): BEDropoffPoint {
  return {
    id: fePoint.id,
    name: fePoint.location,
    address: fePoint.address,
    time: fePoint.time,
  };
}

// ========================
// User Adapters
// ========================

export function adaptBEUserToFE(beUser: BEUser): FEUser {
  return {
    id: beUser.id,
    email: beUser.email ?? '',
    fullName: `${beUser.firstName} ${beUser.lastName}`.trim(),
    phone: beUser.phone ?? undefined,
    avatar: undefined, // Not provided by BE yet
  };
}

// ========================
// Booking Adapters
// ========================

export function adaptBEBookingToFE(beBooking: BEBooking): FEBooking {
  return {
    id: beBooking.id,
    userId: beBooking.userId,
    routeId: beBooking.routeId,
    departureTime: beBooking.route?.departureTime ?? '',
    arrivalTime: beBooking.route?.arrivalTime ?? '',
    departureLocation: beBooking.route?.departureCity ?? '',
    arrivalLocation: beBooking.route?.arrivalCity ?? '',
    operatorName: beBooking.route?.operator?.name ?? 'Unknown',
    totalPrice: beBooking.totalAmount,
    status: mapBookingStatus(beBooking.status),
    seatNumbers: beBooking.seats,
  };
}

function mapBookingStatus(beStatus: BEBooking['status']): FEBooking['status'] {
  switch (beStatus) {
    case 'PENDING':
    case 'CONFIRMED':
      return 'UPCOMING';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'CANCELLED';
    default:
      return 'UPCOMING';
  }
}

// ========================
// Helper Functions
// ========================

function formatDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
}

function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const mins = parseInt(match[2] ?? '0', 10);
  return hours * 60 + mins;
}

function extractTimeFromISO(isoString: string): string {
  try {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch {
    return '00:00';
  }
}

function getAmenityIcon(name: string): string {
  const iconMap: Record<string, string> = {
    wifi: 'Wifi',
    'wi-fi': 'Wifi',
    water: 'Cup',
    'free water': 'Cup',
    ac: 'Wind',
    'air conditioning': 'Wind',
    blanket: 'Wind',
    charging: 'BatteryCharging',
    'charging port': 'BatteryCharging',
    usb: 'BatteryCharging',
    toilet: 'Bath',
    tv: 'Monitor',
    snack: 'Cookie',
    food: 'Utensils',
  };
  return iconMap[name.toLowerCase()] ?? 'Check';
}
