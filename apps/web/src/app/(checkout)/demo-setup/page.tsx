'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
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
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
      return;
    }
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

    console.log('Mock booking data initialized');
  }, [dispatch]);

  const handleGoToPayment = () => {
    router.push('/booking/payment');
  };

  const handleGoToSearch = () => {
    router.push('/search');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-hn">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
            <CircleCheck size={28} className="text-success-ink" aria-hidden="true" />
          </div>
          <h1 className="mb-2 font-display text-2xl text-foreground">Demo Setup Complete</h1>
          <p className="text-sm text-muted-foreground">
            Mock booking data has been loaded into Redux store
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-md bg-muted p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-semibold text-foreground">HCM → Đà Lạt</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seats:</span>
            <span className="font-semibold text-foreground">A1, A2 (2 seats)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-mono font-semibold text-foreground">600,000 VND</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bus Type:</span>
            <span className="font-semibold text-foreground">VIP Limousine</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoToPayment}
            className="w-full rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep motion-reduce:transition-none"
          >
            Go to Payment Page
          </button>

          <button
            onClick={handleGoToSearch}
            className="w-full rounded-md border border-input px-6 py-3 font-semibold text-foreground transition-colors duration-150 hover:bg-muted motion-reduce:transition-none"
          >
            Go to Search Page
          </button>
        </div>

        <div className="mt-6 rounded-md border-l-4 border-info bg-info-soft p-4 text-sm text-info-ink">
          <strong>Tip:</strong> Use this page to quickly initialize booking data for testing the payment flow.
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Development Testing Tool
        </div>
      </div>
    </div>
  );
}
