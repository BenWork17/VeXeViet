'use client';

/**
 * Xe Giường Nằm 42 Chỗ - Sleeper Bus Layout
 * 2 tầng, mỗi tầng 21 giường (7 hàng × 3 dãy)
 * Dãy A và C sát cửa sổ, dãy B ở giữa
 * Layout columns: A, _, B, _, C
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { SeatButton, Aisle, FloorLabel, BusFrame } from './SeatButton';

export function SleeperLayout42({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const floors = busTemplate.floors || 2;
  const rowsPerFloor = busTemplate.rowsPerFloor || 7;
  const columns = busTemplate.columns || ['A', '_', 'B', '_', 'C'];

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

        <BusFrame showDriver={floorNumber === 1} showEntrance={floorNumber === 1}>
          {/* Rows */}
          <div className="space-y-3">
            {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex items-center justify-between gap-1">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return <Aisle key={`aisle-${colIndex}`} height="h-20" />;
                  }

                  const seat = getSeatAtPosition(floorNumber, row, col);
                  const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                  return (
                    <div key={`${floorNumber}-${row}-${col}`}>
                      <SeatButton
                        seat={seat}
                        isSelected={isSelected}
                        onSelect={onSeatSelect}
                        variant="sleeper"
                        size="md"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </BusFrame>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} giường · {floors} tầng · {rowsPerFloor} hàng/tầng
        </p>
      </div>

      {/* Floors */}
      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}

      {/* Legend */}
      <SeatLegend variant="sleeper" />
    </div>
  );
}

// Shared legend component
function SeatLegend({ variant }: { variant: 'sleeper' | 'seat' | 'cabin' }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-6 h-8 bg-white border-2 border-slate-200 rounded" />
        <span className="text-slate-600">Còn trống</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-8 bg-slate-200 border-2 border-slate-300 rounded opacity-60" />
        <span className="text-slate-600">Đã đặt</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-8 bg-amber-100 border-2 border-amber-200 rounded" />
        <span className="text-slate-600">Đang giữ</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-8 bg-blue-600 border-2 border-blue-700 rounded" />
        <span className="text-slate-600">Đang chọn</span>
      </div>
    </div>
  );
}
