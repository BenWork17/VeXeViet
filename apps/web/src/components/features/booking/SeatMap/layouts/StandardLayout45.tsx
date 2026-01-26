'use client';

/**
 * Xe Ghế Ngồi 45 Chỗ - Standard Bus Layout
 * 1 tầng, 12 hàng, layout A,B,_,C,D (4 ghế mỗi hàng)
 * Xe ghế ngồi thường, giá cả phải chăng. Có điều hòa, wifi.
 * Layout columns: A, B, _, C, D
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Armchair, Snowflake, Wifi } from 'lucide-react';
import type { LayoutProps } from './types';
import type { SeatDetail } from '@vexeviet/types';

// Standard seat - compact and simple
function StandardSeat({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}) {
  if (!seat) {
    return <div className="w-11 h-13" />;
  }

  const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  const statusClasses = {
    available: 'bg-white border-slate-200 text-slate-700 hover:border-green-400 hover:bg-green-50 cursor-pointer',
    booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60',
    held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
    selected: 'bg-green-600 border-green-700 text-white shadow-lg shadow-green-200 scale-105 z-10',
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
        'relative w-11 h-[52px] rounded-md border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5',
        statusClasses[status],
        isSelected && 'ring-2 ring-green-300 ring-offset-1'
      )}
      aria-label={`Ghế ${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
    >
      <Armchair className={cn('w-4 h-4', isBooked && 'opacity-40')} />
      <span className="text-[8px] font-bold">{seat.seatLabel}</span>
      <span className="text-[6px] opacity-80">
        {(seat.finalPrice / 1000).toFixed(0)}k
      </span>
    </button>
  );
}

export function StandardLayout45({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const rowsPerFloor = busTemplate.rowsPerFloor || 12;
  const columns = busTemplate.columns || ['A', 'B', '_', 'C', 'D'];

  const getSeatAtPosition = (row: number, column: string) => {
    return seats.find(
      (s) => s.row === row && s.column === column && (s.floor === 1 || !s.floor)
    );
  };

  // Calculate seat count for display
  const totalAvailable = seats.filter(s => s.status === 'AVAILABLE').length;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 rounded-xl border border-green-200 relative overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} ghế · Còn {totalAvailable} chỗ trống
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
      <div className="bg-slate-100 rounded-2xl p-4 border-2 border-slate-300">
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

        {/* Row labels */}
        <div className="flex justify-between px-3 mb-2">
          <span className="text-[10px] text-slate-400 font-medium">Cửa sổ</span>
          <span className="text-[10px] text-slate-400 font-medium">Lối đi</span>
          <span className="text-[10px] text-slate-400 font-medium">Cửa sổ</span>
        </div>

        {/* Seat rows */}
        <div className="space-y-1.5">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <div key={row} className="flex items-center justify-center gap-1">
              {/* Row number */}
              <span className="w-4 text-[10px] text-slate-400 text-right pr-1">{row}</span>
              
              {columns.map((col, colIndex) => {
                if (col === '_') {
                  return (
                    <div key={`aisle-${colIndex}`} className="w-6 flex items-center justify-center">
                      <div className="h-10 w-1 bg-slate-200 rounded-full" />
                    </div>
                  );
                }

                const seat = getSeatAtPosition(row, col);
                const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                return (
                  <div key={`1-${row}-${col}`}>
                    <StandardSeat
                      seat={seat}
                      isSelected={isSelected}
                      onSelect={onSeatSelect}
                    />
                  </div>
                );
              })}
              
              {/* Row number (right side) */}
              <span className="w-4 text-[10px] text-slate-400 text-left pl-1">{row}</span>
            </div>
          ))}
        </div>

        {/* Back seats - last row might have 5 seats */}
        {/* The backend should handle the extra seat in the last row */}

        {/* Bottom decor */}
        <div className="mt-4 h-1 bg-slate-300 rounded-full opacity-50" />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-white border-2 border-slate-200 rounded" />
          <span className="text-slate-600">Còn trống</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-slate-200 border-2 border-slate-300 rounded opacity-60" />
          <span className="text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-6 bg-green-600 border-2 border-green-700 rounded" />
          <span className="text-slate-600">Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
