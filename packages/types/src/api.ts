/**
 * VeXeViet API Types for Frontend Integration
 * Synced with Backend - Iteration 1-4 (Booking Service)
 * Last Updated: 2026-01-19
 */

// ========================
// Common Types
// ========================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================
// User & Auth Types
// ========================

export type UserRole = 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Auth - Register
export interface RegisterRequest {
  method: 'email' | 'phone';
  email?: string;        // Required if method = 'email'
  phone?: string;        // Required if method = 'phone'
  password: string;      // Min 8 chars, must have uppercase, number
  firstName: string;
  lastName: string;
  agreeToTerms: boolean; // Must be true
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  verificationRequired: boolean;
  verificationMethod: 'email' | 'phone';
}

// Auth - Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
  accessToken: string;
  refreshToken: string;
}

// Auth - Refresh Token
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// User - Update Profile
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

// ========================
// Route Types
// ========================

export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
export type VehicleType = 'LIMOUSINE' | 'SLEEPER_BUS' | 'STANDARD' | 'VIP' | 'SLEEPER';
export type BusType = VehicleType; // Alias for backwards compatibility

export interface Route {
  id: string;
  name?: string;
  description?: string;
  operatorId: string;
  origin: string;                 // City name e.g., "Ho Chi Minh City"
  destination: string;            // City name e.g., "Da Lat"
  departureLocation?: string;     // e.g., "Bến Xe Miền Đông"
  arrivalLocation?: string;       // e.g., "Bến Xe Đà Lạt"
  distance?: number;              // km
  departureTime: string;          // ISO datetime or HH:mm
  arrivalTime: string;            // ISO datetime or HH:mm
  duration: number;               // minutes
  price: number | string;         // May be string from DB decimal
  availableSeats: number;
  totalSeats: number;
  busType: VehicleType;           // API returns busType
  vehicleType?: VehicleType;      // Frontend alias
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
  
  // Legacy fields for FE compatibility
  departureCity?: string;
  arrivalCity?: string;
  departureCitySlug?: string;
  arrivalCitySlug?: string;
}

// Pickup/Dropoff points from API
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

// Operator from API
export interface RouteOperator {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  logo?: string;
  rating?: number;
  totalTrips?: number;
}

// Legacy interfaces for backwards compatibility
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
  rating?: number;
  totalTrips?: number;
}

// Route Search Request (POST /search/routes)
export interface SearchRoutesRequest {
  origin: string;              // City name, e.g., "Ho Chi Minh City"
  destination: string;         // City name, e.g., "Da Lat"
  departureDate?: string;      // YYYY-MM-DD format
  passengers?: number;         // Default: 1
  busType?: VehicleType;       // Filter by vehicle type
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'departureTime' | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;               // Default: 1
  pageSize?: number;           // Default: 20
}

// Legacy params (for backwards compatibility with some FE components)
export interface SearchRoutesParams {
  from: string;                // City slug, e.g., "ho-chi-minh"
  to: string;                  // City slug, e.g., "da-lat"
  date: string;                // YYYY-MM-DD format
  passengers?: number;         // Default: 1
  page?: number;               // Default: 1
  limit?: number;              // Default: 10
  sortBy?: 'price' | 'departureTime' | 'rating';
  sortOrder?: 'asc' | 'desc';
  vehicleType?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
  departureTimeFrom?: string;  // HH:mm
  departureTimeTo?: string;    // HH:mm
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

// Legacy search filters (for FE backwards compatibility)
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

// Route detail with additional fields
export interface RouteDetail extends Route {
  cancellationPolicy?: string;
  images?: string[];
}

// City
export interface City {
  id: string;
  name: string;
  slug: string;
  province?: string;
}

// ========================
// Booking Types
// ========================

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';

export interface Booking {
  id: string;
  bookingCode: string;       // e.g., "VXV7A8B9C0"
  userId: string;
  routeId: string;
  departureDate: string;     // YYYY-MM-DD
  status: BookingStatus;
  totalAmount: number;
  passengers: Passenger[];
  seats: string[];           // e.g., ["A1", "A2"]
  pickupPointId: string;
  dropoffPointId: string;
  contactInfo: ContactInfo;
  paymentDeadline: string;   // ISO datetime
  createdAt: string;
  updatedAt: string;
  route?: Route;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  seatNumber: string;        // e.g., "A1"
  idNumber?: string;         // Optional ID card number
  phone?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;             // E.164 format, e.g., "+84901234567"
  fullName?: string;
}

// Booking - Create
export interface CreateBookingRequest {
  routeId: string;
  departureDate: string;     // YYYY-MM-DD
  passengers: Passenger[];
  seats: string[];           // Must match passenger count
  pickupPointId: string;
  dropoffPointId: string;
  contactInfo: ContactInfo;
  idempotencyKey: string;    // UUID - prevent duplicate bookings
  notes?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  bookingCode: string;
  status: BookingStatus;
  totalAmount: number;
  paymentDeadline: string;
  expiresInSeconds: number;
}

// Booking - Cancel
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

// Booking - Confirm (Internal API)
export interface ConfirmBookingResponse {
  bookingId: string;
  bookingCode: string;
  status: 'CONFIRMED';
  confirmedAt: string;
}

// ========================
// Seat Types
// ========================

export interface SeatInfo {
  seatNumber: string;        // e.g., "A1"
  status: SeatStatus;
  price: number;
  floor?: number;            // For sleeper buses: 1 or 2
  row?: number;
  column?: string;           // A, B, C...
}

export interface SeatAvailability {
  routeId: string;
  departureDate: string;
  busTemplate: BusTemplate;
  seats: SeatDetail[];
  summary: SeatSummary;
}

export interface BusTemplate {
  id: string;
  name: string;
  busType: 'STANDARD' | 'LIMOUSINE' | 'SLEEPER';
  totalSeats: number;
  floors: number;
  rowsPerFloor: number;
  columns: string[];         // e.g., ["A", "_", "B", "C"] where "_" = aisle
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
  metadata: Record<string, any> | null;
}

export interface SeatSummary {
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  heldSeats: number;
  blockedSeats: number;
}

export interface SeatMapConfig {
  rows: number;
  columns: number;
  floors: number;
  layout: string[][];        // 2D array of seat positions
}

// Seat - Check Availability
export interface CheckSeatsRequest {
  routeId: string;
  departureDate: string;     // YYYY-MM-DD
  seats: string[];           // Seat numbers to check
}

export interface CheckSeatsResponse {
  available: boolean;
  unavailableSeats: string[];
  seats: Array<{
    seatNumber: string;
    status: SeatStatus;
    heldBy?: string;         // If held, who holds it
    heldUntil?: string;      // If held, when it expires
  }>;
}

// Seat - Hold
export interface HoldSeatsRequest {
  routeId: string;
  departureDate: string;
  seats: string[];
  ttlSeconds?: number;       // Default: 900 (15 minutes)
}

export interface HoldSeatsResponse {
  holdId: string;
  seats: string[];
  expiresAt: string;
  ttlSeconds: number;
}

// Seat - Release
export interface ReleaseSeatsRequest {
  routeId: string;
  departureDate: string;
  seats: string[];
  holdId?: string;
}

export interface ReleaseSeatsResponse {
  released: boolean;
  seats: string[];
}

// ========================
// Error Codes
// ========================

export type ErrorCode =
  // Auth errors
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'UNAUTHORIZED'
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  // Resource errors
  | 'NOT_FOUND'
  | 'ROUTE_NOT_FOUND'
  | 'BOOKING_NOT_FOUND'
  // Booking errors
  | 'SEATS_UNAVAILABLE'
  | 'SEATS_ALREADY_HELD'
  | 'BOOKING_EXPIRED'
  | 'BOOKING_ALREADY_CANCELLED'
  | 'INSUFFICIENT_SEATS'
  | 'INVALID_SEAT_NUMBERS'
  | 'PASSENGER_SEAT_MISMATCH'
  // System errors
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

// ========================
// Constants
// ========================

export const BOOKING_HOLD_DURATION_SECONDS = 900; // 15 minutes
export const BOOKING_PAYMENT_DEADLINE_MINUTES = 15;

export const VEHICLE_TYPES: VehicleType[] = ['LIMOUSINE', 'SLEEPER_BUS', 'STANDARD', 'VIP'];

export const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'EXPIRED',
];

// ========================
// API Endpoints Reference
// ========================

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh-token',

  // Users
  USER_PROFILE: '/users/profile',

  // Search (Route Service)
  SEARCH_ROUTES: '/search/routes',           // POST - Search routes
  SEARCH_POPULAR: '/search/popular',         // GET - Popular routes
  SEARCH_SUGGESTIONS: '/search/suggestions', // GET - Autocomplete suggestions
  
  // Routes
  ROUTES_BY_ID: (id: string) => `/routes/${id}`,
  CITIES: '/cities',

  // Bookings
  BOOKINGS_CREATE: '/bookings',
  BOOKINGS_MY: '/bookings/my',
  BOOKINGS_BY_ID: (id: string) => `/bookings/${id}`,
  BOOKINGS_CANCEL: (id: string) => `/bookings/${id}/cancel`,
  BOOKINGS_CONFIRM: (id: string) => `/bookings/${id}/confirm`,

  // Seats
  SEATS_AVAILABILITY: '/seats/availability',
  SEATS_CHECK: '/seats/check',
  SEATS_HOLD: '/seats/hold',
  SEATS_RELEASE: '/seats/release',
} as const;

// ========================
// Error Messages (Vietnamese)
// ========================

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  TOKEN_EXPIRED: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
  TOKEN_INVALID: 'Token không hợp lệ',
  UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện thao tác này',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INVALID_INPUT: 'Thông tin nhập vào không hợp lệ',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  ROUTE_NOT_FOUND: 'Không tìm thấy tuyến xe',
  BOOKING_NOT_FOUND: 'Không tìm thấy đơn đặt vé',
  SEATS_UNAVAILABLE: 'Ghế đã được đặt, vui lòng chọn ghế khác',
  SEATS_ALREADY_HELD: 'Ghế đang được giữ bởi người khác',
  BOOKING_EXPIRED: 'Đơn đặt vé đã hết hạn',
  BOOKING_ALREADY_CANCELLED: 'Đơn đặt vé đã bị hủy trước đó',
  INSUFFICIENT_SEATS: 'Không đủ ghế trống',
  INVALID_SEAT_NUMBERS: 'Số ghế không hợp lệ',
  PASSENGER_SEAT_MISMATCH: 'Số hành khách không khớp với số ghế đã chọn',
  INTERNAL_ERROR: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng',
};
