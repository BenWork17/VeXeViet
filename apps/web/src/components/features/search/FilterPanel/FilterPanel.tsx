'use client';

import * as React from 'react';
import { Checkbox, Slider, Button } from '@vexeviet/ui';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setFilters, resetFilters } from '@/store/slices/searchSlice';
import { cn } from '@/lib/utils';

export interface FilterPanelProps {
  priceRange?: { min: number; max: number };
  availableBusTypes?: string[];
  availableAmenities?: string[];
  className?: string;
}

const DEPARTURE_TIME_SLOTS = [
  { label: 'Sáng sớm (00:00 - 06:00)', value: 'morning', start: '00:00', end: '06:00', icon: '🌙' },
  { label: 'Buổi sáng (06:00 - 12:00)', value: 'afternoon', start: '06:00', end: '12:00', icon: '🌅' },
  { label: 'Buổi chiều (12:00 - 18:00)', value: 'evening', start: '12:00', end: '18:00', icon: '☀️' },
  { label: 'Buổi tối (18:00 - 24:00)', value: 'night', start: '18:00', end: '24:00', icon: '🌆' },
];

const DEFAULT_BUS_TYPES = ['STANDARD', 'VIP', 'LIMOUSINE', 'SLEEPER'];
const DEFAULT_AMENITIES = ['wifi', 'ac', 'toilet', 'water', 'blanket', 'massage-seat'];

const AMENITY_ICONS: Record<string, string> = {
  'wifi': '📶',
  'ac': '❄️',
  'toilet': '🚽',
  'water': '💧',
  'blanket': '🛏️',
  'massage-seat': '💆',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
}

export function FilterPanel({
  priceRange = { min: 0, max: 2000000 },
  availableBusTypes = DEFAULT_BUS_TYPES,
  availableAmenities = DEFAULT_AMENITIES,
  className = '',
}: FilterPanelProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.search.filters);

  const [localPriceRange, setLocalPriceRange] = React.useState<[number, number]>([
    filters.minPrice ?? priceRange.min,
    filters.maxPrice ?? priceRange.max,
  ]);

  const handlePriceChange = React.useCallback((value: number[]) => {
    if (value.length >= 2) {
      setLocalPriceRange([value[0]!, value[1]!]);
    }
  }, []);

  const debouncedPriceUpdate = React.useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (value: number[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (value.length >= 2) {
            dispatch(setFilters({
              minPrice: value[0],
              maxPrice: value[1],
            }));
          }
        }, 300);
      };
    },
    [dispatch]
  );

  const handlePriceCommit = React.useCallback(
    (value: number[]) => {
      if (value.length >= 2) {
        dispatch(setFilters({
          minPrice: value[0],
          maxPrice: value[1],
        }));
      }
    },
    [dispatch]
  );

  const handleBusTypeToggle = React.useCallback(
    (busType: string, checked: boolean) => {
      const currentTypes = filters.busTypes || [];
      const newTypes = checked
        ? [...currentTypes, busType]
        : currentTypes.filter((t) => t !== busType);
      
      dispatch(setFilters({
        busTypes: newTypes.length > 0 ? newTypes : undefined,
      }));
    },
    [dispatch, filters.busTypes]
  );

  const handleAmenityToggle = React.useCallback(
    (amenity: string, checked: boolean) => {
      const currentAmenities = filters.amenities || [];
      const newAmenities = checked
        ? [...currentAmenities, amenity]
        : currentAmenities.filter((a) => a !== amenity);
      
      dispatch(setFilters({
        amenities: newAmenities.length > 0 ? newAmenities : undefined,
      }));
    },
    [dispatch, filters.amenities]
  );

  const handleTimeSlotToggle = React.useCallback(
    (slot: typeof DEPARTURE_TIME_SLOTS[0], checked: boolean) => {
      if (checked) {
        dispatch(setFilters({
          departureTimeRange: {
            start: slot.start,
            end: slot.end,
          },
        }));
      } else {
        dispatch(setFilters({
          departureTimeRange: undefined,
        }));
      }
    },
    [dispatch]
  );

  const handleClearFilters = React.useCallback(() => {
    setLocalPriceRange([priceRange.min, priceRange.max]);
    dispatch(resetFilters());
  }, [dispatch, priceRange.min, priceRange.max]);

  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.busTypes && filters.busTypes.length > 0) ||
    (filters.amenities && filters.amenities.length > 0) ||
    filters.departureTimeRange !== undefined;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Bộ Lọc</h3>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={handleClearFilters}
            className="text-sm font-medium text-red-500 hover:text-red-600"
          >
            Xóa
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">💰</span>
            <h4 className="text-sm font-semibold text-gray-900">Khoảng Giá</h4>
          </div>
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={50000}
            value={localPriceRange}
            onValueChange={(value) => {
              handlePriceChange(value);
              debouncedPriceUpdate(value);
            }}
            onValueCommit={handlePriceCommit}
            className="w-full"
            aria-label="Bộ lọc khoảng giá"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
              {formatPrice(localPriceRange[0])}
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">
              {formatPrice(localPriceRange[1])}
            </span>
          </div>
        </div>

        {/* Departure Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🕐</span>
            <h4 className="text-sm font-semibold text-gray-900">Giờ Khởi Hành</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEPARTURE_TIME_SLOTS.map((slot) => {
              const isChecked = filters.departureTimeRange?.start === slot.start &&
                               filters.departureTimeRange?.end === slot.end;
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => handleTimeSlotToggle(slot, !isChecked)}
                  className={cn(
                    "p-2 rounded-lg text-left text-xs transition-all",
                    isChecked 
                      ? "bg-primary text-white" 
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <span className="block">{slot.icon} {slot.value === 'morning' ? 'Sáng sớm' : slot.value === 'afternoon' ? 'Buổi sáng' : slot.value === 'evening' ? 'Buổi chiều' : 'Buổi tối'}</span>
                  <span className={cn("text-[10px]", isChecked ? "text-white/70" : "text-gray-400")}>{slot.start} - {slot.end}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bus Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚌</span>
            <h4 className="text-sm font-semibold text-gray-900">Loại Xe</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableBusTypes.map((busType) => {
              const isChecked = filters.busTypes?.includes(busType) ?? false;
              const busIcon = busType === 'LIMOUSINE' ? '✨' : 
                              busType === 'VIP' ? '👑' : 
                              busType === 'SLEEPER' || busType === 'SLEEPER_BUS' ? '🛏️' : '🚐';
              const busLabel = busType === 'SLEEPER_BUS' ? 'Giường Nằm' : 
                               busType === 'SLEEPER' ? 'Giường Nằm' :
                               busType === 'LIMOUSINE' ? 'Limousine' :
                               busType === 'VIP' ? 'VIP' : 'Tiêu Chuẩn';
              return (
                <button
                  key={busType}
                  type="button"
                  onClick={() => handleBusTypeToggle(busType, !isChecked)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isChecked 
                      ? "bg-primary text-white" 
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  )}
                >
                  {busIcon} {busLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎁</span>
            <h4 className="text-sm font-semibold text-gray-900">Tiện Ích</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableAmenities.map((amenity) => {
              const isChecked = filters.amenities?.includes(amenity) ?? false;
              const icon = AMENITY_ICONS[amenity] || '✓';
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity, !isChecked)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-medium transition-all uppercase",
                    isChecked 
                      ? "bg-primary text-white" 
                      : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                  )}
                >
                  {icon} {amenity.replace('-', ' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
