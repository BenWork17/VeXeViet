'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import { useAuth } from '@/lib/hooks/useAuth';
import { selectBooking, setStep, clearHoldInfo } from '@/store/slices/bookingSlice';
import { PassengerInfoForm, type PassengerInfo } from '@/components/features/booking/PassengerInfoForm';
import { CountdownTimer } from '@/components/features/booking/CountdownTimer';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PassengerInfoPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectBooking);
  const { user } = useAuth();

  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seat hold hook
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

  // Check if we have required booking data
  useEffect(() => {
    if (!booking.currentRoute || booking.selectedSeats.length === 0) {
      router.push('/search');
      return;
    }

    // Check if hold has expired
    if (!holdId || isExpired) {
      setShowExpiredModal(true);
    }
  }, [booking.currentRoute, booking.selectedSeats, holdId, isExpired, router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle hold expiration
  const handleExpiredReturn = useCallback(async () => {
    try {
      await release();
    } catch {
      // Ignore errors
    }

    clearHold();
    dispatch(clearHoldInfo());
    router.push('/search');
  }, [release, clearHold, dispatch, router]);

  // Handle form submission
  const handleSubmit = useCallback(async (data: PassengerInfo) => {
    setIsSubmitting(true);

    try {
      // Store passenger info in session storage for payment page
      sessionStorage.setItem('vexeviet_passenger_info', JSON.stringify(data));

      // Navigate to payment page
      dispatch(setStep('payment'));
      router.push('/booking/payment');
    } catch (error) {
      console.error('Error submitting passenger info:', error);
      setIsSubmitting(false);
    }
  }, [dispatch, router]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!booking.currentRoute || booking.selectedSeats.length === 0) {
    return null;
  }

  const seatLabels = booking.heldSeats.length > 0 ? booking.heldSeats : booking.selectedSeats;

  return (
    <>
      <div className="booking-container">
        <button type="button" onClick={handleBack} className="booking-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại chọn ghế
        </button>

        <div className="booking-panel-head">
          <div>
            <h1 className="booking-title">Thông tin hành khách</h1>
            <p className="booking-subtitle">
              Nhập thông tin chính xác để nhận vé điện tử và làm thủ tục lên xe.
            </p>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-panel booking-panel--paper">
            {user ? (
              <div className="booking-info-note">
                <strong>Thông tin tự động điền</strong>
                <span>
                  Chúng tôi đã điền sẵn thông tin từ tài khoản của bạn. Vui lòng kiểm tra và cập nhật nếu cần.
                </span>
              </div>
            ) : null}

            <PassengerInfoForm
              initialData={{
                fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
                phone: user?.phone || '',
                email: user?.email || '',
                acceptTerms: false,
              }}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          <aside className="booking-summary" aria-labelledby="trip-summary-title">
            <div className="booking-panel-head">
              <h2 id="trip-summary-title" className="booking-summary-title">
                Chuyến đi
              </h2>
              <p className="booking-panel-note">{booking.selectedSeats.length} ghế</p>
            </div>

            {expiresAt && !isExpired ? (
              <div className="booking-summary-block">
                <CountdownTimer
                  expiresAt={expiresAt}
                  onExpire={() => setShowExpiredModal(true)}
                />
              </div>
            ) : null}

            <div className="booking-summary-block">
              <div className="booking-ledger-row">
                <span>Tuyến</span>
                <strong>
                  {booking.currentRoute.from} → {booking.currentRoute.to}
                </strong>
              </div>
              <div className="booking-ledger-row">
                <span>Khởi hành</span>
                <strong>
                  {new Date(booking.currentRoute.departureTime).toLocaleString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </div>
              <div className="booking-ledger-row">
                <span>Loại xe</span>
                <strong>{booking.currentRoute.busType}</strong>
              </div>
            </div>

            <div className="booking-summary-block">
              <p className="booking-panel-note">Ghế đã chọn</p>
              <div className="booking-summary-seats">
                {seatLabels.map((seatLabel) => (
                  <span key={seatLabel} className="booking-seat-chip">
                    {seatLabel}
                  </span>
                ))}
              </div>
              <p className="booking-summary-note">
                {booking.selectedSeats.length} × {formatCurrency(booking.totalPrice / booking.selectedSeats.length)}
              </p>
            </div>

            <div className="booking-summary-total">
              <div>
                <p className="booking-summary-total-label">Tổng cộng</p>
                <p className="booking-summary-amount">{formatCurrency(booking.totalPrice)}</p>
                <p className="booking-summary-note">Đã bao gồm thuế và phí.</p>
              </div>
            </div>

            <div className="booking-secure-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                <strong>Thanh toán an toàn.</strong> Thông tin của bạn được mã hóa và bảo mật.
              </span>
            </div>
          </aside>
        </div>
      </div>

      {/* Expired Modal */}
      <SeatHoldExpiredModal
        isOpen={showExpiredModal}
        onReturnToSeatSelection={handleExpiredReturn}
      />
    </>
  );
}
