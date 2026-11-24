import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface BookingStopPoint {
  id: string;
  time?: string;
  location: string;
  address?: string;
}

export interface BookingWizardRoute {
  id: string;
  price: number;
  busType: string;
  from: string;
  to: string;
  departureTime: string;
  operatorId?: string;
  operatorName?: string;
  operatorRating?: number | null;
  operatorReviewCount?: number;
  pickupPoints?: BookingStopPoint[];
  dropoffPoints?: BookingStopPoint[];
}

export type Route = BookingWizardRoute;

export interface BookingState {
  currentRoute: BookingWizardRoute | null;
  selectedSeats: string[];
  passengerCount: number;
  totalPrice: number;
  step: 'seat-selection' | 'passenger-info' | 'payment' | 'confirmation';
  bookingId?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  pickupPointId?: string;
  dropoffPointId?: string;
  holdId: string | null;
  holdExpiresAt: string | null;
  heldSeats: string[];
}

export const BOOKING_STORAGE_KEY = 'vexeviet_booking_context';

export interface PersistedBookingContext {
  currentRoute: BookingWizardRoute | null;
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

export const initialBookingState: BookingState = {
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
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState: initialBookingState,
  reducers: {
    initBooking: (state, action: PayloadAction<BookingWizardRoute>) => {
      state.currentRoute = action.payload;
      state.selectedSeats = [];
      state.totalPrice = 0;
      state.passengerCount = 0;
      state.step = 'seat-selection';
      state.bookingId = undefined;
      state.paymentStatus = undefined;
      state.pickupPointId = action.payload.pickupPoints?.[0]?.id;
      state.dropoffPointId = action.payload.dropoffPoints?.[0]?.id;
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
    },
    toggleSeat: (state, action: PayloadAction<{ seatId: string; isVip?: boolean }>) => {
      const { seatId } = action.payload;
      const index = state.selectedSeats.indexOf(seatId);

      if (index !== -1) {
        state.selectedSeats.splice(index, 1);
      } else if (state.selectedSeats.length < 5) {
        state.selectedSeats.push(seatId);
      }

      state.passengerCount = state.selectedSeats.length;

      if (state.currentRoute) {
        state.totalPrice = state.selectedSeats.length * state.currentRoute.price;
      }
    },
    setSeats: (state, action: PayloadAction<string[]>) => {
      state.selectedSeats = action.payload;
      state.passengerCount = action.payload.length;
    },
    setTotalPrice: (state, action: PayloadAction<number>) => {
      state.totalPrice = action.payload;
    },
    setPassengerCount: (state, action: PayloadAction<number>) => {
      state.passengerCount = action.payload;
    },
    setStep: (state, action: PayloadAction<BookingState['step']>) => {
      state.step = action.payload;
    },
    setBookingId: (state, action: PayloadAction<string | undefined>) => {
      state.bookingId = action.payload;
    },
    setPickupPoint: (state, action: PayloadAction<string | undefined>) => {
      state.pickupPointId = action.payload;
    },
    setDropoffPoint: (state, action: PayloadAction<string | undefined>) => {
      state.dropoffPointId = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<'pending' | 'success' | 'failed'>) => {
      state.paymentStatus = action.payload;
    },
    setHoldInfo: (
      state,
      action: PayloadAction<{ holdId: string; expiresAt: string; seats: string[] }>
    ) => {
      state.holdId = action.payload.holdId;
      state.holdExpiresAt = action.payload.expiresAt;
      state.heldSeats = action.payload.seats;
    },
    clearHoldInfo: (state) => {
      state.holdId = null;
      state.holdExpiresAt = null;
      state.heldSeats = [];
    },
    resetBooking: () => initialBookingState,
    resetBookingState: () => initialBookingState,
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
  setHoldInfo,
  clearHoldInfo,
  resetBooking,
  resetBookingState,
} = bookingSlice.actions;

export const selectBooking = (state: RootState) => state.booking;
export const selectSelectedSeats = (state: RootState) => state.booking.selectedSeats;
export const selectTotalPrice = (state: RootState) => state.booking.totalPrice;
export const selectCanProceed = (state: RootState) => state.booking.selectedSeats.length > 0;
export const selectHoldId = (state: RootState) => state.booking.holdId;
export const selectHoldExpiresAt = (state: RootState) => state.booking.holdExpiresAt;
export const selectHeldSeats = (state: RootState) => state.booking.heldSeats;
export const selectHasActiveHold = (state: RootState) => {
  const { holdId, holdExpiresAt } = state.booking;
  if (!holdId || !holdExpiresAt) return false;
  return new Date(holdExpiresAt).getTime() > Date.now();
};

export default bookingSlice.reducer;
