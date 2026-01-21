/**
 * API Index - Central export for all API functions
 * 
 * This module provides both mock and real API implementations.
 * During development, mock functions are used.
 * When ready to connect to BE, switch to real implementations.
 */

// API Client
export { default as apiClient, tokenStorage, parseApiError, getErrorMessage } from './client';
export type { ParsedApiError } from './client';

// Auth API
export {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  isAuthenticated,
  getStoredTokens,
} from './auth';

// Routes API
export {
  searchRoutes,
  getRouteById,
  getPopularRoutes,
  getCities,
} from './routes';

// Bookings API
export {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getSeatAvailability,
  checkSeats,
  holdSeats,
  releaseSeats,
  generateIdempotencyKey,
} from './bookings';

// Mock APIs (for development/fallback)
export { mockSearchRoutes } from '@vexeviet/api-client';
export { getRouteDetailById as getMockRouteById } from './mock/routes';
