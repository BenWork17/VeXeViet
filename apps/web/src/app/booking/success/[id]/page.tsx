'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TicketCard } from '@/components/features/booking/Ticket/TicketCard';
import { getBookingById } from '@/lib/api/booking';
import { BookingDetails } from '@/types/booking';

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
      <div className="container mx-auto flex min-h-[600px] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Đang tải thông tin vé...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto flex min-h-[600px] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-2 text-2xl font-bold text-red-600 dark:text-red-400">Lỗi</h1>
          <p className="mb-6 text-muted-foreground">{error || 'Không tìm thấy thông tin vé'}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      <div className="no-print mb-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
        <div className="mb-3 text-5xl" aria-hidden="true">
          ✅
        </div>
        <h1 className="mb-2 text-3xl font-bold text-green-800 dark:text-green-200">
          Thanh toán thành công!
        </h1>
        <p className="text-green-700 dark:text-green-300">
          Chúc bạn có một chuyến đi an toàn và vui vẻ! 🚌
        </p>
      </div>

      {/* Ticket Card */}
      <TicketCard booking={booking} />

      {/* Action Buttons */}
      <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={handlePrint}
          className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          aria-label="In hoặc tải vé"
        >
          🖨️ In / Tải vé
        </button>
        <button
          onClick={() => router.push('/profile/bookings')}
          className="rounded-lg border border-gray-300 px-8 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Xem vé của tôi
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg border border-gray-300 px-8 py-3 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Về trang chủ
        </button>
      </div>

      {/* Support Info */}
      <div className="no-print mt-8 rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        <p>
          Cần hỗ trợ? Liên hệ <strong>1900-xxxx</strong> hoặc{' '}
          <a href="mailto:support@vexeviet.com" className="text-primary hover:underline">
            support@vexeviet.com
          </a>
        </p>
      </div>
    </div>
  );
}
