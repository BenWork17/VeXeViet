'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/features/booking/PaymentForm/PaymentForm';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { initiatePayment } from '@/lib/api/payment';
import { PaymentMethod } from '@/types/payment';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import { selectBooking, clearHoldInfo, resetBooking } from '@/store/slices/bookingSlice';

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectBooking);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Use the seat hold hook
  const { 
    holdId, 
    expiresAt, 
    isExpired, 
    release,
    clearHold 
  } = useSeatHold({
    onExpire: () => {
      setShowExpiredModal(true);
    },
  });

  // Check for expired hold on mount
  useEffect(() => {
    if (isExpired && holdId) {
      setShowExpiredModal(true);
    }
  }, [isExpired, holdId]);

  // Handle return to seat selection
  const handleReturnToSeatSelection = useCallback(async () => {
    try {
      // Try to release the hold (it might already be expired on backend)
      await release();
    } catch {
      // Ignore errors - hold might already be expired
    }
    
    // Clear local hold state
    clearHold();
    dispatch(clearHoldInfo());
    
    // Navigate back to search
    router.push('/search');
  }, [release, clearHold, dispatch, router]);

  // Validate booking state
  if (!booking.currentRoute || booking.selectedSeats.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Không có thông tin đặt vé</h1>
          <p className="mb-6 text-muted-foreground">Vui lòng chọn chỗ trước khi thanh toán.</p>
          <button
            onClick={() => router.push('/search')}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Quay lại tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    // Check if hold has expired before proceeding
    if (isExpired) {
      setShowExpiredModal(true);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create booking with holdId
      const bookingId = 'BK-' + Date.now();
      
      // In a real app, we would first call the booking API with holdId
      // const bookingResponse = await createBooking({
      //   holdId: holdId!,
      //   passengers: [...],
      //   ...
      // });
      
      const response = await initiatePayment(bookingId, method, booking.totalPrice);

      if (response.success && response.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = response.paymentUrl;
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (err) {
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý thanh toán';
      setError(errorMessage);
      
      // Show alert for critical errors
      alert('Lỗi thanh toán: ' + errorMessage);
    }
  };

  // Handle hold expiration during payment
  const handleHoldExpire = useCallback(() => {
    if (!isProcessing) {
      setShowExpiredModal(true);
    }
  }, [isProcessing]);

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <PaymentForm
            bookingId={holdId || 'BK-' + Date.now()}
            expiresAt={expiresAt || undefined}
            onExpire={handleHoldExpire}
            tripDetails={{
              from: booking.currentRoute.from,
              to: booking.currentRoute.to,
              departureTime: booking.currentRoute.departureTime,
              busType: booking.currentRoute.busType,
            }}
            passengerCount={booking.selectedSeats.length}
            amount={booking.totalPrice}
            onMethodSelect={handlePaymentMethodSelect}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Expired Modal */}
      <SeatHoldExpiredModal
        isOpen={showExpiredModal}
        onReturnToSeatSelection={handleReturnToSeatSelection}
      />
    </>
  );
}
