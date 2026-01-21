/**
 * Booking API functions
 */

import apiClient from './client';
import {
  ApiResponse,
  Booking,
  CreateBookingRequest,
  CreateBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  SeatAvailability,
  CheckSeatsRequest,
  CheckSeatsResponse,
  HoldSeatsRequest,
  HoldSeatsResponse,
  ReleaseSeatsRequest,
  ReleaseSeatsResponse,
  API_ENDPOINTS,
} from '@vexeviet/types';

// ========================
// Booking API Functions
// ========================

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingRequest): Promise<CreateBookingResponse> {
  const response = await apiClient.post<ApiResponse<CreateBookingResponse>>(
    API_ENDPOINTS.BOOKINGS_CREATE,
    data
  );
  return response.data.data;
}

/**
 * Get user's bookings
 */
export async function getMyBookings(): Promise<Booking[]> {
  const response = await apiClient.get<ApiResponse<Booking[]>>(
    API_ENDPOINTS.BOOKINGS_MY
  );
  return response.data.data;
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  const response = await apiClient.get<ApiResponse<Booking>>(
    API_ENDPOINTS.BOOKINGS_BY_ID(id)
  );
  return response.data.data;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string, data?: CancelBookingRequest): Promise<CancelBookingResponse> {
  const response = await apiClient.post<ApiResponse<CancelBookingResponse>>(
    API_ENDPOINTS.BOOKINGS_CANCEL(id),
    data
  );
  return response.data.data;
}

// ========================
// Seat API Functions
// ========================

/**
 * Get seat availability for a route
 */
export async function getSeatAvailability(routeId: string, departureDate: string): Promise<SeatAvailability> {
  const response = await apiClient.get<ApiResponse<SeatAvailability>>(
    `${API_ENDPOINTS.SEATS_AVAILABILITY}?routeId=${routeId}&departureDate=${departureDate}`
  );
  return response.data.data;
}

/**
 * Check if specific seats are available
 */
export async function checkSeats(data: CheckSeatsRequest): Promise<CheckSeatsResponse> {
  const response = await apiClient.post<ApiResponse<CheckSeatsResponse>>(
    API_ENDPOINTS.SEATS_CHECK,
    data
  );
  return response.data.data;
}

/**
 * Hold seats temporarily (15 minutes by default)
 */
export async function holdSeats(data: HoldSeatsRequest): Promise<HoldSeatsResponse> {
  const response = await apiClient.post<ApiResponse<HoldSeatsResponse>>(
    API_ENDPOINTS.SEATS_HOLD,
    data
  );
  return response.data.data;
}

/**
 * Release held seats
 */
export async function releaseSeats(data: ReleaseSeatsRequest): Promise<ReleaseSeatsResponse> {
  const response = await apiClient.post<ApiResponse<ReleaseSeatsResponse>>(
    API_ENDPOINTS.SEATS_RELEASE,
    data
  );
  return response.data.data;
}

// ========================
// Idempotency Key Helper
// ========================

/**
 * Generate a unique idempotency key for booking
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
