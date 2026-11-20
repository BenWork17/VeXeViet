'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentForm } from '@/components/features/booking/PaymentForm/PaymentForm';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { FadeIn } from '@/components/motion';
import { initiatePayment } from '@/lib/api/payment';
import { createBooking, generateIdempotencyKey, getBookingById } from '@/lib/api/bookings';
import { PaymentMethod } from '@/types/payment';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import {
  selectBooking,
  setBookingId,
  setPickupPoint,
  setDropoffPoint,
  clearHoldInfo,
  hydrateBooking,
  loadBookingContext,
} from '@/store/slices/bookingSlice';
import type { PassengerInfo } from '@/components/features/booking/PassengerInfoForm';
import { AlertCircle, ArrowLeft, MapPin, Ticket } from 'lucide-react';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectBooking);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const createdBookingRef = useRef<{ bookingId: string; totalAmount: number } | null>(null);

  const queryBookingId = searchParams.get('bookingId') || searchParams.get('id');

  // Use the seat hold hook (no 1Hz re-renders; CountdownTimer handles display)
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

  // Hydrate booking from query param (?bookingId= / ?id=) or sessionStorage
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // Priority 1: Existing booking ID passed via query param ("Thanh toán ngay" / "Thử lại")
      if (queryBookingId) {
        try {
          setIsHydrating(true);
          setError(null);
          const existing = await getBookingById(queryBookingId);
          if (cancelled) return;

          if (existing) {
            const seatList =
              existing.passengers?.map((p: any) => p.seatNumber).filter(Boolean) ||
              existing.seats ||
              [];
            const totalAmount =
              typeof (existing as any).totalPrice === 'object' && (existing as any).totalPrice !== null
                ? ((existing as any).totalPrice.amount || (existing as any).totalPrice.total || 0)
                : existing.totalAmount || (existing as any).totalPrice || 0;

            createdBookingRef.current = {
              bookingId: existing.id || queryBookingId,
              totalAmount,
            };

            dispatch(
              hydrateBooking({
                bookingId: existing.id || queryBookingId,
                currentRoute: {
                  id: existing.routeId || existing.route?.id || '',
                  price: seatList.length > 0 ? Math.round(totalAmount / seatList.length) : totalAmount,
                  busType: existing.route?.busType || 'STANDARD',
                  from: existing.route?.origin || '',
                  to: existing.route?.destination || '',
                  departureTime: existing.route?.departureTime || new Date().toISOString(),
                },
                selectedSeats: seatList.length > 0 ? seatList : ['1'],
                passengerCount: seatList.length || 1,
                totalPrice: totalAmount,
                step: 'payment',
              })
            );
            setIsHydrating(false);
            return;
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Không thể tải thông tin đặt vé');
          }
        }
      }

      // Priority 2: Restore in-progress booking from sessionStorage after F5
      if (!booking.currentRoute || booking.selectedSeats.length === 0) {
        const persisted = loadBookingContext();
        if (persisted?.currentRoute && persisted.selectedSeats && persisted.selectedSeats.length > 0) {
          dispatch(hydrateBooking(persisted));
          if (persisted.bookingId) {
            createdBookingRef.current = {
              bookingId: persisted.bookingId,
              totalAmount: persisted.totalPrice,
            };
          }
        }
      } else if (booking.bookingId && !createdBookingRef.current) {
        createdBookingRef.current = {
          bookingId: booking.bookingId,
          totalAmount: booking.totalPrice,
        };
      }

      if (!cancelled) {
        setIsHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [queryBookingId, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for expired hold on mount (skip when paying an already-created booking via query param)
  useEffect(() => {
    if (!queryBookingId && isExpired && holdId) {
      setShowExpiredModal(true);
    }
  }, [isExpired, holdId, queryBookingId]);

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

  // Handle hold expiration during payment
  const handleHoldExpire = useCallback(() => {
    if (!isProcessing && !queryBookingId) {
      setShowExpiredModal(true);
    }
  }, [isProcessing, queryBookingId]);

  if (isHydrating) {
    return (
      <div className="booking-page-loading" role="status" aria-live="polite">
        <p>Đang tải thông tin thanh toán…</p>
      </div>
    );
  }

  // Validate booking state
  if (!booking.currentRoute || booking.selectedSeats.length === 0) {
    return (
      <div className="booking-state-page">
        <div className="booking-state-card">
          <span className="booking-state-icon" aria-hidden="true">
            <Ticket size={24} />
          </span>
          <h1 className="booking-state-title">Chưa có thông tin đặt vé</h1>
          <p className="booking-state-text">
            {error || 'Vui lòng chọn ghế trước khi thanh toán.'}
          </p>
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

  const pickupPoints = booking.currentRoute.pickupPoints || [];
  const dropoffPoints = booking.currentRoute.dropoffPoints || [];
  const selectedPickupId = booking.pickupPointId || pickupPoints[0]?.id || 'p1';
  const selectedDropoffId = booking.dropoffPointId || dropoffPoints[0]?.id || 'd1';

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    if (isProcessing) return;

    if (!queryBookingId && isExpired) {
      setShowExpiredModal(true);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Reuse existing bookingId if already created (prevents duplicate bookings on retry)
      let activeBookingId = createdBookingRef.current?.bookingId || booking.bookingId;
      let payableAmount = createdBookingRef.current?.totalAmount || booking.totalPrice;

      if (!activeBookingId) {
        const seatLabels = booking.heldSeats.length > 0 ? booking.heldSeats : booking.selectedSeats;

        const departureDate: string = booking.currentRoute!.departureTime
          ? new Date(booking.currentRoute!.departureTime).toISOString().split('T')[0]!
          : new Date().toISOString().split('T')[0]!;

        // Build passengers array from form data stored in sessionStorage
        const passengers = passengerInfo?.passengers
          ? passengerInfo.passengers.map((p) => ({
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
          pickupPointId: selectedPickupId,
          dropoffPointId: selectedDropoffId,
          contactInfo: {
            email: passengerInfo?.email || '',
            phone: passengerInfo?.phone || '',
            fullName: passengerInfo?.fullName || '',
          },
          idempotencyKey: idempotencyKeyRef.current,
          notes: '',
        });

        activeBookingId = bookingResponse.bookingId;
        payableAmount = bookingResponse.totalAmount || booking.totalPrice;
        createdBookingRef.current = {
          bookingId: activeBookingId,
          totalAmount: payableAmount,
        };

        // Store bookingId in Redux + sessionStorage so retries reuse it
        dispatch(setBookingId(activeBookingId));
      }

      // Step 2: Create payment (POST /payments) → get VNPay URL
      const paymentResponse = await initiatePayment(
        activeBookingId,
        method,
        payableAmount,
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
      // Only rotate idempotency key if createBooking itself failed before returning a bookingId
      if (!createdBookingRef.current?.bookingId) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }
    }
  };

  return (
    <>
      <FadeIn className="booking-container">
        {!queryBookingId && (
          <button type="button" onClick={() => router.back()} className="booking-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Quay lại thông tin hành khách
          </button>
        )}

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

        {(pickupPoints.length > 0 || dropoffPoints.length > 0) && !createdBookingRef.current?.bookingId && (
          <div className="booking-panel booking-panel--paper mb-6">
            <h2 className="booking-section-title mb-3 flex items-center gap-2">
              <MapPin size={18} aria-hidden="true" />
              Điểm đón &amp; điểm trả
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {pickupPoints.length > 0 && (
                <label className="booking-field">
                  <span className="booking-field-label">Điểm đón</span>
                  <select
                    value={selectedPickupId}
                    onChange={(e) => dispatch(setPickupPoint(e.target.value))}
                    disabled={isProcessing}
                    className="booking-input h-[42px] w-full rounded-md border border-input bg-field px-3 text-sm font-semibold text-foreground"
                  >
                    {pickupPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.time ? `${point.time} · ` : ''}{point.location}
                        {point.address ? ` (${point.address})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {dropoffPoints.length > 0 && (
                <label className="booking-field">
                  <span className="booking-field-label">Điểm trả</span>
                  <select
                    value={selectedDropoffId}
                    onChange={(e) => dispatch(setDropoffPoint(e.target.value))}
                    disabled={isProcessing}
                    className="booking-input h-[42px] w-full rounded-md border border-input bg-field px-3 text-sm font-semibold text-foreground"
                  >
                    {dropoffPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.time ? `${point.time} · ` : ''}{point.location}
                        {point.address ? ` (${point.address})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        )}

        <div className="booking-panel booking-panel--paper">
          <PaymentForm
            bookingId={booking.bookingId || holdId || ''}
            expiresAt={!queryBookingId ? (expiresAt || undefined) : undefined}
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

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="booking-page-loading" role="status" aria-live="polite">
          <p>Đang tải thông tin thanh toán…</p>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
