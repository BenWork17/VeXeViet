'use client';

import { useId, useState } from 'react';
import {
  ArrowRight,
  Bus,
  Clock,
  MapPin,
  Users,
  Wifi,
  Wind,
  Droplet,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  type LucideIcon,
} from 'lucide-react';
import type { Route } from '@vexeviet/types';
import { Button } from '@vexeviet/ui'
import { cn, formatCurrency } from '@/lib/utils'
import { CardWatermark } from '@/components/brand'

export interface SearchRouteCardProps {
  route: Route;
  onBook?: (routeId: string) => void;
  className?: string;
}

const BUS_TYPE_LABELS: Record<string, string> = {
  LIMOUSINE: 'Limousine',
  SLEEPER: 'Giường nằm',
  SLEEPER_BUS: 'Giường nằm',
  VIP: 'VIP',
  STANDARD: 'Tiêu chuẩn',
};

const AMENITY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  WiFi: { icon: Wifi, label: 'WiFi' },
  wifi: { icon: Wifi, label: 'WiFi' },
  'Air Conditioning': { icon: Wind, label: 'Điều hòa' },
  AC: { icon: Wind, label: 'Điều hòa' },
  ac: { icon: Wind, label: 'Điều hòa' },
  'Bottled Water': { icon: Droplet, label: 'Nước uống' },
  Water: { icon: Droplet, label: 'Nước uống' },
  water: { icon: Droplet, label: 'Nước uống' },
  'USB Charging': { icon: Bus, label: 'Sạc USB' },
  USB: { icon: Bus, label: 'Sạc USB' },
  usb: { icon: Bus, label: 'Sạc USB' },
};

interface AmenityObject {
  id: string;
  icon?: string;
  name: string;
}

function getAmenityKey(amenity: string | AmenityObject): string {
  if (typeof amenity === 'string') return amenity;
  return amenity.id || amenity.name;
}

function getAmenityDisplayName(amenity: string | AmenityObject): string {
  if (typeof amenity === 'string') return amenity;
  return amenity.name;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
}

function formatTime(time: string): string {
  try {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  } catch {
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
  }
  return time;
}

function getSeatStatus(available: number, total: number): { tone: string; label: string } {
  const percentage = (available / total) * 100;
  if (percentage <= 20) {
    return { tone: 'is-scarce', label: 'Sắp hết chỗ' };
  }
  if (percentage <= 50) {
    return { tone: 'is-limited', label: 'Còn ít chỗ' };
  }
  return { tone: 'is-plenty', label: 'Còn nhiều chỗ' };
}

export function SearchRouteCard({ route, onBook, className }: SearchRouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const detailsId = useId();

  const seatStatus = getSeatStatus(route.availableSeats, route.totalSeats);
  const operatorName = route.operator?.name ||
    (route.operator?.firstName && route.operator?.lastName
      ? `${route.operator.firstName} ${route.operator.lastName}`
      : 'Nhà xe');
  const busLabel = BUS_TYPE_LABELS[route.busType] ?? 'Tiêu chuẩn';

  const seatBadgeClasses =
    seatStatus.tone === 'is-scarce'
      ? 'border-destructive/25 bg-destructive/10 text-destructive'
      : seatStatus.tone === 'is-limited'
        ? 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        : 'border-emerald-500/25 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/45 hover:shadow-md',
        className
      )}
    >
      <CardWatermark variant="route-ribbon" position="bottom-right" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(200px,1.05fr)_minmax(290px,1.55fr)_224px]">
        {/* Zone 1: Operator, Bus Type, Rating & Amenities */}
        <div className="flex flex-col justify-between gap-3 p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-foreground">
                {operatorName}
              </span>
              {route.operator?.rating != null && route.operator.rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <Star size={12} className="fill-current" aria-hidden="true" />
                  <span>{route.operator.rating.toFixed(1)}</span>
                  {typeof route.operator.reviewCount === 'number' && route.operator.reviewCount > 0 && (
                    <span className="font-medium opacity-80">
                      ({route.operator.reviewCount})
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-primary/25 bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                {busLabel}
              </span>
              {route.name && (
                <h3 className="m-0 font-sans text-xs font-semibold text-muted-foreground line-clamp-1">
                  {route.name}
                </h3>
              )}
            </div>

            {route.description && (
              <p className="m-0 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {route.description}
              </p>
            )}
          </div>

          {route.amenities && route.amenities.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Tiện ích trên xe">
              {route.amenities.slice(0, 4).map((amenity, index) => {
                const amenityKey = getAmenityKey(amenity);
                const amenityDisplay = getAmenityDisplayName(amenity);
                const amenityConfig = AMENITY_ICONS[amenityKey];

                if (!amenityConfig) {
                  return (
                    <li
                      key={amenityKey + index}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {amenityDisplay}
                    </li>
                  );
                }

                const Icon = amenityConfig.icon;
                return (
                  <li
                    key={amenityKey + index}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    <Icon size={12} aria-hidden="true" />
                    {amenityConfig.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Zone 2: Bold Route Timeline */}
        <div className="flex flex-col justify-center border-t border-border/60 p-5 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="m-0 text-2xl font-black tracking-tight tabular-nums text-foreground">
                {formatTime(route.departureTime)}
              </p>
              <p className="mt-1 mb-0 truncate text-sm font-bold text-foreground">
                {route.origin}
              </p>
              {route.departureLocation && (
                <p className="mt-0.5 mb-0 truncate text-xs text-muted-foreground">
                  {route.departureLocation}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-1.5 px-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/70 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-foreground">
                <Clock size={11} className="text-primary" aria-hidden="true" />
                {formatDuration(route.duration)}
              </span>
              <div className="flex w-20 items-center gap-1 sm:w-28" aria-hidden="true">
                <span className="h-2 w-2 shrink-0 rounded-full border-2 border-primary bg-card" />
                <span className="h-[1.5px] flex-1 border-t border-dashed border-primary/50" />
                <Bus size={13} className="shrink-0 text-primary" />
                <span className="h-[1.5px] flex-1 border-t border-dashed border-primary/50" />
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              </div>
              {route.distance && (
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                  {route.distance} km
                </span>
              )}
            </div>

            <div className="min-w-0 text-right">
              <p className="m-0 text-2xl font-black tracking-tight tabular-nums text-foreground">
                {formatTime(route.arrivalTime)}
              </p>
              <p className="mt-1 mb-0 truncate text-sm font-bold text-foreground">
                {route.destination}
              </p>
              {route.arrivalLocation && (
                <p className="mt-0.5 mb-0 truncate text-xs text-muted-foreground">
                  {route.arrivalLocation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Zone 3: Boarding-Pass Ticket Stub */}
        <div className="relative flex flex-row items-center justify-between gap-3 border-t border-dashed border-border bg-muted/20 p-5 lg:flex-col lg:items-end lg:justify-between lg:border-l lg:border-t-0 lg:bg-transparent">
          {/* Subtle semi-circle ticket perforation notches on desktop */}
          <span
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-border bg-background"
          />
          <span
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full border border-border bg-background"
          />

          <div className="lg:text-right">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Giá mỗi ghế
            </p>
            <p className="mt-0.5 mb-0 text-2xl font-black tracking-tight tabular-nums text-primary">
              {formatCurrency(typeof route.price === 'string' ? parseFloat(route.price) : route.price)}
            </p>
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                seatBadgeClasses
              )}
            >
              <Users size={12} aria-hidden="true" />
              Còn {route.availableSeats}/{route.totalSeats} chỗ
            </span>
          </div>

          <Button
            type="button"
            onClick={() => {
              setIsBooking(true);
              onBook?.(route.id);
            }}
            disabled={isBooking}
            className="search-book-button inline-flex! h-10! items-center! justify-center! gap-1.5! rounded-xl! bg-primary! px-4! font-bold! text-primary-foreground! shadow-xs hover:bg-primary-deep! lg:w-full!"
          >
            {isBooking ? (
              <span className="search-book-loading">
                <span className="search-book-spinner" aria-hidden="true" />
                Đang xử lý...
              </span>
            ) : (
              <>
                <span>Chọn chỗ</span>
                <ArrowRight size={15} aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="search-details-toggle relative z-10 w-full! justify-center! border-t! border-border/70! bg-muted/25! py-2.5! text-xs! font-semibold! text-muted-foreground! transition-colors hover:bg-accent/50! hover:text-primary!"
      >
        <Info size={14} aria-hidden="true" />
        <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết điểm đón, trả & chính sách'}</span>
        {isExpanded ? (
          <ChevronUp size={14} aria-hidden="true" />
        ) : (
          <ChevronDown size={14} aria-hidden="true" />
        )}
      </button>

      <div id={detailsId} className="search-route-details relative z-10 px-5! pb-5!" hidden={!isExpanded}>
        {route.pickupPoints && route.pickupPoints.length > 0 && (
          <section className="search-details-section">
            <h4>
              <MapPin size={15} aria-hidden="true" />
              Điểm đón ({route.pickupPoints.length})
            </h4>
            <ul className="search-stop-list">
              {route.pickupPoints.map((point, index) => (
                <li key={point.id || index} className="search-stop-item">
                  <div>
                    <p className="search-stop-place">{point.location}</p>
                    <p className="search-stop-address">{point.address}</p>
                  </div>
                  <span className="search-stop-time">{formatTime(point.time)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {route.dropoffPoints && route.dropoffPoints.length > 0 && (
          <section className="search-details-section">
            <h4>
              <MapPin size={15} aria-hidden="true" />
              Điểm trả ({route.dropoffPoints.length})
            </h4>
            <ul className="search-stop-list">
              {route.dropoffPoints.map((point, index) => (
                <li key={point.id || index} className="search-stop-item">
                  <div>
                    <p className="search-stop-place">{point.location}</p>
                    <p className="search-stop-address">{point.address}</p>
                  </div>
                  <span className="search-stop-time">{formatTime(point.time)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {route.policies && (route.policies.luggage || route.policies.cancellation) && (
          <section className="search-details-section">
            <h4>Chính sách</h4>
            <div className="search-policy-list">
              {route.policies.luggage && (
                <div className="search-policy-item">
                  <p className="search-policy-title">Hành lý</p>
                  <p className="search-policy-text">{route.policies.luggage}</p>
                </div>
              )}
              {route.policies.cancellation && (
                <div className="search-policy-item">
                  <p className="search-policy-title">Hủy vé</p>
                  <p className="search-policy-text">{route.policies.cancellation}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {(route.licensePlate || route.operator?.totalTrips) && (
          <div className="search-details-extra">
            {route.licensePlate && (
              <span>Biển số: <strong>{route.licensePlate}</strong></span>
            )}
            {route.operator?.totalTrips && (
              <span>{route.operator.totalTrips.toLocaleString('vi-VN')} chuyến đi</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
