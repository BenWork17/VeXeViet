import { describe, expect, it } from 'vitest';
import bookingReducer, {
  clearHoldInfo,
  hydrateBooking,
  initBooking,
  initialBookingState,
  resetBooking,
  setDropoffPoint,
  setHoldInfo,
  setPickupPoint,
  setStep,
  toggleSeat,
  type BookingWizardRoute,
} from '../bookingSlice';
import searchReducer, {
  resetFilters,
  setFilters,
  setSortBy,
  setSortOrder,
} from '../searchSlice';

const SAMPLE_ROUTE: BookingWizardRoute = {
  id: 'route-dn-hue-01',
  price: 180000,
  busType: 'LIMOUSINE',
  from: 'Đà Nẵng',
  to: 'Huế',
  departureTime: '2026-12-01T08:00:00.000Z',
  operatorName: 'Phương Trang',
  pickupPoints: [
    { id: 'pu-1', location: 'Bến xe Trung tâm Đà Nẵng', time: '08:00' },
    { id: 'pu-2', location: 'Văn phòng Hải Châu', time: '08:20' },
  ],
  dropoffPoints: [{ id: 'do-1', location: 'Bến xe Phía Nam Huế', time: '10:30' }],
};

describe('bookingSlice pure state transitions', () => {
  it('initialises route and defaults pickup/dropoff points', () => {
    const state = bookingReducer(initialBookingState, initBooking(SAMPLE_ROUTE));
    expect(state.currentRoute?.id).toBe('route-dn-hue-01');
    expect(state.selectedSeats).toEqual([]);
    expect(state.totalPrice).toBe(0);
    expect(state.pickupPointId).toBe('pu-1');
    expect(state.dropoffPointId).toBe('do-1');
    expect(state.step).toBe('seat-selection');
  });

  it('toggles seats, updates total price, and enforces maximum of 5 seats', () => {
    let state = bookingReducer(initialBookingState, initBooking(SAMPLE_ROUTE));

    for (const seatId of ['A01', 'A02', 'A03', 'A04', 'A05', 'A06']) {
      state = bookingReducer(state, toggleSeat({ seatId }));
    }

    expect(state.selectedSeats).toEqual(['A01', 'A02', 'A03', 'A04', 'A05']);
    expect(state.passengerCount).toBe(5);
    expect(state.totalPrice).toBe(5 * 180000);

    state = bookingReducer(state, toggleSeat({ seatId: 'A03' }));
    expect(state.selectedSeats).toEqual(['A01', 'A02', 'A04', 'A05']);
    expect(state.passengerCount).toBe(4);
    expect(state.totalPrice).toBe(4 * 180000);
  });

  it('tracks seat hold metadata, step transitions, hydration, and full reset', () => {
    let state = bookingReducer(initialBookingState, initBooking(SAMPLE_ROUTE));
    state = bookingReducer(state, setPickupPoint('pu-2'));
    state = bookingReducer(state, setDropoffPoint('do-1'));
    state = bookingReducer(
      state,
      setHoldInfo({
        holdId: 'hold-99',
        expiresAt: '2026-12-01T08:15:00.000Z',
        seats: ['A01', 'A02'],
      }),
    );
    state = bookingReducer(state, setStep('passenger-info'));

    expect(state.holdId).toBe('hold-99');
    expect(state.heldSeats).toEqual(['A01', 'A02']);
    expect(state.pickupPointId).toBe('pu-2');
    expect(state.step).toBe('passenger-info');

    state = bookingReducer(state, clearHoldInfo());
    expect(state.holdId).toBeNull();
    expect(state.heldSeats).toEqual([]);

    const hydrated = bookingReducer(
      initialBookingState,
      hydrateBooking({
        selectedSeats: ['B01'],
        passengerCount: 1,
        totalPrice: 180000,
        step: 'payment',
      }),
    );
    expect(hydrated.selectedSeats).toEqual(['B01']);
    expect(hydrated.step).toBe('payment');

    expect(bookingReducer(hydrated, resetBooking())).toEqual(initialBookingState);
  });
});

describe('searchSlice client filter state', () => {
  it('updates filters and sort order and resets cleanly', () => {
    let state = searchReducer(undefined, setFilters({ minPrice: 150000, busTypes: ['VIP'] }));
    state = searchReducer(state, setSortBy('rating'));
    state = searchReducer(state, setSortOrder('desc'));

    expect(state.filters.minPrice).toBe(150000);
    expect(state.filters.busTypes).toEqual(['VIP']);
    expect(state.sortBy).toBe('rating');
    expect(state.sortOrder).toBe('desc');

    state = searchReducer(state, resetFilters());
    expect(state.filters.minPrice).toBe(0);
    expect(state.filters.busTypes).toEqual([]);
  });
});
