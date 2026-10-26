'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookingById } from '@/lib/api/bookings';
import { Booking } from '@vexeviet/types';
import { ArrowLeft, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function BookingTicketPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
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
          <h1 className="booking-state-title">Không tải được vé</h1>
          <p className="booking-state-text">{error || 'Không tìm thấy thông tin vé'}</p>
          <div className="booking-state-actions">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="booking-action booking-action--inline"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle both nested totalPrice object and direct totalAmount
  let totalAmount = 0;
  if ((booking as any).totalPrice && typeof (booking as any).totalPrice === 'object') {
    totalAmount = ((booking as any).totalPrice as any).amount || ((booking as any).totalPrice as any).total || 0;
  } else if (booking.totalAmount) {
    totalAmount = booking.totalAmount;
  } else if ((booking as any).totalPrice) {
    totalAmount = (booking as any).totalPrice as number;
  }

  const seatList = booking.passengers?.map((p: any) => p.seatNumber).filter(Boolean) || booking.seats || [];
  const statusClass =
    booking.status === 'CONFIRMED'
      ? ''
      : booking.status === 'PENDING'
        ? ' is-pending'
        : ' is-cancelled';
  const statusText =
    booking.status === 'CONFIRMED'
      ? 'Đã xác nhận'
      : booking.status === 'PENDING'
        ? 'Chờ thanh toán'
        : booking.status;

  return (
    <div className="booking-ticket-page">
      <div className="booking-ticket-actions no-print">
        <button type="button" onClick={() => router.back()} className="booking-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="booking-action booking-action--inline"
        >
          <Printer size={18} aria-hidden="true" />
          In vé
        </button>
      </div>

      <article className="booking-ticket">
        <header className="booking-ticket-head">
          <div>
            <h1 className="booking-ticket-brand">VeXeViet</h1>
            <p className="booking-ticket-kind">Vé xe điện tử</p>
          </div>
          <span className={`booking-ticket-status${statusClass}`}>{statusText}</span>
        </header>

        <div className="booking-ticket-code-block">
          <p className="booking-ticket-code-label">Mã đặt vé</p>
          <p className="booking-ticket-code">{booking.bookingCode}</p>
        </div>

        <div className="booking-ticket-body">
          <div className="booking-ticket-route">
            <div className="booking-ticket-stop">
              <p className="booking-ticket-stop-label">Điểm đi</p>
              <p className="booking-ticket-stop-name">{booking.route?.origin}</p>
            </div>
            <span className="booking-ticket-arrow" aria-hidden="true">
              →
            </span>
            <div className="booking-ticket-stop booking-ticket-stop--right">
              <p className="booking-ticket-stop-label">Điểm đến</p>
              <p className="booking-ticket-stop-name">{booking.route?.destination}</p>
            </div>
          </div>

          <div className="booking-ticket-grid">
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Ngày khởi hành</p>
              <p className="booking-ticket-field-value">
                {new Date(booking.route?.departureTime || '').toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Giờ khởi hành</p>
              <p className="booking-ticket-field-value">
                {new Date(booking.route?.departureTime || '').toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Số ghế</p>
              <p className="booking-ticket-field-value">
                {seatList.length > 0 ? seatList.join(', ') : 'Chưa có'}
              </p>
            </div>
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Loại xe</p>
              <p className="booking-ticket-field-value">
                {booking.route?.busType === 'LIMOUSINE'
                  ? 'Limousine'
                  : booking.route?.busType === 'SLEEPER'
                    ? 'Giường nằm'
                    : booking.route?.busType === 'VIP'
                      ? 'VIP'
                      : booking.route?.busType || 'Ghế ngồi'}
              </p>
            </div>
          </div>

          <div>
            <p className="booking-ticket-field-label">Hành khách</p>
            <ul className="booking-passenger-list">
              {booking.passengers?.slice(0, 3).map((passenger: any, index: number) => (
                <li key={index}>
                  <span>
                    {passenger.lastName} {passenger.firstName}
                  </span>
                  {passenger.seatNumber ? <strong>{passenger.seatNumber}</strong> : null}
                </li>
              ))}
            </ul>
            {booking.passengers?.length > 3 ? (
              <p className="booking-ticket-field-label">
                Và {booking.passengers.length - 3} hành khách khác
              </p>
            ) : null}
          </div>

          <div className="booking-ticket-grid">
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Số điện thoại</p>
              <p className="booking-ticket-field-value">{booking.contactInfo?.phone}</p>
            </div>
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Email</p>
              <p className="booking-ticket-field-value">{booking.contactInfo?.email}</p>
            </div>
          </div>

          <div className="booking-ticket-perforation" />

          <div className="booking-ticket-total">
            <div>
              <p className="booking-ticket-total-label">Tổng tiền</p>
              <p className="booking-ticket-field-label">Đã bao gồm thuế và phí</p>
            </div>
            <p className="booking-ticket-total-amount">
              {new Intl.NumberFormat('vi-VN').format(totalAmount)}₫
            </p>
          </div>

          <div className="booking-ticket-qr">
            <p>Xuất trình mã QR khi lên xe.</p>
            <div className="booking-ticket-qr-code">
              <QRCode value={booking.bookingCode} size={140} level="M" />
            </div>
            <p className="booking-ticket-field-value">{booking.bookingCode}</p>
          </div>
        </div>

        <div className="booking-ticket-foot">
          <p>Đặt vé: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
          <p>Hotline: 1900-xxxx | support@vexeviet.com</p>
        </div>
      </article>

      <p className="booking-support no-print">
        Cần hỗ trợ? Liên hệ <strong>1900-xxxx</strong> hoặc{' '}
        <a href="mailto:support@vexeviet.com">support@vexeviet.com</a>
      </p>

      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
