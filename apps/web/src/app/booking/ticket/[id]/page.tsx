'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookingById } from '@/lib/api/bookings';
import { Booking } from '@vexeviet/types';
import { MapPin, Calendar, Clock, User, Phone, Mail, Ticket, CreditCard } from 'lucide-react';
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
          <h1 className="mb-2 text-2xl font-bold text-red-600">Lỗi</h1>
          <p className="mb-6 text-muted-foreground">{error || 'Không tìm thấy thông tin vé'}</p>
          <button
            onClick={() => router.push('/profile')}
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
          >
            Quay lại
          </button>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Action Buttons - Hidden when printing */}
        <div className="no-print mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <button
            onClick={handlePrint}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            In vé
          </button>
        </div>

        {/* Ticket Card - Optimized for A4 Print */}
        <div className="print:w-[210mm] print:mx-auto print:my-0 print:p-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border-2 border-primary print:border-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-4 print:p-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl print:text-xl font-black mb-1">VeXeViet</h1>
                <p className="text-blue-100 text-xs">Vé xe điện tử</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 print:px-2 print:py-0.5 rounded-full text-xs font-bold ${
                  booking.status === 'CONFIRMED' ? 'bg-green-400 text-green-900' :
                  booking.status === 'PENDING' ? 'bg-yellow-400 text-yellow-900' :
                  'bg-gray-400 text-gray-900'
                }`}>
                  {booking.status === 'CONFIRMED' ? '✓ ĐÃ XÁC NHẬN' :
                   booking.status === 'PENDING' ? '⏳ CHỜ THANH TOÁN' :
                   booking.status}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Code */}
          <div className="bg-gray-50 dark:bg-gray-900 p-3 print:p-2 text-center border-b-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-500 mb-0.5">Mã đặt vé</p>
            <p className="text-2xl print:text-xl font-black font-mono text-primary tracking-wider">{booking.bookingCode}</p>
          </div>

          {/* Main Content - Compact Layout */}
          <div className="p-6 print:p-4">
            {/* Route Info - Compact */}
            <div className="mb-4 print:mb-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Hành trình</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 print:p-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-500">Điểm đi</p>
                    <p className="text-base print:text-sm font-bold text-gray-900 dark:text-white">{booking.route?.origin}</p>
                  </div>
                  <div className="px-4 print:px-2">
                    <svg className="w-6 h-6 print:w-4 print:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-500">Điểm đến</p>
                    <p className="text-base print:text-sm font-bold text-gray-900 dark:text-white">{booking.route?.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 print:mt-2 pt-3 print:pt-2 border-t border-blue-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 print:w-3 print:h-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Ngày khởi hành</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {new Date(booking.route?.departureTime || '').toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 print:w-3 print:h-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Giờ khởi hành</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {new Date(booking.route?.departureTime || '').toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger & Contact - Two Column */}
            <div className="grid grid-cols-2 gap-3 print:gap-2 mb-4 print:mb-3">
              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 print:mb-1">Hành khách</h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 space-y-1">
                  {booking.passengers?.slice(0, 3).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{p.lastName} {p.firstName}</span>
                      {p.seatNumber && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold flex-shrink-0">
                          {p.seatNumber}
                        </span>
                      )}
                    </div>
                  ))}
                  {booking.passengers?.length > 3 && (
                    <p className="text-[10px] text-gray-500">+{booking.passengers.length - 3} người</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 print:mb-1">Liên hệ</h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">{booking.contactInfo?.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">{booking.contactInfo?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat & Vehicle Type */}
            <div className="grid grid-cols-2 gap-3 print:gap-2 mb-4 print:mb-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 print:w-3 print:h-3 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500">Số ghế</p>
                    <p className="text-sm print:text-xs font-black text-gray-900 dark:text-white truncate">
                      {seatList.length > 0 ? seatList.join(', ') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 print:w-3 print:h-3 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500">Loại xe</p>
                    <p className="text-sm print:text-xs font-bold text-gray-900 dark:text-white truncate">
                      {booking.route?.busType === 'LIMOUSINE' ? 'Limousine' :
                       booking.route?.busType === 'SLEEPER' ? 'Giường nằm' :
                       booking.route?.busType === 'VIP' ? 'VIP' :
                       booking.route?.busType || 'Standard'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-dashed border-gray-300 pt-3 print:pt-2 mb-4 print:mb-3">
              <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 rounded-lg p-3 print:p-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm print:text-xs text-gray-600 dark:text-gray-400">Tổng tiền</span>
                  <span className="text-2xl print:text-xl font-black text-primary">
                    {new Intl.NumberFormat('vi-VN').format(totalAmount)}₫
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t border-dashed border-gray-300 pt-4 print:pt-3">
              <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4 print:p-3 border border-gray-200">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 text-center font-medium">Xuất trình mã QR khi lên xe</p>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCode value={booking.bookingCode} size={140} level="M" className="print:!w-[120px] print:!h-[120px]" />
                </div>
                <p className="text-xs text-gray-500 mt-2 font-mono font-semibold">{booking.bookingCode}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 print:px-3 py-2 border-t border-gray-200 text-center text-[10px] text-gray-500">
            <p>Đặt vé: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
            <p className="mt-0.5">Hotline: 1900-xxxx | support@vexeviet.com</p>
          </div>
        </div>

        {/* Support Info - Screen only */}
        <div className="no-print mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 text-center text-sm text-gray-600">
          <p>
            Cần hỗ trợ? Liên hệ <strong>1900-xxxx</strong> hoặc{' '}
            <a href="mailto:support@vexeviet.com" className="text-primary hover:underline">
              support@vexeviet.com
            </a>
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 10mm 10mm 10mm 20mm;
          }
          .container {
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
