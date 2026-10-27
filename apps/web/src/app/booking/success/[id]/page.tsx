'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Printer, XCircle } from 'lucide-react';
import { TicketCard } from '@/components/features/booking/Ticket/TicketCard';
import { getBookingById } from '@/lib/api/booking';
import { BookingDetails } from '@/types/booking';
import { FadeIn } from '@/components/motion';

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
      <div className="booking-page-loading" role="status" aria-live="polite">
        <p>Đang tải thông tin vé…</p>
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
