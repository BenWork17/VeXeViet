'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useMyBookings } from '@/lib/hooks/useBookings';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileForm, BookingHistoryList } from '@/components/features/profile/ProfileComponents';
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
  User,
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
  const { user, logout, isLoggingOut } = useAuth();
  const { data: bookings = [], isLoading: isLoadingBookings } = useMyBookings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF6F5_48%,#F8FAFC_100%)]">
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-white/70 bg-[#063C45] shadow-2xl shadow-teal-950/10">
          <div className="relative px-6 py-8 md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(250,204,21,0.24),transparent_30%),linear-gradient(135deg,rgba(15,118,110,0.72),rgba(3,50,59,0.94))]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-2xl font-black text-white shadow-xl shadow-teal-950/20 backdrop-blur">
                  {initials}
                </div>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-amber-100/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Tài khoản khách hàng
                  </div>
                  <h1 className="text-3xl font-black text-white md:text-4xl">{fullName}</h1>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-teal-50/90">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-200" />
                      {user.email || 'Chưa có email'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-200" />
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
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-3 shadow-xl shadow-slate-200/60">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'bg-[#063C45] text-white shadow-lg shadow-teal-950/15'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isActive ? 'bg-white/15 text-amber-100' : 'bg-teal-50 text-teal-700 group-hover:bg-white'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{item.label}</span>
                        <span className={`block text-xs ${isActive ? 'text-teal-50/80' : 'text-slate-400'}`}>{item.description}</span>
                      </span>
                      {typeof item.count === 'number' && item.count > 0 ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                          isActive ? 'bg-amber-100 text-teal-950' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.count}
                        </span>
                      ) : (
                        <ChevronRight className={`h-4 w-4 ${isActive ? 'text-amber-100' : 'text-slate-300'}`} />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-950">Trạng thái</p>
                  <p className="text-xs text-slate-500">Độ tin cậy tài khoản</p>
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
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </aside>

          <main className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-200/60">
              <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">VeXeViet Account</p>
                <h2 className="text-2xl font-black text-slate-950">{pageTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
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
    </div>
  );
}

function ProfileStat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof TicketCheck }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/12 p-4 text-white backdrop-blur">
      <Icon className="mb-3 h-5 w-5 text-amber-200" />
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold text-teal-50/80">{label}</p>
    </div>
  );
}

function VerificationRow({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${
        verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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

      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
        {notificationItems.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm [&+&]:mt-3">
            <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
              item.tone === 'warning' ? 'bg-amber-400' : item.tone === 'success' ? 'bg-emerald-400' : 'bg-sky-400'
            }`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-black text-slate-950">{item.title}</h3>
                <span className="text-xs font-semibold text-slate-400">{item.time}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-bold text-slate-950">{title}</p>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Bật tắt ${title}`}
          onClick={onToggle}
          className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
            enabled ? 'bg-[#0F766E]' : 'bg-slate-200'
          }`}
        >
          <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>
      <p className="text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
