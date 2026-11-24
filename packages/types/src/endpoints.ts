export const API_ENDPOINTS = {
  // Auth (Backend route is POST /api/v1/auth/refresh)
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_RESEND_OTP: '/auth/resend-otp',

  // Users
  USER_PROFILE: '/users/profile',

  // Search (Route Service)
  SEARCH_ROUTES: '/search/routes',
  SEARCH_POPULAR: '/search/popular',
  SEARCH_SUGGESTIONS: '/search/suggestions',

  // Routes
  ROUTES_BY_ID: (id: string) => `/routes/${id}`,
  CITIES: '/cities',

  // Bookings
  BOOKINGS_CREATE: '/bookings',
  BOOKINGS_MY: '/bookings/my',
  BOOKINGS_BY_ID: (id: string) => `/bookings/${id}`,
  BOOKINGS_BY_CODE: (code: string) => `/bookings/code/${code}`,
  BOOKINGS_CANCEL: (id: string) => `/bookings/${id}/cancel`,
  BOOKINGS_CONFIRM: (id: string) => `/bookings/${id}/confirm`,

  // Seats
  SEATS_AVAILABILITY: '/seats/availability',
  SEATS_CHECK: '/seats/check',
  SEATS_HOLD: '/seats/hold',
  SEATS_RELEASE: '/seats/release',

  // Payments
  PAYMENTS_CREATE: '/payments',
  PAYMENTS_STATUS: '/payments/status',
  PAYMENTS_BY_ID: (id: string) => `/payments/${id}`,

  // Reviews
  REVIEWS_CREATE: '/reviews',
  REVIEWS_MY: '/reviews/my',
  REVIEWS_ELIGIBILITY: '/reviews/eligibility',
  REVIEWS_OPERATOR_SUMMARY: (operatorId: string) => `/reviews/operators/${operatorId}/summary`,
  REVIEWS_OPERATOR_LIST: (operatorId: string) => `/reviews/operators/${operatorId}`,
  REVIEWS_MANAGE_LIST: '/reviews/manage',
  REVIEWS_MANAGE_STATS: '/reviews/manage/stats',
  REVIEWS_MANAGE_REPLY: (id: string) => `/reviews/manage/${id}/reply`,
} as const;
