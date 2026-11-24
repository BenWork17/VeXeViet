import { PaymentMethod, InitiatePaymentRequest, InitiatePaymentResponse } from '../types/payment';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function initiatePayment(
  bookingId: string,
  paymentMethod: PaymentMethod,
  amount: number
): Promise<InitiatePaymentResponse> {
  const returnUrl = 'vexeviet://payment-result';

  const requestBody: InitiatePaymentRequest = {
    bookingId,
    paymentMethod,
    amount,
    returnUrl,
  };

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
