'use client';

/**
 * Limousine 34 Chỗ - Premium Limousine Layout
 * 1 tầng, 17 hàng × 2 ghế = 34 ghế da cao cấp
 * Ghế có thể ngả 160 độ, Wifi, USB sạc, nước uống miễn phí
 * Layout columns: A, _, B
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Armchair, Usb, Wifi, Droplets, RotateCcw } from 'lucide-react';
import type { LayoutProps } from './types';
import type { SeatDetail } from '@vexeviet/types';

// Reclinable seat styling
function ReclinableSeat({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}) {
  if (!seat) {
    return <div className="w-14 h-18" />;
  }

  const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  const statusClasses = {
    available: 'bg-gradient-to-b from-sky-50 to-blue-50 border-sky-300 text-sky-700 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-100 cursor-pointer',
    booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60 grayscale',
    held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
    selected: 'bg-gradient-to-b from-sky-600 to-blue-600 border-sky-700 text-white shadow-xl shadow-sky-300 scale-105 z-10',
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
        'relative w-14 h-[72px] rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-0.5',
        statusClasses[status],
        isSelected && 'ring-2 ring-sky-300 ring-offset-1'
      )}
      aria-label={`Ghế ${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
    >
      {/* Recline indicator */}
      {!isBooked && (
        <div className="absolute top-1 right-1">
          <RotateCcw className={cn(
            'w-2.5 h-2.5',
            isSelected ? 'text-sky-200' : 'text-sky-400'
          )} />
        </div>
      )}
      
      <Armchair className={cn('w-5 h-5', isBooked && 'opacity-40')} />
      <span className="text-[10px] font-bold">{seat.seatLabel}</span>
      <span className="text-[7px] opacity-80">
        {(seat.finalPrice / 1000).toFixed(0)}k
      </span>
    </button>
  );
}

export function LimousineLayout34({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const rowsPerFloor = busTemplate.rowsPerFloor || 17;
  const columns = busTemplate.columns || ['A', '_', 'B'];

  const getSeatAtPosition = (row: number, column: string) => {
    return seats.find(
      (s) => s.row === row && s.column === column && (s.floor === 1 || !s.floor)
    );
  };

  // Split into sections for better visual
  const sections = [
    { name: 'Khu vực trước', rows: Math.min(6, rowsPerFloor) },
    { name: 'Khu vực giữa', rows: Math.min(6, Math.max(0, rowsPerFloor - 6)) },
    { name: 'Khu vực sau', rows: Math.max(0, rowsPerFloor - 12) },
  ].filter(s => s.rows > 0);

  let rowOffset = 0;

  return (
    <div className="max-w-xs mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-sky-100 via-blue-100 to-sky-100 rounded-xl border border-sky-200 relative overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} ghế da cao cấp · Ngả 160°
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> Wifi
          </span>
          <span className="flex items-center gap-1">
            <Usb className="w-3 h-3" /> USB
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Nước
          </span>
        </div>
      </div>

      {/* Bus layout */}
      <div className="bg-gradient-to-b from-slate-100 to-sky-50/30 rounded-2xl p-4 border-2 border-sky-200/50">
        {/* Driver area */}
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="w-9 h-9 rounded-full border-4 border-slate-400 flex items-center justify-center relative">
            <div className="w-5 h-0.5 bg-slate-400 rotate-45 absolute" />
            <div className="w-5 h-0.5 bg-slate-400 -rotate-45 absolute" />
          </div>
          <span className="px-2 py-1 bg-sky-200 rounded-full text-[9px] font-bold text-sky-700 uppercase tracking-tight">
            Lối vào
          </span>
        </div>

        {/* Seat rows - compact for 34 seats */}
        <div className="space-y-2">
          {sections.map((section, sectionIndex) => {
            const startRow = rowOffset + 1;
            rowOffset += section.rows;
            
            return (
              <div key={sectionIndex}>
                {sectionIndex > 0 && (
                  <div className="my-3 border-t border-dashed border-sky-200" />
                )}
                {Array.from({ length: section.rows }, (_, i) => {
                  const row = startRow + i;
                  return (
                    <div key={row} className="flex items-center justify-center gap-2">
                      {columns.map((col, colIndex) => {
                        if (col === '_') {
                          return (
                            <div key={`aisle-${colIndex}`} className="w-10 flex items-center justify-center">
                              <div className="h-14 w-1.5 bg-sky-100 rounded-full" />
                            </div>
                          );
                        }

                        const seat = getSeatAtPosition(row, col);
                        const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                        return (
                          <div key={`1-${row}-${col}`}>
                            <ReclinableSeat
                              seat={seat}
                              isSelected={isSelected}
                              onSelect={onSeatSelect}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom decor */}
        <div className="mt-4 h-1 bg-gradient-to-r from-sky-200 via-blue-200 to-sky-200 rounded-full opacity-50" />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-7 bg-gradient-to-b from-sky-50 to-blue-50 border-2 border-sky-300 rounded" />
          <span className="text-slate-600">Trống</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-7 bg-slate-200 border-2 border-slate-300 rounded opacity-60" />
          <span className="text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-7 bg-gradient-to-b from-sky-600 to-blue-600 border-2 border-sky-700 rounded" />
          <span className="text-slate-600">Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
