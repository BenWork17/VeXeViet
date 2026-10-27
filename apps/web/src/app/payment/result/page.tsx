'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Home,
  LifeBuoy,
  Mail,
  RotateCcw,
  Ticket,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { setPaymentStatus } from '@/store/slices/bookingSlice';
import { getPaymentStatusByTransactionRef } from '@/lib/api/payment';
import type { PaymentResultParams, PaymentStatus } from '@/types/payment';
import { cn } from '@/lib/utils';

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

type ResultTone = 'success' | 'warning' | 'error' | 'info';

interface ResultPresentation {
  tone: ResultTone;
  icon: LucideIcon;
  title: string;
  badge: string;
}

const TONE_STYLES: Record<
  ResultTone,
  { card: string; icon: string; title: string; badge: string; detail: string }
> = {
  success: {
    card: 'bg-success-soft',
    icon: 'text-success-ink',
    title: 'text-success-ink',
    badge: 'bg-success-soft text-success-ink',
    detail: 'text-success-ink',
  },
  warning: {
    card: 'bg-warning-soft',
    icon: 'text-warning-ink',
    title: 'text-warning-ink',
    badge: 'bg-warning-soft text-warning-ink',
    detail: 'text-warning-ink',
  },
  error: {
    card: 'bg-error-soft',
    icon: 'text-error-ink',
    title: 'text-error-ink',
    badge: 'bg-error-soft text-error-ink',
    detail: 'text-error-ink',
  },
  info: {
    card: 'bg-info-soft',
    icon: 'text-info-ink',
    title: 'text-info-ink',
    badge: 'bg-info-soft text-info-ink',
    detail: 'text-info-ink',
  },
};

function getPresentation(status: PaymentStatus, success: boolean): ResultPresentation {
  if (status === 'COMPLETED') {
    return {
      tone: 'success',
      icon: CheckCircle2,
      title: 'Thanh toán thành công!',
      badge: 'Hoàn thành',
    };
  }

  if (status === 'PENDING' || status === 'PROCESSING') {
    return {
      tone: 'info',
      icon: Clock,
      title: 'Đang xác nhận thanh toán',
      badge: 'Đang xác nhận',
    };
  }

  if (status === 'CANCELLED' || status === 'EXPIRED') {
    return {
      tone: 'warning',
      icon: AlertTriangle,
      title: status === 'CANCELLED' ? 'Thanh toán đã hủy' : 'Giao dịch đã hết hạn',
      badge: status === 'CANCELLED' ? 'Đã hủy' : 'Hết hạn',
    };
  }

  if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') {
    return {
      tone: 'info',
      icon: Clock,
      title: status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Đã hoàn tiền một phần',
      badge: status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Hoàn tiền một phần',
    };
  }

  if (success) {
    return {
      tone: 'success',
      icon: CheckCircle2,
      title: 'Thanh toán thành công!',
      badge: 'Hoàn thành',
    };
  }

  return {
    tone: 'error',
    icon: XCircle,
    title: 'Thanh toán thất bại',
    badge: 'Thất bại',
  };
}

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
      <div className="flex min-h-[400px] items-center justify-center bg-background">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-none"
          role="status"
          aria-label="Đang tải kết quả thanh toán"
        />
      </div>
    );
  }

  const presentation = getPresentation(result.status, result.success);
  const tone = TONE_STYLES[presentation.tone];
  const StatusIcon = presentation.icon;
  const isSuccess = result.status === 'COMPLETED';
  const description = isCheckingStatus
    ? 'Hệ thống đang xác nhận trạng thái thanh toán, vui lòng chờ...'
    : result.message || (isSuccess
      ? 'Giao dịch của bạn đã được xử lý thành công. Vé đã được đặt.'
      : 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.');

  const detailRowClass = 'flex items-center justify-between gap-3 py-2';
  const detailLabelClass = 'text-sm text-muted-foreground';
  const detailValueClass = 'font-mono text-sm font-semibold text-foreground';

  return (
    <div className="min-h-screen bg-background px-4 py-8 font-sans text-foreground sm:py-12">
      <div
        className={cn(
          'mx-auto max-w-2xl transition-all duration-200 motion-reduce:transition-none',
          animate ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-hn-md">
          <div
            className={cn(
              'flex flex-col items-center px-6 py-8 text-center sm:px-8',
              tone.card,
            )}
          >
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-card">
              <StatusIcon className={cn('h-9 w-9', tone.icon)} aria-hidden="true" />
            </div>

            <h1 className={cn('font-display text-3xl leading-tight', tone.title)}>
              {presentation.title}
            </h1>

            <span
              className={cn(
                'mt-3 inline-flex items-center rounded-sm px-3.5 py-1.5 text-xs font-semibold',
                tone.badge,
              )}
            >
              {presentation.badge}
            </span>

            <p className={cn('mt-4 max-w-md text-base leading-relaxed', tone.detail)}>
              {description}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <h2 className="mb-2 font-display text-xl text-foreground">Chi tiết giao dịch</h2>
            <div className="divide-y divide-border">
              {result.paymentId && (
                <div className={detailRowClass}>
                  <span className={detailLabelClass}>Mã thanh toán</span>
                  <span className={detailValueClass}>{result.paymentId}</span>
                </div>
              )}
              {result.transactionId && (
                <div className={detailRowClass}>
                  <span className={detailLabelClass}>Mã giao dịch VNPay</span>
                  <span className={detailValueClass}>{result.transactionId}</span>
                </div>
              )}
              {result.bookingId && (
                <div className={detailRowClass}>
                  <span className={detailLabelClass}>Mã booking</span>
                  <span className={detailValueClass}>{result.bookingId}</span>
                </div>
              )}
              {result.bankCode && (
                <div className={detailRowClass}>
                  <span className={detailLabelClass}>Ngân hàng</span>
                  <span className="inline-flex items-center rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    {result.bankCode}
                  </span>
                </div>
              )}
              {result.responseCode && (
                <div className={detailRowClass}>
                  <span className={detailLabelClass}>Mã phản hồi</span>
                  <span
                    className={cn(
                      'font-mono text-sm font-semibold',
                      result.responseCode === '00' ? 'text-success-ink' : 'text-error-ink',
                    )}
                  >
                    {result.responseCode}
                    {result.responseCode === '00' && ' (Thành công)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-6 py-6 sm:flex-row sm:justify-center sm:px-8">
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
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125]"
                >
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  Xem vé của tôi
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125]"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Về trang chủ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.back()}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Thử lại
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125]"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 rounded-md border border-border bg-muted px-4 py-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-center">
          <LifeBuoy className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <p>
            Cần hỗ trợ? Liên hệ hotline <strong className="font-semibold text-foreground">1900-xxxx</strong> hoặc email{' '}
            <a
              href="mailto:support@vexeviet.com"
              className="inline-flex items-center gap-1 font-semibold text-primary transition-colors duration-150 hover:text-primary-deep"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              support@vexeviet.com
            </a>
          </p>
        </div>

        {isSuccess && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Thông tin vé đã được gửi qua email đăng ký của bạn.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center bg-background">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-none"
            role="status"
            aria-label="Đang tải kết quả thanh toán"
          />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
