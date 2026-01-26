'use client';

/**
 * Xe Giường Nằm 34 Chỗ VIP - Sleeper Bus VIP Layout
 * 2 tầng, tầng dưới 18 giường, tầng trên 16 giường
 * 6 hàng mỗi tầng, giường rộng hơn 20%
 * Layout columns: A, _, B, _, C
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { LayoutProps } from './types';
import { SeatButton, Aisle, FloorLabel, BusFrame } from './SeatButton';

export function SleeperLayout34({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const floors = busTemplate.floors || 2;
  const rowsPerFloor = busTemplate.rowsPerFloor || 6;
  const columns = busTemplate.columns || ['A', '_', 'B', '_', 'C'];

  const getSeatAtPosition = (floor: number, row: number, column: string) => {
    return seats.find(
      (s) => s.floor === floor && s.row === row && s.column === column
    );
  };

  const getFloorSeats = (floorNumber: number) => {
    return seats.filter((s) => s.floor === floorNumber);
  };

  // Tầng trên có ít ghế hơn (16 vs 18) - hàng cuối có thể thiếu ghế
  const getRowsForFloor = (floorNumber: number) => {
    const floorSeats = getFloorSeats(floorNumber);
    const maxRow = floorSeats.length > 0 
      ? Math.max(...floorSeats.map(s => s.row))
      : rowsPerFloor;
    return maxRow;
  };

  const renderFloor = (floorNumber: number) => {
    const floorSeats = getFloorSeats(floorNumber);
    const floorLabel = floorNumber === 1 ? 'Tầng dưới (VIP)' : 'Tầng trên';
    const avgPrice = floorSeats.length
      ? Math.round(
          floorSeats.reduce((sum, s) => sum + s.finalPrice, 0) / floorSeats.length
        )
      : 0;
    const actualRows = getRowsForFloor(floorNumber);

    return (
      <div key={floorNumber} className="mb-6">
        <FloorLabel
          floorNumber={floorNumber}
          label={floorLabel}
          avgPrice={avgPrice}
        />

        <div className={cn(
          'bg-slate-100 rounded-2xl p-4 border-2',
          floorNumber === 1 ? 'border-amber-300 bg-gradient-to-b from-amber-50/50 to-slate-100' : 'border-slate-300'
        )}>
          {/* VIP Badge for lower floor */}
          {floorNumber === 1 && (
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-400 rounded-full text-amber-900 font-bold">
                <Star className="w-3 h-3 fill-amber-900" />
                VIP
              </div>
            </div>
          )}

          {/* Driver area - only on floor 1 */}
          {floorNumber === 1 && (
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="w-10 h-10 rounded-full border-4 border-slate-400 flex items-center justify-center relative">
                <div className="w-6 h-0.5 bg-slate-400 rotate-45 absolute" />
                <div className="w-6 h-0.5 bg-slate-400 -rotate-45 absolute" />
              </div>
              <div className="px-3 py-1 bg-slate-300 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                Lối vào
              </div>
            </div>
          )}

          {/* Rows */}
          <div className="space-y-3">
            {Array.from({ length: actualRows }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex items-center justify-between gap-1">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return <Aisle key={`aisle-${colIndex}`} height="h-24" />;
                  }

                  const seat = getSeatAtPosition(floorNumber, row, col);
                  const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                  return (
                    <div key={`${floorNumber}-${row}-${col}`}>
                      <SeatButton
                        seat={seat}
                        isSelected={isSelected}
                        onSelect={onSeatSelect}
                        variant={floorNumber === 1 ? 'vip' : 'sleeper'}
                        size="lg" // Larger for VIP - 20% wider
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom of bus */}
          <div className="mt-4 h-1.5 bg-slate-300 rounded-full opacity-50" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">
            {busTemplate.name}
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} giường VIP · {floors} tầng · Giường rộng hơn 20%
        </p>
      </div>

      {/* Floors */}
      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-amber-50 border-2 border-amber-300 rounded" />
          <span className="text-slate-600">VIP trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-white border-2 border-slate-200 rounded" />
          <span className="text-slate-600">Thường trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-slate-200 border-2 border-slate-300 rounded opacity-60" />
          <span className="text-slate-600">Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-blue-600 border-2 border-blue-700 rounded" />
          <span className="text-slate-600">Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
