'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModalFocus } from './useModalFocus';

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
  className,
}: SeatConflictModalProps) {
  const dialogRef = useModalFocus(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="booking-modal-layer">
      <button
        type="button"
        className="booking-modal-backdrop"
        aria-label="Đóng thông báo"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="seat-conflict-title"
        aria-describedby="seat-conflict-description"
        tabIndex={-1}
        className={cn('booking-modal', className)}
      >
        <span className="booking-modal-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </span>

        <h2 id="seat-conflict-title" className="booking-modal-title">
          Ghế đã có người chọn
        </h2>

        <p id="seat-conflict-description" className="booking-modal-text">
          Một số ghế bạn chọn vừa được người khác đặt trước:
        </p>

        <div className="booking-modal-seats" aria-label="Các ghế vừa được đặt">
          {conflictedSeats.map((seat) => (
            <span key={seat} className="booking-modal-seat">
              {seat}
            </span>
          ))}
        </div>

        <p className="booking-modal-note">
          Sơ đồ ghế sẽ được cập nhật để hiển thị trạng thái mới nhất. Vui lòng chọn ghế khác.
        </p>

        <div className="booking-modal-actions">
          <button type="button" onClick={onClose} className="booking-modal-secondary">
            Đóng
          </button>
          <button type="button" onClick={onRefreshSeats} className="booking-modal-primary">
            Cập nhật sơ đồ
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatConflictModal;
