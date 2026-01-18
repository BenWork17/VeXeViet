'use client';

import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import { resetBookingState } from '@/store/slices/bookingSlice';

/**
 * Hook to cleanup booking state when component unmounts
 * Use this in booking flow pages to ensure state is reset when user navigates away
 */
export function useBookingCleanup() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Cleanup function runs when component unmounts
    return () => {
      dispatch(resetBookingState());
    };
  }, [dispatch]);
}

/**
 * Hook to reset booking state on demand
 * Use this for "Book Another Trip" or "Start Over" buttons
 */
export function useResetBooking() {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(resetBookingState());
  };
}
