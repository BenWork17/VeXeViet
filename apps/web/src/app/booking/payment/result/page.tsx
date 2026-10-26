'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { CheckCircle2, XCircle } from 'lucide-react';
import { setPaymentStatus } from '@/store/slices/bookingSlice';
import type { PaymentResultParams, PaymentStatus } from '@/types/payment';

function statusLabel(status: PaymentStatus): string {
  if (status === 'COMPLETED') return 'Hoàn thành';
  if (status === 'CANCELLED') return 'Đã hủy';
  return 'Thất bại';
}

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [result, setResult] = useState<PaymentResultParams | null>(null);

  useEffect(() => {
    // === NEW: Parse params from backend VNPay redirect ===
    const successParam = searchParams.get('success');
    const statusParam = searchParams.get('status');
    const paymentId = searchParams.get('paymentId');
    const bankCode = searchParams.get('bankCode');
    const responseCode = searchParams.get('responseCode');

    // === LEGACY: Parse old-style params ===
    const vnpStatus = searchParams.get('vnp_TransactionStatus');
    const momoStatus = searchParams.get('resultCode');
    const zaloStatus = searchParams.get('status');
    const transactionId = searchParams.get('transactionId') || searchParams.get('vnp_TxnRef');
    const bookingId = searchParams.get('bookingId');

    let isSuccess = false;
    let status: PaymentStatus = 'FAILED';

    // Priority 1: New backend VNPay redirect format
    if (successParam !== null) {
      isSuccess = successParam === 'true';
      status = (statusParam as PaymentStatus) || (isSuccess ? 'COMPLETED' : 'FAILED');
    }
    // Priority 2: Legacy VNPAY direct params
    else if (vnpStatus === '00') {
      isSuccess = true;
      status = 'COMPLETED';
    }
    // Priority 3: Momo
    else if (momoStatus === '0') {
      isSuccess = true;
      status = 'COMPLETED';
    }
    // Priority 4: ZaloPay
    else if (zaloStatus === '1') {
      isSuccess = true;
      status = 'COMPLETED';
    }

    const paymentResult: PaymentResultParams = {
      success: isSuccess,
      status,
      paymentId: paymentId || undefined,
      transactionId: transactionId || undefined,
      bankCode: bankCode || undefined,
      message: searchParams.get('message') || undefined,
      responseCode: responseCode || undefined,
      bookingId: bookingId || undefined,
    };

    setResult(paymentResult);

    // Sync with Redux Store
    dispatch(setPaymentStatus(isSuccess ? 'success' : 'failed'));

    // ❌ REMOVED: confirmBooking should be called by Payment Service, NOT by frontend
    // The Payment Service will automatically call /bookings/:id/confirm after successful payment
  }, [searchParams, dispatch]);

  if (!result) {
    return (
      <div className="booking-page-loading" role="status" aria-live="polite">
        <p>Đang đọc kết quả thanh toán…</p>
      </div>
    );
  }

  const isSuccess = result.success;
  const badgeModifier =
    result.status === 'COMPLETED'
      ? ''
      : result.status === 'CANCELLED'
        ? ' is-cancelled'
        : ' is-failure';

  return (
    <div className="booking-state-page">
      <div className="booking-state-card">
        <span
          className={`booking-state-icon${isSuccess ? '' : ' is-failure'}`}
          aria-hidden="true"
        >
          {isSuccess ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
        </span>

        <h1 className="booking-state-title">
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        </h1>

        <span className={`booking-state-badge${badgeModifier}`}>
          {statusLabel(result.status)}
        </span>

        <p className="booking-state-text">
          {isSuccess
            ? 'Vé của bạn đã được đặt thành công. Chúng tôi đã gửi thông tin vé qua email.'
            : result.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
        </p>

        {(result.transactionId || result.bookingId || result.paymentId) ? (
          <div className="booking-state-details">
            {result.paymentId ? (
              <div className="booking-state-row">
                <span>Mã thanh toán</span>
                <strong>{result.paymentId}</strong>
              </div>
            ) : null}
            {result.bookingId ? (
              <div className="booking-state-row">
                <span>Mã đặt vé</span>
                <strong>{result.bookingId}</strong>
              </div>
            ) : null}
            {result.transactionId ? (
              <div className="booking-state-row">
                <span>Mã giao dịch</span>
                <strong>{result.transactionId}</strong>
              </div>
            ) : null}
            {result.bankCode ? (
              <div className="booking-state-row">
                <span>Ngân hàng</span>
                <strong>{result.bankCode}</strong>
              </div>
            ) : null}
            {result.responseCode ? (
              <div className="booking-state-row">
                <span>Mã phản hồi</span>
                <strong>
                  {result.responseCode}
                  {result.responseCode === '00' ? ' (Thành công)' : ''}
                </strong>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="booking-state-actions">
          {isSuccess ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (result.bookingId) {
                    router.push(`/booking/success/${result.bookingId}`);
                  } else {
                    router.push('/profile');
                  }
                }}
                className="booking-action booking-action--inline"
              >
                Xem vé
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="booking-secondary-action"
              >
                Về trang chủ
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (result.bookingId) {
                    router.push(`/booking/payment?id=${result.bookingId}`);
                  } else {
                    router.back();
                  }
                }}
                className="booking-action booking-action--inline"
              >
                Thử lại
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="booking-secondary-action"
              >
                Về trang chủ
              </button>
            </>
          )}
        </div>
      </div>

      <p className="booking-support">
        Cần hỗ trợ? Liên hệ <strong>1900-xxxx</strong> hoặc{' '}
        <a href="mailto:support@vexeviet.com">support@vexeviet.com</a>
      </p>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="booking-page-loading" role="status" aria-live="polite">
          <p>Đang đọc kết quả thanh toán…</p>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
