'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bed } from 'lucide-react';
import type { SeatDetail, BusTemplate } from '@vexeviet/types';

interface SleeperSeatMapProps {
  busTemplate: BusTemplate;
  seats: SeatDetail[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
}

export function SleeperSeatMap({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: SleeperSeatMapProps) {
  if (!busTemplate) return null;
  const { floors, rowsPerFloor, columns } = busTemplate;

  const getSeatAtPosition = (floor: number, row: number, column: string) => {
    return seats.find(
      (s) => s.floor === floor && s.row === row && s.column === column
    );
  };

  const renderSeat = (seat: SeatDetail | undefined) => {
    if (!seat) return <div className="w-16 h-20" />;

    const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
    const isHeld = seat.status === 'HELD';
    const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;
    const isSelected = selectedSeats.includes(seat.id);

    const statusClasses = {
      available: 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer',
      booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60 grayscale',
      held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
      selected: 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200 scale-105 z-10',
    };

    let status: keyof typeof statusClasses = 'available';
    if (isSelected) status = 'selected';
    else if (isBooked) status = 'booked';
    else if (isHeld) status = 'held';

    return (
      <button
        onClick={() => isAvailable && onSeatSelect(seat.id)}
        disabled={!isAvailable && !isSelected}
        className={cn(
          'relative w-16 h-20 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1',
          statusClasses[status]
        )}
        aria-label={`${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
      >
        <Bed className="w-5 h-5" />
        <span className="text-[10px] font-bold">{seat.seatLabel}</span>
        <span className="text-[8px]">
          {(seat.finalPrice / 1000).toFixed(0)}k
        </span>
      </button>
    );
  };

  const renderFloor = (floorNumber: number) => {
    const floorSeats = seats.filter((s) => s.floor === floorNumber);
    const floorLabel = floorNumber === 1 ? 'Tầng dưới' : 'Tầng trên';
    const avgPrice = floorSeats.length
      ? Math.round(
          floorSeats.reduce((sum, s) => sum + s.finalPrice, 0) / floorSeats.length
        )
      : 0;

    return (
      <div key={floorNumber} className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">{floorLabel}</h3>
          <span className="text-xs text-slate-500">
            {avgPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="bg-slate-100 rounded-2xl p-6 border-2 border-slate-300">
          <div className="flex justify-end mb-2">
            <div className="text-[10px] px-2 py-1 bg-slate-300 rounded-full text-slate-600 font-bold">
              CABIN
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex items-center justify-between gap-2">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return (
                      <div
                        key={`aisle-${colIndex}`}
                        className="w-12 flex items-center justify-center"
                      >
                        <div className="h-16 w-2 bg-slate-300/30 rounded-full" />
                      </div>
                    );
                  }

                  const seat = getSeatAtPosition(floorNumber, row, col);
                  return (
                    <div key={`${floorNumber}-${row}-${col}`}>
                      {renderSeat(seat)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-4 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} giường · {busTemplate.floors} tầng
        </p>
      </div>

      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}

      <div className="mt-6 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-green-50 border-2 border-green-300 rounded" />
          <span>Còn trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-gray-200 border-2 border-gray-300 rounded" />
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 bg-blue-600 border-2 border-blue-700 rounded" />
          <span>Đang chọn</span>
        </div>
      </div>
    </div>
  );
}
