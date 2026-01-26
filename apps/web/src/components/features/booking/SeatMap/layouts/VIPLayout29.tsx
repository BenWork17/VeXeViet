'use client';

/**
 * Ghế Ngồi VIP 29 Chỗ - VIP Seating Layout
 * 1 tầng, 8 hàng, layout A,B,_,C,D (4 ghế mỗi hàng, trừ hàng cuối 5 ghế)
 * Ghế rộng, có thể ngả. Phù hợp cho các chuyến đi ngắn và trung bình.
 * Layout columns: A, B, _, C, D
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Armchair, Star, Snowflake, Wifi } from 'lucide-react';
import type { LayoutProps } from './types';
import type { SeatDetail } from '@vexeviet/types';

// VIP seat with wider styling
function VIPSeat({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}) {
  if (!seat) {
    return <div className="w-12 h-14" />;
  }

  const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;
  const isVIP = seat.seatType === 'VIP';

  const statusClasses = {
    available: isVIP 
      ? 'bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-300 text-amber-700 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100 cursor-pointer'
      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer',
    booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60 grayscale',
    held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
    selected: 'bg-gradient-to-b from-blue-600 to-indigo-600 border-blue-700 text-white shadow-xl shadow-blue-300 scale-105 z-10',
  };

  let status: keyof typeof statusClasses = 'available';
  if (isSelected) status = 'selected';
  else if (isBooked) status = 'booked';
  else if (isHeld) status = 'held';

  return (
    <button
      onClick={() => isAvailable && onSelect(seat.id)}
      disabled={!isAvailable && !isSelected}
      className={cn(
        'relative w-12 h-14 rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-0.5',
        statusClasses[status],
        isSelected && 'ring-2 ring-blue-300 ring-offset-1'
      )}
      aria-label={`Ghế ${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
    >
      {/* VIP indicator */}
      {isVIP && !isBooked && !isSelected && (
        <div className="absolute -top-1 -right-1">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
        </div>
      )}
      
      <Armchair className={cn('w-5 h-5', isBooked && 'opacity-40')} />
      <span className="text-[9px] font-bold">{seat.seatLabel}</span>
      <span className="text-[7px] opacity-80">
        {(seat.finalPrice / 1000).toFixed(0)}k
      </span>
    </button>
  );
}

export function VIPLayout29({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const rowsPerFloor = busTemplate.rowsPerFloor || 8;
  const columns = busTemplate.columns || ['A', 'B', '_', 'C', 'D'];

  const getSeatAtPosition = (row: number, column: string) => {
    return seats.find(
      (s) => s.row === row && s.column === column && (s.floor === 1 || !s.floor)
    );
  };

  // First 2 rows are VIP
  const isVIPRow = (row: number) => row <= 2;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 rounded-xl border border-amber-200 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} ghế · Ghế rộng, có thể ngả
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Snowflake className="w-3 h-3" /> Điều hòa
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Wifi
          </span>
        </div>
      </div>

      {/* Bus layout */}
      <div className="bg-gradient-to-b from-slate-100 to-amber-50/30 rounded-2xl p-4 border-2 border-amber-200/50">
        {/* Driver area */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="w-9 h-9 rounded-full border-4 border-slate-400 flex items-center justify-center relative">
            <div className="w-5 h-0.5 bg-slate-400 rotate-45 absolute" />
            <div className="w-5 h-0.5 bg-slate-400 -rotate-45 absolute" />
          </div>
          <span className="px-2 py-1 bg-slate-300 rounded-full text-[9px] font-bold text-slate-600 uppercase tracking-tight">
            Lối vào
          </span>
        </div>

        {/* VIP Section label */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex-1 h-px bg-amber-300" />
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
            <Star className="w-3 h-3 fill-amber-500" /> VIP
          </span>
          <div className="flex-1 h-px bg-amber-300" />
        </div>

        {/* Seat rows */}
        <div className="space-y-2">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <React.Fragment key={row}>
              {/* Separator after VIP rows */}
              {row === 3 && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="flex-1 h-px bg-slate-300" />
                  <span className="text-[10px] text-slate-400 uppercase">Thường</span>
                  <div className="flex-1 h-px bg-slate-300" />
                </div>
              )}
              
              <div className="flex items-center justify-center gap-1.5">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return (
                      <div key={`aisle-${colIndex}`} className="w-8 flex items-center justify-center">
                        <div className="h-12 w-1.5 bg-slate-200 rounded-full" />
                      </div>
                    );
                  }

                  const seat = getSeatAtPosition(row, col);
                  const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                  return (
                    <div key={`1-${row}-${col}`}>
                      <VIPSeat
                        seat={seat}
                        isSelected={isSelected}
                        onSelect={onSeatSelect}
                      />
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Back row - might have extra seat */}
        {/* Note: Backend should handle the last row having 5 seats */}

        {/* Bottom decor */}
        <div className="mt-4 h-1 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 rounded-full opacity-50" />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-gradient-to-b from-amber-50 to-yellow-50 border-2 border-amber-300 rounded relative">
            <Star className="w-2 h-2 text-amber-500 fill-amber-500 absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-slate-600">VIP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-white border-2 border-slate-200 rounded" />
          <span className="text-slate-600">Thường</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-slate-200 border-2 border-slate-300 rounded opacity-60" />
          <span className="text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 border-2 border-blue-700 rounded" />
          <span className="text-slate-600">Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
