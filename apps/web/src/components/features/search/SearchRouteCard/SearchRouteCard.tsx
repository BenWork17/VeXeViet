'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar,
  Route as RouteIcon,
  Info,
  Building2,
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

// Bus type configuration with colors and labels
const BUS_TYPE_CONFIG: Record<string, {
  label: string;
  gradient: string;
  bg: string;
  border: string;
  text: string;
}> = {
  LIMOUSINE: {
    label: 'Limousine',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
  },
  SLEEPER: {
    label: 'Giường Nằm',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  SLEEPER_BUS: {
    label: 'Giường Nằm',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  VIP: {
    label: 'VIP',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  STANDARD: {
    label: 'Tiêu Chuẩn',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
};

// Amenity icons mapping
const AMENITY_ICONS: Record<string, { icon: React.ComponentType<{ size?: number }>; label: string }> = {
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

// Type for amenity from API (can be string or object)
interface AmenityObject {
  id: string;
  icon?: string;
  name: string;
}

// Helper to normalize amenity to string key
function getAmenityKey(amenity: string | AmenityObject): string {
  if (typeof amenity === 'string') return amenity;
  return amenity.id || amenity.name;
}

// Helper to get amenity display name
function getAmenityDisplayName(amenity: string | AmenityObject): string {
  if (typeof amenity === 'string') return amenity;
  return amenity.name;
}

// Format duration (minutes to hours + minutes)
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
}

// Format time (HH:mm from ISO or time string)
function formatTime(time: string): string {
  try {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
  } catch {
    // If not a valid date, check if it's already HH:mm format
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
  }
  return time;
}

// Get seat availability status
function getSeatStatus(available: number, total: number): { color: string; label: string; percentage: number } {
  const percentage = (available / total) * 100;
  if (percentage <= 20) {
    return { color: 'text-red-600', label: 'Sắp hết chỗ', percentage };
  }
  if (percentage <= 50) {
    return { color: 'text-orange-600', label: 'Còn ít chỗ', percentage };
  }
  return { color: 'text-green-600', label: 'Còn nhiều chỗ', percentage };
}

export function SearchRouteCard({ route, onBook, className }: SearchRouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const busConfig = BUS_TYPE_CONFIG[route.busType] || BUS_TYPE_CONFIG.STANDARD;
  const seatStatus = getSeatStatus(route.availableSeats, route.totalSeats);
  const operatorName = route.operator?.name || 
                       (route.operator?.firstName && route.operator?.lastName 
                         ? `${route.operator.firstName} ${route.operator.lastName}` 
                         : 'Nhà xe');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300',
        'hover:shadow-xl hover:border-blue-200',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header: Route name, operator, bus type */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{operatorName}</span>
              {route.operator?.rating && (
                <span className="text-xs text-amber-600">
                  ⭐ {route.operator.rating.toFixed(1)}
                </span>
              )}
            </div>
            {route.name && (
              <h3 className="text-lg font-bold text-gray-900">{route.name}</h3>
            )}
            {route.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{route.description}</p>
            )}
          </div>

          {/* Bus type badge */}
          <div className={cn('px-3 py-1 rounded-full text-xs font-semibold', busConfig.bg, busConfig.text)}>
            {busConfig.label}
          </div>
        </div>

        {/* Main Route Info */}
        <div className="flex items-center gap-6">
          {/* Departure */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">{route.origin}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(route.departureTime)}</div>
            {route.departureLocation && (
              <div className="text-xs text-gray-500">{route.departureLocation}</div>
            )}
          </div>

          {/* Progress line */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-full">
              <motion.div
                className="h-1 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className={cn('h-full bg-gradient-to-r', busConfig.gradient)}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </motion.div>
              <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(route.duration)}</span>
              {route.distance && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>{route.distance} km</span>
                </>
              )}
            </div>
          </div>

          {/* Arrival */}
          <div className="flex-1 space-y-2 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-medium text-gray-700">{route.destination}</span>
              <MapPin className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(route.arrivalTime)}</div>
            {route.arrivalLocation && (
              <div className="text-xs text-gray-500">{route.arrivalLocation}</div>
            )}
          </div>
        </div>

        {/* Amenities */}
        {route.amenities && route.amenities.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {route.amenities.map((amenity, index) => {
              const amenityKey = getAmenityKey(amenity);
              const amenityDisplay = getAmenityDisplayName(amenity);
              const amenityConfig = AMENITY_ICONS[amenityKey];
              if (!amenityConfig) {
                return (
                  <span key={amenityKey + index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {amenityDisplay}
                  </span>
                );
              }
              const Icon = amenityConfig.icon;
              return (
                <div
                  key={amenityKey + index}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                >
                  <Icon size={14} />
                  <span>{amenityConfig.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom row: Seats, Price, CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Seat availability */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="space-y-1">
              <div className={cn('text-sm font-semibold', seatStatus.color)}>
                {seatStatus.label}
              </div>
              <div className="text-xs text-gray-500">
                Còn {route.availableSeats}/{route.totalSeats} chỗ
              </div>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Từ</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(typeof route.price === 'string' ? parseFloat(route.price) : route.price)}
              </div>
            </div>
            <Button
              onClick={() => onBook?.(route.id)}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold text-white shadow-md',
                'bg-gradient-to-r transition-all duration-300',
                busConfig.gradient,
                'hover:shadow-lg hover:shadow-blue-500/50'
              )}
            >
              Đặt vé
            </Button>
          </div>
        </div>

        {/* Expandable section toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 pt-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Info className="w-4 h-4" />
          <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden border-t border-gray-100"
          >
            <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
              {/* Pickup Points */}
              {route.pickupPoints && route.pickupPoints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Điểm đón ({route.pickupPoints.length})
                  </h4>
                  <div className="space-y-2">
                    {route.pickupPoints.map((point, idx) => (
                      <motion.div
                        key={point.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{point.location}</div>
                          <div className="text-xs text-gray-600">{point.address}</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">{formatTime(point.time)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropoff Points */}
              {route.dropoffPoints && route.dropoffPoints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Điểm trả ({route.dropoffPoints.length})
                  </h4>
                  <div className="space-y-2">
                    {route.dropoffPoints.map((point, idx) => (
                      <motion.div
                        key={point.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{point.location}</div>
                          <div className="text-xs text-gray-600">{point.address}</div>
                        </div>
                        <div className="text-sm font-semibold text-red-600">{formatTime(point.time)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              {route.policies && (route.policies.luggage || route.policies.cancellation) && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <RouteIcon className="w-4 h-4 text-amber-600" />
                    Chính sách
                  </h4>
                  <div className="space-y-2">
                    {route.policies.luggage && (
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-900 mb-1">Hành lý</div>
                        <div className="text-xs text-gray-600">{route.policies.luggage}</div>
                      </div>
                    )}
                    {route.policies.cancellation && (
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-900 mb-1">Hủy vé</div>
                        <div className="text-xs text-gray-600">{route.policies.cancellation}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(route.licensePlate || route.operator?.totalTrips) && (
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  {route.licensePlate && (
                    <div>Biển số: <span className="font-medium">{route.licensePlate}</span></div>
                  )}
                  {route.operator?.totalTrips && (
                    <div>{route.operator.totalTrips.toLocaleString('vi-VN')} chuyến đi</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
