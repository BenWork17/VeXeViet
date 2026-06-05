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

  return (
    <div className="ticket-card mx-auto max-w-2xl overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b-2 border-dashed border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-gray-700 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {booking.operator.logoUrl ? (
              <img
                src={booking.operator.logoUrl}
                alt={booking.operator.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
                🚌
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {booking.operator.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{booking.busType}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-500">Mã vé</div>
            <div className="font-mono text-lg font-bold text-primary">{booking.bookingCode}</div>
          </div>
        </div>
      </div>

      {/* Route Info */}
      <div className="border-b-2 border-dashed border-gray-300 p-6 dark:border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-500 dark:text-gray-500">Điểm đi</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {booking.route.from}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatDateTime(booking.route.departureTime)}
            </div>
          </div>
          <div className="flex flex-col items-center px-4">
            <div className="text-3xl">→</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{booking.route.duration}</div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-500 dark:text-gray-500">Điểm đến</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {booking.route.to}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatDateTime(booking.route.arrivalTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="grid gap-6 border-b-2 border-dashed border-gray-300 p-6 sm:grid-cols-2 dark:border-gray-700">
        <div>
          <div className="mb-3 text-sm font-semibold uppercase text-gray-500 dark:text-gray-500">
            Thông tin hành khách
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tên:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {firstPassenger.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">SĐT:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {firstPassenger.phone}
              </span>
            </div>
            {firstPassenger.email && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {firstPassenger.email}
                </span>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold uppercase text-gray-500 dark:text-gray-500">
            Chi tiết vé
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Số ghế:</span>
              <span className="font-mono font-bold text-primary">{allSeats}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Số hành khách:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {booking.passengers.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Biển số xe:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {booking.licensePlate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-gray-50 p-6 text-center dark:bg-gray-950">
        <div className="mb-4 text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">
          Mã QR Vé
        </div>
        <div className="mx-auto mb-4 inline-block rounded-lg bg-white p-4 shadow-sm">
          <QRCode value={booking.bookingCode} size={160} level="M" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          📱 Vui lòng xuất trình mã QR này cho tài xế khi lên xe
        </p>
      </div>

      {/* Footer - Price */}
      <div className="border-t-2 border-dashed border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-gray-700 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(booking.totalPrice)}</div>
          </div>
          <div className="text-right">
            <div
              className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                booking.paymentStatus === 'PAID'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {booking.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : 'Chờ thanh toán'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
