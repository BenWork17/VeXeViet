import { InitiatePaymentRequest, InitiatePaymentResponse, PaymentMethod } from '@/types/payment';
import { mockInitiatePayment } from './mock/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_PAYMENT === 'true';

export async function initiatePayment(
  bookingId: string,
  paymentMethod: PaymentMethod,
  amount: number
): Promise<InitiatePaymentResponse> {
  const returnUrl = `${window.location.origin}/booking/payment/result`;

  const requestBody: InitiatePaymentRequest = {
    bookingId,
    paymentMethod,
    amount,
    returnUrl,
  };

  // Use mock API in development or when explicitly enabled
  if (USE_MOCK_API || process.env.NODE_ENV === 'development') {
    console.log('🔧 Using Mock Payment API');
    return mockInitiatePayment(requestBody);
  }

  const response = await fetch(`${API_BASE_URL}/payment/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Payment initiation failed: ${response.statusText}`);
  }

  const data: InitiatePaymentResponse = await response.json();
  return data;
}
