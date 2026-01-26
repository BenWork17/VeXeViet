'use client';

import { cn } from '@/lib/utils';

interface SeatHoldExpiredModalProps {
  isOpen: boolean;
  onReturnToSeatSelection: () => void;
  className?: string;
}

export function SeatHoldExpiredModal({ 
  isOpen, 
  onReturnToSeatSelection,
  className 
}: SeatHoldExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center",
          "animate-in fade-in zoom-in-95 duration-300",
          className
        )}
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Hết thời gian giữ chỗ
        </h2>
        
        {/* Description */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          Rất tiếc, thời gian giữ chỗ của bạn đã hết hạn. 
          Ghế đã được tự động giải phóng để người khác có thể đặt.
        </p>
        
        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3">
            <span className="text-amber-500 text-xl">💡</span>
            <div className="text-sm text-amber-800">
              <strong>Lưu ý:</strong> Vui lòng quay lại chọn ghế và hoàn tất thanh toán 
              trong thời gian quy định để đảm bảo giữ chỗ thành công.
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={onReturnToSeatSelection}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-lg transition-all",
            "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
            "hover:from-blue-700 hover:to-blue-800",
            "shadow-lg shadow-blue-500/25",
            "active:scale-[0.98]"
          )}
        >
          Quay lại chọn ghế
        </button>
      </div>
    </div>
  );
}

export default SeatHoldExpiredModal;
