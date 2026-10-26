'use client';

import React from 'react';
import { cn } from '@/lib/utils';
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
  sm: 'booking-seat--sm',
  md: 'booking-seat--md',
  lg: 'booking-seat--lg',
};

const stateLabels = {
  available: 'còn trống',
  booked: 'đã đặt',
  held: 'đang giữ',
  selected: 'đang chọn',
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
    return <div className={cn(sizeClasses[size])} aria-hidden="true" />;
  }

  const isBooked = seat.status !== 'AVAILABLE' && seat.status !== 'HELD';
  const isHeld = seat.status === 'HELD';
  const isAvailable = seat.status === 'AVAILABLE' && seat.isSelectable;

  let state: keyof typeof stateLabels = 'available';
  if (isSelected) state = 'selected';
  else if (isBooked) state = 'booked';
  else if (isHeld) state = 'held';

  const isPremium = variant === 'vip' || variant === 'cabin';

  return (
    <button
      type="button"
      onClick={() => isAvailable && onSelect(seat.id)}
      disabled={!isAvailable && !isSelected}
      aria-pressed={isSelected}
      aria-label={`${seat.seatLabel}, ${stateLabels[state]}, ${seat.finalPrice.toLocaleString('vi-VN')} đồng`}
      className={cn(
        'booking-seat',
        sizeClasses[size],
        isPremium && 'booking-seat--vip',
        state === 'selected' && 'is-selected',
        state === 'booked' && 'is-booked',
        state === 'held' && 'is-held'
      )}
    >
      <span className="booking-seat-label">{seat.seatLabel}</span>
      {showPrice ? (
        <span className="booking-seat-price">{(seat.finalPrice / 1000).toFixed(0)}k</span>
      ) : null}
      {state === 'held' ? <span className="booking-seat-note">Đang giữ</span> : null}
    </button>
  );
}

// Aisle component for visual separation
export function Aisle({ height = 'h-16' }: { height?: string }) {
  return (
    <div className={cn('booking-bus-aisle', height)} aria-hidden="true" />
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
    <div className="booking-floor-head">
      <span>
        <span className="booking-floor-index" aria-hidden="true">
          {floorNumber}
        </span>
        {label}
      </span>
      {avgPrice ? (
        <span className="booking-floor-price">~{avgPrice.toLocaleString('vi-VN')}đ</span>
      ) : null}
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
    <div className="booking-bus-frame">
      {showDriver ? (
        <div className="booking-bus-cab">
          <span className="booking-bus-driver">
            <span className="booking-bus-wheel" aria-hidden="true" />
            Đầu xe
          </span>
          {showEntrance ? <span className="booking-bus-entrance">Lối vào</span> : null}
        </div>
      ) : null}

      {children}

      <div className="booking-bus-footer" aria-hidden="true" />
    </div>
  );
}
