export type PaymentMethod = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'CREDIT_CARD';

export type PaymentStatus = 'COMPLETED' | 'FAILED' | 'CANCELLED';

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
  // Legacy fields
  bookingId?: string;
}
