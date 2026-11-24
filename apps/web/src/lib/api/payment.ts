import {
  InitiatePaymentResponse,
  PaymentMethod,
  PaymentStatusPollingResponse,
} from '@/types/payment';
import { mockInitiatePayment } from './mock/payment';
import apiClient, { parseApiError } from './client';
import { API_ENDPOINTS } from '@vexeviet/types';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_PAYMENT === 'true';

/**
 * Create payment and get redirect URL
 * POST /api/v1/payments
 */
export async function initiatePayment(
  bookingId: string,
  paymentMethod: PaymentMethod,
  amount: number,
  _bankCode?: string
): Promise<InitiatePaymentResponse> {
  if (USE_MOCK_API) {
    const returnUrl = `${window.location.origin}/payment/result`;
    return mockInitiatePayment({
      bookingId,
      paymentMethod,
      amount,
      returnUrl,
    });
  }

  try {
    const { data } = await apiClient.post(API_ENDPOINTS.PAYMENTS_CREATE, {
      bookingId,
      amount,
      method: paymentMethod,
      language: 'vn',
    });

    const paymentData = data.data || data;

    return {
      success: true,
      paymentUrl: paymentData.paymentUrl,
      transactionId: paymentData.transactionId || paymentData.paymentId || bookingId,
    };
  } catch (error: unknown) {
    const parsed = parseApiError(error);
    const reqSuffix = parsed.requestId ? ` (Mã tham chiếu: ${parsed.requestId})` : '';
    const wrapped = new Error(`${parsed.message}${reqSuffix}`) as Error & {
      code?: string;
      requestId?: string;
      status?: number;
    };
    wrapped.code = parsed.code;
    wrapped.requestId = parsed.requestId;
    wrapped.status = parsed.status;
    throw wrapped;
  }
}

/**
 * Get payment status by ID
 * GET /api/v1/payments/:paymentId
 */
export async function getPaymentStatus(paymentId: string) {
  const { data } = await apiClient.get(API_ENDPOINTS.PAYMENTS_BY_ID(paymentId));
  return data.data || data;
}

export async function getPaymentStatusByTransactionRef(
  transactionRef: string
): Promise<PaymentStatusPollingResponse> {
  const { data } = await apiClient.get(API_ENDPOINTS.PAYMENTS_STATUS, {
    params: { transactionRef },
  });

  return data.data || data;
}
