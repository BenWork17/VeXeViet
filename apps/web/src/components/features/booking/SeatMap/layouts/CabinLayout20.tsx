'use client';

/**
 * Cabin Đôi Luxury 20 Chỗ - Luxury Cabin Layout
 * 2 tầng, mỗi tầng 5 hàng × 2 cabin = 10 cabin/tầng = 20 cabin tổng
 * Mỗi cabin có rèm che, đèn đọc sách, ổ cắm điện
 * Layout columns: A, _, B
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { Aisle, FloorLabel, BusFrame } from './SeatButton';
import type { SeatDetail } from '@vexeviet/types';

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
    return <div className="booking-seat--lg" aria-hidden="true" />;
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
      aria-label={`Cabin ${seat.seatLabel}, ${stateLabel}, ${seat.finalPrice.toLocaleString('vi-VN')} đồng`}
      className={cn(
        'booking-seat booking-seat--lg booking-seat--vip',
        isSelected && 'is-selected',
        isBooked && 'is-booked',
        isHeld && 'is-held'
      )}
    >
      <span className="booking-seat-label">{seat.seatLabel}</span>
      <span className="booking-seat-price">{(seat.finalPrice / 1000).toFixed(0)}k</span>
      <span className="booking-seat-note">{isHeld ? 'Đang giữ' : 'Cabin'}</span>
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
      <div key={floorNumber} className="booking-bus-floor">
        <FloorLabel
          floorNumber={floorNumber}
          label={floorLabel}
          avgPrice={avgPrice}
        />

        <BusFrame showDriver={floorNumber === 1} showEntrance={floorNumber === 1}>
          <div className="booking-bus-rows">
            {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
              <div key={row} className="booking-bus-row booking-bus-row--wide">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return <Aisle key={`aisle-${colIndex}`} height="h-24" />;
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
        </BusFrame>
      </div>
    );
  };

  return (
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} cabin riêng tư · {floors} tầng
        </p>
        <ul className="booking-bus-amenities">
          <li>Đèn đọc</li>
          <li>Ổ cắm</li>
          <li>Rèm che</li>
        </ul>
      </div>

      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}
    </div>
  );
}
