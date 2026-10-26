'use client';

/**
 * Xe Giường Nằm 42 Chỗ - Sleeper Bus Layout
 * 2 tầng, mỗi tầng 21 giường (7 hàng × 3 dãy)
 * Dãy A và C sát cửa sổ, dãy B ở giữa
 * Layout columns: A, _, B, _, C
 */

import React from 'react';
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
      <div key={floorNumber} className="booking-bus-floor">
        <FloorLabel
          floorNumber={floorNumber}
          label={floorLabel}
          avgPrice={avgPrice}
        />

        <BusFrame showDriver={floorNumber === 1} showEntrance={floorNumber === 1}>
          <div className="booking-bus-rows">
            {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
              <div key={row} className="booking-bus-row">
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
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} giường · {floors} tầng · {rowsPerFloor} hàng mỗi tầng
        </p>
        <ul className="booking-bus-amenities">
          <li>Giường nằm</li>
          <li>Điều hòa</li>
          <li>Wifi</li>
        </ul>
      </div>

      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}
    </div>
  );
}
