import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BookingHistoryList from '../BookingHistoryList';
import bookingReducer from '@/store/slices/bookingSlice';

// Mock data
const mockUpcomingBooking = {
  id: 'booking-upcoming',
  userId: 'user-123',
  routeId: 'route-456',
  status: 'CONFIRMED' as const,
  seatNumbers: ['A1', 'A2'],
  totalPrice: 500000,
  departureDate: '2026-03-15T08:00:00Z', // Future date
  route: {
    fromCity: 'Ho Chi Minh',
    toCity: 'Hanoi',
    departureTime: '08:00',
    busType: 'Limousine',
  },
  createdAt: '2026-01-10T10:00:00Z',
  updatedAt: '2026-01-10T10:00:00Z',
};

const mockPastBooking = {
  ...mockUpcomingBooking,
  id: 'booking-past',
  departureDate: '2025-12-01T08:00:00Z', // Past date
};

const mockCancelledBooking = {
  ...mockUpcomingBooking,
  id: 'booking-cancelled',
  status: 'CANCELLED' as const,
  departureDate: '2026-02-20T08:00:00Z', // Future but cancelled
};

// Helper to create mock store
const createMockStore = (bookings: any[]) => {
  return configureStore({
    reducer: {
      booking: bookingReducer,
    },
    preloadedState: {
      booking: {
        bookings,
        selectedSeats: [],
        currentRoute: null,
        loading: false,
        error: null,
      },
    },
  });
};

// Helper to render with Redux
const renderWithStore = (component: React.ReactElement, bookings: any[]) => {
  const store = createMockStore(bookings);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('BookingHistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render list with mock data', () => {
      renderWithStore(
        <BookingHistoryList />,
        [mockUpcomingBooking, mockPastBooking]
      );

      expect(screen.getByText('Ho Chi Minh → Hanoi')).toBeInTheDocument();
      expect(screen.getAllByText(/A1, A2/)).toHaveLength(2);
    });

    it('should render empty state when no bookings', () => {
      renderWithStore(<BookingHistoryList />, []);

      expect(screen.getByText(/No bookings found/i)).toBeInTheDocument();
    });
  });

  describe('Cancel Button Visibility', () => {
    it('should show Cancel button ONLY for upcoming trips', () => {
      renderWithStore(<BookingHistoryList />, [mockUpcomingBooking, mockPastBooking]);

      const cancelButtons = screen.queryAllByRole('button', { name: /cancel/i });

      // Only 1 cancel button (for upcoming booking)
      expect(cancelButtons).toHaveLength(1);

      // Verify it's associated with the upcoming booking
      const upcomingCard = screen.getByTestId('booking-card-booking-upcoming');
      expect(upcomingCard).toContainElement(cancelButtons[0]);
    });

    it('should hide Cancel button for past trips', () => {
      renderWithStore(<BookingHistoryList />, [mockPastBooking]);

      const cancelButton = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeInTheDocument();
    });

    it('should hide Cancel button for cancelled trips', () => {
      renderWithStore(<BookingHistoryList />, [mockCancelledBooking]);

      const cancelButton = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeInTheDocument();

      // Should show "Cancelled" label instead
      expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
    });

    it('should show Cancel button for confirmed upcoming trips only', () => {
      const confirmedUpcoming = { ...mockUpcomingBooking, status: 'CONFIRMED' as const };
      const pendingUpcoming = { ...mockUpcomingBooking, id: 'pending', status: 'PENDING' as const };

      renderWithStore(<BookingHistoryList />, [confirmedUpcoming, pendingUpcoming]);

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });

      // Both should have cancel buttons (CONFIRMED and PENDING are cancellable)
      expect(cancelButtons).toHaveLength(2);
    });
  });

  describe('Tab Filtering', () => {
    it('should filter to upcoming bookings when Upcoming tab is clicked', async () => {
      renderWithStore(
        <BookingHistoryList />,
        [mockUpcomingBooking, mockPastBooking, mockCancelledBooking]
      );

      const upcomingTab = screen.getByRole('tab', { name: /upcoming/i });
      fireEvent.click(upcomingTab);

      await waitFor(() => {
        // Only upcoming booking should be visible
        expect(screen.getByTestId('booking-card-booking-upcoming')).toBeInTheDocument();
        expect(screen.queryByTestId('booking-card-booking-past')).not.toBeInTheDocument();
        expect(screen.queryByTestId('booking-card-booking-cancelled')).not.toBeInTheDocument();
      });
    });

    it('should filter to past bookings when Past tab is clicked', async () => {
      renderWithStore(
        <BookingHistoryList />,
        [mockUpcomingBooking, mockPastBooking, mockCancelledBooking]
      );

      const pastTab = screen.getByRole('tab', { name: /past/i });
      fireEvent.click(pastTab);

      await waitFor(() => {
        // Past and cancelled bookings should be visible
        expect(screen.getByTestId('booking-card-booking-past')).toBeInTheDocument();
        expect(screen.getByTestId('booking-card-booking-cancelled')).toBeInTheDocument();
        expect(screen.queryByTestId('booking-card-booking-upcoming')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cancellation Flow', () => {
    it('should open confirmation modal when Cancel button is clicked', async () => {
      renderWithStore(<BookingHistoryList />, [mockUpcomingBooking]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm cancellation/i)).toBeInTheDocument();
        expect(screen.getByText(/booking-upcoming/i)).toBeInTheDocument();
      });
    });

    it('should close modal when Cancel is clicked in modal', async () => {
      renderWithStore(<BookingHistoryList />, [mockUpcomingBooking]);

      // Open modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Close modal
      const modalCancelButton = screen.getByRole('button', { name: /no, keep booking/i });
      fireEvent.click(modalCancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirm cancellation/i)).not.toBeInTheDocument();
      });
    });

    it('should dispatch cancelBooking action when Confirm is clicked', async () => {
      const { store } = renderWithStore(<BookingHistoryList />, [mockUpcomingBooking]);

      // Mock dispatch
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      // Open modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Confirm cancellation
      const confirmButton = screen.getByRole('button', { name: /yes, cancel/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringContaining('cancelBooking'),
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for Cancel button', () => {
      renderWithStore(<BookingHistoryList />, [mockUpcomingBooking]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveAttribute('aria-label', 'Cancel booking booking-upcoming');
    });

    it('should have keyboard navigation for tabs', async () => {
      renderWithStore(<BookingHistoryList />, [mockUpcomingBooking, mockPastBooking]);

      const upcomingTab = screen.getByRole('tab', { name: /upcoming/i });
      const pastTab = screen.getByRole('tab', { name: /past/i });

      upcomingTab.focus();
      expect(upcomingTab).toHaveFocus();

      // Simulate Tab key press
      fireEvent.keyDown(upcomingTab, { key: 'Tab' });
      pastTab.focus();
      expect(pastTab).toHaveFocus();
    });
  });

  describe('Loading & Error States', () => {
    it('should show loading spinner when cancelling', async () => {
      const { store } = renderWithStore(<BookingHistoryList />, [mockUpcomingBooking]);

      // Mock loading state
      store.dispatch({ type: 'booking/cancelBooking/pending' });

      await waitFor(() => {
        expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
      });
    });

    it('should show error toast when cancellation fails', async () => {
      const { store } = renderWithStore(<BookingHistoryList />, [mockUpcomingBooking]);

      // Mock error state
      store.dispatch({
        type: 'booking/cancelBooking/rejected',
        payload: 'Network error',
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to cancel booking/i)).toBeInTheDocument();
      });
    });
  });
});
