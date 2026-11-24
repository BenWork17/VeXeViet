import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice';
import bookingReducer, {
  clearBookingContext,
  hydrateBooking,
  initBooking,
  resetBooking,
  resetBookingState,
  saveBookingContext,
  setBookingId,
  setDropoffPoint,
  setPassengerCount,
  setPickupPoint,
  setSeats,
  setStep,
  setTotalPrice,
  toggleSeat,
} from './slices/bookingSlice';

const bookingPersistenceMiddleware = createListenerMiddleware();

bookingPersistenceMiddleware.startListening({
  matcher: isAnyOf(
    initBooking,
    hydrateBooking,
    toggleSeat,
    setSeats,
    setTotalPrice,
    setPassengerCount,
    setStep,
    setBookingId,
    setPickupPoint,
    setDropoffPoint
  ),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { booking: ReturnType<typeof bookingReducer> };
    saveBookingContext(state.booking);
  },
});

bookingPersistenceMiddleware.startListening({
  matcher: isAnyOf(resetBooking, resetBookingState),
  effect: () => {
    clearBookingContext();
  },
});

export const makeStore = () => {
  return configureStore({
    reducer: {
      search: searchReducer,
      booking: bookingReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(bookingPersistenceMiddleware.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
