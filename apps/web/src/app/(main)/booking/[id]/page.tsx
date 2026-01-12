'use client';

import React, { useState, useMemo } from 'react';
import { SeatMap, SeatData } from '@/components/features/booking/SeatMap/SeatMap';
import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data generator
const getSeatAvailability = (routeId: string): SeatData[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const cols = [1, 2, 3, 4];
  const seats: SeatData[] = [];

  rows.forEach((row) => {
    cols.forEach((col) => {
      const id = `${row}${col}`;
      // Randomly assign statuses for demo
      const random = Math.random();
      let status: SeatData['status'] = 'available';
      if (random > 0.8) status = 'occupied';
      
      const type: SeatData['type'] = (row === 'A' || row === 'B') ? 'vip' : 'standard';
      
      seats.push({ id, status, type });
    });
  });

  return seats;
};

export default function BookingPage({ params }: { params: { id: string } }) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const routeId = params.id;
  const busType = 'Standard'; // Mock
  const basePrice = 250000; // Mock (VND)
  const vipSurcharge = 50000;
  
  const seats = useMemo(() => getSeatAvailability(routeId), [routeId]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= 5) {
        alert('You can select up to 5 seats only.');
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + basePrice + (seat?.type === 'vip' ? vipSurcharge : 0);
    }, 0);
  }, [selectedSeats, seats]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl text-slate-900">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Select Your Seats</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-900">
        <div className="md:col-span-2 flex justify-center text-slate-900">
          <SeatMap 
            busType={busType}
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </div>

        <div className="flex flex-col gap-6 text-slate-900">
          {/* Legend */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-slate-900">
            <h3 className="font-semibold mb-3 text-slate-900">Legend</h3>
            <div className="space-y-2 text-slate-900">
              <LegendItem color="text-green-600" label="Available" />
              <LegendItem color="text-slate-400" label="Occupied" />
              <LegendItem color="text-blue-600" label="Selected" />
              <div className="flex items-center gap-2 pt-2 border-t mt-2 text-slate-900">
                <div className="w-5 h-5 bg-amber-50 border-2 border-amber-400 rounded-sm" />
                <span className="text-sm text-slate-700">VIP Seat (+{vipSurcharge.toLocaleString()} VND)</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm sticky top-4 text-slate-900">
            <h3 className="font-semibold mb-3 text-slate-900">Booking Summary</h3>
            <div className="space-y-4 text-slate-900">
              <div className="flex justify-between text-sm text-slate-900">
                <span className="text-slate-600">Selected Seats:</span>
                <span className="font-bold text-slate-900">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-slate-900">
                <span className="text-slate-600">Total Price:</span>
                <span className="text-xl font-black text-blue-700">
                  {totalPrice.toLocaleString()} VND
                </span>
              </div>
              <button 
                className={cn(
                  "w-full py-3 rounded-lg font-bold transition-all",
                  selectedSeats.length > 0 
                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
                disabled={selectedSeats.length === 0}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Armchair className={cn("w-5 h-5", color)} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
