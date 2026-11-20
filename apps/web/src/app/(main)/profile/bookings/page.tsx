'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cancelBooking } from '@/lib/api/bookings';
import { useMyBookings } from '@/lib/hooks/useBookings';
import { useAuth } from '@/lib/hooks/useAuth';
import { BookingDetails } from '@/types/booking';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, MapPin, Users, Ticket, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { FadeIn } from '@/components/motion';

function normalizeBooking(raw: any): BookingDetails {
  const totalPrice =
    raw.totalPrice && typeof raw.totalPrice === 'object'
      ? raw.totalPrice.amount || raw.totalPrice.total || 0
      : raw.totalAmount ?? raw.totalPrice ?? 0;

  const durationMinutes = typeof raw.route?.duration === 'number' ? raw.route.duration : null;
  const duration =
    durationMinutes !== null
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : String(raw.route?.duration || 'N/A');

  const passengers = Array.isArray(raw.passengers)
    ? raw.passengers.map((p: any) => ({
        fullName:
          p.fullName ||
          `${p.lastName || ''} ${p.firstName || ''}`.trim() ||
          'Hành khách',
        seatNumber: p.seatNumber || '',
        phone: p.phone || raw.contactInfo?.phone || '',
        email: p.email || raw.contactInfo?.email,
      }))
    : (raw.seats || []).map((seat: string) => ({
        fullName: raw.contactInfo?.fullName || 'Hành khách',
        seatNumber: seat,
        phone: raw.contactInfo?.phone || '',
        email: raw.contactInfo?.email,
      }));

  const normalizedStatus: BookingDetails['status'] =
    raw.status === 'CONFIRMED' || raw.status === 'COMPLETED'
      ? 'CONFIRMED'
      : raw.status === 'CANCELLED'
        ? 'CANCELLED'
        : 'PENDING';

  const paymentStatus: BookingDetails['paymentStatus'] =
    raw.paymentStatus === 'PAID' || raw.paymentStatus === 'REFUNDED'
      ? raw.paymentStatus
      : normalizedStatus === 'CONFIRMED'
        ? 'PAID'
        : 'PENDING';

  return {
    id: raw.id || raw.bookingId || '',
    bookingCode: raw.bookingCode || raw.id || '',
    status: normalizedStatus,
    route: {
      id: raw.route?.id || raw.routeId || '',
      from: raw.route?.from || raw.route?.origin || 'N/A',
      to: raw.route?.to || raw.route?.destination || 'N/A',
      departureTime: raw.route?.departureTime || raw.departureDate || raw.createdAt || new Date().toISOString(),
      arrivalTime: raw.route?.arrivalTime || raw.route?.departureTime || raw.createdAt || new Date().toISOString(),
      duration,
    },
    operator: {
      id: raw.operator?.id || raw.route?.operator?.id || raw.route?.operatorId || '',
      name: raw.operator?.name || raw.route?.operator?.name || 'VeXeViet',
      logoUrl: raw.operator?.logoUrl || raw.operator?.logo || raw.route?.operator?.logo || '',
    },
    busType: raw.busType || raw.route?.busType || 'STANDARD',
    licensePlate: raw.licensePlate || raw.route?.licensePlate || 'N/A',
    passengers,
    ticketPrice: raw.ticketPrice ?? totalPrice,
    serviceFee: raw.serviceFee ?? 0,
    totalPrice,
    paymentMethod: raw.paymentMethod || 'VNPAY',
    paymentStatus,
    transactionId: raw.transactionId,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export default function BookingsDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: rawBookings = [], isLoading: loading, refetch } = useMyBookings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const bookings = useMemo(
    () => (Array.isArray(rawBookings) ? rawBookings.map(normalizeBooking) : []),
    [rawBookings]
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, {
        reason: 'User requested cancellation'
      });

      showToast('Booking cancelled successfully', 'success');
      await refetch();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to cancel booking';
      showToast(errorMessage, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const isUpcoming = (departureTime: string) => {
    return new Date(departureTime) > new Date();
  };

  const canCancel = (booking: BookingDetails) => {
    if (booking.status !== 'CONFIRMED') return false;

    const departureDate = new Date(booking.route.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilDeparture > 24;
  };

  const upcomingBookings = bookings.filter((b) => isUpcoming(b.route.departureTime));
  const pastBookings = bookings.filter((b) => !isUpcoming(b.route.departureTime));

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-hn-md"
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="h-5 w-5 text-success-ink" />
            : <X className="h-5 w-5 text-error-ink" />}
          <p>{toast.message}</p>
        </div>
      )}

      <FadeIn className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">VeXeViet Account</p>
          <h1 className="font-display text-3xl text-foreground">My Bookings</h1>
          <p className="mt-2 text-muted-foreground">Manage your bus tickets and travel history</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 inline-flex gap-1 rounded-lg border border-border bg-card p-1 shadow-hn-sm">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
              activeTab === 'upcoming'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            Upcoming Trips
            {upcomingBookings.length > 0 && (
              <span className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === 'upcoming' ? 'bg-card text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {upcomingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
              activeTab === 'past'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            Past Trips
            {pastBookings.length > 0 && (
              <span className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === 'past' ? 'bg-card text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {pastBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              role="status"
              aria-label="Đang tải danh sách vé"
              className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none"
            />
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Ticket className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl text-foreground">
              No {activeTab === 'upcoming' ? 'upcoming' : 'past'} trips
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming trips yet."
                : "You don't have any past trips."}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/"
                className="mt-6 inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep"
              >
                Book a Trip Now
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-hn-sm">
            {currentBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                canCancel={canCancel(booking)}
                isCancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  canCancel,
  isCancelling,
}: {
  booking: BookingDetails;
  onCancel: (id: string) => void;
  canCancel: boolean;
  isCancelling: boolean;
}) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: BookingDetails['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <StatusChip label="Confirmed" tone="success" />;
      case 'PENDING':
        return <StatusChip label="Pending" tone="warning" />;
      case 'CANCELLED':
        return <StatusChip label="Cancelled" tone="error" />;
      default:
        return <StatusChip label={status} tone="neutral" />;
    }
  };

  return (
    <article className="border-b border-border p-5 transition-colors duration-150 last:border-b-0 hover:bg-accent sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Ticket className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate font-display text-lg text-foreground">{booking.operator.name}</h3>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Booking Code: <span className="font-mono text-foreground">{booking.bookingCode}</span>
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-xl font-semibold text-foreground">
            {booking.totalPrice.toLocaleString('vi-VN')} ₫
          </p>
          <p className="text-sm text-muted-foreground">{booking.passengers.length} passenger(s)</p>
        </div>
      </div>

      {/* Route Info */}
      <div className="mb-4 grid grid-cols-1 gap-3 border-b border-border pb-4 md:grid-cols-3">
        <RouteFact icon={MapPin} label="From" value={booking.route.from} />
        <RouteFact icon={MapPin} label="To" value={booking.route.to} />
        <RouteFact icon={Clock} label="Duration" value={booking.route.duration} />
      </div>

      {/* Departure & Arrival */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <RouteFact
          icon={Calendar}
          label="Departure"
          value={formatDate(booking.route.departureTime)}
          detail={formatTime(booking.route.departureTime)}
        />
        <RouteFact
          icon={Calendar}
          label="Arrival"
          value={formatDate(booking.route.arrivalTime)}
          detail={formatTime(booking.route.arrivalTime)}
        />
      </div>

      {/* Passengers & Seats */}
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Users className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Passengers &amp; Seats
          </p>
          <div className="flex flex-wrap gap-2">
            {booking.passengers.map((passenger, idx) => (
              <span key={idx} className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                {passenger.fullName} - Seat {passenger.seatNumber}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bus Info */}
      <div className="mb-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <span className="text-muted-foreground">Bus Type:</span>{' '}
          <span className="font-semibold text-foreground">{booking.busType}</span>
        </div>
        <div>
          <span className="text-muted-foreground">License Plate:</span>{' '}
          <span className="font-mono text-foreground">{booking.licensePlate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
        <Link
          href={`/booking/success/${booking.id}`}
          className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep"
        >
          <Ticket className="h-4 w-4" />
          View E-Ticket
        </Link>

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isCancelling}
                className="inline-flex h-[42px] items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-error-ink transition-colors duration-150 hover:bg-error-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-lg border-border bg-card! shadow-hn-md!">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-xl text-foreground">Cancel Booking?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground!">
                  Are you sure you want to cancel this booking? A cancellation fee will apply according to our
                  policy:
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• More than 24 hours before departure: 90% refund</li>
                    <li>• 12-24 hours before departure: 50% refund</li>
                    <li>• Less than 12 hours: No refund</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-[42px] border-border! bg-card! text-foreground! hover:bg-muted!">
                  Keep Booking
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(booking.id)}
                  className="h-[42px] bg-destructive! text-destructive-foreground! hover:bg-destructive/90!"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </article>
  );
}

function StatusChip({ label, tone }: { label: string; tone: 'success' | 'warning' | 'error' | 'neutral' }) {
  const toneClassName =
    tone === 'success'
      ? 'bg-success-soft text-success-ink'
      : tone === 'warning'
        ? 'bg-warning-soft text-warning-ink'
        : tone === 'error'
          ? 'bg-error-soft text-error-ink'
          : 'bg-muted text-muted-foreground';

  return (
    <span className={`inline-flex shrink-0 items-center rounded-sm px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${toneClassName}`}>
      {label}
    </span>
  );
}

function RouteFact({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-semibold text-foreground">{value}</p>
        {detail ? <p className="font-mono text-sm text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  );
}
