'use client';

import React, { useMemo } from 'react';
import { Seat, SeatStatus, SeatType } from './Seat';
import { BusFrame } from './layouts/SeatButton';

export interface SeatData {
  id: string;
  status: SeatStatus;
  type: SeatType;
}

interface SeatMapProps {
  busType: 'Standard' | 'Limousine';
  seats: SeatData[];
  selectedSeats: string[];
  onSeatSelect: (id: string) => void;
  maxSeats?: number;
}

export function SeatMap({ busType, seats, selectedSeats, onSeatSelect }: SeatMapProps) {
  const isLimousine = busType === 'Limousine';

  // Group seats by rows
  const seatRows = useMemo(() => {
    const rows: { [key: string]: SeatData[] } = {};
    seats.forEach(seat => {
      const rowLabel = seat.id.charAt(0);
      if (!rows[rowLabel]) rows[rowLabel] = [];
      rows[rowLabel].push(seat);
    });
    return Object.entries(rows).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div className="booking-bus">
      <BusFrame>
        <div className="booking-bus-rows">
          {seatRows.map(([label, rowSeats]) => (
            <div key={label} className="booking-bus-row">
              <div className="booking-seat-pair">
                {rowSeats.slice(0, isLimousine ? 1 : 2).map((seat) => (
                  <Seat
                    key={seat.id}
                    id={seat.id}
                    status={selectedSeats.includes(seat.id) ? 'selected' : seat.status}
                    type={seat.type}
                    onClick={onSeatSelect}
                  />
                ))}
              </div>

              <div className="booking-bus-aisle" aria-hidden="true" />

              <div className="booking-seat-pair">
                {rowSeats.slice(isLimousine ? 1 : 2).map((seat) => (
                  <Seat
                    key={seat.id}
                    id={seat.id}
                    status={selectedSeats.includes(seat.id) ? 'selected' : seat.status}
                    type={seat.type}
                    onClick={onSeatSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </BusFrame>
    </div>
  );
}
