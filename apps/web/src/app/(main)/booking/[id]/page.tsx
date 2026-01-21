'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SeatMap, SeatData } from '@/components/features/booking/SeatMap/SeatMap';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setSeats, setTotalPrice, setStep } from '@/store/slices/bookingSlice';
import { getSeatAvailability } from '@/lib/api/bookings';

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentRoute } = useAppSelector((state) => state.booking);
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeatsData] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const routeId = params.id;
  const busType = (currentRoute?.busType === 'Limousine' ? 'Limousine' : 'Standard') as 'Standard' | 'Limousine';
  const basePrice = currentRoute?.price || 250000;
  const vipSurcharge = 50000;

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
          ? new Date(currentRoute.departureTime).toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        console.log('[BookingPage] Fetching seats for routeId:', routeId, 'date:', departureDate);
        
        const availability = await getSeatAvailability(routeId, departureDate!);
        
        console.log('[BookingPage] API Response:', availability);
        
        if (availability && availability.seats && availability.seats.length > 0) {
          const mappedSeats: SeatData[] = availability.seats.map((seat: { 
            seatNumber: string; 
            status: string; 
            seatType?: string;
            seatLabel?: string;
          }) => ({
            id: seat.seatNumber || seat.seatLabel,
            status: seat.status === 'AVAILABLE' ? 'available' : 'occupied',
            type: seat.seatType === 'VIP' ? 'vip' : 'standard',
          }));
          console.log('[BookingPage] Using API seats:', mappedSeats.length);
          setSeatsData(mappedSeats);
        } else {
          console.log('[BookingPage] No seats from API, using fallback');
          const fallbackSeats = generateFallbackSeats();
          setSeatsData(fallbackSeats);
        }
      } catch (err) {
        console.error('[BookingPage] Failed to fetch seat availability:', err);
        setError('Không thể tải sơ đồ ghế từ server. Đang hiển thị dữ liệu mẫu.');
        const fallbackSeats = generateFallbackSeats();
        setSeatsData(fallbackSeats);
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
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + basePrice + (seat?.type === 'vip' ? vipSurcharge : 0);
    }, 0);
  }, [selectedSeats, seats, basePrice]);

  const handleContinue = () => {
    dispatch(setSeats(selectedSeats));
    dispatch(setTotalPrice(totalPrice));
    dispatch(setStep('payment'));
    router.push('/booking/payment');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-600">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  if (!currentRoute) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Không tìm thấy thông tin chuyến xe</p>
          <button 
            onClick={() => router.push('/search')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl text-slate-900">
      <h1 className="text-2xl font-bold mb-2 text-slate-900">Chọn ghế ngồi</h1>
      <p className="text-slate-600 mb-6">
        {currentRoute.from} → {currentRoute.to} • {new Date(currentRoute.departureTime).toLocaleString('vi-VN')}
      </p>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-900">
        <div className="md:col-span-2 flex justify-center text-slate-900">
          <SeatMap 
            busType={busType}
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </div>

        <div className="flex flex-col gap-6 text-slate-900">
          {/* Legend */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-slate-900">
            <h3 className="font-semibold mb-3 text-slate-900">Chú thích</h3>
            <div className="space-y-2 text-slate-900">
              <LegendItem color="text-green-600" label="Còn trống" />
              <LegendItem color="text-slate-400" label="Đã đặt" />
              <LegendItem color="text-blue-600" label="Đang chọn" />
              <div className="flex items-center gap-2 pt-2 border-t mt-2 text-slate-900">
                <div className="w-5 h-5 bg-amber-50 border-2 border-amber-400 rounded-sm" />
                <span className="text-sm text-slate-700">Ghế VIP (+{vipSurcharge.toLocaleString()} VND)</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm sticky top-4 text-slate-900">
            <h3 className="font-semibold mb-3 text-slate-900">Thông tin đặt vé</h3>
            <div className="space-y-4 text-slate-900">
              <div className="flex justify-between text-sm text-slate-900">
                <span className="text-slate-600">Ghế đã chọn:</span>
                <span className="font-bold text-slate-900">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-slate-900">
                <span className="text-slate-600">Tổng tiền:</span>
                <span className="text-xl font-black text-blue-700">
                  {totalPrice.toLocaleString()} VND
                </span>
              </div>
              <button 
                onClick={handleContinue}
                className={cn(
                  "w-full py-3 rounded-lg font-bold transition-all",
                  selectedSeats.length > 0 
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
                disabled={selectedSeats.length === 0}
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-5 h-5 rounded border-2", color)} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
