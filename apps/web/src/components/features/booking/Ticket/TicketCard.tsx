'use client';

import QRCode from 'react-qr-code';
import { BookingDetails } from '@/types/booking';

export interface TicketCardProps {
  booking: BookingDetails;
}

function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function TicketCard({ booking }: TicketCardProps) {
  const firstPassenger = booking.passengers[0];
  if (!firstPassenger) return null;

  const allSeats = booking.passengers.map((p) => p.seatNumber).join(', ');
  const isPaid = booking.paymentStatus === 'PAID';

  return (
    <article className="booking-ticket">
      <header className="booking-ticket-head">
        <div className="booking-ticket-brand-row">
          {booking.operator.logoUrl ? (
            <img
              src={booking.operator.logoUrl}
              alt=""
              className="booking-ticket-logo"
            />
          ) : (
            <span className="booking-ticket-logo-fallback" aria-hidden="true">
              VX
            </span>
          )}
          <div>
            <h2 className="booking-ticket-brand">{booking.operator.name}</h2>
            <p className="booking-ticket-kind">{booking.busType}</p>
          </div>
        </div>
        <span className={`booking-ticket-status${isPaid ? '' : ' is-pending'}`}>
          {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
        </span>
      </header>

      <div className="booking-ticket-code-block">
        <p className="booking-ticket-code-label">Mã vé</p>
        <p className="booking-ticket-code">{booking.bookingCode}</p>
      </div>

      <div className="booking-ticket-body">
        <div className="booking-ticket-route">
          <div className="booking-ticket-stop">
            <p className="booking-ticket-stop-label">Điểm đi</p>
            <p className="booking-ticket-stop-name">{booking.route.from}</p>
            <p className="booking-ticket-field-label">{formatDateTime(booking.route.departureTime)}</p>
          </div>
          <span className="booking-ticket-arrow" aria-hidden="true">
            →
          </span>
          <div className="booking-ticket-stop booking-ticket-stop--right">
            <p className="booking-ticket-stop-label">Điểm đến</p>
            <p className="booking-ticket-stop-name">{booking.route.to}</p>
            <p className="booking-ticket-field-label">{formatDateTime(booking.route.arrivalTime)}</p>
          </div>
        </div>

        <p className="booking-ticket-field-label">Thời gian di chuyển: {booking.route.duration}</p>

        <div className="booking-ticket-grid">
          <div className="booking-ticket-field">
            <p className="booking-ticket-field-label">Hành khách</p>
            <p className="booking-ticket-field-value">{firstPassenger.fullName}</p>
          </div>
          <div className="booking-ticket-field">
            <p className="booking-ticket-field-label">Số điện thoại</p>
            <p className="booking-ticket-field-value">{firstPassenger.phone}</p>
          </div>
          {firstPassenger.email ? (
            <div className="booking-ticket-field">
              <p className="booking-ticket-field-label">Email</p>
              <p className="booking-ticket-field-value">{firstPassenger.email}</p>
            </div>
          ) : null}
          <div className="booking-ticket-field">
            <p className="booking-ticket-field-label">Số ghế</p>
            <p className="booking-ticket-field-value">{allSeats}</p>
          </div>
          <div className="booking-ticket-field">
            <p className="booking-ticket-field-label">Số hành khách</p>
            <p className="booking-ticket-field-value">{booking.passengers.length}</p>
          </div>
          <div className="booking-ticket-field">
            <p className="booking-ticket-field-label">Biển số xe</p>
            <p className="booking-ticket-field-value">{booking.licensePlate}</p>
          </div>
        </div>

        <div className="booking-ticket-perforation" />

        <div className="booking-ticket-total">
          <div>
            <p className="booking-ticket-total-label">Tổng tiền</p>
            <p className="booking-ticket-field-label">Đã bao gồm phí dịch vụ</p>
          </div>
          <p className="booking-ticket-total-amount">{formatCurrency(booking.totalPrice)}</p>
        </div>

        <div className="booking-ticket-qr">
          <div className="booking-ticket-qr-code">
            <QRCode value={booking.bookingCode} size={160} level="M" />
          </div>
          <p>Xuất trình mã QR này cho tài xế khi lên xe.</p>
          <p className="booking-ticket-field-value">{booking.bookingCode}</p>
        </div>
      </div>

      <div className="booking-ticket-foot">
        <p>Đặt vé: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
        <p>Hotline: 1900-xxxx | support@vexeviet.com</p>
      </div>
    </article>
  );
}
