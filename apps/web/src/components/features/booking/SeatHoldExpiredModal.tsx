'use client';

import { Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModalFocus } from './useModalFocus';

interface SeatHoldExpiredModalProps {
  isOpen: boolean;
  onReturnToSeatSelection: () => void;
  className?: string;
}

export function SeatHoldExpiredModal({
  isOpen,
  onReturnToSeatSelection,
  className,
}: SeatHoldExpiredModalProps) {
  const dialogRef = useModalFocus(isOpen);

  if (!isOpen) return null;

  return (
    <div className="booking-modal-layer">
      <div className="booking-modal-backdrop" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="seat-hold-expired-title"
        aria-describedby="seat-hold-expired-description"
        tabIndex={-1}
        className={cn('booking-modal', className)}
      >
        <span className="booking-modal-icon is-expired" aria-hidden="true">
          <Clock3 size={22} />
        </span>

        <h2 id="seat-hold-expired-title" className="booking-modal-title">
          Hết thời gian giữ chỗ
        </h2>

        <p id="seat-hold-expired-description" className="booking-modal-text">
          Thời gian giữ chỗ của bạn đã hết. Ghế đã được tự động giải phóng để người khác có thể đặt.
        </p>

        <p className="booking-modal-note is-expired">
          <strong>Lưu ý:</strong> Hãy quay lại chọn ghế và hoàn tất thanh toán trong thời gian quy định
          để đảm bảo giữ chỗ thành công.
        </p>

        <div className="booking-modal-actions">
          <button
            type="button"
            onClick={onReturnToSeatSelection}
            className="booking-modal-primary"
          >
            Quay lại chọn ghế
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatHoldExpiredModal;
