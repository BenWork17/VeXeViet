'use client';

/**
 * Xe Giường Nằm 34 Chỗ VIP - Sleeper Bus VIP Layout
 * 2 tầng, tầng dưới 18 giường, tầng trên 16 giường
 * 6 hàng mỗi tầng, giường rộng hơn 20%
 * Layout columns: A, _, B, _, C
 */

import React from 'react';
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
      <div key={floorNumber} className="booking-bus-floor">
        <FloorLabel
          floorNumber={floorNumber}
          label={floorLabel}
          avgPrice={avgPrice}
        />

        <BusFrame showDriver={floorNumber === 1} showEntrance={floorNumber === 1}>
          {floorNumber === 1 ? (
            <p className="booking-bus-flag">Giường VIP</p>
          ) : null}

          <div className="booking-bus-rows">
            {Array.from({ length: actualRows }, (_, i) => i + 1).map((row) => (
              <div key={row} className="booking-bus-row">
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
                        size="lg"
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
          {busTemplate.totalSeats} giường VIP · {floors} tầng · Giường rộng hơn 20%
        </p>
        <ul className="booking-bus-amenities">
          <li>Giường VIP</li>
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
