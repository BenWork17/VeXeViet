'use client';

/**
 * BusTypePreview - Hiển thị preview loại xe và sơ đồ ghế
 * Dùng ở trang chi tiết chuyến xe trước khi vào trang chọn ghế
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type BusType = 'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER';

interface BusTypePreviewProps {
  busType: BusType | string;
  totalSeats?: number;
  className?: string;
}

type SeatPreviewKind = 'sleeper' | 'cabin' | 'limousine' | 'vip' | 'standard';

type BusTypeConfig = {
  name: string;
  description: string;
  amenities: string[];
  seatPreview: SeatPreviewKind;
};

const BUS_TYPE_CONFIG: Record<string, BusTypeConfig> = {
  SLEEPER: {
    name: 'Xe giường nằm',
    description: 'Hai tầng, giường nằm thoải mái',
    amenities: ['Giường nằm', 'Điều hòa', 'Wifi'],
    seatPreview: 'sleeper',
  },
  LIMOUSINE: {
    name: 'Limousine',
    description: 'Ghế massage cao cấp, không gian riêng tư',
    amenities: ['Màn hình', 'Wifi', 'Nước uống', 'USB sạc'],
    seatPreview: 'limousine',
  },
  VIP: {
    name: 'Ghế ngồi VIP',
    description: 'Ghế rộng, có thể ngả',
    amenities: ['Điều hòa', 'Wifi', 'Ngả ghế'],
    seatPreview: 'vip',
  },
  STANDARD: {
    name: 'Xe ghế ngồi',
    description: 'Tiêu chuẩn, giá phải chăng',
    amenities: ['Điều hòa', 'Wifi'],
    seatPreview: 'standard',
  },
};

const DEFAULT_BUS_TYPE_CONFIG: BusTypeConfig = {
  name: 'Xe ghế ngồi',
  description: 'Tiêu chuẩn, giá phải chăng',
  amenities: ['Điều hòa', 'Wifi'],
  seatPreview: 'standard',
};

function MiniSeat({
  variant,
  status = 'available',
}: {
  variant: SeatPreviewKind;
  status?: 'available' | 'booked';
}) {
  return (
    <span
      className={cn(
        'booking-preview-seat',
        `booking-preview-seat--${variant}`,
        status === 'booked' && 'is-booked'
      )}
    />
  );
}

function PreviewRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="booking-preview-row">{children}</div>;
}

function SleeperPreview() {
  return (
    <div className="booking-preview-floor">
      <p className="booking-preview-floor-label">Tầng trên</p>
      <PreviewRow>
        <MiniSeat variant="sleeper" />
        <MiniSeat variant="sleeper" />
        <MiniSeat variant="sleeper" />
      </PreviewRow>
      <p className="booking-preview-floor-label">Tầng dưới</p>
      <PreviewRow>
        <MiniSeat variant="sleeper" />
        <MiniSeat variant="sleeper" status="booked" />
        <MiniSeat variant="sleeper" />
      </PreviewRow>
    </div>
  );
}

function LimousinePreview() {
  return (
    <div className="booking-preview-floor">
      {[1, 2, 3].map((row) => (
        <PreviewRow key={row}>
          <MiniSeat variant="limousine" status={row === 2 ? 'booked' : 'available'} />
          <MiniSeat variant="limousine" />
        </PreviewRow>
      ))}
    </div>
  );
}

function VIPPreview() {
  return (
    <div className="booking-preview-floor">
      {[1, 2].map((row) => (
        <PreviewRow key={row}>
          <MiniSeat variant="vip" />
          <MiniSeat variant="vip" status={row === 1 ? 'booked' : 'available'} />
          <MiniSeat variant="vip" />
          <MiniSeat variant="vip" />
        </PreviewRow>
      ))}
    </div>
  );
}

function StandardPreview() {
  return (
    <div className="booking-preview-floor">
      {[1, 2, 3].map((row) => (
        <PreviewRow key={row}>
          <MiniSeat variant="standard" />
          <MiniSeat variant="standard" status={row === 2 ? 'booked' : 'available'} />
          <MiniSeat variant="standard" />
          <MiniSeat variant="standard" />
        </PreviewRow>
      ))}
    </div>
  );
}

function CabinPreview() {
  return (
    <div className="booking-preview-floor">
      {[1, 2].map((row) => (
        <PreviewRow key={row}>
          <MiniSeat variant="cabin" />
          <MiniSeat variant="cabin" status={row === 1 ? 'booked' : 'available'} />
        </PreviewRow>
      ))}
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<SeatPreviewKind, React.ComponentType> = {
  sleeper: SleeperPreview,
  cabin: CabinPreview,
  limousine: LimousinePreview,
  vip: VIPPreview,
  standard: StandardPreview,
};

export function BusTypePreview({ busType, totalSeats, className }: BusTypePreviewProps) {
  const type = busType.toUpperCase();
  const config = BUS_TYPE_CONFIG[type] ?? DEFAULT_BUS_TYPE_CONFIG;
  const PreviewComponent = PREVIEW_COMPONENTS[config.seatPreview];

  return (
    <section className={cn('booking-bus-preview', className)}>
      <div className="booking-bus-preview-head">
        <div>
          <h3 className="booking-bus-name">{config.name}</h3>
          <p className="booking-bus-meta">{config.description}</p>
        </div>
        {totalSeats ? (
          <p className="booking-bus-seat-count">
            {totalSeats} chỗ
          </p>
        ) : null}
      </div>

      <div className="booking-bus-preview-body">
        <div>
          <p className="booking-preview-label">Sơ đồ xe</p>
          <div className="booking-bus-frame" aria-hidden="true">
            <PreviewComponent />
          </div>
          <p className="booking-preview-caption">Sơ đồ minh họa cho cách bố trí ghế.</p>
        </div>

        <div>
          <p className="booking-preview-label">Tiện nghi</p>
          <ul className="booking-bus-amenities">
            {config.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function BusTypeBadge({
  busType,
  className,
}: {
  busType: BusType | string;
  className?: string;
}) {
  const type = busType.toUpperCase();
  const config = BUS_TYPE_CONFIG[type] ?? DEFAULT_BUS_TYPE_CONFIG;

  return (
    <span className={cn('booking-bus-badge', className)}>
      {config.name}
    </span>
  );
}
