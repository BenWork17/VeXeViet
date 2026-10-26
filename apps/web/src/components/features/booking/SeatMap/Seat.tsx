'use client';

import { cn } from '@/lib/utils';

export type SeatStatus = 'available' | 'occupied' | 'selected';
export type SeatType = 'standard' | 'vip';

interface SeatProps {
  id: string;
  status: SeatStatus;
  type: SeatType;
  onClick?: (id: string) => void;
}

const stateLabels: Record<SeatStatus, string> = {
  available: 'còn trống',
  occupied: 'đã đặt',
  selected: 'đang chọn',
};

export function Seat({ id, status, type, onClick }: SeatProps) {
  const isOccupied = status === 'occupied';
  const isSelected = status === 'selected';
  const isAvailable = status === 'available';

  const handleActivate = () => {
    if (isAvailable || isSelected) onClick?.(id);
  };

  return (
    <button
      type="button"
      className={cn(
        'booking-seat',
        type === 'vip' && 'booking-seat--vip',
        isSelected && 'is-selected',
        isOccupied && 'is-booked'
      )}
      onClick={handleActivate}
      disabled={isOccupied}
      aria-pressed={isSelected}
      aria-label={`Ghế ${id}, ${stateLabels[status]}${type === 'vip' ? ', VIP' : ''}`}
    >
      <span className="booking-seat-label">{id}</span>
      {type === 'vip' ? <span className="booking-seat-note">VIP</span> : null}
    </button>
  );
}
