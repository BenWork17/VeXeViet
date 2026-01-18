import { describe, it, expect, beforeEach } from 'vitest';
import bookingReducer, {
  cancelBooking,
  resetBookingState,
  selectUpcomingBookings,
  selectPastBookings,
  setSelectedSeats,
  type BookingState,
} from '../bookingSlice';
import type { RootState } from '@/store';

// Mock data
const mockBooking = {
  id: 'booking-123',
  userId: 'user-456',
  routeId: 'route-789',
  status: 'CONFIRMED' as const,
  seatNumbers: ['A1', 'A2'],
  totalPrice: 500000,
  departureDate: '2026-02-01T08:00:00Z',
  createdAt: '2026-01-10T10:00:00Z',
  updatedAt: '2026-01-10T10:00:00Z',
};

const mockPastBooking = {
  ...mockBooking,
  id: 'booking-past',
  departureDate: '2025-12-01T08:00:00Z',
};

const mockCancelledBooking = {
  ...mockBooking,
  id: 'booking-cancelled',
  status: 'CANCELLED' as const,
};

describe('bookingSlice', () => {
  let initialState: BookingState;

  beforeEach(() => {
    initialState = {
      bookings: [mockBooking, mockPastBooking, mockCancelledBooking],
      selectedSeats: [],
      currentRoute: null,
      loading: false,
      error: null,
    };
  });

  describe('Cancellation Logic', () => {
    it('should update booking status to CANCELLED when cancelBooking.fulfilled', () => {
      const action = cancelBooking.fulfilled(
        { ...mockBooking, status: 'CANCELLED' },
        'requestId',
        { bookingId: mockBooking.id }
      );

      const newState = bookingReducer(initialState, action);

      expect(newState.bookings[0].status).toBe('CANCELLED');
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should set loading to true when cancelBooking.pending', () => {
      const action = cancelBooking.pending('requestId', {
        bookingId: mockBooking.id,
      });

      const newState = bookingReducer(initialState, action);

      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should set error when cancelBooking.rejected', () => {
      const errorMessage = 'Cancellation failed: Network error';
      const action = cancelBooking.rejected(
        new Error(errorMessage),
        'requestId',
        { bookingId: mockBooking.id }
      );

      const newState = bookingReducer(initialState, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });
  });

  describe('Cleanup Logic', () => {
    it('should reset booking state to initial values', () => {
      const dirtyState: BookingState = {
        bookings: initialState.bookings,
        selectedSeats: ['A1', 'A2', 'A3'],
        currentRoute: 'route-789',
        loading: false,
        error: 'Some error',
      };

      const newState = bookingReducer(dirtyState, resetBookingState());

      expect(newState.selectedSeats).toEqual([]);
      expect(newState.currentRoute).toBeNull();
      expect(newState.error).toBeNull();
      // Bookings should remain (only transient state is cleared)
      expect(newState.bookings).toEqual(initialState.bookings);
    });

    it('should clear selected seats when setSelectedSeats is called with empty array', () => {
      const stateWithSeats: BookingState = {
        ...initialState,
        selectedSeats: ['A1', 'B2', 'C3'],
      };

      const newState = bookingReducer(
        stateWithSeats,
        setSelectedSeats([])
      );

      expect(newState.selectedSeats).toEqual([]);
    });
  });

  describe('Selectors', () => {
    const mockRootState: RootState = {
      booking: initialState,
      // Add other slices as needed
    } as RootState;

    it('should select only upcoming bookings', () => {
      const upcomingBookings = selectUpcomingBookings(mockRootState);

      expect(upcomingBookings).toHaveLength(1);
      expect(upcomingBookings[0].id).toBe('booking-123');
      expect(new Date(upcomingBookings[0].departureDate).getTime()).toBeGreaterThan(
        Date.now()
      );
    });

    it('should select only past bookings', () => {
      const pastBookings = selectPastBookings(mockRootState);

      expect(pastBookings).toHaveLength(2);
      expect(pastBookings.map((b) => b.id)).toContain('booking-past');
      expect(pastBookings.map((b) => b.id)).toContain('booking-cancelled');
    });

    it('should exclude cancelled bookings from upcoming', () => {
      const upcomingBookings = selectUpcomingBookings(mockRootState);

      expect(upcomingBookings.every((b) => b.status !== 'CANCELLED')).toBe(true);
    });
  });

  describe('Seat Selection Logic', () => {
    it('should add seats to selectedSeats', () => {
      const newState = bookingReducer(
        initialState,
        setSelectedSeats(['A1', 'A2'])
      );

      expect(newState.selectedSeats).toEqual(['A1', 'A2']);
    });

    it('should update selectedSeats count correctly', () => {
      const state1 = bookingReducer(initialState, setSelectedSeats(['A1']));
      expect(state1.selectedSeats).toHaveLength(1);

      const state2 = bookingReducer(state1, setSelectedSeats(['A1', 'B2', 'C3']));
      expect(state2.selectedSeats).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle cancelling non-existent booking gracefully', () => {
      const action = cancelBooking.fulfilled(
        { ...mockBooking, id: 'non-existent', status: 'CANCELLED' },
        'requestId',
        { bookingId: 'non-existent' }
      );

      const newState = bookingReducer(initialState, action);

      // State should remain unchanged if booking not found
      expect(newState.bookings).toEqual(initialState.bookings);
    });

    it('should preserve other bookings when cancelling one', () => {
      const action = cancelBooking.fulfilled(
        { ...mockBooking, status: 'CANCELLED' },
        'requestId',
        { bookingId: mockBooking.id }
      );

      const newState = bookingReducer(initialState, action);

      expect(newState.bookings).toHaveLength(3);
      expect(newState.bookings[1].status).toBe('CONFIRMED'); // Other booking unchanged
    });
  });
});
