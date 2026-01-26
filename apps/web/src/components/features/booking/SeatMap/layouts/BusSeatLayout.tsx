'use client';

/**
 * BusSeatLayout - Main component that automatically selects the correct layout
 * based on the bus template configuration
 */

import React from 'react';
import type { SeatDetail, BusTemplate } from '@vexeviet/types';
import { getLayoutType, type LayoutProps } from './types';
import { SleeperLayout42 } from './SleeperLayout42';
import { SleeperLayout34 } from './SleeperLayout34';
import { CabinLayout20 } from './CabinLayout20';
import { LimousineLayout22 } from './LimousineLayout22';
import { LimousineLayout34 } from './LimousineLayout34';
import { VIPLayout29 } from './VIPLayout29';
import { StandardLayout45 } from './StandardLayout45';

interface BusSeatLayoutProps {
  busTemplate: BusTemplate;
  seats: SeatDetail[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
}

// Layout component mapping
const LAYOUT_COMPONENTS: Record<string, React.ComponentType<LayoutProps>> = {
  'SLEEPER_42': SleeperLayout42,
  'SLEEPER_34': SleeperLayout34,
  'LIMOUSINE_20': CabinLayout20,
  'LIMOUSINE_22': LimousineLayout22,
  'LIMOUSINE_34': LimousineLayout34,
  'VIP_29': VIPLayout29,
  'STANDARD_45': StandardLayout45,
};

// Fallback layout for unknown configurations
function FallbackLayout({ busTemplate, seats, selectedSeats, onSeatSelect }: LayoutProps) {
  const { busType, totalSeats, floors } = busTemplate;

  // Try to use the most appropriate layout based on bus type
  if (busType === 'SLEEPER') {
    if (totalSeats >= 38) {
      return <SleeperLayout42 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
    }
    return <SleeperLayout34 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
  }

  if (busType === 'LIMOUSINE') {
    if (floors === 2) {
      return <CabinLayout20 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
    }
    if (totalSeats <= 25) {
      return <LimousineLayout22 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
    }
    return <LimousineLayout34 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
  }

  if (busType === 'VIP') {
    return <VIPLayout29 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
  }

  // Default to standard layout
  return <StandardLayout45 busTemplate={busTemplate} seats={seats} selectedSeats={selectedSeats} onSeatSelect={onSeatSelect} />;
}

export function BusSeatLayout({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: BusSeatLayoutProps) {
  if (!busTemplate) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không có thông tin xe
      </div>
    );
  }

  // Determine the layout type
  const layoutType = getLayoutType(busTemplate);
  
  // Get the appropriate layout component
  const LayoutComponent = layoutType 
    ? LAYOUT_COMPONENTS[layoutType] 
    : null;

  if (LayoutComponent) {
    return (
      <LayoutComponent
        busTemplate={busTemplate}
        seats={seats}
        selectedSeats={selectedSeats}
        onSeatSelect={onSeatSelect}
      />
    );
  }

  // Use fallback for unknown configurations
  return (
    <FallbackLayout
      busTemplate={busTemplate}
      seats={seats}
      selectedSeats={selectedSeats}
      onSeatSelect={onSeatSelect}
    />
  );
}
