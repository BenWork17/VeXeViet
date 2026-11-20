'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Printer, XCircle } from 'lucide-react';
import { getBookingById } from '@/lib/api/booking';
import { BookingDetails } from '@/types/booking';
import { FadeIn } from '@/components/motion';

const TicketCard = dynamic(
  () => import('@/components/features/booking/Ticket/TicketCard').then((mod) => mod.TicketCard),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card p-6 shadow-hn-sm"
        aria-hidden="true"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="h-6 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-6 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
        <div className="my-5 h-16 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="grid grid-cols-2 gap-4 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3.5 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center border-t border-dashed border-border pt-6">
          <div className="h-[140px] w-[140px] animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        </div>
      </div>
    ),
  },
);

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = params.id as string;

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('Không tìm thấy mã đặt vé');
        setLoading(false);
        return;
      }

      try {
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin vé');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="booking-ticket-page" role="status" aria-live="polite">
        <div className="mx-auto w-full max-w-2xl space-y-5 py-6">
          <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
            <span>Đang tải thông tin vé…</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card p-6 shadow-hn-sm" aria-hidden="true">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="space-y-2">
                <div className="h-6 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
            <div className="my-5 h-16 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="grid grid-cols-2 gap-4 py-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center border-t border-dashed border-border pt-6">
              <div className="h-[140px] w-[140px] animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-state-page">
        <div className="booking-state-card">
          <span className="booking-state-icon is-failure" aria-hidden="true">
            <XCircle size={26} />
          </span>
          <h1 className="booking-state-title">Không tải được vé</h1>
          <p className="booking-state-text">{error || 'Không tìm thấy thông tin vé'}</p>
          <div className="booking-state-actions">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="booking-action booking-action--inline"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FadeIn className="booking-ticket-page">
      <div className="booking-success-head no-print">
        <span className="booking-state-icon" aria-hidden="true">
          <CheckCircle2 size={26} />
        </span>
        <div>
          <h1 className="booking-state-title">Thanh toán thành công</h1>
          <p className="booking-state-text">
            Chúc bạn có một chuyến đi an toàn và vui vẻ.
          </p>
        </div>
      </div>

      <div className="booking-state-actions no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="booking-action booking-action--inline"
          aria-label="In hoặc tải vé"
        >
          <Printer size={18} aria-hidden="true" />
          In / Tải vé
        </button>
        <button
          type="button"
          onClick={() => router.push('/profile/bookings')}
          className="booking-secondary-action"
        >
          Xem vé của tôi
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="booking-secondary-action"
        >
          Về trang chủ
        </button>
      </div>

      <TicketCard booking={booking} />

      <p className="booking-support no-print">
        Cần hỗ trợ? Liên hệ <strong>1900-xxxx</strong> hoặc{' '}
        <a href="mailto:support@vexeviet.com">support@vexeviet.com</a>
      </p>
    </FadeIn>
  );
}
