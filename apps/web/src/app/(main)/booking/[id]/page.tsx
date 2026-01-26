'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SeatMap, SeatData } from '@/components/features/booking/SeatMap/SeatMap';
import { BusSeatLayout } from '@/components/features/booking/SeatMap/layouts';
import { CountdownTimer } from '@/components/features/booking/CountdownTimer';
import { SeatConflictModal } from '@/components/features/booking/SeatConflictModal';
import { SeatHoldExpiredModal } from '@/components/features/booking/SeatHoldExpiredModal';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { useSeatHold } from '@/lib/hooks/useSeatHold';
import { setSeats, setTotalPrice, setStep, clearHoldInfo } from '@/store/slices/bookingSlice';
import { getSeatAvailability } from '@/lib/api/bookings';
import type { SeatAvailability, SeatDetail, BusTemplate } from '@vexeviet/types';
import { ArrowRight, Bus, Star, AlertCircle } from 'lucide-react';

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentRoute } = useAppSelector((state) => state.booking);
  
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
  const basePrice = currentRoute?.price || 250000;
  const vipSurcharge = 50000;

  // Check if this is a sleeper bus (case-insensitive)
  const isSleeper = busTypeDisplay === 'SLEEPER';

  useEffect(() => {
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
          } else if (detectedBusType === 'VIP') {
            // VIP bus fallback
            availability.busTemplate = {
              id: 'auto-vip',
              name: 'Ghế Ngồi VIP 29 Chỗ',
              busType: 'VIP',
              totalSeats: seatCount,
              floors: 1,
              rowsPerFloor: 8,
              columns: ['A', 'B', '_', 'C', 'D'],
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
          const column = s.column || (colMatch ? colMatch[0] : ['A', 'B', 'C', 'D'][index % 4]);

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
  }, [routeId, currentRoute, router]);

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
    // Use seatAvailability for all bus types when available
    if (seatAvailability) {
      return selectedSeats.reduce((total, seatId) => {
        const seat = seatAvailability.seats.find(s => s.id === seatId);
        return total + (seat?.finalPrice || basePrice);
      }, 0);
    }
    // Fallback for legacy SeatMap
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + basePrice + (seat?.type === 'vip' ? vipSurcharge : 0);
    }, 0);
  }, [selectedSeats, seats, basePrice, seatAvailability]);

  const handleContinue = useCallback(async () => {
    if (selectedSeats.length === 0) {
      setError('Vui lòng chọn ít nhất một ghế');
      return;
    }

    setError(null);

    try {
      const departureDate = currentRoute?.departureTime 
        ? new Date(currentRoute.departureTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Get seat labels (not IDs) for the API
      const seatLabels = selectedSeats.map(seatId => {
        if (seatAvailability) {
          const seat = seatAvailability.seats.find(s => s.id === seatId);
          return seat?.seatLabel || seat?.seatNumber || seatId;
        }
        return seatId;
      });

      console.log('[BookingPage] Calling hold API with:', {
        routeId,
        departureDate,
        seats: seatLabels,
        ttlSeconds: 900
      });

      // Call hold API with seat labels (not internal IDs)
      await hold({
        routeId: routeId,
        departureDate: departureDate,
        seats: seatLabels,
        ttlSeconds: 900, // 15 minutes
      });
    } catch (err: any) {
      // Error is handled in onHoldError callback
      console.error('[BookingPage] Hold error:', err);
      console.error('[BookingPage] Error response:', err.response?.data);
      
      // Show detailed error to user
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || 'Không thể giữ chỗ. Vui lòng thử lại.';
      setError(errorMessage);
    }
  }, [selectedSeats, hold, routeId, currentRoute]);

  // Handle refresh seats after conflict
  const handleRefreshSeats = useCallback(async () => {
    setShowConflictModal(false);
    setLoading(true);
    
    try {
      const departureDate = currentRoute?.departureTime 
        ? new Date(currentRoute.departureTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
      // Refresh seat availability
      await refreshSeatAvailability(routeId, departureDate);
      
      // Refetch seats from API
      const availability = await getSeatAvailability(routeId, departureDate);
      setSeatAvailability(availability);
      
      // Clear selected seats that are now unavailable
      setSelectedSeats(prev => prev.filter(seatId => {
        const seat = availability.seats.find(s => s.id === seatId);
        return seat?.status === 'AVAILABLE';
      }));
    } catch (err) {
      setError('Không thể cập nhật sơ đồ ghế');
    } finally {
      setLoading(false);
    }
  }, [routeId, currentRoute, refreshSeatAvailability]);

  // Handle expired hold - go back to seat selection
  const handleExpiredReturn = useCallback(() => {
    setShowExpiredModal(false);
    clearHold();
    dispatch(clearHoldInfo());
    setSelectedSeats([]);
    window.location.reload(); // Reload to refresh seat availability
  }, [clearHold, dispatch]);

  const handleBack = useCallback(() => {
    // If user has a hold, release it before going back
    if (holdId) {
      release().catch(() => {}); // Try to release, ignore errors
    }
    router.back();
  }, [holdId, release, router]);

  // Get selected seat labels for display
  const getSelectedSeatLabels = (): string[] => {
    if (isSleeper && seatAvailability) {
      return selectedSeats.map(seatId => {
        const seat = seatAvailability.seats.find(s => s.id === seatId);
        return seat?.seatLabel || seat?.seatNumber || seatId;
      });
    }
    // For standard buses, the seat ID is the label
    return selectedSeats;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 mb-1">Đang tải sơ đồ ghế</p>
            <p className="text-slate-500">Vui lòng đợi trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl text-slate-900">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-semibold">Quay lại tìm kiếm</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
              {busTypeDisplay}
            </span>
            <h1 className="text-3xl font-black text-slate-900">Chọn chỗ ngồi</h1>
          </div>
          <p className="text-slate-500 flex items-center gap-2">
            <span className="font-bold text-slate-700">{currentRoute.from}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-bold text-slate-700">{currentRoute.to}</span>
            <span className="mx-1">•</span>
            <span>{new Date(currentRoute.departureTime).toLocaleString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg flex items-start gap-3">
          <div className="shrink-0 text-amber-500 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Thông báo</p>
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            {seatAvailability?.busTemplate ? (
              <BusSeatLayout 
                busTemplate={seatAvailability.busTemplate}
                seats={seatAvailability.seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loại xe</p>
                      <p className="font-bold text-slate-900">{busTypeDisplay}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Giá từ</p>
                    <p className="font-bold text-blue-600">{basePrice.toLocaleString()}đ</p>
                  </div>
                </div>

                <SeatMap 
                  busType={busTypeDisplay === 'LIMOUSINE' ? 'Limousine' : 'Standard'}
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Legend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              Chú thích
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <LegendItem color="bg-white border-slate-200" label="Còn trống" />
              <LegendItem color="bg-slate-100 border-slate-200" label="Đã đặt" />
              <LegendItem color="bg-blue-600 border-blue-700 shadow-blue-200 shadow-sm" label="Đang chọn" />
              {isSleeper && (
                <LegendItem color="bg-orange-100 border-orange-200" label="Đang giữ" />
              )}
            </div>
            {!isSleeper && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="w-8 h-8 bg-white border-2 border-amber-400 rounded-lg flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Hạng thương gia</p>
                    <p className="text-xs text-amber-700">Ghế VIP (+{vipSurcharge.toLocaleString()}đ)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Card */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl sticky top-4">
            <h3 className="text-white font-bold text-xl mb-6">Chi tiết vé</h3>
            
            <div className="space-y-6">
              {/* Countdown Timer (if holding) */}
              {expiresAt && !isExpired && (
                <div className="mb-4">
                  <CountdownTimer 
                    expiresAt={expiresAt} 
                    onExpire={() => {
                      setShowExpiredModal(true);
                    }}
                    className="!bg-orange-900/50 !text-orange-300"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm">Ghế đã chọn</span>
                <div className="text-right">
                  <p className="text-white font-black text-lg">
                    {selectedSeats.length > 0 ? getSelectedSeatLabels().join(', ') : 'Chưa chọn'}
                  </p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-tighter">
                    {selectedSeats.length} / 5 ghế tối đa
                  </p>
                </div>
              </div>

              {isSleeper && seatAvailability?.summary && (
                <div className="flex justify-between items-center py-4 border-y border-slate-800">
                  <span className="text-slate-400 text-sm">Trạng thái xe</span>
                  <span className="text-blue-400 font-bold text-sm">
                    Trống {seatAvailability.summary.availableSeats} giường
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <span>Giá vé cơ bản</span>
                  <span>{basePrice.toLocaleString()}đ</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between items-center text-blue-400 text-sm">
                    <span>Phụ phí / Giảm giá</span>
                    <span>{((totalPrice - (basePrice * selectedSeats.length)) / selectedSeats.length).toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-white text-sm font-bold">TỔNG CỘNG</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-orange-500 leading-none">
                      {totalPrice.toLocaleString()}đ
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1 italic">Đã bao gồm thuế & phí</p>
                  </div>
                </div>

                <button 
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0 || isHolding}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95",
                    selectedSeats.length > 0 && !isHolding
                      ? "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-900/20 hover:brightness-110" 
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  )}
                >
                  {isHolding ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang giữ chỗ...
                    </span>
                  ) : (
                    'TIẾP TỤC ĐẶT VÉ'
                  )}
                </button>
                
                <p className="text-xs text-slate-500 text-center mt-3">
                  Ghế sẽ được giữ trong 15 phút sau khi nhấn "Tiếp tục"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
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

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-5 h-5 rounded border-2", color)} />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}
