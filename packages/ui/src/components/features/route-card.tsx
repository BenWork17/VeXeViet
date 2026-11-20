import * as React from 'react'
import type { Route } from '@vexeviet/types'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export interface RouteCardProps {
  route: Route
  onSelect: (routeId: string) => void
  showCompare?: boolean
  onCompare?: (routeId: string) => void
  isComparing?: boolean
  className?: string
  /** Visual variant for different color schemes */
  variant?: 'default' | 'blue' | 'amber' | 'emerald' | 'violet'
}

const VARIANT_STYLES = {
  default: {
    accentBar: 'bg-primary',
    text: 'text-primary',
    badge: 'bg-accent text-accent-foreground border-primary/20',
    borderHover: 'hover:border-primary/60',
  },
  blue: {
    accentBar: 'bg-sky-600 dark:bg-sky-400',
    text: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    borderHover: 'hover:border-sky-500/60',
  },
  amber: {
    accentBar: 'bg-amber-600 dark:bg-amber-400',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    borderHover: 'hover:border-amber-500/60',
  },
  emerald: {
    accentBar: 'bg-emerald-600 dark:bg-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/60',
  },
  violet: {
    accentBar: 'bg-violet-600 dark:bg-violet-400',
    text: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    borderHover: 'hover:border-violet-500/60',
  },
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins}p`
}

function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return numPrice.toLocaleString('vi-VN')
}

function formatTime(timeString: string): string {
  if (!timeString) return '--:--'
  if (/^\d{2}:\d{2}$/.test(timeString)) return timeString
  try {
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }
  } catch {
    // Fallback
  }
  return timeString
}

function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 6h8M6 6h.01M18 6h.01M6 10h12M9 14H6m12 0h-3M7 18v2m10-2v2M5 14V6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2z"
      />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Đánh giá ${rating.toFixed(1)} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn('h-3.5 w-3.5', i < Math.floor(rating) ? 'text-amber-500' : 'text-border-strong')}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

export function RouteCard({
  route,
  onSelect,
  showCompare = false,
  onCompare,
  isComparing = false,
  className,
  variant = 'default',
}: RouteCardProps) {
  const variantStyle = VARIANT_STYLES[variant]

  const handleSelect = () => onSelect(route.id)
  const handleCompareToggle = () => onCompare?.(route.id)

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  const operatorName =
    route.operator?.name ??
    (route.operator?.firstName && route.operator?.lastName
      ? `${route.operator.firstName} ${route.operator.lastName}`
      : null) ??
    route.name ??
    'Nhà xe'
  const operatorLogo = route.operator?.logo ?? '/images/default-operator.png'
  const operatorRating = route.operator?.rating ?? 0
  const duration =
    typeof route.duration === 'number' ? formatDuration(route.duration) : route.duration
  const departureTimeFormatted = formatTime(route.departureTime)
  const arrivalTimeFormatted = formatTime(route.arrivalTime)
  const departureCity = route.origin ?? route.departureCity ?? route.departureLocation ?? ''
  const arrivalCity = route.destination ?? route.arrivalCity ?? route.arrivalLocation ?? ''
  const vehicleType = route.busType ?? route.vehicleType ?? ''
  const vehicleTypeDisplay = vehicleType.replace('_', ' ')
  const priceFormatted = formatPrice(route.price)
  const isLowSeats = route.availableSeats <= 5

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Chọn chuyến ${operatorName} từ ${departureCity} đến ${arrivalCity}, khởi hành ${departureTimeFormatted}, giá ${priceFormatted} đồng`}
      onKeyDown={handleCardKeyDown}
      onClick={handleSelect}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-hn',
        'transition-[border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none',
        'hover:-translate-y-0.5 hover:shadow-hn-md motion-reduce:hover:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variantStyle.borderHover,
        className
      )}
    >
      {/* Top accent strip */}
      <div
        className={cn(
          'h-1 w-full opacity-75 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none',
          variantStyle.accentBar
        )}
      />

      {/* Top Section: Operator Info */}
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={operatorLogo}
              alt={operatorName}
              className="h-12 w-12 rounded-xl border border-border object-cover shadow-hn-sm"
            />
            <span
              className={cn(
                'absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm',
                isLowSeats ? 'bg-destructive' : 'bg-success'
              )}
              title={`${route.availableSeats} chỗ trống`}
            >
              {route.availableSeats}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-card-foreground">{operatorName}</h3>
              {vehicleTypeDisplay && (
                <span
                  className={cn(
                    'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    variantStyle.badge
                  )}
                >
                  {vehicleTypeDisplay}
                </span>
              )}
            </div>
            {operatorRating > 0 && (
              <div className="mt-1">
                <StarRating rating={operatorRating} />
              </div>
            )}
          </div>
        </div>

        {showCompare && (
          <label
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none',
              isComparing
                ? 'border-primary/40 bg-accent text-accent-foreground'
                : 'border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isComparing}
              onChange={handleCompareToggle}
              className="h-4 w-4 rounded border-border-strong accent-primary"
            />
            <span>So sánh</span>
          </label>
        )}
      </div>

      {/* Middle Section: Journey Timeline */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <div className={cn('text-2xl font-extrabold tracking-tight sm:text-3xl', variantStyle.text)}>
              {departureTimeFormatted}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {departureCity}
            </div>
          </div>

          <div className="relative flex-1 py-3">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-border" />
            <div
              className={cn(
                'absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-card',
                variantStyle.accentBar
              )}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-hn-sm transition-colors duration-200 group-hover:border-primary/50 group-hover:text-primary motion-reduce:transition-none">
                <BusIcon className="h-4 w-4" />
              </div>
              <div
                className={cn(
                  'absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider',
                  variantStyle.text
                )}
              >
                {duration}
              </div>
            </div>
            <div
              className={cn(
                'absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-card',
                variantStyle.accentBar
              )}
            />
          </div>

          <div className="flex-1 text-center">
            <div className={cn('text-2xl font-extrabold tracking-tight sm:text-3xl', variantStyle.text)}>
              {arrivalTimeFormatted}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {arrivalCity}
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Row */}
      {route.amenities && route.amenities.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {route.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Price & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-border px-5 py-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold',
              isLowSeats ? 'bg-error-soft text-error-ink' : 'bg-success-soft text-success-ink'
            )}
          >
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                isLowSeats ? 'bg-destructive' : 'bg-success'
              )}
              aria-hidden="true"
            />
            <span>{route.availableSeats} chỗ trống</span>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Giá từ
            </div>
            <div className={cn('text-xl font-extrabold sm:text-2xl', variantStyle.text)}>
              {priceFormatted}
              <span className="ml-0.5 text-sm">₫</span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="md"
          onClick={(e) => {
            e.stopPropagation()
            handleSelect()
          }}
          className="gap-2"
        >
          <span>Đặt vé ngay</span>
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Button>
      </div>
    </div>
  )
}
