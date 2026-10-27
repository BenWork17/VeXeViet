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

      <div className="rounded-lg border border-border bg-muted p-4 md:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base text-foreground">Bảo mật và xác thực</h3>
            <p className="text-sm text-muted-foreground">Theo dõi các kênh liên hệ đã được xác minh.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AccountStatusCard label="Email xác thực" verified={user.isEmailVerified} />
          <AccountStatusCard label="Số điện thoại" verified={user.isPhoneVerified} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending || !isDirty}
          className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateProfileMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" />
              Đang lưu...
            </span>
          ) : (
            'Lưu thay đổi'
          )}
        </button>
        {!isDirty && <p className="text-sm text-muted-foreground">Không có thay đổi nào cần lưu.</p>}
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
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <span
        className={`flex h-[42px] items-center gap-2.5 rounded-md border bg-field px-3.5 transition-colors duration-150 ${
          error
            ? 'border-2 border-error ring-[3px] ring-error-soft'
            : 'border-input hover:border-primary focus-within:border-2 focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          {...inputProps}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-error-ink">{error}</span>
      ) : helperText ? (
        <span className="mt-1 block text-xs text-muted-foreground">{helperText}</span>
      ) : null}
    </label>
  );
}

function ProfileReadOnlyField({ label, value, icon: Icon, note }: { label: string; value: string; icon: typeof Mail; note: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <span className="flex h-[42px] items-center gap-2.5 rounded-md border border-border bg-muted px-3.5 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input value={value} disabled className="h-full min-w-0 flex-1 bg-transparent text-muted-foreground outline-none" />
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
    </label>
  );
}

function AccountStatusCard({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {verified ? 'Có thể nhận thông báo quan trọng' : 'Nên xác thực để bảo vệ tài khoản'}
        </p>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold ${
        verified ? 'bg-success-soft text-success-ink' : 'bg-warning-soft text-warning-ink'
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
          <div key={item} className="h-40 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-6 py-14 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-card text-accent-foreground">
          <Ticket className="h-8 w-8" />
        </div>
        <h3 className="font-display text-xl text-foreground">Chưa có đặt chỗ</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Bạn chưa thực hiện bất kỳ đặt vé nào. Khi đặt vé thành công, lịch sử sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-hn-sm">
      {bookings.map((booking) => {
        const totalAmount = getTotalAmount(booking);
        const seatList = booking.passengers?.map((p: any) => p.seatNumber).filter(Boolean) || booking.seats || [];
        const canViewTicket = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
        const bookingId = booking.bookingId || booking.id;

        return (
          <article
            key={bookingId}
            className="border-b border-border px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-accent"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Ticket className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={booking.status} />
                    {booking.status === 'PENDING' && booking.paymentDeadline && (
                      <span className="rounded-sm bg-error-soft px-2.5 py-1 text-xs font-semibold text-error-ink">
                        Hết hạn {new Date(booking.paymentDeadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <h3 className="truncate font-display text-lg text-foreground">
                    {booking.route?.name || `${booking.route?.origin || 'Điểm đi'} - ${booking.route?.destination || 'Điểm đến'}`}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Mã đặt vé: <span className="font-mono text-foreground">{booking.bookingCode || bookingId}</span>
                  </p>
                </div>
              </div>
              <div className="shrink-0 md:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tổng tiền</p>
                <p className="font-mono text-xl font-semibold text-foreground">
                  {new Intl.NumberFormat('vi-VN').format(totalAmount)}đ
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 border-t border-border pt-3 md:grid-cols-2">
              <BookingInfo icon={MapPin} label="Hành trình" value={`${booking.route?.origin || 'N/A'} → ${booking.route?.destination || 'N/A'}`} />
              <BookingInfo icon={Calendar} label="Khởi hành" value={formatDeparture(booking.route?.departureTime)} />
              <BookingInfo icon={Ticket} label="Ghế đã chọn" value={seatList.length > 0 ? seatList.join(', ') : 'Chưa có thông tin'} />
              <BookingInfo icon={CreditCard} label="Loại xe" value={formatBusType(booking.route?.busType)} />
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Đặt lúc: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
              {canViewTicket ? (
                <button
                  onClick={() => window.open(`/booking/ticket/${bookingId}`, '_blank')}
                  className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep"
                >
                  Xem chi tiết &amp; in vé
                </button>
              ) : booking.status === 'PENDING' ? (
                <button
                  onClick={() => {
                    setNavigatingBookingId(bookingId);
                    window.location.href = `/booking/payment?bookingId=${bookingId}`;
                  }}
                  disabled={navigatingBookingId === bookingId}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-warning-ink transition-colors duration-150 hover:bg-warning-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {navigatingBookingId === bookingId && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
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
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'PENDING'
      ? 'bg-warning-soft text-warning-ink'
      : status === 'CONFIRMED'
        ? 'bg-success-soft text-success-ink'
        : status === 'CANCELLED'
          ? 'bg-error-soft text-error-ink'
          : status === 'COMPLETED'
            ? 'bg-info-soft text-info-ink'
            : 'bg-muted text-muted-foreground';

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

  return <span className={`rounded-sm px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>{label}</span>;
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
