import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { BookingDetails } from '@/types/booking';
import { mockBookingApi } from '@/lib/api/mock/booking';

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
  bookingId?: string;
  paymentStatus?: 'pending' | 'success' | 'failed';
  
  // Ticket details
  currentTicket: BookingDetails | null;
  ticketLoading: boolean;
  ticketError: string | null;
}

const initialState: BookingState = {
  currentRoute: null,
  selectedSeats: [],
  passengerCount: 1,
  totalPrice: 0,
  step: 'seat-selection',
  bookingId: undefined,
  paymentStatus: undefined,
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
        // In a real app, we would need to know which seats are VIP
        // For simplicity in this slice, we assume the UI handles the pricing logic or we store seat types
        // Let's just update the totalPrice directly in the action or handle it better
      }
    },
    setSeats: (state, action: PayloadAction<string[]>) => {
      state.selectedSeats = action.payload;
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
    setBookingId: (state, action: PayloadAction<string>) => {
      state.bookingId = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<'pending' | 'success' | 'failed'>) => {
      state.paymentStatus = action.payload;
    },
    clearTicketError: (state) => {
      state.ticketError = null;
    },
    resetBooking: () => initialState,
    resetBookingState: () => initialState,
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
  toggleSeat, 
  setSeats,
  setTotalPrice,
  setPassengerCount, 
  setStep, 
  setBookingId, 
  setPaymentStatus, 
  clearTicketError,
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

export default bookingSlice.reducer;
