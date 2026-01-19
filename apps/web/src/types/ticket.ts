import { BookingDetails } from './booking';

export interface PassengerInfo {
  fullName: string;
  phone: string;
  email?: string;
  seatNumber: string;
  idNumber?: string;
}

export interface RouteInfo {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  pickupAddress?: string;
  dropoffAddress?: string;
}

export interface OperatorInfo {
  id: string;
  name: string;
  logoUrl: string;
  phone?: string;
}

export interface QRCodeData {
  ticketId: string;
  bookingCode: string;
  validationHash: string;
  expiresAt: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  bookingCode: string;
  status: 'VALID' | 'USED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;

  route: RouteInfo;
  operator: OperatorInfo;
  passenger: PassengerInfo;

  busType: string;
  licensePlate: string;

  ticketPrice: number;
  serviceFee: number;
  totalPrice: number;

  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  transactionId?: string;

  qrCode: QRCodeData;

  offlineData?: {
    cachedAt: string;
    lastSyncedAt?: string;
    pendingSync: boolean;
  };
}

export function bookingToTickets(booking: BookingDetails): Ticket[] {
  return booking.passengers.map((passenger, index) => ({
    id: `${booking.id}-${index}`,
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    status: booking.status === 'CANCELLED' ? 'CANCELLED' : 'VALID',
    createdAt: booking.createdAt,
    updatedAt: booking.createdAt,
    route: booking.route,
    operator: booking.operator,
    passenger,
    busType: booking.busType,
    licensePlate: booking.licensePlate,
    ticketPrice: booking.ticketPrice,
    serviceFee: booking.serviceFee / booking.passengers.length,
    totalPrice: booking.totalPrice / booking.passengers.length,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    transactionId: booking.transactionId,
    qrCode: {
      ticketId: `${booking.id}-${index}`,
      bookingCode: booking.bookingCode,
      validationHash: generateValidationHash(booking.id, passenger.seatNumber),
      expiresAt: booking.route.departureTime,
    },
  }));
}

function generateValidationHash(bookingId: string, seatNumber: string): string {
  const data = `${bookingId}:${seatNumber}:${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
