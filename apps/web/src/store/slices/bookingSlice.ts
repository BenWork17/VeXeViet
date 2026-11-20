import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { BookingDetails } from '@/types/booking';
import { mockBookingApi } from '@/lib/api/mock/booking';

export interface BookingStopPoint {
  id: string;
  time?: string;
  location: string;
  address?: string;
}

export interface Route {
  id: string;
  price: number;
  busType: string;
  from: string;
  to: string;
  departureTime: string;
  pickupPoints?: BookingStopPoint[];
  dropoffPoints?: BookingStopPoint[];
}

export interface BookingState {
  currentRoute: Route | null;
  selectedSeats: string[];
  passengerCount: number;
  totalPrice: number;
  step: 'seat-selection' | 'passenger-info' | 'payment' | 'confirmation';
  bookingId?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  pickupPointId?: string;
  dropoffPointId?: string;

  // Seat holding state
  holdId: string | null;
  holdExpiresAt: string | null;
  heldSeats: string[];

  // Ticket details
  currentTicket: BookingDetails | null;
  ticketLoading: boolean;
  ticketError: string | null;
}

const BOOKING_STORAGE_KEY = 'vexeviet_booking_context';

export interface PersistedBookingContext {
  currentRoute: Route | null;
  selectedSeats: string[];
  passengerCount: number;
  totalPrice: number;
  step: BookingState['step'];
  bookingId?: string;
  pickupPointId?: string;
  dropoffPointId?: string;
}

export function saveBookingContext(state: PersistedBookingContext): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      BOOKING_STORAGE_KEY,
      JSON.stringify({
        currentRoute: state.currentRoute,
        selectedSeats: state.selectedSeats,
        passengerCount: state.passengerCount,
        totalPrice: state.totalPrice,
        step: state.step,
        bookingId: state.bookingId,
        pickupPointId: state.pickupPointId,
        dropoffPointId: state.dropoffPointId,
      })
    );
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function loadBookingContext(): PersistedBookingContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBookingContext;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    sessionStorage.removeItem(BOOKING_STORAGE_KEY);
    return null;
  }
}

export function clearBookingContext(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(BOOKING_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

const initialState: BookingState = {
  currentRoute: null,
  selectedSeats: [],
  passengerCount: 1,
  totalPrice: 0,
  step: 'seat-selection',
  bookingId: undefined,
  paymentStatus: undefined,
  pickupPointId: undefined,
  dropoffPointId: undefined,
  holdId: null,
  holdExpiresAt: null,
  heldSeats: [],
  currentTicket: null,
  ticketLoading: false,
  ticketError: null,
};

// Async thunk to fetch booking details
export const fetchBookingDetails = createAsyncThunk(
  'booking/fetchBookingDetails',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const booking = await mockBookingApi.getBookingById(bookingId);
      return booking;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch booking');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    initBooking: (state, action: PayloadAction<Route>) => {
      state.currentRoute = action.payload;
      state.selectedSeats = [];
      state.totalPrice = 0;
      state.passengerCount = 0;
      state.step = 'seat-selection';
      state.bookingId = undefined;
      state.paymentStatus = undefined;
      state.pickupPointId = action.payload.pickupPoints?.[0]?.id;
      state.dropoffPointId = action.payload.dropoffPoints?.[0]?.id;
      state.currentTicket = null;
      state.ticketError = null; // Clear error when starting new booking
      saveBookingContext(state);
    },
    hydrateBooking: (state, action: PayloadAction<Partial<PersistedBookingContext>>) => {
      const payload = action.payload;
      if (payload.currentRoute !== undefined) state.currentRoute = payload.currentRoute;
      if (payload.selectedSeats !== undefined) state.selectedSeats = payload.selectedSeats;
      if (payload.passengerCount !== undefined) state.passengerCount = payload.passengerCount;
      if (payload.totalPrice !== undefined) state.totalPrice = payload.totalPrice;
      if (payload.step !== undefined) state.step = payload.step;
      if (payload.bookingId !== undefined) state.bookingId = payload.bookingId;
      if (payload.pickupPointId !== undefined) state.pickupPointId = payload.pickupPointId;
      if (payload.dropoffPointId !== undefined) state.dropoffPointId = payload.dropoffPointId;
      saveBookingContext(state);
    },
    toggleSeat: (state, action: PayloadAction<{ seatId: string; isVip?: boolean }>) => {
      const { seatId, isVip = false } = action.payload;
      const index = state.selectedSeats.indexOf(seatId);
      
      if (index !== -1) {
        state.selectedSeats.splice(index, 1);
      } else {
        if (state.selectedSeats.length < 5) {
          state.selectedSeats.push(seatId);
        }
      }
      
      // Sync passenger count with selected seats
      state.passengerCount = state.selectedSeats.length;
      
      // Recalculate total price
      if (state.currentRoute) {
        const basePrice = state.currentRoute.price;
        const vipSurcharge = 50000;
        
        // Since we don't store seat types in the array, 
        // in a real app we'd map over seats to check which are VIP.
        // For now, we use the isVip flag from the last action or a simplified logic.
        // Simplified: Total = count * basePrice (plus any logic for VIP if needed)
        state.totalPrice = state.selectedSeats.length * basePrice;
      }
      saveBookingContext(state);
    },
    setSeats: (state, action: PayloadAction<string[]>) => {
      state.selectedSeats = action.payload;
      state.passengerCount = action.payload.length;
      saveBookingContext(state);
    },
    setTotalPrice: (state, action: PayloadAction<number>) => {
      state.totalPrice = action.payload;
      saveBookingContext(state);
    },
    setPassengerCount: (state, action: PayloadAction<number>) => {
      state.passengerCount = action.payload;
      saveBookingContext(state);
    },
    setStep: (state, action: PayloadAction<BookingState['step']>) => {
      state.step = action.payload;
      saveBookingContext(state);
    },
    setBookingId: (state, action: PayloadAction<string | undefined>) => {
      state.bookingId = action.payload;
      saveBookingContext(state);
    },
    setPickupPoint: (state, action: PayloadAction<string | undefined>) => {
      state.pickupPointId = action.payload;
      saveBookingContext(state);
    },
    setDropoffPoint: (state, action: PayloadAction<string | undefined>) => {
      state.dropoffPointId = action.payload;
      saveBookingContext(state);
    },
    setPaymentStatus: (state, action: PayloadAction<'pending' | 'success' | 'failed'>) => {
      state.paymentStatus = action.payload;
    },
    clearTicketError: (state) => {
      state.ticketError = null;
    },
    // Seat holding actions
    setHoldInfo: (state, action: PayloadAction<{ holdId: string; expiresAt: string; seats: string[] }>) => {
      state.holdId = action.payload.holdId;
      state.holdExpiresAt = action.payload.expiresAt;
      state.heldSeats = action.payload.seats;
    },
    clearHoldInfo: (state) => {
      state.holdId = null;
      state.holdExpiresAt = null;
      state.heldSeats = [];
    },
    resetBooking: () => {
      clearBookingContext();
      return initialState;
    },
    resetBookingState: () => {
      clearBookingContext();
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingDetails.pending, (state) => {
        state.ticketLoading = true;
        state.ticketError = null;
      })
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.ticketLoading = false;
        state.currentTicket = action.payload;
        state.ticketError = null;
      })
      .addCase(fetchBookingDetails.rejected, (state, action) => {
        state.ticketLoading = false;
        state.ticketError = action.payload as string;
        state.currentTicket = null;
      });
  },
});

export const { 
  initBooking, 
  hydrateBooking,
  toggleSeat, 
  setSeats,
  setTotalPrice,
  setPassengerCount, 
  setStep, 
  setBookingId, 
  setPickupPoint,
  setDropoffPoint,
  setPaymentStatus, 
  clearTicketError,
  setHoldInfo,
  clearHoldInfo,
  resetBooking,
  resetBookingState
} = bookingSlice.actions;

// Selectors
export const selectBooking = (state: RootState) => state.booking;
export const selectSelectedSeats = (state: RootState) => state.booking.selectedSeats;
export const selectTotalPrice = (state: RootState) => state.booking.totalPrice;
export const selectCanProceed = (state: RootState) => state.booking.selectedSeats.length > 0;
export const selectCurrentTicket = (state: RootState) => state.booking.currentTicket;
export const selectTicketLoading = (state: RootState) => state.booking.ticketLoading;
export const selectTicketError = (state: RootState) => state.booking.ticketError;

// Seat holding selectors
export const selectHoldId = (state: RootState) => state.booking.holdId;
export const selectHoldExpiresAt = (state: RootState) => state.booking.holdExpiresAt;
export const selectHeldSeats = (state: RootState) => state.booking.heldSeats;
export const selectHasActiveHold = (state: RootState) => {
  const { holdId, holdExpiresAt } = state.booking;
  if (!holdId || !holdExpiresAt) return false;
  return new Date(holdExpiresAt).getTime() > Date.now();
};

export default bookingSlice.reducer;
