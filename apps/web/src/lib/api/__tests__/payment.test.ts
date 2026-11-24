import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import apiClient from '../client';
import { initiatePayment } from '../payment';

describe('Payment API client (initiatePayment)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unwraps nested payment payload and returns redirect URL + transactionId', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=TX123',
          transactionId: 'TX123',
        },
      },
    });

    const result = await initiatePayment('booking-1', 'VNPAY', 350000);
    expect(result).toEqual({
      success: true,
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=TX123',
      transactionId: 'TX123',
    });
  });

  it('normalises backend error envelope via parseApiError and attaches requestId/code/status', async () => {
    const headers = new AxiosHeaders({ 'x-request-id': 'req-pay-901' });
    const axiosErr = new AxiosError(
      'Request failed with status code 409',
      'ERR_BAD_REQUEST',
      { headers },
      null,
      {
        data: {
          success: false,
          error: {
            code: 'BOOKING_EXPIRED',
            message: 'Đơn đặt vé đã hết hạn thanh toán',
          },
          requestId: 'req-pay-901',
        },
        status: 409,
        statusText: 'Conflict',
        headers,
        config: { headers },
      },
    );

    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(axiosErr);

    await expect(initiatePayment('booking-expired', 'VNPAY', 250000)).rejects.toMatchObject({
      message: 'Đơn đặt vé đã hết hạn thanh toán (Mã tham chiếu: req-pay-901)',
      code: 'BOOKING_EXPIRED',
      requestId: 'req-pay-901',
      status: 409,
    });
  });
});
