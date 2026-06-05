'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/features/booking/PaymentForm/PaymentForm';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { initiatePayment } from '@/lib/api/payment';
import { createBooking, generateIdempotencyKey } from '@/lib/api/bookings';
import { PaymentMethod } from '@/types/payment';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import { selectBooking, setBookingId, clearHoldInfo, resetBooking } from '@/store/slices/bookingSlice';
import type { PassengerInfo } from '@/components/features/booking/PassengerInfoForm';

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectBooking);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const idempotencyKeyRef = useRef(generateIdempotencyKey());

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

  // Load passenger info from session storage
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo | null>(null);
  useEffect(() => {
    const stored = sessionStorage.getItem('vexeviet_passenger_info');
    if (stored) {
      try {
        setPassengerInfo(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Check for expired hold on mount
  useEffect(() => {
    if (isExpired && holdId) {
      setShowExpiredModal(true);
    }
  }, [isExpired, holdId]);

  // Handle return to seat selection
  const handleReturnToSeatSelection = useCallback(async () => {
    try {
      await release();
    } catch {
      // Ignore errors - hold might already be expired
    }
    
    clearHold();
    dispatch(clearHoldInfo());
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
    if (isExpired) {
      setShowExpiredModal(true);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create booking via API (POST /bookings)
      const seatLabels = booking.heldSeats.length > 0 ? booking.heldSeats : booking.selectedSeats;
      
      const departureDate: string = booking.currentRoute!.departureTime
        ? new Date(booking.currentRoute!.departureTime).toISOString().split('T')[0]!
        : new Date().toISOString().split('T')[0]!;

      // Build passengers array from form data stored in sessionStorage
      const passengers = passengerInfo?.passengers
        ? passengerInfo.passengers.map(p => ({
            firstName: p.firstName,
            lastName: p.lastName,
            seatNumber: p.seatNumber,
            idNumber: p.idNumber || undefined,
            dateOfBirth: p.dateOfBirth || undefined,
          }))
        : seatLabels.map((seatNumber) => {
            const nameParts = (passengerInfo?.fullName || 'Guest').split(' ');
            const lastName = nameParts[0] || '';
            const firstName = nameParts.slice(1).join(' ') || nameParts[0] || '';
            return { firstName, lastName, seatNumber };
          });

      const bookingResponse = await createBooking({
        routeId: booking.currentRoute!.id,
        departureDate,
        seats: seatLabels,
        passengers,
        pickupPointId: 'p1',
        dropoffPointId: 'd1',
        contactInfo: {
          email: passengerInfo?.email || '',
          phone: passengerInfo?.phone || '',
          fullName: passengerInfo?.fullName || '',
        },
        idempotencyKey: idempotencyKeyRef.current,
        notes: '',
      });

      // Store bookingId in Redux
      dispatch(setBookingId(bookingResponse.bookingId));

      // Step 2: Create payment (POST /payments) → get VNPay URL
      const paymentResponse = await initiatePayment(
        bookingResponse.bookingId,
        method,
        bookingResponse.totalAmount || booking.totalPrice,
      );

      if (paymentResponse.success && paymentResponse.paymentUrl) {
        // Redirect browser to VNPay (NOT iframe!)
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error('Không nhận được link thanh toán từ server');
      }
    } catch (err) {
      setIsProcessing(false);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý thanh toán';
      setError(errorMessage);
      // Generate new idempotency key for retry
      idempotencyKeyRef.current = generateIdempotencyKey();
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <PaymentForm
            bookingId={booking.bookingId || holdId || ''}
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
