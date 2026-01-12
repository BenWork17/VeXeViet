import * as React from 'react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
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

function formatDuration(departureTime: string, arrivalTime: string): string {
  const departure = parseISO(departureTime);
  const arrival = parseISO(arrivalTime);
  const minutes = differenceInMinutes(arrival, departure);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
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

  const handleSelect = () => {
    onSelect(route.id);
  };

  const handleCompareToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCompare) {
      onCompare(route.id);
    }
  };

  const duration = formatDuration(route.departureTime, route.arrivalTime);
  const departureTimeFormatted = format(parseISO(route.departureTime), 'HH:mm');
  const arrivalTimeFormatted = format(parseISO(route.arrivalTime), 'HH:mm');

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={route.operatorLogo}
                alt={route.operatorName}
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{route.operatorName}</h3>
                <StarRating rating={route.operatorRating} />
              </div>
            </div>
            {showCompare && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isComparing}
                  onChange={handleCompareToggle}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Compare</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{departureTimeFormatted}</div>
              <div className="text-sm text-gray-600">{route.origin.city}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-sm text-gray-600">{duration}</div>
              <div className="w-full h-px bg-gray-300 my-1"></div>
              <div className="text-xs text-gray-500">{route.busType}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{arrivalTimeFormatted}</div>
              <div className="text-sm text-gray-600">{route.destination.city}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {route.availableSeats} seats available
              </span>
              {route.amenities.length > 0 && (
                <div className="flex items-center gap-1">
                  {route.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                    >
                      {amenity}
                    </span>
                  ))}
                  {route.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">+{route.amenities.length - 3}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {isExpanded && (
            <div className="pt-3 border-t border-gray-200 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {route.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Cancellation Policy</h4>
                <p className="text-sm text-gray-600">{route.cancellationPolicy}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Pickup Points</h4>
                <div className="space-y-1">
                  {route.pickupPoints.map((point) => (
                    <div key={point.id} className="text-sm text-gray-600">
                      {point.time} - {point.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(route.price)}
            </div>
            <div className="text-sm text-gray-600">{route.currency}</div>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSelect}
            className="w-full"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
