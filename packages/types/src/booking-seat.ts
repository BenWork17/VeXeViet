import type { Route } from './route';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';

export interface Passenger {
  firstName: string;
  lastName: string;
  seatNumber: string;
  idNumber?: string;
  dateOfBirth?: string;
  phone?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  fullName?: string;
}

export interface Booking {
  id: string;
  bookingId?: string;
  bookingCode: string;
  userId: string;
  routeId: string;
  departureDate: string;
  status: BookingStatus;
  totalAmount: number;
  totalPrice?:
    | number
    | {
        amount: number;
        currency?: string;
        breakdown?: {
          tickets?: number;
          serviceFee?: number;
          discount?: number;
          total?: number;
        };
      };
  passengers: Passenger[];
  seats: string[];
  pickupPointId: string;
  dropoffPointId: string;
  contactInfo: ContactInfo;
  paymentDeadline: string;
  createdAt: string;
  updatedAt?: string;
  route?: Route;
}

export interface CreateBookingRequest {
  routeId: string;
  departureDate: string;
  passengers: Passenger[];
  seats: string[];
  pickupPointId: string;
  dropoffPointId: string;
  contactInfo: ContactInfo;
  idempotencyKey: string;
  notes?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  bookingCode: string;
  status: BookingStatus;
  totalAmount?: number;
  totalPrice?: {
    amount: number;
    currency: string;
    breakdown?: Record<string, number | undefined>;
  };
  paymentDeadline: string;
  expiresInSeconds?: number;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface CancelBookingResponse {
  bookingId: string;
  bookingCode: string;
  status: 'CANCELLED';
  cancelledAt: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: string;
}

export interface ConfirmBookingResponse {
  bookingId: string;
  bookingCode: string;
  status: 'CONFIRMED';
  confirmedAt: string;
}

export interface SeatInfo {
  seatNumber: string;
  status: SeatStatus;
  price: number;
  floor?: number;
  row?: number;
  column?: string;
}

export interface BusTemplate {
  id: string;
  name: string;
  busType: 'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER';
  totalSeats: number;
  floors: number;
  rowsPerFloor: number;
  columns: string[];
  layoutImage: string | null;
}

export interface SeatDetail {
  id: string;
  seatNumber: string;
  seatLabel: string;
  row: number;
  column: string;
  floor: number;
  seatType: 'STANDARD' | 'VIP' | 'SLEEPER';
  position: 'WINDOW' | 'AISLE' | 'MIDDLE';
  basePrice: number;
  priceModifier: number;
  finalPrice: number;
  status: SeatStatus;
  isSelectable: boolean;
  metadata: Record<string, unknown> | null;
}

export interface SeatSummary {
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  heldSeats: number;
  blockedSeats: number;
}

export interface SeatAvailability {
  routeId: string;
  departureDate: string;
  busTemplate: BusTemplate;
  seats: SeatDetail[];
  summary: SeatSummary;
}

export interface SeatMapConfig {
  rows: number;
  columns: number;
  floors: number;
  layout: string[][];
}

export interface CheckSeatsRequest {
  routeId: string;
  departureDate: string;
  seats: string[];
}

export interface CheckSeatsResponse {
  available: boolean;
  unavailableSeats: string[];
  seats?: Array<{
    seatNumber: string;
    status: SeatStatus;
    heldBy?: string;
    heldUntil?: string;
  }>;
}

export interface HoldSeatsRequest {
  routeId: string;
  departureDate: string;
  seats: string[];
  ttlSeconds?: number;
}

export interface HoldSeatsResponse {
  holdId: string;
  seats: string[];
  expiresAt: string;
  ttlSeconds?: number;
}

export interface ReleaseSeatsRequest {
  holdId: string;
}

export interface ReleaseSeatsResponse {
  released: boolean;
  seats: string[];
}

export const BOOKING_HOLD_DURATION_SECONDS = 900;
export const BOOKING_PAYMENT_DEADLINE_MINUTES = 15;

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'EXPIRED',
];
