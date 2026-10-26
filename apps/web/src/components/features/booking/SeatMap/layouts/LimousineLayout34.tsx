'use client';

/**
 * Limousine 34 Chỗ - Premium Limousine Layout
 * 1 tầng, 17 hàng × 2 ghế = 34 ghế da cao cấp
 * Ghế có thể ngả 160 độ, Wifi, USB sạc, nước uống miễn phí
 * Layout columns: A, _, B
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { Aisle, BusFrame } from './SeatButton';
import type { SeatDetail } from '@vexeviet/types';

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
        'booking-seat booking-seat--sm booking-seat--vip',
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

  return (
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} ghế da cao cấp · Ngả 160°
        </p>
        <ul className="booking-bus-amenities">
          <li>Wifi</li>
          <li>USB sạc</li>
          <li>Nước uống</li>
        </ul>
      </div>

      <BusFrame>
        <div className="booking-bus-rows">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <div key={row} className="booking-bus-row">
              {columns.map((col, colIndex) => {
                if (col === '_') {
                  return <Aisle key={`aisle-${colIndex}`} height="h-20" />;
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
          ))}
        </div>
      </BusFrame>
    </div>
  );
}
