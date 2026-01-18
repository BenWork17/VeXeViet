'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks/redux';
import { initBooking, toggleSeat, setStep } from '@/store/slices/bookingSlice';

/**
 * Demo Setup Page - Initializes Redux store with mock booking data
 * Navigate to this page before testing payment flow
 */
export default function DemoSetupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize mock booking data
    const mockRoute = {
      id: 'route-123',
      price: 250000,
      busType: 'VIP Limousine 24 seats',
      from: 'TP. Hồ Chí Minh',
      to: 'Đà Lạt',
      departureTime: '2026-01-20T08:00:00',
    };

    // Set up booking state
    dispatch(initBooking(mockRoute));
    
    // Select 2 mock seats
    dispatch(toggleSeat({ seatId: 'A1', isVip: true }));
    dispatch(toggleSeat({ seatId: 'A2', isVip: true }));
    
    // Set payment step
    dispatch(setStep('payment'));

    console.log('✅ Mock booking data initialized');
  }, [dispatch]);

  const handleGoToPayment = () => {
    router.push('/booking/payment');
  };

  const handleGoToSearch = () => {
    router.push('/search');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Demo Setup Complete</h1>
          <p className="text-sm text-gray-600">
            Mock booking data has been loaded into Redux store
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Route:</span>
            <span className="font-semibold">HCM → Đà Lạt</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seats:</span>
            <span className="font-semibold">A1, A2 (2 seats)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold">600,000 VND</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bus Type:</span>
            <span className="font-semibold">VIP Limousine</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoToPayment}
            className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600"
          >
            Go to Payment Page
          </button>

          <button
            onClick={handleGoToSearch}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            Go to Search Page
          </button>
        </div>

        <div className="mt-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>💡 Tip:</strong> Use this page to quickly initialize booking data for testing the payment flow.
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Development Testing Tool
        </div>
      </div>
    </div>
  );
}
