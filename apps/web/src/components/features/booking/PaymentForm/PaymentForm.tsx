'use client';

import { useState } from 'react';
import { PaymentMethod } from '@/types/payment';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { CountdownTimer } from '../CountdownTimer';

export interface PaymentFormProps {
  bookingId: string;
  expiresAt?: string | Date;
  onExpire?: () => void;
  tripDetails: {
    from: string;
    to: string;
    departureTime: string;
    busType: string;
  };
  passengerCount: number;
  amount: number;
  onMethodSelect: (method: PaymentMethod) => void;
  isProcessing?: boolean;
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  badge: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'VNPAY',
    name: 'VNPAY',
    description: 'Thanh toán qua cổng VNPAY',
    badge: 'VP',
  },
  {
    id: 'MOMO',
    name: 'Momo',
    description: 'Ví điện tử Momo',
    badge: 'Mo',
  },
  {
    id: 'ZALOPAY',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    badge: 'Za',
  },
  {
    id: 'BANK_TRANSFER',
    name: 'Chuyển khoản ngân hàng',
    description: 'Thanh toán qua tài khoản ngân hàng',
    badge: 'NH',
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PaymentForm({
  bookingId,
  expiresAt,
  onExpire,
  tripDetails,
  passengerCount,
  amount,
  onMethodSelect,
  isProcessing = false,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod && !isProcessing) {
      onMethodSelect(selectedMethod);
    }
  };

  return (
    <div className="booking-payment">
      {expiresAt ? (
        <div className="booking-payment-countdown">
          <CountdownTimer expiresAt={expiresAt} onExpire={onExpire} />
        </div>
      ) : null}

      <div className="booking-trip-ledger">
        <div className="booking-panel-head">
          <h2 className="booking-section-title">Thông tin chuyến đi</h2>
          <p className="booking-panel-note">Mã giữ chỗ: {bookingId || '—'}</p>
        </div>

        <div className="booking-ledger-row">
          <span>Tuyến đường</span>
          <strong>
            {tripDetails.from} → {tripDetails.to}
          </strong>
        </div>
        <div className="booking-ledger-row">
          <span>Khởi hành</span>
          <strong>{formatDateTime(tripDetails.departureTime)}</strong>
        </div>
        <div className="booking-ledger-row">
          <span>Loại xe</span>
          <strong>{tripDetails.busType}</strong>
        </div>
        <div className="booking-ledger-row">
          <span>Số hành khách</span>
          <strong>{passengerCount} người</strong>
        </div>

        <div className="booking-ledger-total">
          <div>
            <p className="booking-summary-total-label">Tổng cộng</p>
            <p className="booking-summary-note">Đã bao gồm thuế và phí.</p>
          </div>
          <p className="booking-ledger-amount">{formatCurrency(amount)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-panel">
        <h2 className="booking-section-title">Chọn phương thức thanh toán</h2>
        <p className="booking-section-hint">
          Bạn sẽ được chuyển đến cổng thanh toán của đối tác sau khi xác nhận.
        </p>

        <div className="booking-pay-methods" role="radiogroup" aria-label="Phương thức thanh toán">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={cn(
                'booking-pay-option',
                selectedMethod === method.id && 'is-selected',
                isProcessing && 'is-disabled'
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                disabled={isProcessing}
                aria-label={method.name}
              />
              <span className="booking-pay-badge" aria-hidden="true">
                {method.badge}
              </span>
              <span className="booking-pay-copy">
                <span className="booking-pay-name">{method.name}</span>
                <span className="booking-pay-desc">{method.description}</span>
              </span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={!selectedMethod || isProcessing}
          aria-busy={isProcessing}
          aria-label={`Thanh toán ${formatCurrency(amount)}`}
          className="booking-action booking-pay-submit"
        >
          {isProcessing
            ? 'Đang chuyển đến cổng thanh toán…'
            : `Thanh toán ${formatCurrency(amount)}`}
        </button>

        <div className="booking-secure-note">
          <Lock size={18} aria-hidden="true" />
          <span>
            <strong>Thanh toán an toàn.</strong> Chúng tôi không lưu trữ thông tin thẻ của bạn.
          </span>
        </div>
      </form>
    </div>
  );
}
