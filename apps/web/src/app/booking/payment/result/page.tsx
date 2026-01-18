'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentResultParams } from '@/types/payment';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentResultParams | null>(null);

  useEffect(() => {
    // Parse payment result from query params
    // Different gateways use different parameter names
    const vnpStatus = searchParams.get('vnp_TransactionStatus');
    const momoStatus = searchParams.get('resultCode');
    const zaloStatus = searchParams.get('status');
    const transactionId = searchParams.get('transactionId') || searchParams.get('vnp_TxnRef');
    const bookingId = searchParams.get('bookingId');

    let status: 'success' | 'failed' | 'pending' = 'failed';

    // VNPAY: 00 = success
    if (vnpStatus === '00') {
      status = 'success';
    }
    // Momo: 0 = success
    else if (momoStatus === '0') {
      status = 'success';
    }
    // ZaloPay: 1 = success
    else if (zaloStatus === '1') {
      status = 'success';
    }

    setResult({
      status,
      transactionId: transactionId || undefined,
      bookingId: bookingId || undefined,
      message: searchParams.get('message') || undefined,
    });
  }, [searchParams]);

  if (!result) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  const isSuccess = result.status === 'success';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div
          className={`rounded-lg border p-8 text-center ${
            isSuccess
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          }`}
        >
          {/* Icon */}
          <div className="mb-4 text-6xl" aria-hidden="true">
            {isSuccess ? '✅' : '❌'}
          </div>

          {/* Title */}
          <h1
            className={`mb-2 text-3xl font-bold ${
              isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}
          >
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          {/* Message */}
          <p
            className={`mb-6 ${
              isSuccess
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {isSuccess
              ? 'Vé của bạn đã được đặt thành công. Chúng tôi đã gửi thông tin vé qua email.'
              : result.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
          </p>

          {/* Transaction Details */}
          {(result.transactionId || result.bookingId) && (
            <div className="mb-6 space-y-2 rounded-lg border bg-white p-4 text-left dark:bg-gray-900">
              {result.bookingId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đặt vé:</span>
                  <span className="font-mono font-semibold">{result.bookingId}</span>
                </div>
              )}
              {result.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã giao dịch:</span>
                  <span className="font-mono text-sm">{result.transactionId}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isSuccess ? (
              <>
                <button
                  onClick={() => {
                    if (result.bookingId) {
                      router.push(`/booking/success/${result.bookingId}`);
                    } else {
                      router.push('/profile/bookings');
                    }
                  }}
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Xem vé
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Về trang chủ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.back()}
                  className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
          <p>
            Cần hỗ trợ? Liên hệ <strong>1900-xxxx</strong> hoặc{' '}
            <a href="mailto:support@vexeviet.com" className="text-primary hover:underline">
              support@vexeviet.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
