'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { mockBookingApi } from '@/lib/api/mock/booking';
import { BookingDetails } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
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
import { Calendar, Clock, MapPin, Users, Ticket, CreditCard, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function BookingsDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadBookings();
  }, [user, router]);

  const loadBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await mockBookingApi.getBookingHistory(user.id);
      setBookings(data);
    } catch (error) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const result = await mockBookingApi.cancelBooking(bookingId);
      
      if (result.success) {
        showToast(result.message, 'success');
        await loadBookings(); // Refresh bookings
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('Failed to cancel booking', 'error');
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white animate-in slide-in-from-top-5`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your bus tickets and travel history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming Trips
          {upcomingBookings.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
              {upcomingBookings.length}
            </span>
          )}
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'past' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past Trips
          {pastBookings.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {pastBookings.length}
            </span>
          )}
          {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : currentBookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Ticket className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No {activeTab === 'upcoming' ? 'upcoming' : 'past'} trips</h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming trips yet."
              : "You don't have any past trips."}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book a Trip Now
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
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
        return <Badge variant="success">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold">{booking.operator.name}</h3>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-sm text-gray-500">Booking Code: {booking.bookingCode}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{booking.totalPrice.toLocaleString('vi-VN')} ₫</p>
            <p className="text-sm text-gray-500">{booking.passengers.length} passenger(s)</p>
          </div>
        </div>

        {/* Route Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-medium">{booking.route.from}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="font-medium">{booking.route.to}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{booking.route.duration}</p>
            </div>
          </div>
        </div>

        {/* Departure & Arrival */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="font-medium">{formatDate(booking.route.departureTime)}</p>
              <p className="text-sm text-gray-600">{formatTime(booking.route.departureTime)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="font-medium">{formatDate(booking.route.arrivalTime)}</p>
              <p className="text-sm text-gray-600">{formatTime(booking.route.arrivalTime)}</p>
            </div>
          </div>
        </div>

        {/* Passengers & Seats */}
        <div className="flex items-start gap-3 mb-4">
          <Users className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Passengers & Seats</p>
            <div className="flex flex-wrap gap-2">
              {booking.passengers.map((passenger, idx) => (
                <span key={idx} className="text-sm px-3 py-1 bg-gray-100 rounded-full">
                  {passenger.fullName} - Seat {passenger.seatNumber}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bus Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Bus Type:</span> <span className="font-medium">{booking.busType}</span>
          </div>
          <div>
            <span className="text-gray-500">License Plate:</span>{' '}
            <span className="font-medium">{booking.licensePlate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Link
            href={`/booking/success/${booking.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            View E-Ticket
          </Link>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isCancelling}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                  <AlertDialogDescription>
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
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(booking.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
