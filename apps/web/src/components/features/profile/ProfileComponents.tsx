'use client';

import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/error/ToastProvider';
import { User } from '@vexeviet/types';
import { Loader2 } from 'lucide-react';

export function ProfileForm({ user }: { user: User }) {
  const updateProfileMutation = useUpdateProfile();
  const { showSuccess, showError } = useToast();
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      showSuccess('Cập nhật thông tin thành công!');
    } catch (error: any) {
      showError('Lỗi', error?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
          <input
            {...register('lastName', { 
              required: 'Vui lòng nhập họ',
              minLength: { value: 1, message: 'Họ phải có ít nhất 1 ký tự' }
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
          <input
            {...register('firstName', { 
              required: 'Vui lòng nhập tên',
              minLength: { value: 1, message: 'Tên phải có ít nhất 1 ký tự' }
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={user.email || ''}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            {...register('phone', {
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message: 'Số điện thoại không hợp lệ (10-15 số)'
              }
            })}
            placeholder="+84901234567"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Định dạng: +84901234567 hoặc 0901234567</p>
        </div>
      </div>

      {/* Account Status */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Trạng thái tài khoản</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Email xác thực</span>
            {user.isEmailVerified ? (
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Đã xác thực</span>
            ) : (
              <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">⚠ Chưa xác thực</span>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Số điện thoại</span>
            {user.isPhoneVerified ? (
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Đã xác thực</span>
            ) : (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">⚠ Chưa xác thực</span>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={updateProfileMutation.isPending || !isDirty}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {updateProfileMutation.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin w-5 h-5" />
            Đang lưu...
          </span>
        ) : (
          'Lưu thay đổi'
        )}
      </button>
      {!isDirty && (
        <p className="text-xs text-gray-500 ml-2 inline-block">Không có thay đổi nào</p>
      )}
    </form>
  );
}

import { Booking } from '@/types/models';
import { format } from 'date-fns';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export function BookingHistoryList({ bookings, isLoading }: { bookings: any[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đặt chỗ</h3>
        <p className="mt-1 text-sm text-gray-500">Bạn chưa thực hiện bất kỳ đặt vé nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        // Handle both nested totalPrice object and direct totalAmount
        let totalAmount = 0;
        if (booking.totalPrice && typeof booking.totalPrice === 'object') {
          totalAmount = booking.totalPrice.amount || booking.totalPrice.total || 0;
        } else if (booking.totalAmount) {
          totalAmount = booking.totalAmount;
        } else if (booking.totalPrice) {
          totalAmount = booking.totalPrice;
        }
        
        const seatList = booking.passengers?.map((p: any) => p.seatNumber).filter(Boolean) || 
                        booking.seats || [];

        // Only show "View ticket" button for CONFIRMED or COMPLETED bookings
        const canViewTicket = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';

        return (
          <div key={booking.bookingId} className="bg-white border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 pb-4 border-b">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border border-green-300' : 
                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-300' : 
                    booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                    'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {booking.status === 'PENDING' ? 'Chờ thanh toán' :
                     booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                     booking.status === 'CANCELLED' ? 'Đã hủy' :
                     booking.status === 'COMPLETED' ? 'Hoàn thành' : booking.status}
                  </span>
                  {booking.status === 'PENDING' && booking.paymentDeadline && (
                    <span className="text-xs text-red-600 font-medium">
                      Hết hạn: {new Date(booking.paymentDeadline).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {booking.route?.name || `${booking.route?.origin} - ${booking.route?.destination}`}
                </h3>
                <p className="text-sm text-gray-500 font-mono">Mã đặt vé: <span className="font-bold text-primary">{booking.bookingCode}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                <p className="text-2xl font-black text-primary">
                  {new Intl.NumberFormat('vi-VN').format(totalAmount)}₫
                </p>
                {typeof booking.totalPrice === 'object' && booking.totalPrice.breakdown && (
                  <p className="text-xs text-gray-400 mt-1">
                    Phí dịch vụ: {new Intl.NumberFormat('vi-VN').format(booking.totalPrice.breakdown.serviceFee)}₫
                  </p>
                )}
              </div>
            </div>

            {/* Route Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hành trình</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{booking.route?.origin}</p>
                  <div className="flex items-center text-gray-400 my-1">
                    <div className="w-full h-px bg-gray-300 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2">→</div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{booking.route?.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Thời gian khởi hành</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(booking.route?.departureTime).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.route?.departureTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <Ticket className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ghế đã chọn</p>
                  <p className="text-sm font-bold text-gray-900">
                    {seatList.length > 0 ? seatList.join(', ') : 'Chưa có thông tin'}
                  </p>
                  <p className="text-xs text-gray-500">{booking.passengers?.length || 0} hành khách</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Loại xe</p>
                  <p className="text-sm font-bold text-gray-900">
                    {booking.route?.busType === 'LIMOUSINE' ? 'Limousine' :
                     booking.route?.busType === 'SLEEPER' ? 'Giường nằm' :
                     booking.route?.busType === 'VIP' ? 'VIP' :
                     booking.route?.busType === 'STANDARD' ? 'Tiêu chuẩn' :
                     booking.route?.busType || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Passengers */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Liên hệ</p>
                  <p className="text-gray-900">{booking.contactInfo?.email}</p>
                  <p className="text-gray-900">{booking.contactInfo?.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Hành khách</p>
                  {booking.passengers?.slice(0, 2).map((p: any, i: number) => (
                    <p key={i} className="text-gray-900">
                      {p.lastName} {p.firstName} {p.seatNumber && `(${p.seatNumber})`}
                    </p>
                  ))}
                  {booking.passengers?.length > 2 && (
                    <p className="text-gray-500 text-xs">+{booking.passengers.length - 2} người khác</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
              <span>Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}</span>
              {canViewTicket ? (
                <button
                  onClick={() => window.open(`/booking/ticket/${booking.bookingId}`, '_blank')}
                  className="text-primary hover:text-primary/80 font-medium hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Xem chi tiết & In vé
                </button>
              ) : booking.status === 'PENDING' ? (
                <button
                  onClick={() => window.location.href = `/booking/payment?bookingId=${booking.bookingId}`}
                  className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 font-medium flex items-center gap-1 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Thanh toán ngay
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
