'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useMyBookings } from '@/lib/hooks/useBookings';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileForm, BookingHistoryList } from '@/components/features/profile/ProfileComponents';
import { FadeIn } from '@/components/motion';
import { AvatarUploader } from '@/components/features/profile/AvatarUploader';
import { Spinner } from '@/components/ui/spinner';
import {
  Bell,
  Briefcase,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  TicketCheck,
} from 'lucide-react';

type ProfileTab = 'profile' | 'bookings' | 'notifications';

const notificationItems = [
  {
    id: 'payment',
    title: 'Nhắc thanh toán vé đang giữ chỗ',
    description: 'Hoàn tất thanh toán trước khi hết hạn để giữ đúng ghế đã chọn.',
    time: '5 phút trước',
    tone: 'warning',
    unread: true,
  },
  {
    id: 'route',
    title: 'Cập nhật hành trình',
    description: 'Một số chuyến có thể thay đổi điểm đón trong giờ cao điểm. Kiểm tra vé trước khi đi.',
    time: 'Hôm nay',
    tone: 'info',
    unread: true,
  },
  {
    id: 'promo',
    title: 'Ưu đãi khách hàng thân thiết',
    description: 'Bạn có mã giảm giá cho chuyến xe tiếp theo trên các tuyến phổ biến.',
    time: 'Hôm qua',
    tone: 'success',
    unread: false,
  },
];

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout, isLoggingOut } = useAuth();
  const { data: bookings = [], isLoading: isLoadingBookings } = useMyBookings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login?redirect=/profile');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-10">
          <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
            <Spinner
              size="sm"
              label={isAuthLoading ? 'Đang kiểm tra đăng nhập' : 'Đang chuyển đến trang đăng nhập'}
            />
            <span>
              {isAuthLoading
                ? 'Đang tải thông tin tài khoản…'
                : 'Đang chuyển đến trang đăng nhập…'}
            </span>
          </div>

          <div aria-hidden="true" className="space-y-8">
            <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  <div className="space-y-2.5">
                    <div className="h-5 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="h-8 w-56 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    <div className="h-4 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="space-y-2 rounded-lg border border-border bg-card p-3 shadow-hn-sm">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                    />
                  ))}
                </div>
                <div className="h-36 animate-pulse rounded-lg border border-border bg-card p-5 shadow-hn-sm motion-reduce:animate-none" />
              </aside>

              <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm md:p-8">
                <div className="space-y-2 border-b border-border pb-5">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-7 w-56 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng VeXeViet';
  const initials = `${user.lastName?.[0] || ''}${user.firstName?.[0] || ''}`.toUpperCase() || 'VX';
  const confirmedBookings = bookings.filter((booking: any) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED').length;
  const pendingBookings = bookings.filter((booking: any) => booking.status === 'PENDING').length;
  const unreadNotifications = notificationItems.filter((item) => item.unread).length;

  const navItems: Array<{
    id: ProfileTab;
    label: string;
    description: string;
    icon: typeof Settings;
    count?: number;
  }> = [
    { id: 'profile', label: 'Hồ sơ cá nhân', description: 'Thông tin và xác thực', icon: Settings },
    { id: 'bookings', label: 'Vé của tôi', description: 'Lịch sử đặt vé', icon: Briefcase, count: bookings.length },
    { id: 'notifications', label: 'Thông báo', description: 'Cập nhật tài khoản', icon: Bell, count: unreadNotifications },
  ];

  const pageTitle = activeTab === 'profile'
    ? 'Thông tin tài khoản'
    : activeTab === 'bookings'
      ? 'Lịch sử đặt vé'
      : 'Thông báo';

  const pageDescription = activeTab === 'profile'
    ? 'Quản lý thông tin cá nhân, số điện thoại và trạng thái xác thực.'
    : activeTab === 'bookings'
      ? 'Theo dõi vé đã đặt, trạng thái thanh toán và thao tác với vé.'
      : 'Các cập nhật quan trọng về vé, thanh toán và ưu đãi.';

  return (
    <FadeIn className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <section className="mb-8 overflow-hidden rounded-lg border border-border bg-primary shadow-hn-md">
          <div className="px-6 py-8 md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <AvatarUploader avatarUrl={user.avatarUrl} initials={initials} name={fullName} />
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-sm border border-primary-foreground/25 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Tài khoản khách hàng
                  </div>
                  <h1 className="font-display text-3xl text-primary-foreground md:text-4xl">{fullName}</h1>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email || 'Chưa có email'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Thành viên từ {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'hôm nay'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
                <ProfileStat label="Tổng vé" value={bookings.length} icon={TicketCheck} />
                <ProfileStat label="Hoàn tất" value={confirmedBookings} icon={CalendarCheck2} />
                <ProfileStat label="Chờ xử lý" value={pendingBookings} icon={Clock} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-3 shadow-hn-sm">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors duration-150 ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
                        isActive
                          ? 'bg-card text-accent-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{item.label}</span>
                        <span className={`block text-xs ${isActive ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{item.description}</span>
                      </span>
                      {typeof item.count === 'number' && item.count > 0 ? (
                        <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${
                          isActive ? 'bg-card text-accent-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.count}
                        </span>
                      ) : (
                        <ChevronRight className={`h-4 w-4 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-hn-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success-soft text-success-ink">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base text-foreground">Trạng thái</p>
                  <p className="text-xs text-muted-foreground">Độ tin cậy tài khoản</p>
                </div>
              </div>
              <div className="space-y-3">
                <VerificationRow label="Email" verified={user.isEmailVerified} />
                <VerificationRow label="Số điện thoại" verified={user.isPhoneVerified} />
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-error-ink transition-colors duration-150 hover:bg-error-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </aside>

          <main className="min-w-0">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-hn-sm">
              <div className="border-b border-border px-6 py-5 md:px-8">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">VeXeViet Account</p>
                <h2 className="font-display text-2xl text-foreground">{pageTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
              </div>
              <div className="p-5 md:p-8">
                {activeTab === 'profile' ? (
                  <ProfileForm user={user as any} />
                ) : activeTab === 'bookings' ? (
                  <BookingHistoryList bookings={bookings as any} isLoading={isLoadingBookings} />
                ) : (
                  <NotificationsPanel />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </FadeIn>
  );
}

function ProfileStat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof TicketCheck }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <Icon className="mb-3 h-5 w-5 text-accent-foreground" />
      <p className="font-display text-2xl text-foreground">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function VerificationRow({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${
        verified ? 'bg-success-soft text-success-ink' : 'bg-warning-soft text-warning-ink'
      }`}>
        {verified ? 'Đã xác thực' : 'Chưa xác thực'}
      </span>
    </div>
  );
}

function NotificationsPanel() {
  const [settings, setSettings] = useState({
    booking: true,
    trip: true,
    promo: false,
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <NotificationSetting
          title="Thông báo đặt vé"
          description="Trạng thái giữ chỗ, thanh toán và vé điện tử."
          enabled={settings.booking}
          onToggle={() => setSettings((current) => ({ ...current, booking: !current.booking }))}
        />
        <NotificationSetting
          title="Cập nhật chuyến đi"
          description="Thay đổi giờ chạy, điểm đón và ghi chú từ nhà xe."
          enabled={settings.trip}
          onToggle={() => setSettings((current) => ({ ...current, trip: !current.trip }))}
        />
        <NotificationSetting
          title="Ưu đãi"
          description="Mã giảm giá và tuyến phổ biến phù hợp với bạn."
          enabled={settings.promo}
          onToggle={() => setSettings((current) => ({ ...current, promo: !current.promo }))}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-3">
        {notificationItems.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-md border border-border bg-card p-4">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-current ${
              item.tone === 'warning' ? 'text-warning' : item.tone === 'success' ? 'text-success' : 'text-info'
            }`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationSetting({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{title}</p>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Bật tắt ${title}`}
          onClick={onToggle}
          className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
            enabled ? 'bg-primary' : 'bg-border'
          }`}
        >
          <span className={`h-4 w-4 rounded-full bg-card shadow-hn-sm ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
