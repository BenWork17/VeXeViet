'use client';

/**
 * Limousine 22 Chỗ VIP - Premium Limousine Layout
 * 1 tầng, 11 hàng × 2 ghế = 22 ghế massage cao cấp
 * Khoảng cách ghế rộng, có màn hình riêng, wifi, nước uống
 * Layout columns: A, _, B
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { Aisle, BusFrame } from './SeatButton';
import type { SeatDetail } from '@vexeviet/types';

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
    return <div className="booking-seat--md" aria-hidden="true" />;
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
        'booking-seat booking-seat--md booking-seat--vip',
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
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} ghế massage cao cấp
        </p>
        <ul className="booking-bus-amenities">
          <li>Màn hình</li>
          <li>Wifi</li>
          <li>Nước uống</li>
          <li>Ghế ngả</li>
        </ul>
      </div>

      <BusFrame>
        <div className="booking-bus-rows">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <div key={row} className="booking-bus-row booking-bus-row--wide">
              {columns.map((col, colIndex) => {
                if (col === '_') {
                  return <Aisle key={`aisle-${colIndex}`} height="h-20" />;
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
      </BusFrame>
    </div>
  );
}
