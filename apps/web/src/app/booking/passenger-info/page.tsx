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
import { cn } from '@/lib/utils';
import { ArrowLeft, MapPin, Clock, Users, AlertCircle, Bus } from 'lucide-react';

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

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Thông tin liên hệ</h2>
                  <p className="text-slate-600">
                    Vui lòng nhập thông tin chính xác để nhận vé điện tử
                  </p>
                </div>

                {/* Info Banner */}
                {user && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">Thông tin tự động điền</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Chúng tôi đã điền sẵn thông tin từ tài khoản của bạn. Vui lòng kiểm tra và cập nhật nếu cần.
                      </p>
                    </div>
                  </div>
                )}

                {/* Passenger Form */}
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
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Tóm tắt chuyến đi</h3>

                {/* Countdown Timer */}
                {expiresAt && !isExpired && (
                  <div className="mb-6">
                    <CountdownTimer 
                      expiresAt={expiresAt} 
                      onExpire={() => setShowExpiredModal(true)}
                    />
                  </div>
                )}

                {/* Trip Info */}
                <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Tuyến đường</p>
                      <p className="font-semibold text-slate-900">
                        {booking.currentRoute.from} → {booking.currentRoute.to}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Giờ khởi hành</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(booking.currentRoute.departureTime).toLocaleString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bus className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Loại xe</p>
                      <p className="font-semibold text-slate-900">{booking.currentRoute.busType}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Seats */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-900 mb-3">
                    Ghế đã chọn ({booking.selectedSeats.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {booking.heldSeats.length > 0 ? (
                      // Show seat labels from held seats
                      booking.heldSeats.map((seatLabel) => (
                        <span
                          key={seatLabel}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm"
                        >
                          {seatLabel}
                        </span>
                      ))
                    ) : (
                      // Fallback to selected seat IDs
                      booking.selectedSeats.map((seatId) => (
                        <span
                          key={seatId}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm"
                        >
                          {seatId}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Giá vé x {booking.selectedSeats.length}</span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔒</span>
                    <p className="text-xs text-green-800 leading-relaxed">
                      <strong>Thanh toán an toàn:</strong> Thông tin của bạn được mã hóa và bảo mật
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
