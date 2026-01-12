import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      search: searchReducer,
      auth: authReducer,
      booking: bookingReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
