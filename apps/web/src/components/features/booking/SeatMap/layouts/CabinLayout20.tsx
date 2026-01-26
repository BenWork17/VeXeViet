'use client';

/**
 * Cabin Đôi Luxury 20 Chỗ - Luxury Cabin Layout
 * 2 tầng, mỗi tầng 5 hàng × 2 cabin = 10 cabin/tầng = 20 cabin tổng
 * Mỗi cabin có rèm che, đèn đọc sách, ổ cắm điện
 * Layout columns: A, _, B
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Bed, Sparkles, Lamp, Plug } from 'lucide-react';
import type { LayoutProps } from './types';
import { Aisle, FloorLabel } from './SeatButton';
import type { SeatDetail } from '@vexeviet/types';

// Special cabin seat button for luxury feel
function CabinButton({
  seat,
  isSelected,
  onSelect,
}: {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}) {
  if (!seat) {
    return <div className="w-20 h-28" />;
  }

  const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  const statusClasses = {
    available: 'bg-gradient-to-b from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100 cursor-pointer',
    booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60 grayscale',
    held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
    selected: 'bg-gradient-to-b from-purple-600 to-indigo-600 border-purple-700 text-white shadow-xl shadow-purple-300 scale-105 z-10',
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
        'relative w-20 h-28 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1',
        statusClasses[status],
        isSelected && 'ring-2 ring-purple-300 ring-offset-2'
      )}
      aria-label={`Cabin ${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
    >
      {/* Cabin icons */}
      {!isBooked && (
        <div className="absolute top-1 right-1 flex gap-0.5">
          <Lamp className={cn('w-3 h-3', isSelected ? 'text-purple-200' : 'text-purple-400')} />
          <Plug className={cn('w-3 h-3', isSelected ? 'text-purple-200' : 'text-purple-400')} />
        </div>
      )}
      
      <Bed className={cn('w-6 h-6', isBooked && 'opacity-40')} />
      <span className="text-xs font-bold">{seat.seatLabel}</span>
      <span className="text-[9px] opacity-80">
        {(seat.finalPrice / 1000).toFixed(0)}k
      </span>
      
      {/* Luxury badge */}
      {!isBooked && !isSelected && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      )}
    </button>
  );
}

export function CabinLayout20({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const floors = busTemplate.floors || 2;
  const rowsPerFloor = busTemplate.rowsPerFloor || 5;
  const columns = busTemplate.columns || ['A', '_', 'B'];

  const getSeatAtPosition = (floor: number, row: number, column: string) => {
    return seats.find(
      (s) => s.floor === floor && s.row === row && s.column === column
    );
  };

  const getFloorSeats = (floorNumber: number) => {
    return seats.filter((s) => s.floor === floorNumber);
  };

  const renderFloor = (floorNumber: number) => {
    const floorSeats = getFloorSeats(floorNumber);
    const floorLabel = floorNumber === 1 ? 'Tầng dưới' : 'Tầng trên';
    const avgPrice = floorSeats.length
      ? Math.round(
          floorSeats.reduce((sum, s) => sum + s.finalPrice, 0) / floorSeats.length
        )
      : 0;

    return (
      <div key={floorNumber} className="mb-6">
        <FloorLabel
          floorNumber={floorNumber}
          label={floorLabel}
          avgPrice={avgPrice}
        />

        <div className="bg-gradient-to-b from-slate-100 to-purple-50/30 rounded-2xl p-5 border-2 border-purple-200/50">
          {/* Driver area - only on floor 1 */}
          {floorNumber === 1 && (
            <div className="flex justify-between items-center mb-5 px-2">
              <div className="w-10 h-10 rounded-full border-4 border-slate-400 flex items-center justify-center relative">
                <div className="w-6 h-0.5 bg-slate-400 rotate-45 absolute" />
                <div className="w-6 h-0.5 bg-slate-400 -rotate-45 absolute" />
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-[10px] font-bold text-white uppercase tracking-tight">
                  Luxury
                </span>
              </div>
            </div>
          )}

          {/* Cabin rows */}
          <div className="space-y-4">
            {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex items-center justify-center gap-2">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return (
                      <div key={`aisle-${colIndex}`} className="w-12 flex items-center justify-center">
                        <div className="h-24 w-2 bg-purple-100 rounded-full" />
                      </div>
                    );
                  }

                  const seat = getSeatAtPosition(floorNumber, row, col);
                  const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                  return (
                    <div key={`${floorNumber}-${row}-${col}`}>
                      <CabinButton
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
          <div className="mt-5 h-1.5 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200 rounded-full opacity-50" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-100 rounded-xl border border-purple-200 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} cabin riêng tư · {floors} tầng
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Lamp className="w-3 h-3" /> Đèn đọc
          </span>
          <span className="flex items-center gap-1">
            <Plug className="w-3 h-3" /> Ổ cắm
          </span>
          <span>Rèm che</span>
        </div>
      </div>

      {/* Floors */}
      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-gradient-to-b from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg" />
          <span className="text-slate-600">Còn trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-slate-200 border-2 border-slate-300 rounded-lg opacity-60" />
          <span className="text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 border-2 border-purple-700 rounded-lg" />
          <span className="text-slate-600">Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
