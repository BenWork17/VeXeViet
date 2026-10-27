'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/features/booking/PaymentForm/PaymentForm';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { FadeIn } from '@/components/motion';
import { initiatePayment } from '@/lib/api/payment';
import { createBooking, generateIdempotencyKey } from '@/lib/api/bookings';
import { PaymentMethod } from '@/types/payment';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import { selectBooking, setBookingId, clearHoldInfo, resetBooking } from '@/store/slices/bookingSlice';
import type { PassengerInfo } from '@/components/features/booking/PassengerInfoForm';
import { AlertCircle, Ticket } from 'lucide-react';

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
      <div className="booking-state-page">
        <div className="booking-state-card">
          <span className="booking-state-icon" aria-hidden="true">
            <Ticket size={24} />
          </span>
          <h1 className="booking-state-title">Chưa có thông tin đặt vé</h1>
          <p className="booking-state-text">Vui lòng chọn ghế trước khi thanh toán.</p>
          <div className="booking-state-actions">
            <button
              type="button"
              onClick={() => router.push('/search')}
              className="booking-action booking-action--inline"
            >
              Quay lại tìm kiếm
            </button>
          </div>
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
      <FadeIn className="booking-container">
        <div className="booking-panel-head">
          <div>
            <h1 className="booking-title">Thanh toán</h1>
            <p className="booking-subtitle">
              Kiểm tra thông tin chuyến đi và chọn phương thức thanh toán.
            </p>
          </div>
        </div>

        {error ? (
          <div className="booking-inline-alert" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <div>
              <strong>Không thể xử lý thanh toán</strong>
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        <div className="booking-panel booking-panel--paper">
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
      </FadeIn>

      {/* Expired Modal */}
      <SeatHoldExpiredModal
        isOpen={showExpiredModal}
        onReturnToSeatSelection={handleReturnToSeatSelection}
      />
    </>
  );
}
