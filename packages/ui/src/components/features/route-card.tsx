import * as React from 'react';
import type { Route } from '@vexeviet/types';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface RouteCardProps {
  route: Route;
  onSelect: (routeId: string) => void;
  showCompare?: boolean;
  onCompare?: (routeId: string) => void;
  isComparing?: boolean;
  className?: string;
}

// Helper to format duration from minutes
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}p`;
}

function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('vi-VN');
}

// Format ISO datetime or HH:mm to display time
function formatTime(timeString: string): string {
  if (!timeString) return '--:--';
  
  // If already in HH:mm format
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // If ISO datetime format (e.g., "2026-02-15T08:00:00.000Z")
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
  } catch {
    // Fallback
  }
  
  return timeString;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'text-sm',
            i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'
          )}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export function RouteCard({
  route,
  onSelect,
  showCompare = false,
  onCompare,
  isComparing = false,
  className,
}: RouteCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSelect = () => {
    onSelect(route.id);
  };

  const handleCompareToggle = () => {
    if (onCompare) {
      onCompare(route.id);
    }
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 1500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsExpanded(false);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Extract operator info (handles both old and new format)
  const operatorName = route.operator?.name 
    ?? (route.operator?.firstName && route.operator?.lastName 
        ? `${route.operator.firstName} ${route.operator.lastName}` 
        : null)
    ?? route.name 
    ?? 'Nhà xe';
  const operatorLogo = route.operator?.logo ?? '/images/default-operator.png';
  const operatorRating = route.operator?.rating ?? 0;

  // Duration - BE returns number (minutes), format it
  const duration = typeof route.duration === 'number' 
    ? formatDuration(route.duration) 
    : route.duration;

  // Time formatting - BE may return ISO datetime or HH:mm
  const departureTimeFormatted = formatTime(route.departureTime);
  const arrivalTimeFormatted = formatTime(route.arrivalTime);

  // City names - API uses origin/destination, fallback to departureCity/arrivalCity
  const departureCity = route.origin ?? route.departureCity ?? route.departureLocation ?? '';
  const arrivalCity = route.destination ?? route.arrivalCity ?? route.arrivalLocation ?? '';

  // Vehicle type display - API uses busType
  const vehicleType = route.busType ?? route.vehicleType ?? '';
  const vehicleTypeDisplay = vehicleType.replace('_', ' ');
  
  // Price - may be string from DB
  const priceFormatted = formatPrice(route.price);

  return (
    <div
      className={cn(
        'group bg-white rounded-[2.5rem] border-4 transition-all duration-500 p-6 md:p-8 cursor-pointer',
        'shadow-[0_10px_30px_rgba(0,0,0,0.05)]',
        'hover:shadow-[0_25px_70px_rgba(139,0,0,0.2)]',
        'hover:-translate-y-2 hover:scale-[1.01]',
        isExpanded 
          ? 'border-primary bg-primary/5 shadow-[0_25px_70px_rgba(139,0,0,0.2)] -translate-y-2' 
          : 'border-gray-200 hover:border-primary',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSelect}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                <img
                  src={operatorLogo}
                  alt={operatorName}
                  className="w-16 h-16 rounded-2xl object-cover relative z-10 border border-gray-100"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{operatorName}</h3>
                {operatorRating > 0 && <StarRating rating={operatorRating} />}
              </div>
            </div>
            {showCompare && (
              <label 
                className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isComparing}
                  onChange={handleCompareToggle}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">So sánh</span>
              </label>
            )}
          </div>

          <div className="flex items-center justify-between bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
            <div className="text-center space-y-1">
              <div className="text-3xl font-black text-gray-900 tracking-tighter">{departureTimeFormatted}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{departureCity}</div>
            </div>
            
            <div className="flex-1 px-8 flex flex-col items-center">
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{duration}</div>
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,0,0,0.5)]" />
              </div>
              <div className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">{vehicleTypeDisplay}</div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-3xl font-black text-gray-900 tracking-tighter">{arrivalTimeFormatted}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{arrivalCity}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-xs font-bold text-gray-600 bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse" />
                Còn {route.availableSeats} chỗ
              </div>
              {route.amenities && route.amenities.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  {route.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-[10px] font-bold px-3 py-1 bg-white border border-gray-100 rounded-full text-gray-500 uppercase tracking-tighter"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="pt-6 border-t border-gray-100 animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Tiện ích</h4>
                <div className="flex flex-wrap gap-2">
                  {route.amenities?.map((amenity) => (
                    <span
                      key={amenity}
                      className="text-[10px] font-bold px-3 py-1 bg-primary/5 text-primary rounded-full uppercase tracking-tighter"
                    >
                      {amenity}
                    </span>
                  )) ?? <span className="text-sm text-gray-400">Không có thông tin</span>}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Điểm đón</h4>
                <div className="space-y-3">
                  {route.pickupPoints?.map((point, index) => (
                    <div key={point.id ?? index} className="flex items-center text-sm text-gray-500 group/point">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/30 mr-3 group-hover/point:bg-primary transition-colors" />
                      <span className="font-bold text-gray-700 mr-2">{point.time}</span>
                      <span className="font-medium">{point.name ?? point.location ?? point.address}</span>
                    </div>
                  )) ?? <span className="text-sm text-gray-400">Không có thông tin</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 lg:min-w-[200px] lg:pl-8 lg:border-l lg:border-gray-100">
          <div className="text-left lg:text-right space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Giá vé từ</span>
            <div className="text-4xl font-black text-primary tracking-tighter italic">
              {priceFormatted}<span className="text-xl not-italic ml-1">₫</span>
            </div>
          </div>
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            className="rounded-2xl px-10 h-14 text-lg font-bold shadow-[0_10px_20px_-5px_rgba(139,0,0,0.3)] group-hover:shadow-[0_20px_40px_-10px_rgba(139,0,0,0.4)] transition-all"
          >
            Chọn vé
          </Button>
        </div>
      </div>
    </div>
  );
}
