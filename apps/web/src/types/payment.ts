export type PaymentMethod = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'CREDIT_CARD';

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

export interface PaymentResultParams {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  bookingId?: string;
  message?: string;
}
