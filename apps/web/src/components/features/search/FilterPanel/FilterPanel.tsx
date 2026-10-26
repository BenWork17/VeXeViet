'use client';

import * as React from 'react';
import { Slider } from '@vexeviet/ui';
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
  { label: 'Sáng sớm', value: 'morning', start: '00:00', end: '06:00' },
  { label: 'Buổi sáng', value: 'afternoon', start: '06:00', end: '12:00' },
  { label: 'Buổi chiều', value: 'evening', start: '12:00', end: '18:00' },
  { label: 'Buổi tối', value: 'night', start: '18:00', end: '24:00' },
];

const DEFAULT_BUS_TYPES = ['STANDARD', 'VIP', 'LIMOUSINE', 'SLEEPER'];
const DEFAULT_AMENITIES = ['wifi', 'ac', 'toilet', 'water', 'blanket', 'massage-seat'];

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  ac: 'Điều hòa',
  toilet: 'Nhà vệ sinh',
  water: 'Nước uống',
  blanket: 'Chăn',
  'massage-seat': 'Ghế massage',
};

const BUS_TYPE_LABELS: Record<string, string> = {
  STANDARD: 'Tiêu chuẩn',
  VIP: 'VIP',
  LIMOUSINE: 'Limousine',
  SLEEPER: 'Giường nằm',
  SLEEPER_BUS: 'Giường nằm',
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
    <div className={cn('filter-panel', className)}>
      <div className="filter-panel-header">
        <h3>Bộ lọc</h3>
        {hasActiveFilters && (
          <button type="button" onClick={handleClearFilters} className="filter-panel-clear">
            Xóa bộ lọc
          </button>
        )}
      </div>

      <fieldset className="filter-group">
        <legend>Khoảng giá</legend>
        <Slider
          min={priceRange.min}
          max={priceRange.max}
          step={50000}
          value={localPriceRange}
          onValueChange={(value: number[]) => {
            handlePriceChange(value);
            debouncedPriceUpdate(value);
          }}
          onValueCommit={handlePriceCommit}
          className="w-full"
          aria-label="Bộ lọc khoảng giá"
        />
        <div className="filter-price-values">
          <span>{formatPrice(localPriceRange[0])}</span>
          <span className="filter-price-separator" aria-hidden="true">đến</span>
          <span>{formatPrice(localPriceRange[1])}</span>
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Giờ khởi hành</legend>
        <div className="filter-toggles filter-toggles-two">
          {DEPARTURE_TIME_SLOTS.map((slot) => {
            const isChecked = filters.departureTimeRange?.start === slot.start &&
              filters.departureTimeRange?.end === slot.end;
            return (
              <button
                key={slot.value}
                type="button"
                aria-pressed={isChecked}
                onClick={() => handleTimeSlotToggle(slot, !isChecked)}
                className={cn('filter-toggle filter-toggle-slot', isChecked && 'is-active')}
              >
                <span className="filter-toggle-label">{slot.label}</span>
                <span className="filter-toggle-meta">{slot.start} - {slot.end}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Loại xe</legend>
        <div className="filter-toggles">
          {availableBusTypes.map((busType) => {
            const isChecked = filters.busTypes?.includes(busType) ?? false;
            return (
              <button
                key={busType}
                type="button"
                aria-pressed={isChecked}
                onClick={() => handleBusTypeToggle(busType, !isChecked)}
                className={cn('filter-toggle', isChecked && 'is-active')}
              >
                {BUS_TYPE_LABELS[busType] ?? busType}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Tiện ích</legend>
        <div className="filter-toggles">
          {availableAmenities.map((amenity) => {
            const isChecked = filters.amenities?.includes(amenity) ?? false;
            return (
              <button
                key={amenity}
                type="button"
                aria-pressed={isChecked}
                onClick={() => handleAmenityToggle(amenity, !isChecked)}
                className={cn('filter-toggle', isChecked && 'is-active')}
              >
                {AMENITY_LABELS[amenity] ?? amenity.replace('-', ' ')}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
