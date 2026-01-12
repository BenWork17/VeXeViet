import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Route {
  id: string;
  price: number;
  busType: string;
  from: string;
  to: string;
  departureTime: string;
}

export interface BookingState {
  currentRoute: Route | null;
  selectedSeats: string[];
  passengerCount: number;
  totalPrice: number;
  step: 'seat-selection' | 'passenger-info' | 'payment' | 'confirmation';
}

const initialState: BookingState = {
  currentRoute: null,
  selectedSeats: [],
  passengerCount: 1,
  totalPrice: 0,
  step: 'seat-selection',
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    initBooking: (state, action: PayloadAction<Route>) => {
      state.currentRoute = action.payload;
      state.selectedSeats = [];
      state.totalPrice = 0;
      state.step = 'seat-selection';
    },
    toggleSeat: (state, action: PayloadAction<{ seatId: string; isVip?: boolean }>) => {
      const { seatId, isVip } = action.payload;
      const index = state.selectedSeats.indexOf(seatId);
      
      if (index !== -1) {
        state.selectedSeats.splice(index, 1);
      } else {
        if (state.selectedSeats.length < 5) {
          state.selectedSeats.push(seatId);
        }
      }
      
      // Recalculate total price
      if (state.currentRoute) {
        const vipSurcharge = 50000;
        state.totalPrice = state.selectedSeats.reduce((total, id) => {
          // In a real app, we'd check the seat type from a map or the action
          // For now, we'll assume the action provides isVip or we handle it simply
          return total + (state.currentRoute?.price || 0) + (isVip ? vipSurcharge : 0);
        }, 0);
      }
    },
    setPassengerCount: (state, action: PayloadAction<number>) => {
      state.passengerCount = action.payload;
    },
    setStep: (state, action: PayloadAction<BookingState['step']>) => {
      state.step = action.payload;
    },
    resetBooking: () => initialState,
  },
});

export const { initBooking, toggleSeat, setPassengerCount, setStep, resetBooking } = bookingSlice.actions;

// Selectors
export const selectBooking = (state: RootState) => state.booking;
export const selectSelectedSeats = (state: RootState) => state.booking.selectedSeats;
export const selectTotalPrice = (state: RootState) => state.booking.totalPrice;
export const selectCanProceed = (state: RootState) => state.booking.selectedSeats.length > 0;

export default bookingSlice.reducer;
