/**
 * Central export for all hooks
 */

// Redux hooks
export { useAppDispatch, useAppSelector } from './redux';

// Auth hooks
export { useAuth, useUser, useLogin, useRegister, useLogout, useUpdateProfile, authKeys } from './useAuth';

// Route hooks
export { useSearchRoutes, useRoute, usePopularRoutes, useCities, routeKeys } from './useRoutes';

// Booking hooks
export {
  useMyBookings,
  useBookingDetail,
  useCreateBooking,
  useCancelBooking,
  useBookingByCode,
  bookingKeys,
} from './useBookings';

// Seat holding hook
export { useSeatHold } from './useSeatHold';

// Utility hooks
export { useTheme } from './useTheme';
export { useOnlineStatus } from './useOnlineStatus';
export { usePWAInstall } from './usePWA';
export { useServiceWorker } from './useServiceWorker';
export { useBookingCleanup } from './useBookingCleanup';
export { useOfflineTickets } from './useOfflineTickets';
