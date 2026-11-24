import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelBooking,
  createBooking,
  getBookingByCode,
  getBookingById,
  getMyBookings,
} from '@/lib/api/bookings';
import type { CancelBookingRequest, CreateBookingRequest } from '@vexeviet/types';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  my: () => [...bookingKeys.lists(), 'my'] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  byCode: (code: string) => [...bookingKeys.all, 'code', code.trim().toUpperCase()] as const,
};

export const bookingQueries = {
  all: () => bookingKeys.all,
  my: () =>
    queryOptions({
      queryKey: bookingKeys.my(),
      queryFn: getMyBookings,
      staleTime: 2 * 60 * 1000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: bookingKeys.detail(id),
      queryFn: () => getBookingById(id),
      staleTime: 60 * 1000,
    }),
  byCode: (code: string) => {
    const normalized = code.trim().toUpperCase();
    return queryOptions({
      queryKey: bookingKeys.byCode(normalized),
      queryFn: () => getBookingByCode(normalized),
      staleTime: 30 * 1000,
    });
  },
};

export function useMyBookings(enabled = true) {
  return useQuery({
    ...bookingQueries.my(),
    enabled,
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    ...bookingQueries.detail(id),
    enabled: Boolean(id),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingRequest }) =>
      cancelBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}

export function useBookingByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return useQuery({
    ...bookingQueries.byCode(normalized),
    enabled: Boolean(normalized),
  });
}
