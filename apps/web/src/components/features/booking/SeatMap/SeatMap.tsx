'use client';

import React, { useMemo } from 'react';
import { Seat, SeatStatus, SeatType } from './Seat';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col items-center p-8 bg-slate-100 rounded-3xl border-4 border-slate-300 shadow-inner max-w-md w-full">
      {/* Steering Wheel / Driver Area */}
      <div className="mb-10 w-full flex justify-between items-center px-6">
        <div className="w-12 h-12 rounded-full border-4 border-slate-400 flex items-center justify-center">
          <div className="w-8 h-1 bg-slate-400 rotate-45 absolute" />
          <div className="w-8 h-1 bg-slate-400 -rotate-45 absolute" />
        </div>
        <div className="px-4 py-1 bg-slate-300 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
          Entrance
        </div>
      </div>
      
      <div className="flex flex-col gap-6 w-full">
        {seatRows.map(([label, rowSeats]) => (
          <div key={label} className="flex justify-between items-center w-full px-2">
            {/* Left side seats (usually 2 seats or 1 for Limousine) */}
            <div className="flex gap-3">
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

            {/* The Aisle (Lối đi) */}
            <div className="flex-1 flex justify-center">
              <div className="h-14 w-8 bg-slate-200/50 rounded-lg flex items-center justify-center">
                <div className="w-1 h-8 bg-slate-300/30 rounded-full" />
              </div>
            </div>

            {/* Right side seats (usually 2 seats) */}
            <div className="flex gap-3">
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

      <div className="mt-10 w-full h-2 bg-slate-300 rounded-full opacity-50" />
    </div>
  );
}
