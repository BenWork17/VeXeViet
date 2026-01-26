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

// Enhanced color variants with more vibrant colors
const VARIANT_STYLES = {
  default: {
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    bgGradient: 'from-blue-50 to-cyan-50',
    glow: 'shadow-blue-500/30',
    accent: 'bg-blue-500',
    accentHover: 'bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    ring: 'ring-blue-400/30',
  },
  blue: {
    gradient: 'from-indigo-600 via-blue-500 to-sky-400',
    bgGradient: 'from-indigo-50 to-sky-50',
    glow: 'shadow-indigo-500/30',
    accent: 'bg-indigo-500',
    accentHover: 'bg-indigo-600',
    light: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    ring: 'ring-indigo-400/30',
  },
  amber: {
    gradient: 'from-amber-500 via-orange-500 to-red-400',
    bgGradient: 'from-amber-50 to-orange-50',
    glow: 'shadow-amber-500/30',
    accent: 'bg-amber-500',
    accentHover: 'bg-amber-600',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    ring: 'ring-amber-400/30',
  },
  emerald: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
    bgGradient: 'from-emerald-50 to-teal-50',
    glow: 'shadow-emerald-500/30',
    accent: 'bg-emerald-500',
    accentHover: 'bg-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    ring: 'ring-emerald-400/30',
  },
  violet: {
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
    bgGradient: 'from-violet-50 to-fuchsia-50',
    glow: 'shadow-violet-500/30',
    accent: 'bg-violet-500',
    accentHover: 'bg-violet-600',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
    ring: 'ring-violet-400/30',
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

// Animated Bus Icon Component
function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 6h8M6 6h.01M18 6h.01M6 10h12M9 14H6m12 0h-3M7 18v2m10-2v2M5 14V6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2z"
      />
    </svg>
  )
}

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn('w-3 h-3', i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200')}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-gray-600 ml-1">{rating.toFixed(1)}</span>
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
  const [isHovered, setIsHovered] = React.useState(false)
  const variantStyle = VARIANT_STYLES[variant]

  const handleSelect = () => onSelect(route.id)
  const handleCompareToggle = () => onCompare?.(route.id)

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

  return (
    <div
      className={cn(
        'group relative bg-white rounded-3xl overflow-hidden cursor-pointer',
        'border-2 border-transparent',
        'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        'hover:border-2',
        isHovered && variantStyle.border,
        isHovered && `shadow-2xl ${variantStyle.glow}`,
        isHovered && 'scale-[1.02] -translate-y-2',
        !isHovered && 'shadow-lg shadow-gray-200/50',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* === ANIMATED BACKGROUND ELEMENTS === */}
      
      {/* Gradient Background that slides in */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
          variantStyle.bgGradient,
          isHovered && 'opacity-100'
        )}
      />

      {/* Animated circles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute -right-20 -top-20 w-40 h-40 rounded-full',
            'bg-gradient-to-br opacity-0 blur-3xl transition-all duration-700',
            variantStyle.gradient,
            isHovered && 'opacity-20 scale-150'
          )}
        />
        <div
          className={cn(
            'absolute -left-10 -bottom-10 w-32 h-32 rounded-full',
            'bg-gradient-to-tr opacity-0 blur-2xl transition-all duration-700 delay-100',
            variantStyle.gradient,
            isHovered && 'opacity-15 scale-125'
          )}
        />
      </div>

      {/* Shine sweep effect */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent',
          '-translate-x-full skew-x-12 transition-transform duration-1000',
          isHovered && 'translate-x-full'
        )}
      />

      {/* === MAIN CONTENT === */}
      <div className="relative z-10">
        {/* Top Section: Gradient Header with Route Info */}
        <div
          className={cn(
            'relative px-5 py-4 transition-all duration-500',
            isHovered && `bg-gradient-to-r ${variantStyle.gradient}`
          )}
        >
          {/* Pattern overlay when hovered */}
          <div
            className={cn(
              'absolute inset-0 opacity-0 transition-opacity duration-500',
              "bg-[url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E\")]",
              isHovered && 'opacity-100'
            )}
          />

          <div className="relative flex items-center justify-between">
            {/* Left: Operator Info */}
            <div className="flex items-center gap-3">
              {/* Animated Logo */}
              <div className="relative">
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl transition-all duration-500',
                    'bg-gradient-to-br opacity-0 blur-md',
                    variantStyle.gradient,
                    isHovered && 'opacity-60 scale-110'
                  )}
                />
                <img
                  src={operatorLogo}
                  alt={operatorName}
                  className={cn(
                    'relative w-14 h-14 rounded-2xl object-cover',
                    'border-2 border-white shadow-md',
                    'transition-all duration-500',
                    isHovered && 'scale-110 rotate-3 shadow-xl'
                  )}
                />
                {/* Availability badge */}
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full',
                    'flex items-center justify-center text-[8px] font-black text-white',
                    'transition-all duration-300 shadow-lg',
                    route.availableSeats <= 5
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-green-500',
                    isHovered && 'scale-125'
                  )}
                >
                  {route.availableSeats}
                </div>
              </div>

              <div>
                <h3
                  className={cn(
                    'text-base font-black transition-colors duration-300',
                    isHovered ? 'text-white' : 'text-gray-900'
                  )}
                >
                  {operatorName}
                </h3>
                <div className={cn('transition-opacity duration-300', isHovered && 'opacity-0 h-0')}>
                  {operatorRating > 0 && <StarRating rating={operatorRating} />}
                </div>
                <div
                  className={cn(
                    'flex items-center gap-2 transition-all duration-300 overflow-hidden',
                    isHovered ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0'
                  )}
                >
                  <span className="text-xs font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                    {vehicleTypeDisplay || 'Xe khách'}
                  </span>
                  {operatorRating > 0 && (
                    <span className="text-xs font-bold text-white/90">⭐ {operatorRating.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Compare checkbox */}
            {showCompare && (
              <label
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer',
                  'transition-all duration-300',
                  isHovered
                    ? 'bg-white/20 text-white'
                    : isComparing
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isComparing}
                  onChange={handleCompareToggle}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs font-bold">So sánh</span>
              </label>
            )}
          </div>
        </div>

        {/* Middle Section: Journey Timeline */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-4">
            {/* Departure */}
            <div className="flex-1 text-center">
              <div
                className={cn(
                  'text-3xl font-black tracking-tight transition-all duration-300',
                  variantStyle.text,
                  isHovered && 'scale-110'
                )}
              >
                {departureTimeFormatted}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                {departureCity}
              </div>
            </div>

            {/* Timeline Visual */}
            <div className="flex-1 relative py-3">
              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
              
              {/* Animated progress line */}
              <div
                className={cn(
                  'absolute top-1/2 left-0 h-1 rounded-full -translate-y-1/2',
                  'bg-gradient-to-r transition-all duration-700 ease-out',
                  variantStyle.gradient,
                  isHovered ? 'w-full' : 'w-0'
                )}
              />

              {/* Departure dot */}
              <div
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2',
                  'transition-all duration-300',
                  variantStyle.accent,
                  'border-white shadow-md',
                  isHovered && 'scale-125'
                )}
              />

              {/* Center: Bus icon with animation */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    'transition-all duration-500 shadow-lg',
                    isHovered
                      ? `bg-gradient-to-br ${variantStyle.gradient} text-white`
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  )}
                >
                  <BusIcon
                    className={cn(
                      'w-5 h-5 transition-transform duration-500',
                      isHovered && 'animate-bounce'
                    )}
                  />
                </div>
                {/* Duration label */}
                <div
                  className={cn(
                    'absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap',
                    'text-[10px] font-black uppercase tracking-wider',
                    'transition-colors duration-300',
                    variantStyle.text
                  )}
                >
                  {duration}
                </div>
              </div>

              {/* Arrival dot */}
              <div
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2',
                  'transition-all duration-300 delay-200',
                  variantStyle.accent,
                  'border-white shadow-md',
                  isHovered && 'scale-125'
                )}
              />
            </div>

            {/* Arrival */}
            <div className="flex-1 text-center">
              <div
                className={cn(
                  'text-3xl font-black tracking-tight transition-all duration-300',
                  variantStyle.text,
                  isHovered && 'scale-110'
                )}
              >
                {arrivalTimeFormatted}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                {arrivalCity}
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Row - Scrollable tags */}
        {route.amenities && route.amenities.length > 0 && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {route.amenities.map((amenity, index) => (
                <span
                  key={amenity}
                  className={cn(
                    'shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide',
                    'transition-all duration-300 border',
                    isHovered
                      ? `${variantStyle.light} ${variantStyle.text} ${variantStyle.border}`
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  )}
                  style={{
                    transitionDelay: isHovered ? `${index * 50}ms` : '0ms',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section: Price & CTA */}
        <div
          className={cn(
            'px-5 py-4 flex items-center justify-between gap-4',
            'border-t-2 border-dashed transition-colors duration-300',
            isHovered ? variantStyle.border : 'border-gray-100'
          )}
        >
          {/* Seats & Price */}
          <div className="flex items-center gap-4">
            {/* Seats indicator */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl',
                'transition-all duration-300',
                route.availableSeats <= 5
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600',
                isHovered && (route.availableSeats <= 5 ? 'bg-red-100' : 'bg-green-100')
              )}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    'absolute inline-flex h-full w-full rounded-full opacity-75',
                    route.availableSeats <= 5 ? 'bg-red-400 animate-ping' : 'bg-green-400'
                  )}
                />
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    route.availableSeats <= 5 ? 'bg-red-500' : 'bg-green-500'
                  )}
                />
              </span>
              <span className="text-xs font-black">{route.availableSeats} chỗ trống</span>
            </div>

            {/* Price */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Giá từ</div>
              <div
                className={cn(
                  'text-2xl font-black transition-all duration-300',
                  variantStyle.text,
                  isHovered && 'scale-105'
                )}
              >
                {priceFormatted}
                <span className="text-sm">₫</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSelect()
            }}
            className={cn(
              'relative px-6 py-3 rounded-2xl font-black text-sm overflow-hidden',
              'transition-all duration-500 shadow-lg',
              'flex items-center gap-2',
              isHovered
                ? `bg-gradient-to-r ${variantStyle.gradient} text-white shadow-xl ${variantStyle.glow} scale-105`
                : 'bg-gray-900 text-white hover:bg-gray-800'
            )}
          >
            {/* Button shine */}
            <span
              className={cn(
                'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
                '-translate-x-full skew-x-12 transition-transform duration-700',
                isHovered && 'translate-x-full'
              )}
            />
            <span className="relative">Đặt vé ngay</span>
            <svg
              className={cn(
                'relative w-5 h-5 transition-transform duration-300',
                isHovered && 'translate-x-1 animate-pulse'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-1.5 transition-all duration-500',
          'bg-gradient-to-r',
          variantStyle.gradient,
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}
