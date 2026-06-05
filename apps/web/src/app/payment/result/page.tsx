'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setPaymentStatus } from '@/store/slices/bookingSlice';
import { getPaymentStatusByTransactionRef } from '@/lib/api/payment';
import type { PaymentResultParams, PaymentStatus } from '@/types/payment';

const FINAL_STATUSES: PaymentStatus[] = [
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
];

const POLLING_INTERVAL_MS = 3000;
const POLLING_TIMEOUT_MS = 60000;

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [result, setResult] = useState<PaymentResultParams | null>(null);
  const [animate, setAnimate] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success') === 'true';
    const status = (searchParams.get('status') as PaymentStatus) || (success ? 'COMPLETED' : 'FAILED');
    const paymentId = searchParams.get('paymentId') || undefined;
    const transactionId = searchParams.get('transactionId') || undefined;
    const bankCode = searchParams.get('bankCode') || undefined;
    const message = searchParams.get('message') || undefined;
    const responseCode = searchParams.get('responseCode') || undefined;
    const bookingId = searchParams.get('bookingId') || undefined;

    const paymentResult: PaymentResultParams = {
      success,
      status,
      paymentId,
      transactionId,
      bankCode,
      message,
      responseCode,
      bookingId,
    };

    setResult(paymentResult);
    dispatch(setPaymentStatus(success ? 'success' : 'failed'));
    setTimeout(() => setAnimate(true), 100);
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (!result?.paymentId) {
      return;
    }

    if (FINAL_STATUSES.includes(result.status)) {
      return;
    }

    let active = true;
    const startedAt = Date.now();

    const pollStatus = async () => {
      if (!active) {
        return;
      }

      setIsCheckingStatus(true);
      try {
        const statusResult = await getPaymentStatusByTransactionRef(result.paymentId as string);

        if (!active) {
          return;
        }

        const nextStatus = statusResult.status;
        const nextSuccess = nextStatus === 'COMPLETED';

        setResult((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            success: nextSuccess,
            status: nextStatus,
            bookingId: statusResult.bookingId || prev.bookingId,
            message:
              nextStatus === 'COMPLETED'
                ? prev.message || 'Thanh toán đã được xác nhận thành công.'
                : prev.message,
          };
        });

        dispatch(setPaymentStatus(nextSuccess ? 'success' : 'failed'));

        if (statusResult.isFinal || Date.now() - startedAt > POLLING_TIMEOUT_MS) {
          setIsCheckingStatus(false);
          return;
        }
      } catch (_error) {
        if (Date.now() - startedAt > POLLING_TIMEOUT_MS) {
          setIsCheckingStatus(false);
          return;
        }
      }

      setTimeout(pollStatus, POLLING_INTERVAL_MS);
    };

    void pollStatus();

    return () => {
      active = false;
    };
  }, [result?.paymentId, result?.status, dispatch]);

  if (!result) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
      </div>
    );
  }

  const isSuccess = result.success;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`mx-auto max-w-2xl transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div
          className={`rounded-2xl border-2 p-8 text-center shadow-lg ${
            isSuccess
              ? 'border-green-300 bg-gradient-to-b from-green-50 to-white dark:border-green-700 dark:from-green-950 dark:to-gray-900'
              : 'border-red-300 bg-gradient-to-b from-red-50 to-white dark:border-red-700 dark:from-red-950 dark:to-gray-900'
          }`}
        >
          <div className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full ${
            isSuccess ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            <span className="text-5xl" aria-hidden="true">
              {isSuccess ? '✅' : '❌'}
            </span>
          </div>

          <h1
            className={`mb-3 text-3xl font-bold ${
              isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}
          >
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          <div className="mb-4">
            <span className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${
              result.status === 'COMPLETED'
                ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                : result.status === 'CANCELLED'
                  ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                  : result.status === 'PENDING' || result.status === 'PROCESSING'
                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                    : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
            }`}>
              {result.status === 'COMPLETED'
                ? 'Hoàn thành'
                : result.status === 'CANCELLED'
                  ? 'Đã hủy'
                  : result.status === 'PENDING' || result.status === 'PROCESSING'
                    ? 'Đang xác nhận'
                    : 'Thất bại'}
            </span>
          </div>

          <p
            className={`mb-6 text-lg ${
              isSuccess
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            {isCheckingStatus
              ? 'Hệ thống đang xác nhận trạng thái thanh toán, vui lòng chờ...'
              : result.message || (isSuccess
                ? 'Giao dịch của bạn đã được xử lý thành công. Vé đã được đặt.'
                : 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.')}
          </p>

          <div className="mb-6 space-y-3 rounded-xl border bg-white p-5 text-left shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 border-b pb-2 font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
              Chi tiết giao dịch
            </h3>
            {result.paymentId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Mã thanh toán:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{result.paymentId}</span>
              </div>
            )}
            {result.transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Mã giao dịch VNPay:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{result.transactionId}</span>
              </div>
            )}
            {result.bookingId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Mã booking:</span>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{result.bookingId}</span>
              </div>
            )}
            {result.bankCode && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Ngân hàng:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {result.bankCode}
                  </span>
                </span>
              </div>
            )}
            {result.responseCode && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Mã phản hồi:</span>
                <span className={`font-mono text-sm font-semibold ${
                  result.responseCode === '00' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.responseCode}
                  {result.responseCode === '00' && ' (Thành công)'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isSuccess ? (
              <>
                <button
                  onClick={() => {
                    if (result.bookingId) {
                      router.push(`/booking/ticket/${result.bookingId}`);
                      return;
                    }
                    router.push('/profile');
                  }}
                  className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-green-700 active:scale-95 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  📋 Xem vé của tôi
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="rounded-xl border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  🏠 Về trang chủ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.back()}
                  className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  🔄 Thử lại
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="rounded-xl border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  🏠 Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-blue-50 p-4 text-center text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <p>
            Cần hỗ trợ? Liên hệ hotline <strong>1900-xxxx</strong> hoặc email{' '}
            <a href="mailto:support@vexeviet.com" className="font-semibold underline hover:no-underline">
              support@vexeviet.com
            </a>
          </p>
        </div>

        {isSuccess && (
          <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
            💡 Thông tin vé đã được gửi qua email đăng ký của bạn.
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
