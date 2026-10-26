'use client';

/**
 * Xe Ghế Ngồi 45 Chỗ - Standard Bus Layout
 * 1 tầng, 12 hàng, layout A,B,_,C,D (4 ghế mỗi hàng)
 * Xe ghế ngồi thường, giá cả phải chăng. Có điều hòa, wifi.
 * Layout columns: A, B, _, C, D
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { Aisle, BusFrame } from './SeatButton';
import type { SeatDetail } from '@vexeviet/types';

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
    return <div className="booking-seat--sm" aria-hidden="true" />;
  }

  const isBooked = seat.status !== 'AVAILABLE' && seat.status !== 'HELD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  let stateLabel = 'còn trống';
  if (isSelected) stateLabel = 'đang chọn';
  else if (isBooked) stateLabel = 'đã đặt';
  else if (isHeld) stateLabel = 'đang giữ';

  return (
    <button
      type="button"
      onClick={() => isAvailable && onSelect(seat.id)}
      disabled={!isAvailable && !isSelected}
      aria-pressed={isSelected}
      aria-label={`Ghế ${seat.seatLabel}, ${stateLabel}, ${seat.finalPrice.toLocaleString('vi-VN')} đồng`}
      className={cn(
        'booking-seat booking-seat--sm',
        isSelected && 'is-selected',
        isBooked && 'is-booked',
        isHeld && 'is-held'
      )}
    >
      <span className="booking-seat-label">{seat.seatLabel}</span>
      <span className="booking-seat-price">{(seat.finalPrice / 1000).toFixed(0)}k</span>
      {isHeld ? <span className="booking-seat-note">Đang giữ</span> : null}
    </button>
  );
}

export function StandardLayout45({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const columns = busTemplate.columns || ['A', 'B', '_', 'C', 'D'];
  const seatColumnsCount = columns.filter((c) => c !== '_').length;
  const maxSeatRow = seats.reduce((max, seat) => Math.max(max, seat.row || 0), 0);
  const inferredRowsBySeatCount = seatColumnsCount > 0 ? Math.ceil(seats.length / seatColumnsCount) : 0;
  const rowsPerFloor = Math.max(maxSeatRow, inferredRowsBySeatCount, 1);

  const getSeatAtPosition = (row: number, column: string) => {
    return seats.find(
      (s) => s.row === row && s.column === column && (s.floor === 1 || !s.floor)
    );
  };

  const totalAvailable = seats.filter(s => s.status === 'AVAILABLE').length;

  return (
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} ghế · Còn {totalAvailable} chỗ trống
        </p>
        <ul className="booking-bus-amenities">
          <li>Điều hòa</li>
          <li>Wifi</li>
        </ul>
      </div>

      <BusFrame>
        <div className="booking-bus-row-labels" aria-hidden="true">
          <span>Cửa sổ</span>
          <span>Lối đi</span>
          <span>Cửa sổ</span>
        </div>

        <div className="booking-bus-rows">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <div key={row} className="booking-bus-row">
              <span className="booking-row-index">{row}</span>

              {columns.map((col, colIndex) => {
                if (col === '_') {
                  return <Aisle key={`aisle-${colIndex}`} height="h-14" />;
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

              <span className="booking-row-index">{row}</span>
            </div>
          ))}
        </div>
      </BusFrame>
    </div>
  );
}
