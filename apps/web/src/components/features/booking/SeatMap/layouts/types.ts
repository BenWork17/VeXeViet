import type { SeatDetail, BusTemplate } from '@vexeviet/types';

export interface LayoutProps {
  busTemplate: BusTemplate;
  seats: SeatDetail[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
}

export interface SeatRenderProps {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
}

// Layout configurations for different bus types
export const BUS_LAYOUT_CONFIG = {
  // Xe Giường Nằm 42 Chỗ
  'SLEEPER_42': {
    floors: 2,
    rowsPerFloor: 7,
    columns: ['A', '_', 'B', '_', 'C'],
    seatsPerFloor: 21,
  },
  // Xe Giường Nằm 34 Chỗ VIP
  'SLEEPER_34': {
    floors: 2,
    rowsPerFloor: 6,
    columns: ['A', '_', 'B', '_', 'C'],
    seatsPerFloorLower: 18,
    seatsPerFloorUpper: 16,
  },
  // Cabin Đôi Luxury 20 Chỗ
  'LIMOUSINE_20': {
    floors: 2,
    rowsPerFloor: 5,
    columns: ['A', '_', 'B'],
    seatsPerFloor: 10,
    isCabin: true,
  },
  // Limousine 22 Chỗ VIP
  'LIMOUSINE_22': {
    floors: 1,
    rowsPerFloor: 11,
    columns: ['A', '_', 'B'],
    totalSeats: 22,
  },
  // Limousine 34 Chỗ
  'LIMOUSINE_34': {
    floors: 1,
    rowsPerFloor: 17,
    columns: ['A', '_', 'B'],
    totalSeats: 34,
  },
  // Ghế Ngồi VIP 29 Chỗ
  'VIP_29': {
    floors: 1,
    rowsPerFloor: 8,
    columns: ['A', 'B', '_', 'C', 'D'],
    totalSeats: 29,
  },
  // Xe Ghế Ngồi 45 Chỗ
  'STANDARD_45': {
    floors: 1,
    rowsPerFloor: 12,
    columns: ['A', 'B', '_', 'C', 'D'],
    totalSeats: 45,
  },
} as const;

export type BusLayoutType = keyof typeof BUS_LAYOUT_CONFIG;

// Helper to determine layout type from bus template
export function getLayoutType(busTemplate: BusTemplate): BusLayoutType | null {
  const { busType, totalSeats, floors } = busTemplate;
  
  if (busType === 'SLEEPER') {
    if (totalSeats === 42 || totalSeats === 40) return 'SLEEPER_42';
    if (totalSeats === 34 || totalSeats === 36) return 'SLEEPER_34';
  }
  
  if (busType === 'LIMOUSINE') {
    if (totalSeats === 20 && floors === 2) return 'LIMOUSINE_20';
    if (totalSeats === 22) return 'LIMOUSINE_22';
    if (totalSeats === 34) return 'LIMOUSINE_34';
  }
  
  if (busType === 'VIP') {
    if (totalSeats === 29) return 'VIP_29';
  }
  
  if (busType === 'STANDARD') {
    if (totalSeats === 45) return 'STANDARD_45';
  }
  
  return null;
}
