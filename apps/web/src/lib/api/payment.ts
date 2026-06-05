import {
  InitiatePaymentResponse,
  PaymentMethod,
  PaymentStatusPollingResponse,
} from '@/types/payment';
import { mockInitiatePayment } from './mock/payment';
import apiClient from './client';
import { API_ENDPOINTS } from '@vexeviet/types';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_PAYMENT === 'true';

/**
 * Create payment and get redirect URL
 * POST /api/v1/payments
 * 
 * Backend response: { success, data: { paymentId, paymentUrl, transactionId, expiredAt } }
 * FE action: redirect browser to paymentUrl (VNPay gateway)
 * After payment: VNPay → Backend verify → redirect FE to /payment/result?success=...
 */
export async function initiatePayment(
  bookingId: string,
  paymentMethod: PaymentMethod,
  amount: number,
  bankCode?: string
): Promise<InitiatePaymentResponse> {
  // Note: returnUrl is configured on backend via FRONTEND_PAYMENT_RESULT_URL env variable
  // Backend sẽ redirect user về: {FRONTEND_PAYMENT_RESULT_URL}?success=true&status=COMPLETED&...

  if (USE_MOCK_API) {
    console.log('🔧 Using Mock Payment API');
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

    // Backend response: { success, data: { paymentId, paymentUrl, transactionId, expiredAt } }
    const paymentData = data.data || data;

    return {
      success: true,
      paymentUrl: paymentData.paymentUrl,
      transactionId: paymentData.transactionId || paymentData.paymentId || bookingId,
    };
  } catch (error: unknown) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string }; statusText?: string } };
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.statusText || 'Unknown error';
      throw new Error(`Lỗi khởi tạo thanh toán: ${errorMessage}`);
    }

    throw error;
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
