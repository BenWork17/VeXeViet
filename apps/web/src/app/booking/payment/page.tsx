'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/features/booking/PaymentForm/PaymentForm';
import { initiatePayment } from '@/lib/api/payment';
import { PaymentMethod } from '@/types/payment';
import { useAppSelector } from '@/lib/hooks/redux';
import { selectBooking } from '@/store/slices/bookingSlice';

export default function PaymentPage() {
  const router = useRouter();
  const booking = useAppSelector(selectBooking);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock booking ID - in real app, this would come from the booking creation response
  const bookingId = 'BK-' + Date.now();

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
    setIsProcessing(true);
    setError(null);

    try {
      // In a real app, we would first call the booking API to create a booking record
      // For this demo, we use the Redux state to pass details to the payment initiator
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
        <p className="text-slate-500 mt-2">Vui lòng chọn phương thức thanh toán an toàn</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <strong>Lỗi:</strong> {error}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <PaymentForm
          bookingId={bookingId}
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
  );
  }
