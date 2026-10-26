'use client';

import { useId, useState } from 'react';
import {
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
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

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

  return (
    <article className={cn('search-route-card', className)}>
      <div className="search-route-card-head">
        <div className="search-operator">
          <span className="search-operator-name">{operatorName}</span>
          {route.operator?.rating !== undefined && (
            <span className="search-operator-rating">
              <Star size={13} aria-hidden="true" />
              {route.operator.rating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="route-type-badge">{busLabel}</span>
      </div>

      {route.name && <h3 className="search-route-card-name">{route.name}</h3>}
      {route.description && (
        <p className="search-route-card-description">{route.description}</p>
      )}

      <div className="search-route-path">
        <div className="search-route-leg">
          <p className="search-route-leg-label">
            <span className="search-route-dot search-route-dot-origin" aria-hidden="true" />
            Điểm đi
          </p>
          <p className="search-route-leg-city">{route.origin}</p>
          <p className="search-route-leg-time">{formatTime(route.departureTime)}</p>
          {route.departureLocation && (
            <p className="search-route-leg-place">{route.departureLocation}</p>
          )}
        </div>

        <div className="search-route-middle">
          <div className="search-route-track" aria-hidden="true">
            <span className="search-route-track-line" />
            <Bus size={14} />
          </div>
          <p className="search-route-duration">
            <Clock size={13} aria-hidden="true" />
            {formatDuration(route.duration)}
            {route.distance && <span>{route.distance} km</span>}
          </p>
        </div>

        <div className="search-route-leg search-route-leg-arrival">
          <p className="search-route-leg-label">
            <span className="search-route-dot search-route-dot-arrival" aria-hidden="true" />
            Điểm đến
          </p>
          <p className="search-route-leg-city">{route.destination}</p>
          <p className="search-route-leg-time">{formatTime(route.arrivalTime)}</p>
          {route.arrivalLocation && (
            <p className="search-route-leg-place">{route.arrivalLocation}</p>
          )}
        </div>
      </div>

      {route.amenities && route.amenities.length > 0 && (
        <ul className="search-route-amenities" aria-label="Tiện ích trên xe">
          {route.amenities.map((amenity, index) => {
            const amenityKey = getAmenityKey(amenity);
            const amenityDisplay = getAmenityDisplayName(amenity);
            const amenityConfig = AMENITY_ICONS[amenityKey];

            if (!amenityConfig) {
              return (
                <li key={amenityKey + index} className="search-amenity-chip">
                  {amenityDisplay}
                </li>
              );
            }

            const Icon = amenityConfig.icon;
            return (
              <li key={amenityKey + index} className="search-amenity-chip">
                <Icon size={13} aria-hidden="true" />
                {amenityConfig.label}
              </li>
            );
          })}
        </ul>
      )}

      <div className="search-route-card-footer">
        <div className={cn('search-seat', seatStatus.tone)}>
          <Users size={15} aria-hidden="true" />
          <div>
            <p className="search-seat-label">{seatStatus.label}</p>
            <p className="search-seat-count">
              Còn {route.availableSeats}/{route.totalSeats} chỗ
            </p>
          </div>
        </div>

        <div className="search-route-booking">
          <div className="search-price">
            <p className="search-price-label">Từ</p>
            <p className="search-price-value">
              {formatCurrency(typeof route.price === 'string' ? parseFloat(route.price) : route.price)}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setIsBooking(true);
              onBook?.(route.id);
            }}
            disabled={isBooking}
            className="search-book-button"
          >
            {isBooking ? (
              <span className="search-book-loading">
                <span className="search-book-spinner" aria-hidden="true" />
                Đang xử lý...
              </span>
            ) : (
              'Đặt vé'
            )}
          </Button>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="search-details-toggle"
      >
        <Info size={15} aria-hidden="true" />
        <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'}</span>
        {isExpanded ? (
          <ChevronUp size={15} aria-hidden="true" />
        ) : (
          <ChevronDown size={15} aria-hidden="true" />
        )}
      </button>

      <div id={detailsId} className="search-route-details" hidden={!isExpanded}>
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
