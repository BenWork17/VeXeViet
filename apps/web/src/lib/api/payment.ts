import { InitiatePaymentResponse, PaymentMethod } from '@/types/payment';
import { mockInitiatePayment } from './mock/payment';
import apiClient from './client';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_PAYMENT === 'true';

export async function initiatePayment(
  bookingId: string,
  paymentMethod: PaymentMethod,
  amount: number,
  bankCode?: string
): Promise<InitiatePaymentResponse> {
  // Note: returnUrl is configured on backend via FRONTEND_PAYMENT_RESULT_URL env variable
  // Backend sẽ redirect user về: {FRONTEND_PAYMENT_RESULT_URL}?success=true&status=COMPLETED&...

  // Use mock API when explicitly enabled
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
    // Sử dụng apiClient (axios) - đã có interceptor xử lý auth token + refresh token
    const { data } = await apiClient.post('/payments/vnpay/create-payment', {
      bookingId,
      amount,
      bankCode: bankCode || '',
      language: 'vn',
    });

    return {
      success: true,
      paymentUrl: data.paymentUrl || data.url || data.data?.paymentUrl,
      transactionId: data.transactionId || data.orderId || data.data?.transactionId || bookingId,
    };
  } catch (error: unknown) {
    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }

    // Axios error with response
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string }; statusText?: string } };
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.statusText || 'Unknown error';
      throw new Error(`Lỗi khởi tạo thanh toán: ${errorMessage}`);
    }

    throw error;
  }
}
