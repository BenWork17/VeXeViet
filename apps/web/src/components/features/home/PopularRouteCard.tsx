'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@vexeviet/ui';
import { formatCurrency } from '@/lib/utils';
import type { Route } from '@vexeviet/types';

// Bus type labels constant
const BUS_TYPE_LABELS: Record<string, string> = {
  'LIMOUSINE': 'Limousine',
  'SLEEPER_BUS': 'Giường nằm',
  'STANDARD': 'Tiêu chuẩn',
  'VIP': 'VIP',
  'SLEEPER': 'Giường nằm'
};

// Color variants for cards
const CARD_VARIANTS = [
  { gradient: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/20' },
  { gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
  { gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  { gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20' },
];

interface PopularRouteCardProps {
  route: Route;
  index: number;
}

export const PopularRouteCard = memo(({ route, index }: PopularRouteCardProps) => {
  const price = typeof route.price === 'string' ? parseFloat(route.price) : route.price;
  const formattedPrice = formatCurrency(price);
  const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];
  
  return (
    <Link
      href={`/routes/${route.id}`}
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-2xl",
        "border border-gray-100",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      {/* Animated Gradient Header */}
      <div className={cn(
        "relative h-24 bg-gradient-to-r p-4 overflow-hidden",
        variant.gradient
      )}>
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]" />
        </div>
        
        {/* Moving Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        
        {/* Route Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {BUS_TYPE_LABELS[route.busType] || 'Xe khách'}
          </span>
        </div>

        {/* Bus Icon with Animation */}
        <div className="absolute bottom-3 left-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>

        {/* Available Seats Indicator */}
        {route.availableSeats > 0 && (
          <div className="absolute bottom-3 right-4 flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[10px] font-bold text-white">{route.availableSeats} chỗ trống</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Route Cities */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary/30" />
              <div className="w-0.5 h-8 bg-gradient-to-b from-primary via-primary/50 to-secondary" />
              <div className="w-3 h-3 rounded-full bg-secondary border-2 border-secondary/30" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Điểm đi</span>
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                  {route.origin}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Điểm đến</span>
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                  {route.destination}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Info Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {route.duration && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-[10px] font-medium text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {Math.floor(route.duration / 60)}h{route.duration % 60 > 0 ? `${route.duration % 60}m` : ''}
            </span>
          )}
          {route.distance && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-[10px] font-medium text-gray-600">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {route.distance}km
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Giá từ</span>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-gray-900">
                {formattedPrice.replace('₫', '').replace(/\s/g, '')}
              </span>
              <span className="text-sm font-semibold text-gray-500 ml-0.5">₫</span>
            </div>
          </div>
          
          {/* CTA Arrow with Magnetic Effect */}
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-white",
            "bg-gradient-to-br transition-all duration-300",
            "group-hover:scale-110 group-hover:shadow-lg",
            variant.gradient,
            variant.glow
          )}>
            <svg 
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        "shadow-[0_0_60px_-15px] -z-10",
        variant.glow
      )} />
    </Link>
  );
});

PopularRouteCard.displayName = 'PopularRouteCard';
