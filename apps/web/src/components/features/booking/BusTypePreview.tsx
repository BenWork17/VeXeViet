'use client';

/**
 * BusTypePreview - Hiển thị preview loại xe và sơ đồ ghế
 * Dùng ở trang chi tiết chuyến xe trước khi vào trang chọn ghế
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Bed, 
  Armchair, 
  Sparkles, 
  Crown, 
  Star, 
  Wifi, 
  Tv, 
  Usb, 
  Coffee,
  Plug,
  Lamp,
  Snowflake,
  RotateCcw,
  Users
} from 'lucide-react';

export type BusType = 'STANDARD' | 'VIP' | 'LIMOUSINE' | 'SLEEPER';

interface BusTypePreviewProps {
  busType: BusType | string;
  totalSeats?: number;
  className?: string;
}

// Configuration for each bus type
const BUS_TYPE_CONFIG: Record<string, {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  amenities: { icon: React.ElementType; label: string }[];
  seatPreview: 'sleeper' | 'cabin' | 'limousine' | 'vip' | 'standard';
}> = {
  'SLEEPER': {
    name: 'Xe Giường Nằm',
    description: '2 tầng, giường nằm thoải mái',
    icon: Bed,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    amenities: [
      { icon: Bed, label: 'Giường nằm' },
      { icon: Snowflake, label: 'Điều hòa' },
      { icon: Wifi, label: 'Wifi' },
    ],
    seatPreview: 'sleeper',
  },
  'LIMOUSINE': {
    name: 'Limousine',
    description: 'Ghế massage cao cấp, không gian riêng tư',
    icon: Crown,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-200',
    amenities: [
      { icon: Tv, label: 'Màn hình' },
      { icon: Wifi, label: 'Wifi' },
      { icon: Coffee, label: 'Nước uống' },
      { icon: Usb, label: 'USB sạc' },
    ],
    seatPreview: 'limousine',
  },
  'VIP': {
    name: 'Ghế Ngồi VIP',
    description: 'Ghế rộng, có thể ngả',
    icon: Star,
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    amenities: [
      { icon: Snowflake, label: 'Điều hòa' },
      { icon: Wifi, label: 'Wifi' },
      { icon: RotateCcw, label: 'Ngả ghế' },
    ],
    seatPreview: 'vip',
  },
  'STANDARD': {
    name: 'Xe Ghế Ngồi',
    description: 'Tiêu chuẩn, giá phải chăng',
    icon: Armchair,
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    amenities: [
      { icon: Snowflake, label: 'Điều hòa' },
      { icon: Wifi, label: 'Wifi' },
    ],
    seatPreview: 'standard',
  },
};

// Mini seat preview components
function SleeperPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] text-slate-400 mb-1">Tầng trên</div>
      <div className="flex gap-1">
        <MiniSeat variant="sleeper" />
        <div className="w-2" />
        <MiniSeat variant="sleeper" />
        <div className="w-2" />
        <MiniSeat variant="sleeper" />
      </div>
      <div className="text-[10px] text-slate-400 mt-2 mb-1">Tầng dưới</div>
      <div className="flex gap-1">
        <MiniSeat variant="sleeper" />
        <div className="w-2" />
        <MiniSeat variant="sleeper" status="booked" />
        <div className="w-2" />
        <MiniSeat variant="sleeper" />
      </div>
    </div>
  );
}

function LimousinePreview() {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2, 3].map((row) => (
        <div key={row} className="flex gap-1 justify-center">
          <MiniSeat variant="limousine" status={row === 2 ? 'booked' : 'available'} />
          <div className="w-4" />
          <MiniSeat variant="limousine" />
        </div>
      ))}
    </div>
  );
}

function VIPPreview() {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2].map((row) => (
        <div key={row} className="flex gap-1 justify-center">
          <MiniSeat variant="vip" />
          <MiniSeat variant="vip" status={row === 1 ? 'booked' : 'available'} />
          <div className="w-3" />
          <MiniSeat variant="vip" />
          <MiniSeat variant="vip" />
        </div>
      ))}
    </div>
  );
}

function StandardPreview() {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2, 3].map((row) => (
        <div key={row} className="flex gap-1 justify-center">
          <MiniSeat variant="standard" />
          <MiniSeat variant="standard" status={row === 2 ? 'booked' : 'available'} />
          <div className="w-2" />
          <MiniSeat variant="standard" />
          <MiniSeat variant="standard" />
        </div>
      ))}
    </div>
  );
}

function CabinPreview() {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2].map((row) => (
        <div key={row} className="flex gap-1 justify-center">
          <MiniSeat variant="cabin" />
          <div className="w-3" />
          <MiniSeat variant="cabin" status={row === 1 ? 'booked' : 'available'} />
        </div>
      ))}
    </div>
  );
}

function MiniSeat({ 
  variant, 
  status = 'available' 
}: { 
  variant: 'sleeper' | 'cabin' | 'limousine' | 'vip' | 'standard';
  status?: 'available' | 'booked';
}) {
  const sizeClasses = {
    sleeper: 'w-6 h-8',
    cabin: 'w-7 h-9',
    limousine: 'w-6 h-7',
    vip: 'w-5 h-6',
    standard: 'w-4 h-5',
  };

  const colorClasses = {
    sleeper: status === 'booked' ? 'bg-slate-300' : 'bg-blue-100 border-blue-300',
    cabin: status === 'booked' ? 'bg-slate-300' : 'bg-purple-100 border-purple-300',
    limousine: status === 'booked' ? 'bg-slate-300' : 'bg-emerald-100 border-emerald-300',
    vip: status === 'booked' ? 'bg-slate-300' : 'bg-amber-100 border-amber-300',
    standard: status === 'booked' ? 'bg-slate-300' : 'bg-green-100 border-green-300',
  };

  return (
    <div 
      className={cn(
        'rounded border',
        sizeClasses[variant],
        colorClasses[variant],
        status === 'booked' && 'opacity-50'
      )} 
    />
  );
}

const PREVIEW_COMPONENTS: Record<string, React.ComponentType> = {
  sleeper: SleeperPreview,
  cabin: CabinPreview,
  limousine: LimousinePreview,
  vip: VIPPreview,
  standard: StandardPreview,
};

export function BusTypePreview({ busType, totalSeats, className }: BusTypePreviewProps) {
  const type = busType.toUpperCase();
  const config = BUS_TYPE_CONFIG[type] || BUS_TYPE_CONFIG['STANDARD'];
  const Icon = config.icon;
  const PreviewComponent = PREVIEW_COMPONENTS[config.seatPreview];

  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-md border-2 overflow-hidden',
      config.borderColor,
      className
    )}>
      {/* Header */}
      <div className={cn(
        'px-6 py-4 bg-gradient-to-r',
        config.bgGradient
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
            config.color,
            'bg-white'
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{config.name}</h3>
            <p className="text-sm text-slate-600">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex gap-6">
          {/* Seat preview */}
          <div className="flex-1">
            <div className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wide">
              Sơ đồ xe
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <PreviewComponent />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {totalSeats && (
              <div className="mb-4">
                <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">
                  Số chỗ
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  <span className="text-2xl font-bold text-slate-800">{totalSeats}</span>
                  <span className="text-slate-500">chỗ</span>
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">
                Tiện nghi
              </div>
              <div className="flex flex-wrap gap-2">
                {config.amenities.map((amenity, idx) => {
                  const AmenityIcon = amenity.icon;
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium',
                        'bg-gradient-to-r',
                        config.bgGradient,
                        config.color
                      )}
                    >
                      <AmenityIcon className="w-3.5 h-3.5" />
                      {amenity.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className={cn('w-4 h-4 rounded border', 
              type === 'SLEEPER' ? 'bg-blue-100 border-blue-300' :
              type === 'LIMOUSINE' ? 'bg-emerald-100 border-emerald-300' :
              type === 'VIP' ? 'bg-amber-100 border-amber-300' :
              'bg-green-100 border-green-300'
            )} />
            <span>Còn trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border bg-slate-300 opacity-50" />
            <span>Đã đặt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for cards/lists
export function BusTypeBadge({ busType, className }: { busType: BusType | string; className?: string }) {
  const type = busType.toUpperCase();
  const config = BUS_TYPE_CONFIG[type] || BUS_TYPE_CONFIG['STANDARD'];
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
      'bg-gradient-to-r',
      config.bgGradient,
      config.color,
      'border',
      config.borderColor,
      className
    )}>
      <Icon className="w-4 h-4" />
      {config.name}
    </div>
  );
}
