'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bed, Armchair, Sofa } from 'lucide-react';
import type { SeatDetail } from '@vexeviet/types';

interface SeatButtonProps {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
  variant?: 'sleeper' | 'cabin' | 'seat' | 'vip';
  size?: 'sm' | 'md' | 'lg';
  showPrice?: boolean;
}

const sizeClasses = {
  sm: 'w-12 h-14',
  md: 'w-16 h-20',
  lg: 'w-20 h-24',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function SeatButton({
  seat,
  isSelected,
  onSelect,
  variant = 'seat',
  size = 'md',
  showPrice = true,
}: SeatButtonProps) {
  // Empty slot
  if (!seat) {
    return <div className={cn(sizeClasses[size])} />;
  }

  const isBooked = seat.status === 'BOOKED' || seat.status === 'SOLD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  const statusClasses = {
    available: 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer',
    booked: 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60 grayscale',
    held: 'bg-amber-100 border-amber-200 text-amber-600 cursor-not-allowed opacity-80',
    selected: 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200 scale-105 z-10',
  };

  const variantClasses = {
    sleeper: 'rounded-lg',
    cabin: 'rounded-xl bg-gradient-to-b from-amber-50 to-amber-100',
    seat: 'rounded-lg',
    vip: 'rounded-xl border-amber-400 bg-gradient-to-b from-amber-50 to-white',
  };

  let status: keyof typeof statusClasses = 'available';
  if (isSelected) status = 'selected';
  else if (isBooked) status = 'booked';
  else if (isHeld) status = 'held';

  const Icon = variant === 'sleeper' || variant === 'cabin' ? Bed : variant === 'vip' ? Sofa : Armchair;

  return (
    <button
      onClick={() => isAvailable && onSelect(seat.id)}
      disabled={!isAvailable && !isSelected}
      className={cn(
        'relative border-2 transition-all duration-200 flex flex-col items-center justify-center gap-0.5',
        sizeClasses[size],
        statusClasses[status],
        variantClasses[variant],
        isSelected && 'ring-2 ring-blue-300 ring-offset-1'
      )}
      aria-label={`${seat.seatLabel}, ${seat.status}, ${seat.finalPrice.toLocaleString('vi-VN')}đ`}
    >
      <Icon className={cn(iconSizes[size], isBooked && 'opacity-40')} />
      <span className="text-[10px] font-bold">{seat.seatLabel}</span>
      {showPrice && (
        <span className="text-[8px] opacity-80">
          {(seat.finalPrice / 1000).toFixed(0)}k
        </span>
      )}
    </button>
  );
}

// Aisle component for visual separation
export function Aisle({ height = 'h-16' }: { height?: string }) {
  return (
    <div className={cn('w-8 flex items-center justify-center', height)}>
      <div className="h-full w-1.5 bg-slate-200/50 rounded-full" />
    </div>
  );
}

// Floor label component
export function FloorLabel({
  floorNumber,
  label,
  avgPrice,
}: {
  floorNumber: number;
  label: string;
  avgPrice?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">
          {floorNumber}
        </span>
        {label}
      </h3>
      {avgPrice && (
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          ~{avgPrice.toLocaleString('vi-VN')}đ
        </span>
      )}
    </div>
  );
}

// Bus frame wrapper
export function BusFrame({
  children,
  showDriver = true,
  showEntrance = true,
}: {
  children: React.ReactNode;
  showDriver?: boolean;
  showEntrance?: boolean;
}) {
  return (
    <div className="bg-slate-100 rounded-2xl p-4 border-2 border-slate-300">
      {/* Driver area */}
      {showDriver && (
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="w-10 h-10 rounded-full border-4 border-slate-400 flex items-center justify-center relative">
            <div className="w-6 h-0.5 bg-slate-400 rotate-45 absolute" />
            <div className="w-6 h-0.5 bg-slate-400 -rotate-45 absolute" />
          </div>
          {showEntrance && (
            <div className="px-3 py-1 bg-slate-300 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-tight">
              Lối vào
            </div>
          )}
        </div>
      )}

      {children}

      {/* Bottom of bus */}
      <div className="mt-4 h-1.5 bg-slate-300 rounded-full opacity-50" />
    </div>
  );
}
