'use client';

import * as React from 'react';
import { Slider } from '@vexeviet/ui';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setFilters, resetFilters } from '@/store/slices/searchSlice';
import { cn } from '@/lib/utils';
import { CardWatermark } from '@/components/brand';

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
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local slider state synced when filters are reset or updated externally
  React.useEffect(() => {
    setLocalPriceRange([
      filters.minPrice ?? priceRange.min,
      filters.maxPrice ?? priceRange.max,
    ]);
  }, [filters.minPrice, filters.maxPrice, priceRange.min, priceRange.max]);

  // Clean up pending debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  const handlePriceChange = React.useCallback((value: number[]) => {
    if (value.length >= 2) {
      setLocalPriceRange([value[0]!, value[1]!]);
    }
  }, []);

  const debouncedPriceUpdate = React.useCallback(
    (value: number[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        if (value.length >= 2) {
          dispatch(setFilters({
            minPrice: value[0],
            maxPrice: value[1],
          }));
        }
      }, 300);
    },
    [dispatch]
  );

  const handlePriceCommit = React.useCallback(
    (value: number[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
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
    <div
      className={cn(
        'group relative overflow-hidden filter-panel bg-card! border! border-border! rounded-2xl! p-5! shadow-xs',
        className
      )}
    >
      <CardWatermark variant="heritage-lattice" position="top-right" />

      <div className="relative z-10 space-y-4">
        <div className="filter-panel-header border-b! border-border! pb-3.5! mb-0!">
          <h3>Bộ lọc</h3>
          {hasActiveFilters && (
            <button type="button" onClick={handleClearFilters} className="filter-panel-clear">
              Xóa bộ lọc
            </button>
          )}
        </div>

        <fieldset className="filter-group border-b! border-border/70! pb-4!">
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
          <div className="filter-price-values gap-2!">
            <span className="rounded-lg border border-input bg-field px-2.5 py-1.5 text-xs font-semibold tabular-nums text-foreground">
              {formatPrice(localPriceRange[0])}
            </span>
            <span className="filter-price-separator" aria-hidden="true">đến</span>
            <span className="rounded-lg border border-input bg-field px-2.5 py-1.5 text-xs font-semibold tabular-nums text-foreground">
              {formatPrice(localPriceRange[1])}
            </span>
          </div>
        </fieldset>

        <fieldset className="filter-group border-b! border-border/70! pb-4!">
          <legend>Giờ khởi hành</legend>
          <div className="filter-toggles filter-toggles-two grid! grid-cols-2! gap-2!">
            {DEPARTURE_TIME_SLOTS.map((slot) => {
              const isChecked = filters.departureTimeRange?.start === slot.start &&
                filters.departureTimeRange?.end === slot.end;
              return (
                <button
                  key={slot.value}
                  type="button"
                  aria-pressed={isChecked}
                  onClick={() => handleTimeSlotToggle(slot, !isChecked)}
                  className={cn(
                    'filter-toggle filter-toggle-slot rounded-lg! border! px-2.5! py-2! text-left! transition-colors',
                    isChecked
                      ? 'is-active border-primary! bg-accent! text-accent-foreground! ring-1 ring-primary/20'
                      : 'border-input! bg-card! text-foreground! hover:border-primary/50! hover:bg-accent/50!'
                  )}
                >
                  <span className="filter-toggle-label block text-xs font-bold leading-tight">{slot.label}</span>
                  <span className="filter-toggle-meta mt-0.5 block whitespace-nowrap text-[11px] font-medium tabular-nums text-muted-foreground">
                    {slot.start} - {slot.end}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="filter-group border-b! border-border/70! pb-4!">
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
                  className={cn(
                    'filter-toggle rounded-lg! border! transition-colors',
                    isChecked
                      ? 'is-active border-primary! bg-accent! text-accent-foreground! ring-1 ring-primary/20'
                      : 'border-input! bg-card! text-foreground! hover:border-primary/50! hover:bg-accent/50!'
                  )}
                >
                  {BUS_TYPE_LABELS[busType] ?? busType}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="filter-group pb-0!">
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
                  className={cn(
                    'filter-toggle rounded-lg! border! transition-colors',
                    isChecked
                      ? 'is-active border-primary! bg-accent! text-accent-foreground! ring-1 ring-primary/20'
                      : 'border-input! bg-card! text-foreground! hover:border-primary/50! hover:bg-accent/50!'
                  )}
                >
                  {AMENITY_LABELS[amenity] ?? amenity.replace('-', ' ')}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
