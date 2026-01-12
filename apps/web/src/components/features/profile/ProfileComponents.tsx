'use client';

import { useForm } from 'react-hook-form';
import { User } from '@/types/models';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function ProfileForm({ user }: { user: User }) {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Profile updated! (Simulated)');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            {...register('fullName')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            {...register('phone')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            value={user.email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
      >
        {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Changes'}
      </button>
    </form>
  );
}

import { Booking } from '@/types/models';
import { format } from 'date-fns';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export function BookingHistoryList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't made any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                booking.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' : 
                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {booking.status}
              </span>
              <h3 className="text-lg font-bold mt-2">{booking.operatorName}</h3>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(booking.departureTime), 'EEE, dd MMM yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {booking.departureLocation} → {booking.arrivalLocation}
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Seats: {booking.seatNumbers.join(', ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
