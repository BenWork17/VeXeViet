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
  { label: 'Morning (00:00 - 06:00)', value: 'morning', start: '00:00', end: '06:00' },
  { label: 'Afternoon (06:00 - 12:00)', value: 'afternoon', start: '06:00', end: '12:00' },
  { label: 'Evening (12:00 - 18:00)', value: 'evening', start: '12:00', end: '18:00' },
  { label: 'Night (18:00 - 24:00)', value: 'night', start: '18:00', end: '24:00' },
];

const DEFAULT_BUS_TYPES = ['STANDARD', 'VIP', 'LIMOUSINE'];
const DEFAULT_AMENITIES = ['wifi', 'ac', 'toilet', 'water', 'blanket', 'massage-seat'];

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
    <div className={`bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-100 p-6 space-y-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b-2 border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Bộ Lọc
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Khoảng Giá
        </h4>
        <div className="space-y-3">
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
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {formatPrice(localPriceRange[0])}
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {formatPrice(localPriceRange[1])}
            </span>
          </div>
        </div>
      </div>

      {/* Departure Time */}
      <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
          Giờ Khởi Hành
        </h4>
        <div className="space-y-2">
          {DEPARTURE_TIME_SLOTS.map((slot) => {
            const isChecked = filters.departureTimeRange?.start === slot.start &&
                             filters.departureTimeRange?.end === slot.end;
            return (
              <div 
                key={slot.value} 
                className={cn(
                  "rounded-md p-2 transition-all duration-200 border border-transparent",
                  isChecked 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "hover:bg-gray-50"
                )}
              >
                <Checkbox
                  id={`time-${slot.value}`}
                  label={slot.label}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleTimeSlotToggle(slot, checked as boolean)
                  }
                  aria-label={`Lọc theo ${slot.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bus Type */}
      <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
          Loại Xe
        </h4>
        <div className="space-y-2">
          {availableBusTypes.map((busType) => {
            const isChecked = filters.busTypes?.includes(busType) ?? false;
            return (
              <div 
                key={busType} 
                className={cn(
                  "rounded-md p-2 transition-all duration-200 border border-transparent",
                  isChecked 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "hover:bg-gray-50"
                )}
              >
                <Checkbox
                  id={`bus-${busType}`}
                  label={busType}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleBusTypeToggle(busType, checked as boolean)
                  }
                  aria-label={`Lọc theo loại xe ${busType}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
          Tiện Ích
        </h4>
        <div className="space-y-2">
          {availableAmenities.map((amenity) => {
            const isChecked = filters.amenities?.includes(amenity) ?? false;
            return (
              <div 
                key={amenity} 
                className={cn(
                  "rounded-md p-2 transition-all duration-200 border border-transparent",
                  isChecked 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "hover:bg-gray-50"
                )}
              >
                <Checkbox
                  id={`amenity-${amenity}`}
                  label={amenity.replace('-', ' ').toUpperCase()}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleAmenityToggle(amenity, checked as boolean)
                  }
                  aria-label={`Lọc theo tiện ích ${amenity}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
