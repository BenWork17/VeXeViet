'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Tuyệt vời',
};

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  showLabel?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

export function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  showLabel = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = !readOnly && hovered !== null ? hovered : value;

  if (readOnly || !onChange) {
    return (
      <div
        className={cn('inline-flex items-center gap-0.5', className)}
        aria-label={`Đánh giá ${value} trên 5 sao`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(displayValue);
          return (
            <Star
              key={star}
              aria-hidden="true"
              className={cn(
                SIZE_MAP[size],
                filled
                  ? 'fill-amber-400 text-amber-500'
                  : 'fill-transparent text-border'
              )}
            />
          );
        })}
        {showLabel && value > 0 ? (
          <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
            {RATING_LABELS[Math.round(value)] ?? ''}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex flex-col items-start gap-1.5', className)}>
      <div
        role="radiogroup"
        aria-label="Chọn số sao đánh giá"
        className="inline-flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} sao - ${RATING_LABELS[star]}`}
              onMouseEnter={() => setHovered(star)}
              onFocus={() => setHovered(star)}
              onBlur={() => setHovered(null)}
              onClick={() => onChange(star)}
              className="rounded-sm p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Star
                aria-hidden="true"
                className={cn(
                  SIZE_MAP[size],
                  'transition-colors duration-150',
                  active
                    ? 'fill-amber-400 text-amber-500'
                    : 'fill-transparent text-muted-foreground/40'
                )}
              />
            </button>
          );
        })}
      </div>
      {showLabel ? (
        <span className="text-sm font-semibold text-foreground">
          {displayValue > 0
            ? `${displayValue}/5 — ${RATING_LABELS[displayValue]}`
            : 'Chọn mức độ hài lòng của bạn'}
        </span>
      ) : null}
    </div>
  );
}
