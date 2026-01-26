'use client';

/**
 * Limousine 22 Chỗ VIP - Premium Limousine Layout
 * 1 tầng, 11 hàng × 2 ghế = 22 ghế massage cao cấp
 * Khoảng cách ghế rộng, có màn hình riêng, wifi, nước uống
 * Layout columns: A, _, B
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Armchair, Tv, Wifi, Coffee, Crown } from 'lucide-react';
import type { LayoutProps } from './types';
import type { SeatDetail } from '@vexeviet/types';

// Premium limousine seat with massage chair styling
function LimousineSeat({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}) {
  if (!seat) {
    return <div className="w-16 h-20" />;
  }

  const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  const statusClasses = {
    available: 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 cursor-pointer',
    booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60 grayscale',
    held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
    selected: 'bg-gradient-to-b from-emerald-600 to-teal-600 border-emerald-700 text-white shadow-xl shadow-emerald-300 scale-105 z-10',
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
        'relative w-16 h-20 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1',
        statusClasses[status],
        isSelected && 'ring-2 ring-emerald-300 ring-offset-1'
      )}
      aria-label={`Ghế ${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
    >
      {/* TV screen indicator */}
      {!isBooked && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className={cn(
            'w-8 h-1.5 rounded-t-sm',
            isSelected ? 'bg-emerald-400' : 'bg-slate-300'
          )} />
        </div>
      )}
      
      <Armchair className={cn('w-6 h-6', isBooked && 'opacity-40')} />
      <span className="text-xs font-bold">{seat.seatLabel}</span>
      <span className="text-[8px] opacity-80">
        {(seat.finalPrice / 1000).toFixed(0)}k
      </span>
    </button>
  );
}

export function LimousineLayout22({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const rowsPerFloor = busTemplate.rowsPerFloor || 11;
  const columns = busTemplate.columns || ['A', '_', 'B'];

  const getSeatAtPosition = (row: number, column: string) => {
    return seats.find(
      (s) => s.row === row && s.column === column && (s.floor === 1 || !s.floor)
    );
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-100 rounded-xl border border-emerald-200 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} ghế massage cao cấp
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Tv className="w-3 h-3" /> Màn hình
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Wifi
          </span>
          <span className="flex items-center gap-1">
            <Coffee className="w-3 h-3" /> Nước uống
          </span>
        </div>
      </div>

      {/* Bus layout */}
      <div className="bg-gradient-to-b from-slate-100 to-emerald-50/30 rounded-2xl p-5 border-2 border-emerald-200/50">
        {/* Driver area */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="w-10 h-10 rounded-full border-4 border-slate-400 flex items-center justify-center relative">
            <div className="w-6 h-0.5 bg-slate-400 rotate-45 absolute" />
            <div className="w-6 h-0.5 bg-slate-400 -rotate-45 absolute" />
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-[10px] font-bold text-white uppercase tracking-tight">
              VIP Class
            </span>
          </div>
        </div>

        {/* Seat rows - wide spacing for massage chairs */}
        <div className="space-y-5">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              {columns.map((col, colIndex) => {
                if (col === '_') {
                  return (
                    <div key={`aisle-${colIndex}`} className="w-16 flex items-center justify-center">
                      <div className="h-16 w-2 bg-emerald-100 rounded-full" />
                    </div>
                  );
                }

                const seat = getSeatAtPosition(row, col);
                const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                return (
                  <div key={`1-${row}-${col}`}>
                    <LimousineSeat
                      seat={seat}
                      isSelected={isSelected}
                      onSelect={onSeatSelect}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom decor */}
        <div className="mt-5 h-1.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 rounded-full opacity-50" />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg" />
          <span className="text-slate-600">Còn trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-slate-200 border-2 border-slate-300 rounded-lg opacity-60" />
          <span className="text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-gradient-to-b from-emerald-600 to-teal-600 border-2 border-emerald-700 rounded-lg" />
          <span className="text-slate-600">Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
