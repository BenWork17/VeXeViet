'use client';

import { cn } from '@/lib/utils';

interface SeatConflictModalProps {
  isOpen: boolean;
  conflictedSeats: string[];
  onRefreshSeats: () => void;
  onClose: () => void;
  className?: string;
}

export function SeatConflictModal({ 
  isOpen, 
  conflictedSeats,
  onRefreshSeats,
  onClose,
  className 
}: SeatConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center",
          "animate-in fade-in zoom-in-95 duration-300",
          className
        )}
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-orange-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Ghế đã có người chọn
        </h2>
        
        {/* Description */}
        <p className="text-slate-600 mb-4 leading-relaxed">
          Rất tiếc, một số ghế bạn chọn vừa có người đặt trước:
        </p>
        
        {/* Conflicted Seats Display */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {conflictedSeats.map((seat) => (
            <span 
              key={seat}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-lg"
            >
              {seat}
            </span>
          ))}
        </div>
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3">
            <span className="text-blue-500 text-xl">ℹ️</span>
            <div className="text-sm text-blue-800">
              Sơ đồ ghế sẽ được cập nhật để hiển thị trạng thái mới nhất. 
              Vui lòng chọn ghế khác.
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={cn(
              "flex-1 py-3 rounded-xl font-semibold transition-all",
              "bg-slate-100 text-slate-700",
              "hover:bg-slate-200",
              "active:scale-[0.98]"
            )}
          >
            Đóng
          </button>
          <button
            onClick={onRefreshSeats}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold transition-all",
              "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
              "hover:from-blue-700 hover:to-blue-800",
              "shadow-lg shadow-blue-500/25",
              "active:scale-[0.98]"
            )}
          >
            Cập nhật sơ đồ
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatConflictModal;
