'use client';

import React from 'react';
import type { SeatDetail, BusTemplate } from '@vexeviet/types';
import { Aisle, BusFrame, FloorLabel, SeatButton } from './layouts/SeatButton';

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

  return (
    <div className="booking-bus">
      <div className="booking-bus-head">
        <h2 className="booking-bus-name">{busTemplate.name}</h2>
        <p className="booking-bus-meta">
          {busTemplate.totalSeats} giường · {busTemplate.floors} tầng
        </p>
      </div>

      <BusFrame>
        {Array.from({ length: floors }, (_, i) => i + 1).map((floorNumber) => {
          const floorSeats = seats.filter((s) => s.floor === floorNumber);
          const floorLabel = floorNumber === 1 ? 'Tầng dưới' : 'Tầng trên';
          const avgPrice = floorSeats.length
            ? Math.round(
                floorSeats.reduce((sum, s) => sum + s.finalPrice, 0) / floorSeats.length
              )
            : undefined;

          return (
            <section key={floorNumber} className="booking-bus-floor">
              <FloorLabel floorNumber={floorNumber} label={floorLabel} avgPrice={avgPrice} />

              <div className="booking-bus-rows">
                {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
                  <div key={row} className="booking-bus-row">
                    {columns.map((col, colIndex) => {
                      if (col === '_') {
                        return <Aisle key={`aisle-${colIndex}`} />;
                      }

                      const seat = getSeatAtPosition(floorNumber, row, col);
                      return (
                        <SeatButton
                          key={`${floorNumber}-${row}-${col}`}
                          seat={seat}
                          isSelected={Boolean(seat && selectedSeats.includes(seat.id))}
                          onSelect={onSeatSelect}
                          variant="sleeper"
                          size="md"
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </BusFrame>

      <ul className="booking-legend" aria-label="Chú thích trạng thái ghế">
        <li>
          <span className="booking-legend-swatch" aria-hidden="true" />
          Còn trống
        </li>
        <li>
          <span className="booking-legend-swatch is-booked" aria-hidden="true" />
          Đã đặt
        </li>
        <li>
          <span className="booking-legend-swatch is-held" aria-hidden="true" />
          Đang giữ
        </li>
        <li>
          <span className="booking-legend-swatch is-selected" aria-hidden="true" />
          Đang chọn
        </li>
      </ul>
    </div>
  );
}
