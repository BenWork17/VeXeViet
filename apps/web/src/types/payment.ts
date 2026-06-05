export type PaymentMethod = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'CASH';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface InitiatePaymentRequest {
  bookingId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  returnUrl: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  paymentUrl: string;
  transactionId: string;
}

// Params received from backend VNPay redirect
export interface VNPayResultParams {
  success: boolean;
  status: PaymentStatus;
  paymentId: string;
  transactionId: string;
  bankCode: string;
  message: string;
  responseCode: string;
}

// Internal payment result used in UI
export interface PaymentResultParams {
  success: boolean;
  status: PaymentStatus;
  paymentId?: string;
  transactionId?: string;
  bankCode?: string;
  message?: string;
  responseCode?: string;
  bookingId?: string;
}

export interface PaymentStatusPollingResponse {
  paymentId: string;
  bookingId: string;
  transactionRef: string;
  status: PaymentStatus;
  isFinal: boolean;
  paidAt: string | null;
  expiredAt: string | null;
}
