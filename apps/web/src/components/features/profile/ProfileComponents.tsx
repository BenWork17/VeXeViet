'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/error/ToastProvider';
import { User } from '@vexeviet/types';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  UserRound,
} from 'lucide-react';

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
};

export function ProfileForm({ user }: { user: User }) {
  const updateProfileMutation = useUpdateProfile();
  const { showSuccess, showError } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      showSuccess('Cập nhật thông tin thành công!');
    } catch (error: any) {
      showError('Lỗi', error?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileInput
          label="Họ"
          icon={UserRound}
          error={errors.lastName?.message}
          inputProps={register('lastName', {
            required: 'Vui lòng nhập họ',
            minLength: { value: 1, message: 'Họ phải có ít nhất 1 ký tự' },
          })}
        />
        <ProfileInput
          label="Tên"
          icon={UserRound}
          error={errors.firstName?.message}
          inputProps={register('firstName', {
            required: 'Vui lòng nhập tên',
            minLength: { value: 1, message: 'Tên phải có ít nhất 1 ký tự' },
          })}
        />
        <ProfileReadOnlyField label="Email" value={user.email || 'Chưa có email'} icon={Mail} note="Email không thể thay đổi tại đây" />
        <ProfileInput
          label="Số điện thoại"
          icon={Phone}
          placeholder="+84901234567"
          helperText="Định dạng: +84901234567 hoặc 0901234567"
          error={errors.phone?.message}
          inputProps={register('phone', {
            pattern: {
              value: /^\+?[0-9]{10,15}$/,
              message: 'Số điện thoại không hợp lệ (10-15 số)',
            },
          })}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-950">Bảo mật và xác thực</h3>
            <p className="text-sm text-slate-500">Theo dõi các kênh liên hệ đã được xác minh.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AccountStatusCard label="Email xác thực" verified={user.isEmailVerified} />
          <AccountStatusCard label="Số điện thoại" verified={user.isPhoneVerified} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending || !isDirty}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#063C45] px-6 text-sm font-black text-white shadow-lg shadow-teal-950/15 transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {updateProfileMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang lưu...
            </span>
          ) : (
            'Lưu thay đổi'
          )}
        </button>
        {!isDirty && <p className="text-sm font-medium text-slate-400">Không có thay đổi nào cần lưu.</p>}
      </div>
    </form>
  );
}

function ProfileInput({
  label,
  icon: Icon,
  error,
  helperText,
  inputProps,
  placeholder,
}: {
  label: string;
  icon: typeof UserRound;
  error?: string;
  helperText?: string;
  placeholder?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className={`flex h-12 items-center gap-3 rounded-2xl border bg-white px-4 shadow-sm transition-colors ${
        error ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100'
      }`}>
        <Icon className="h-5 w-5 text-slate-400" />
        <input
          {...inputProps}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-300"
        />
      </span>
      {error ? (
        <span className="mt-2 block text-sm font-semibold text-red-600">{error}</span>
      ) : helperText ? (
        <span className="mt-2 block text-xs font-medium text-slate-400">{helperText}</span>
      ) : null}
    </label>
  );
}

function ProfileReadOnlyField({ label, value, icon: Icon, note }: { label: string; value: string; icon: typeof Mail; note: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500">
        <Icon className="h-5 w-5 text-slate-400" />
        <input value={value} disabled className="h-full min-w-0 flex-1 bg-transparent outline-none" />
      </span>
      <span className="mt-2 block text-xs font-medium text-slate-400">{note}</span>
    </label>
  );
}

function AccountStatusCard({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-bold text-slate-950">{label}</p>
        <p className="text-xs text-slate-400">{verified ? 'Có thể nhận thông báo quan trọng' : 'Nên xác thực để bảo vệ tài khoản'}</p>
      </div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
        verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        {verified ? 'Đã xác thực' : 'Chưa xác thực'}
      </span>
    </div>
  );
}

export function BookingHistoryList({ bookings, isLoading }: { bookings: any[]; isLoading?: boolean }) {
  const [navigatingBookingId, setNavigatingBookingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-3xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
          <Ticket className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black text-slate-950">Chưa có đặt chỗ</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Bạn chưa thực hiện bất kỳ đặt vé nào. Khi đặt vé thành công, lịch sử sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const totalAmount = getTotalAmount(booking);
        const seatList = booking.passengers?.map((p: any) => p.seatNumber).filter(Boolean) || booking.seats || [];
        const canViewTicket = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
        const bookingId = booking.bookingId || booking.id;

        return (
          <article key={bookingId} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={booking.status} />
                  {booking.status === 'PENDING' && booking.paymentDeadline && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      Hết hạn {new Date(booking.paymentDeadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <h3 className="truncate text-xl font-black text-slate-950">
                  {booking.route?.name || `${booking.route?.origin || 'Điểm đi'} - ${booking.route?.destination || 'Điểm đến'}`}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Mã đặt vé: <span className="font-black text-teal-700">{booking.bookingCode || bookingId}</span>
                </p>
              </div>
              <div className="rounded-2xl bg-teal-50 px-4 py-3 md:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Tổng tiền</p>
                <p className="text-2xl font-black text-[#063C45]">{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</p>
              </div>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2">
              <BookingInfo icon={MapPin} label="Hành trình" value={`${booking.route?.origin || 'N/A'} → ${booking.route?.destination || 'N/A'}`} />
              <BookingInfo icon={Calendar} label="Khởi hành" value={formatDeparture(booking.route?.departureTime)} />
              <BookingInfo icon={Ticket} label="Ghế đã chọn" value={seatList.length > 0 ? seatList.join(', ') : 'Chưa có thông tin'} />
              <BookingInfo icon={CreditCard} label="Loại xe" value={formatBusType(booking.route?.busType)} />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Đặt lúc: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
              {canViewTicket ? (
                <button
                  onClick={() => window.open(`/booking/ticket/${bookingId}`, '_blank')}
                  className="inline-flex items-center justify-center rounded-xl bg-[#063C45] px-4 py-2 font-bold text-white transition-colors hover:bg-[#0F766E]"
                >
                  Xem chi tiết & in vé
                </button>
              ) : booking.status === 'PENDING' ? (
                <button
                  onClick={() => {
                    setNavigatingBookingId(bookingId);
                    window.location.href = `/booking/payment?bookingId=${bookingId}`;
                  }}
                  disabled={navigatingBookingId === bookingId}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {navigatingBookingId === bookingId && <Loader2 className="h-4 w-4 animate-spin" />}
                  Thanh toán ngay
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function BookingInfo({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'PENDING'
      ? 'bg-amber-100 text-amber-700'
      : status === 'CONFIRMED'
        ? 'bg-emerald-100 text-emerald-700'
        : status === 'CANCELLED'
          ? 'bg-red-100 text-red-700'
          : status === 'COMPLETED'
            ? 'bg-sky-100 text-sky-700'
            : 'bg-slate-100 text-slate-600';

  const label =
    status === 'PENDING'
      ? 'Chờ thanh toán'
      : status === 'CONFIRMED'
        ? 'Đã xác nhận'
        : status === 'CANCELLED'
          ? 'Đã hủy'
          : status === 'COMPLETED'
            ? 'Hoàn thành'
            : status || 'Không rõ';

  return <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${className}`}>{label}</span>;
}

function getTotalAmount(booking: any) {
  if (booking.totalPrice && typeof booking.totalPrice === 'object') {
    return booking.totalPrice.amount || booking.totalPrice.total || 0;
  }
  return booking.totalAmount || booking.totalPrice || 0;
}

function formatDeparture(value?: string) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return `${date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })} · ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatBusType(value?: string) {
  if (value === 'LIMOUSINE') return 'Limousine';
  if (value === 'SLEEPER') return 'Giường nằm';
  if (value === 'VIP') return 'VIP';
  if (value === 'STANDARD') return 'Tiêu chuẩn';
  return value || 'N/A';
}
