'use client';

import { useState } from 'react';
import { PaymentMethod } from '@/types/payment';
import { cn } from '@/lib/utils';

export interface PaymentFormProps {
  bookingId: string;
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
  logo: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'VNPAY',
    name: 'VNPAY',
    description: 'Thanh toán qua VNPAY',
    logo: '💳',
  },
  {
    id: 'MOMO',
    name: 'Momo',
    description: 'Ví điện tử Momo',
    logo: '🟣',
  },
  {
    id: 'ZALOPAY',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    logo: '🔵',
  },
  {
    id: 'CREDIT_CARD',
    name: 'Thẻ tín dụng',
    description: 'Thẻ quốc tế (Visa, Mastercard)',
    logo: '💳',
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
    <div className="mx-auto max-w-4xl space-y-6 text-slate-900 bg-white">
      {/* Summary Card */}
      <div className="rounded-lg border bg-slate-50 p-6 shadow-sm text-slate-900 border-slate-200">
        <h2 className="mb-4 text-xl font-bold text-slate-900 border-b pb-2 border-slate-200">Thông tin chuyến đi</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Tuyến đường:</span>
            <span className="font-bold text-slate-900 text-lg">
              {tripDetails.from} <span className="text-blue-500">→</span> {tripDetails.to}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Thời gian khởi hành:</span>
            <span className="font-bold text-slate-900">{formatDateTime(tripDetails.departureTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Loại xe:</span>
            <span className="font-bold text-slate-900 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{tripDetails.busType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Số hành khách:</span>
            <span className="font-bold text-slate-900">{passengerCount} người</span>
          </div>
          <div className="border-t pt-4 border-slate-300">
            <div className="flex justify-between items-center text-xl">
              <span className="font-bold text-slate-900 uppercase tracking-tight">Tổng cộng:</span>
              <span className="font-black text-blue-700 text-2xl">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm text-slate-900 border-slate-200">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Chọn phương thức thanh toán</h2>
          
          <div className="space-y-3" role="radiogroup" aria-label="Phương thức thanh toán">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-blue-600',
                  selectedMethod === method.id && 'border-blue-600 bg-blue-50',
                  isProcessing && 'cursor-not-allowed opacity-50'
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                  disabled={isProcessing}
                  className="h-4 w-4 accent-blue-600"
                  aria-label={method.name}
                />
                <div className="text-3xl" aria-hidden="true">
                  {method.logo}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{method.name}</div>
                  <div className="text-sm text-slate-500">{method.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedMethod || isProcessing}
          className={cn(
            'w-full rounded-lg py-4 text-lg font-bold transition-all shadow-md',
            selectedMethod && !isProcessing
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
          )}
          aria-label={`Thanh toán ${formatCurrency(amount)}`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Đang xử lý...
            </span>
          ) : (
            `Thanh toán ${formatCurrency(amount)}`
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <div className="flex gap-2">
          <span className="text-xl" aria-hidden="true">
            🔒
          </span>
          <div>
            <strong>Thanh toán an toàn:</strong> Bạn sẽ được chuyển đến cổng thanh toán của đối tác.
            Chúng tôi không lưu trữ thông tin thẻ của bạn.
          </div>
        </div>
      </div>
    </div>
  );
}
