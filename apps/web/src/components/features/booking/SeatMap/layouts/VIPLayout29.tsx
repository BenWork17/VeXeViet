'use client';

/**
 * Ghế Ngồi VIP 29 Chỗ - VIP Seating Layout
 * 1 tầng, 8 hàng, layout A,B,_,C,D (4 ghế mỗi hàng, trừ hàng cuối 5 ghế)
 * Ghế rộng, có thể ngả. Phù hợp cho các chuyến đi ngắn và trung bình.
 * Layout columns: A, B, _, C, D
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { Aisle, BusFrame } from './SeatButton';
import type { SeatDetail } from '@vexeviet/types';

function VIPSeat({
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
  const isVIP = seat.seatType === 'VIP';

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
      aria-label={`Ghế ${seat.seatLabel}${isVIP ? ' VIP' : ''}, ${stateLabel}, ${seat.finalPrice.toLocaleString('vi-VN')} đồng`}
      className={cn(
        'booking-seat booking-seat--sm',
        isVIP && 'booking-seat--vip',
        isSelected && 'is-selected',
        isBooked && 'is-booked',
        isHeld && 'is-held'
      )}
    >
      <span className="booking-seat-label">{seat.seatLabel}</span>
      <span className="booking-seat-price">{(seat.finalPrice / 1000).toFixed(0)}k</span>
      {isVIP ? <span className="booking-seat-note">VIP</span> : null}
      {isHeld ? <span className="booking-seat-note">Đang giữ</span> : null}
    </button>
  );
}

export function VIPLayout29({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const rowsPerFloor = busTemplate.rowsPerFloor || 8;
  const columns = busTemplate.columns || ['A', 'B', '_', 'C', 'D'];

  const getSeatAtPosition = (row: number, column: string) => {
    return seats.find(
      (s) => s.row === row && s.column === column && (s.floor === 1 || !s.floor)
    );
  };

  // First 2 rows are VIP
  const isVIPRow = (row: number) => row <= 2;

  return (
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} ghế · Hai hàng đầu là ghế VIP
        </p>
        <ul className="booking-bus-amenities">
          <li>Ghế rộng</li>
          <li>Điều hòa</li>
          <li>Wifi</li>
        </ul>
      </div>

      <BusFrame>
        <p className="booking-bus-flag">Hai hàng ghế VIP</p>

        <div className="booking-bus-rows">
          {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
            <div key={row} className="booking-bus-row">
              {columns.map((col, colIndex) => {
                if (col === '_') {
                  return <Aisle key={`aisle-${colIndex}`} height="h-20" />;
                }

                const seat = getSeatAtPosition(row, col);
                const isSelected = seat ? selectedSeats.includes(seat.id) : false;
                const seatWithVIP = seat && isVIPRow(row)
                  ? { ...seat, seatType: 'VIP' as const }
                  : seat;

                return (
                  <div key={`1-${row}-${col}`}>
                    <VIPSeat
                      seat={seatWithVIP}
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
