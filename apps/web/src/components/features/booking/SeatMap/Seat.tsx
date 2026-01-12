'use client';

import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SeatStatus = 'available' | 'occupied' | 'selected';
export type SeatType = 'standard' | 'vip';

interface SeatProps {
  id: string;
  status: SeatStatus;
  type: SeatType;
  onClick?: (id: string) => void;
}

export function Seat({ id, status, type, onClick }: SeatProps) {
  const isOccupied = status === 'occupied';
  const isSelected = status === 'selected';
  const isAvailable = status === 'available';

  const statusClasses = {
    available: 'text-green-600 bg-white border-slate-200 hover:bg-green-50 cursor-pointer',
    occupied: 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed',
    selected: 'text-white bg-blue-700 border-blue-800 cursor-pointer shadow-lg transform scale-105 z-10',
  };

  const typeClasses = {
    standard: 'border',
    vip: 'border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-2 transition-all duration-200 rounded-xl w-12 h-14',
        statusClasses[status],
        status !== 'selected' && type === 'vip' ? 'bg-amber-50' : '',
        typeClasses[type]
      )}
      onClick={() => isAvailable || isSelected ? onClick?.(id) : null}
      role="button"
      aria-label={`Seat ${id}, ${status}${type === 'vip' ? ', VIP' : ''}`}
      aria-disabled={isOccupied}
      tabIndex={isOccupied ? -1 : 0}
    >
      <Armchair className={cn("w-7 h-7 mb-1", isOccupied ? "opacity-40" : "opacity-100")} />
      <span className={cn(
        "text-[10px] font-bold",
        isSelected ? "text-white" : isOccupied ? "text-slate-400" : "text-slate-700"
      )}>{id}</span>
    </div>
  );
}
