'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SeatMap, SeatData } from '@/components/features/booking/SeatMap/SeatMap';
import { BusSeatLayout } from '@/components/features/booking/SeatMap/layouts';
import { CountdownTimer } from '@/components/features/booking/CountdownTimer';
import { SeatConflictModal } from '@/components/features/booking/SeatConflictModal';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { FadeIn } from '@/components/motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import { setSeats, setTotalPrice, setStep, clearHoldInfo } from '@/store/slices/bookingSlice';
import { getSeatAvailability } from '@/lib/api/bookings';
import type { SeatAvailability, SeatDetail } from '@vexeviet/types';
import { AlertCircle } from 'lucide-react';

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentRoute } = useAppSelector((state) => state.booking);
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  // For standard/limousine buses
  const [seats, setSeatsData] = useState<SeatData[]>([]);
  // For sleeper buses - use API response directly
  const [seatAvailability, setSeatAvailability] = useState<SeatAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [conflictedSeats, setConflictedSeats] = useState<string[]>([]);
  
  const routeId = params.id;
  
  // Seat hold hook
  const { 
    holdId, 
    expiresAt, 
    isHolding, 
    isExpired,
    hold, 
    release,
    clearHold,
    refreshAvailability: refreshSeatAvailability 
  } = useSeatHold({
    onHoldSuccess: (data) => {
      // Navigate to passenger info page after successful hold
      dispatch(setSeats(selectedSeats));
      dispatch(setTotalPrice(totalPrice));
      dispatch(setStep('passenger-info'));
      router.push('/booking/passenger-info');
    },
    onHoldError: (error) => {
      // Check if it's a conflict error (409)
      if (error.message.includes('409') || error.message.includes('conflict') || error.message.includes('đã có người')) {
        setConflictedSeats(selectedSeats);
        setShowConflictModal(true);
      } else {
        setError(error.message);
      }
    },
    onExpire: () => {
      setShowExpiredModal(true);
    },
  });
  
  const currentBusType = seatAvailability?.busTemplate?.busType || currentRoute?.busType || 'STANDARD';
  const busTypeDisplay = currentBusType.toString().toUpperCase();
  const busTypeLabel =
    {
      STANDARD: 'Ghế ngồi',
      SLEEPER: 'Giường nằm',
      LIMOUSINE: 'Limousine',
      VIP: 'Ghế VIP',
    }[busTypeDisplay] || 'Xe khách';
  const basePrice = currentRoute?.price || 250000;
  const vipSurcharge = 50000;

  // Check if this is a sleeper bus (case-insensitive)
  const isSleeper = busTypeDisplay === 'SLEEPER';

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/booking/${routeId}`)}`);
      return;
    }

    if (!currentRoute) {
      router.push(`/routes/${routeId}`);
      return;
    }

    async function fetchSeats() {
      try {
        setLoading(true);
        setError(null);
        
        const departureDate = currentRoute?.departureTime 
          ? new Date(currentRoute.departureTime).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        console.log('[BookingPage] Requesting:', { routeId, departureDate });
        
        const availability = await getSeatAvailability(routeId, departureDate!);
        
        console.log('[BookingPage] API Data:', availability);
        
        if (!availability || !availability.seats || availability.seats.length === 0) {
          throw new Error('Không có dữ liệu chỗ ngồi từ server');
        }

        // HEURISTIC: If API lacks busTemplate, detect from seat numbers
        let detectedBusType = availability.busTemplate?.busType || currentRoute?.busType || 'STANDARD';
        
        const isSleeperLabels = availability.seats.some(s => 
          s.seatNumber?.includes('-L') || s.seatNumber?.includes('-U') || 
          s.seatLabel?.includes('-L') || s.seatLabel?.includes('-U')
        );

        if (isSleeperLabels && detectedBusType !== 'SLEEPER') {
          detectedBusType = 'SLEEPER';
        }

        // Create busTemplate if not provided by API
        if (!availability.busTemplate) {
          // Determine template based on detected bus type and seat count
          const seatCount = availability.seats.length;
          
          if (detectedBusType === 'SLEEPER') {
            // Sleeper bus fallback
            availability.busTemplate = {
              id: 'auto-sleeper',
              name: seatCount >= 38 ? 'Xe Giường Nằm 42 Chỗ' : 'Xe Giường Nằm 34 Chỗ VIP',
              busType: 'SLEEPER',
              totalSeats: seatCount,
              floors: 2,
              rowsPerFloor: seatCount >= 38 ? 7 : 6,
              columns: ['A', '_', 'B', '_', 'C'],
              layoutImage: null
            };
          } else if (detectedBusType === 'LIMOUSINE') {
            // Limousine fallback
            availability.busTemplate = {
              id: 'auto-limousine',
              name: seatCount <= 25 ? 'Limousine 22 Chỗ VIP' : 'Limousine 34 Chỗ',
              busType: 'LIMOUSINE',
              totalSeats: seatCount,
              floors: 1,
              rowsPerFloor: seatCount <= 25 ? 11 : 17,
              columns: ['A', '_', 'B'],
              layoutImage: null
            };
          } else {
            // Standard bus fallback
            availability.busTemplate = {
              id: 'auto-standard',
              name: 'Xe Ghế Ngồi 45 Chỗ',
              busType: 'STANDARD',
              totalSeats: seatCount,
              floors: 1,
              rowsPerFloor: 12,
              columns: ['A', 'B', '_', 'C', 'D'],
              layoutImage: null
            };
          }
        }

        // Ensure all seats have floor/row/col for rendering
        availability.seats = availability.seats.map((s, index) => {
          const label = (s.seatNumber || s.seatLabel || '');
          
          // Detect floor: 1 for Lower (-L), 2 for Upper (-U)
          // Trust API if available, otherwise parse label
          let floor = s.floor;
          if (!floor) {
            if (label.includes('-U')) floor = 2;
            else if (label.includes('-L')) floor = 1;
            else floor = 1;
          }
          
          // Extract row and column
          const rowMatch = label.match(/\d+/);
          const row = s.row || (rowMatch ? parseInt(rowMatch[0]) : Math.floor(index / 4) + 1);
          
          const colMatch = label.match(/[A-Z]/);
          const column = s.column || (colMatch ? colMatch[0] : ['A', 'B', 'C', 'D'][index % 4] || 'A');

          return {
            ...s,
            id: s.id || label || `s-${index}`,
            floor,
            row,
            column,
            seatLabel: label || `${row}${column}`,
            isSelectable: s.status === 'AVAILABLE' || s.isSelectable === true,
            finalPrice: s.finalPrice || (basePrice || 250000)
          };
        });

        setSeatAvailability(availability);

        // Keep legacy mapping for fallback SeatMap component
        const mappedSeats: SeatData[] = availability.seats.map((seat: SeatDetail) => ({
          id: seat.id || seat.seatNumber || seat.seatLabel,
          status: seat.status === 'AVAILABLE' ? 'available' : 'occupied',
          type: seat.seatType === 'VIP' ? 'vip' : 'standard',
        }));
        setSeatsData(mappedSeats);
      } catch (err: any) {
        console.error('[BookingPage] Error:', err);
        setError(err.message || 'Lỗi kết nối server');
      } finally {
        setLoading(false);
      }
    }

    fetchSeats();
  }, [routeId, currentRoute, router, isAuthenticated, user, isAuthLoading]);

  const generateFallbackSeats = (): SeatData[] => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const cols = [1, 2, 3, 4];
    const seats: SeatData[] = [];

    rows.forEach((row) => {
      cols.forEach((col) => {
        const id = `${row}${col}`;
        const random = Math.random();
        let status: SeatData['status'] = 'available';
        if (random > 0.8) status = 'occupied';
        
        const type: SeatData['type'] = (row === 'A' || row === 'B') ? 'vip' : 'standard';
        
        seats.push({ id, status, type });
      });
    });

    return seats;
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= 5) {
        alert('Bạn chỉ có thể chọn tối đa 5 ghế.');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const totalPrice = useMemo(() => {
    if (selectedSeats.length === 0) return 0;
    
    // If we have detailed availability, use actual seat prices
    if (seatAvailability && seatAvailability.seats.length > 0) {
      return selectedSeats.reduce((sum, seatId) => {
        const seat = seatAvailability.seats.find(s => s.id === seatId || s.seatNumber === seatId || s.seatLabel === seatId);
        return sum + (seat?.finalPrice || basePrice);
      }, 0);
    }
    
    // Fallback to base price + surcharges
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      const price = seat?.type === 'vip' ? basePrice + vipSurcharge : basePrice;
      return sum + price;
    }, 0);
  }, [selectedSeats, seats, basePrice, vipSurcharge, seatAvailability]);

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;
    
    try {
      // Hold seats before continuing
      const departureDate = currentRoute?.departureTime 
        ? new Date(currentRoute.departureTime).toISOString().split('T')[0] || ''
        : new Date().toISOString().split('T')[0] || '';

      // Map selected seat IDs back to seat numbers/labels as expected by backend
      const seatLabels = selectedSeats.map(id => {
        const seat = seatAvailability?.seats.find(s => s.id === id || s.seatNumber === id || s.seatLabel === id);
        return seat?.seatNumber || seat?.seatLabel || id;
      });

      console.log('[BookingPage] Requesting hold:', {
        routeId,
        departureDate,
        seats: seatLabels,
        ttlSeconds: 900
      });

      await hold({
        routeId,
        departureDate,
        seats: seatLabels,
        ttlSeconds: 900
      });
      // Note: Navigation happens in onHoldSuccess callback
    } catch (err) {
      // Error handled in onHoldError callback
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRefreshSeats = async () => {
    setShowConflictModal(false);

    const departureDate = currentRoute?.departureTime
      ? new Date(currentRoute.departureTime).toISOString().split('T')[0] || ''
      : new Date().toISOString().split('T')[0] || '';

    await refreshSeatAvailability(routeId, departureDate);
  };

  const handleExpiredReturn = async () => {
    setShowExpiredModal(false);
    await clearHold();
    dispatch(clearHoldInfo());
    router.push('/search');
  };

  const getSelectedSeatLabels = () => {
    if (!seatAvailability) return selectedSeats;
    return selectedSeats.map(id => {
      const seat = seatAvailability.seats.find(s => s.id === id || s.seatNumber === id || s.seatLabel === id);
      return seat?.seatLabel || id;
    });
  };

  if (isAuthLoading || !isAuthenticated || !user) {
    return <BookingLoading label="Đang kiểm tra đăng nhập..." />;
  }

  if (loading) {
    return <BookingLoading label="Đang tải sơ đồ ghế..." />;
  }

  if (!currentRoute) {
    return null;
  }

  const selectedSeatLabels = getSelectedSeatLabels();

  return (
    <div className="booking-container">
      <FadeIn>
      <h1 className="sr-only">
        Chọn ghế cho tuyến {currentRoute.from} đến {currentRoute.to}
      </h1>

      {error && (
        <div className="booking-inline-alert" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Thông báo</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="booking-layout">
        <div>
          <div className="booking-bus-panel">
            {seatAvailability?.busTemplate ? (
              <BusSeatLayout
                busTemplate={seatAvailability.busTemplate}
                seats={seatAvailability.seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            ) : (
              <div className="booking-bus">
                <div className="booking-bus-head">
                  <h2 className="booking-bus-name">{busTypeLabel}</h2>
                  <p className="booking-bus-meta">Giá từ {basePrice.toLocaleString('vi-VN')}đ</p>
                </div>
                <SeatMap
                  busType={busTypeDisplay === 'LIMOUSINE' ? 'Limousine' : 'Standard'}
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                />
              </div>
            )}

            <ul className="booking-legend" aria-label="Chú thích trạng thái ghế">
              <li>
                <span className="booking-legend-swatch" aria-hidden="true" />
                Còn trống
              </li>
              <li>
                <span className="booking-legend-swatch is-booked" aria-hidden="true" />
                Đã đặt
              </li>
              <li>
                <span className="booking-legend-swatch is-held" aria-hidden="true" />
                Đang giữ
              </li>
              <li>
                <span className="booking-legend-swatch is-selected" aria-hidden="true" />
                Đang chọn
              </li>
              {!isSleeper ? (
                <li>
                  <span className="booking-legend-swatch is-vip" aria-hidden="true" />
                  Ghế VIP
                </li>
              ) : null}
            </ul>

            {!isSleeper ? (
              <p className="booking-vip-note">
                <strong>Ghế VIP</strong>
                <span>Phụ phí {vipSurcharge.toLocaleString('vi-VN')}đ mỗi ghế so với giá cơ bản.</span>
              </p>
            ) : null}
          </div>
        </div>

        <section className="booking-summary" aria-labelledby="booking-summary-title">
          <div className="booking-panel-head">
            <h2 id="booking-summary-title" className="booking-summary-title">
              Chi tiết vé
            </h2>
            <p className="booking-panel-note">{selectedSeats.length}/5 ghế</p>
          </div>

          {expiresAt && !isExpired ? (
            <div className="booking-summary-block">
              <CountdownTimer
                expiresAt={expiresAt}
                onExpire={() => {
                  setShowExpiredModal(true);
                }}
              />
            </div>
          ) : null}

          <div className="booking-summary-block">
            <div className="booking-summary-row">
              <span>Ghế đã chọn</span>
              {selectedSeats.length === 0 ? <strong>Chưa chọn</strong> : null}
            </div>
            {selectedSeats.length > 0 ? (
              <div className="booking-summary-seats">
                {selectedSeatLabels.map((label) => (
                  <span key={label} className="booking-seat-chip">
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="booking-summary-note">Tối đa 5 ghế cho mỗi lượt đặt.</p>

            {isSleeper && seatAvailability?.summary ? (
              <div className="booking-summary-row">
                <span>Còn trống</span>
                <span>{seatAvailability.summary.availableSeats} giường</span>
              </div>
            ) : null}
          </div>

          <div className="booking-summary-block">
            <div className="booking-summary-row">
              <span>Giá vé cơ bản</span>
              <span>{basePrice.toLocaleString('vi-VN')}đ</span>
            </div>
            {selectedSeats.length > 0 ? (
              <div className="booking-summary-row">
                <span>Phụ phí / giảm giá</span>
                <span>
                  {((totalPrice - basePrice * selectedSeats.length) / selectedSeats.length).toLocaleString('vi-VN')}đ
                </span>
              </div>
            ) : null}
          </div>

          <div className="booking-summary-total">
            <div>
              <p className="booking-summary-total-label">Tổng cộng</p>
              <p className="booking-summary-amount">{totalPrice.toLocaleString('vi-VN')}đ</p>
              <p className="booking-summary-note">Đã bao gồm thuế và phí.</p>
            </div>
          </div>

          <div className="booking-summary-block">
            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedSeats.length === 0 || isHolding}
              aria-busy={isHolding}
              className="booking-action"
            >
              {isHolding ? 'Đang giữ chỗ…' : 'Tiếp tục đặt vé'}
            </button>
            <p className="booking-action-note">
              Ghế được giữ trong 15 phút sau khi bạn tiếp tục.
            </p>
          </div>
        </section>
      </div>

      </FadeIn>

      <SeatConflictModal
        isOpen={showConflictModal}
        conflictedSeats={conflictedSeats}
        onRefreshSeats={handleRefreshSeats}
        onClose={() => setShowConflictModal(false)}
      />

      <SeatHoldExpiredModal
        isOpen={showExpiredModal}
        onReturnToSeatSelection={handleExpiredReturn}
      />
    </div>
  );
}

function BookingLoading({ label }: { label: string }) {
  return (
    <div className="booking-loading" role="status" aria-live="polite">
      <div className="booking-skeleton-grid" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="booking-skeleton-seat" />
        ))}
      </div>
      <span>{label}</span>
    </div>
  );
}
