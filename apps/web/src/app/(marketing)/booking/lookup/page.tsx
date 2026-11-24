'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Printer,
  Search,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react';
import type { Booking } from '@vexeviet/types';
import { useBookingByCode } from '@/lib/hooks/useBookings';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOfflineTickets } from '@/lib/hooks/useOfflineTickets';
import { useToast } from '@/components/error/ToastProvider';
import { parseApiError } from '@/lib/api/client';
import type { Ticket } from '@/types/ticket';
import { FadeIn } from '@/components/motion';

const QRCode = dynamic(() => import('react-qr-code'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[132px] w-[132px] animate-pulse rounded-md bg-muted motion-reduce:animate-none"
      aria-hidden="true"
    />
  ),
});

function getBookingTotalAmount(booking: Booking): number {
  const raw = booking as unknown as Record<string, unknown>;
  if (raw.totalPrice && typeof raw.totalPrice === 'object') {
    const obj = raw.totalPrice as Record<string, unknown>;
    return Number(obj.amount ?? obj.total ?? 0);
  }
  return Number(booking.totalAmount ?? raw.totalPrice ?? 0);
}

function mapBookingToOfflineTicket(booking: Booking): Ticket {
  const totalAmount = getBookingTotalAmount(booking);
  const firstPassenger = booking.passengers?.[0];
  const bookingId = booking.id;
  const departureTime = booking.route?.departureTime || new Date().toISOString();

  return {
    id: `${bookingId}-0`,
    bookingId,
    bookingCode: booking.bookingCode,
    status: booking.status === 'CANCELLED' ? 'CANCELLED' : 'VALID',
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: booking.updatedAt || booking.createdAt || new Date().toISOString(),
    route: {
      id: booking.routeId || booking.route?.id || '',
      from: booking.route?.origin || 'Điểm đi',
      to: booking.route?.destination || 'Điểm đến',
      departureTime,
      arrivalTime: booking.route?.arrivalTime || departureTime,
      duration: String(booking.route?.duration ?? ''),
    },
    operator: {
      id: booking.route?.operator?.id || '',
      name: booking.route?.operator?.name || 'VeXeViet Partner',
      logoUrl: booking.route?.operator?.operatorAvatarUrl || booking.route?.operator?.logo || '',
    },
    passenger: {
      fullName: firstPassenger
        ? `${firstPassenger.lastName || ''} ${firstPassenger.firstName || ''}`.trim() || 'Hành khách'
        : 'Hành khách',
      phone: booking.contactInfo?.phone || '',
      email: booking.contactInfo?.email,
      seatNumber: firstPassenger?.seatNumber || booking.seats?.[0] || 'N/A',
    },
    busType: booking.route?.busType || 'STANDARD',
    licensePlate: booking.route?.licensePlate || '',
    ticketPrice: totalAmount,
    serviceFee: 0,
    totalPrice: totalAmount,
    paymentMethod: 'ONLINE',
    paymentStatus: booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'PAID' : 'PENDING',
    qrCode: {
      ticketId: `${bookingId}-0`,
      bookingCode: booking.bookingCode,
      validationHash: booking.bookingCode,
      expiresAt: departureTime,
    },
  };
}

function BookingLookupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get('code') || '').trim().toUpperCase();

  const [inputCode, setInputCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);
  const [savingOffline, setSavingOffline] = useState(false);

  const { user } = useAuth();
  const { saveTicketOffline } = useOfflineTickets();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (initialCode && initialCode !== submittedCode) {
      setInputCode(initialCode);
      setSubmittedCode(initialCode);
    }
  }, [initialCode, submittedCode]);

  const bookingQuery = useBookingByCode(submittedCode);
  const booking = bookingQuery.data;
  const parsedError = bookingQuery.error ? parseApiError(bookingQuery.error) : null;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const normalized = inputCode.trim().toUpperCase();
    if (!normalized) return;
    setSubmittedCode(normalized);
    router.replace(`/booking/lookup?code=${encodeURIComponent(normalized)}`);
  };

  const handleSaveOffline = async () => {
    if (!booking) return;
    setSavingOffline(true);
    try {
      await saveTicketOffline(mapBookingToOfflineTicket(booking));
      showSuccess('Đã lưu vé điện tử vào bộ nhớ ngoại tuyến trên thiết bị này.');
    } catch (err) {
      showError('Không thể lưu Offline', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setSavingOffline(false);
    }
  };

  const seatList =
    booking?.passengers?.map((p) => p.seatNumber).filter(Boolean) || booking?.seats || [];
  const totalAmount = booking ? getBookingTotalAmount(booking) : 0;
  const canShowQr = booking?.status === 'CONFIRMED' || booking?.status === 'COMPLETED';

  return (
    <FadeIn className="min-h-[calc(100vh-12rem)] bg-background py-10 lg:py-14">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-bold text-primary">
            <TicketIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Tra cứu vé điện tử không cần đăng nhập
          </span>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            Tra cứu đơn hàng &amp; Vé xe
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Nhập mã đặt vé (ví dụ: <span className="font-mono font-semibold text-foreground">VXV123456</span>)
            trong email xác nhận để kiểm tra hành trình, thanh toán hoặc tải mã QR lên xe.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-border bg-card p-4 shadow-hn-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã đặt vé (VD: VXV892041)"
                aria-label="Mã đặt vé"
                className="h-12 w-full rounded-xl border border-input bg-field pr-4 pl-10 font-mono text-sm font-bold tracking-wider text-foreground uppercase placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={!inputCode.trim() || bookingQuery.isFetching}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-hn-sm transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingQuery.isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                  <span>Đang tra cứu...</span>
                </>
              ) : (
                <span>Kiểm tra vé</span>
              )}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Mã đặt vé gồm chữ cái và số được gửi qua Email ngay sau khi giữ chỗ.</span>
            {user ? (
              <Link href="/profile/bookings" className="font-semibold text-primary hover:underline">
                Xem toàn bộ vé trong tài khoản →
              </Link>
            ) : (
              <Link
                href="/login?redirect=/profile/bookings"
                className="font-semibold text-primary hover:underline"
              >
                Đăng nhập để xem lịch sử đặt vé →
              </Link>
            )}
          </div>
        </form>

        {submittedCode && bookingQuery.isError && parsedError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-error/25 bg-error-soft p-5 text-error-ink"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  Không tìm thấy đơn đặt vé với mã &ldquo;{submittedCode}&rdquo;
                </p>
                <p className="mt-1 text-sm opacity-90">{parsedError.message}</p>
                {parsedError.requestId && (
                  <p className="mt-1.5 font-mono text-xs opacity-75">
                    Mã tham chiếu: {parsedError.requestId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {booking && !bookingQuery.isError && (
          <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-hn-md">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mã đặt vé điện tử
                </p>
                <p className="font-mono text-2xl font-extrabold tracking-wider text-foreground">
                  {booking.bookingCode}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase ${
                  booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                    ? 'bg-success-soft text-success-ink'
                    : booking.status === 'PENDING'
                      ? 'bg-warning-soft text-warning-ink'
                      : 'bg-error-soft text-error-ink'
                }`}
              >
                {booking.status === 'CONFIRMED' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Đã xác nhận
                  </>
                ) : booking.status === 'PENDING' ? (
                  <>
                    <Clock className="h-3.5 w-3.5" /> Chờ thanh toán
                  </>
                ) : booking.status === 'COMPLETED' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Hoàn thành
                  </>
                ) : (
                  'Đã hủy'
                )}
              </span>
            </header>

            <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hành trình
                  </p>
                  <h2 className="mt-1 font-display text-xl text-foreground sm:text-2xl">
                    {booking.route?.origin || 'Điểm đi'} → {booking.route?.destination || 'Điểm đến'}
                  </h2>
                  {booking.route?.operator?.name && (
                    <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                      Nhà xe: <strong className="text-foreground">{booking.route.operator.name}</strong>
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Thời gian khởi hành</p>
                      <p className="text-sm font-bold text-foreground">
                        {booking.route?.departureTime
                          ? new Date(booking.route.departureTime).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'Đang cập nhật'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Số ghế</p>
                      <p className="text-sm font-bold text-foreground">
                        {seatList.length > 0 ? seatList.join(', ') : 'Chưa gán ghế'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Hành khách</p>
                      <p className="text-sm font-bold text-foreground">
                        {booking.passengers?.length || seatList.length || 1} hành khách
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
                      <p className="font-mono text-sm font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN').format(totalAmount)}đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {canShowQr && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-4 text-center">
                  <div className="rounded-lg bg-white p-2.5">
                    <QRCode
                      value={JSON.stringify({
                        bookingCode: booking.bookingCode,
                        bookingId: booking.id,
                        seats: seatList,
                      })}
                      size={132}
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    Xuất trình mã QR khi lên xe
                  </p>
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border bg-muted/30 px-6 py-4">
              {booking.status === 'PENDING' ? (
                <Link
                  href={`/booking/payment?bookingId=${encodeURIComponent(booking.id)}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                >
                  <CreditCard className="h-4 w-4" />
                  Thanh toán ngay
                </Link>
              ) : null}

              {canShowQr ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveOffline}
                    disabled={savingOffline}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {savingOffline ? 'Đang lưu...' : 'Lưu vé Offline'}
                  </button>
                  <Link
                    href={`/booking/ticket/${encodeURIComponent(booking.id)}`}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Mở trang in vé
                    <ExternalLink className="h-3 w-3 opacity-80" />
                  </Link>
                </>
              ) : null}
            </footer>
          </article>
        )}
      </div>
    </FadeIn>
  );
}

export default function BookingLookupPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[60vh] items-center justify-center bg-background px-4"
          role="status"
          aria-label="Đang tải trang tra cứu vé"
        >
          <Loader2 className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none" />
        </div>
      }
    >
      <BookingLookupContent />
    </Suspense>
  );
}
