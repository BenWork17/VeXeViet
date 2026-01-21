/**
 * React Query hooks for Bookings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyBookings, 
  getBookingById, 
  cancelBooking,
  createBooking
} from '@/lib/api/bookings';
import { CancelBookingRequest, CreateBookingRequest } from '@vexeviet/types';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  my: () => [...bookingKeys.lists(), 'my'] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

/**
 * Hook to get current user's bookings
 */
export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.my(),
    queryFn: getMyBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get booking details
 */
export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingRequest }) => 
      cancelBooking(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific detail
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook to create a booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
