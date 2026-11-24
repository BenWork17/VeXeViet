'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Booking, ReviewEligibilityItem, User } from '@vexeviet/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMyBookings } from '@/lib/hooks/useBookings';
import { useReviewEligibility } from '@/lib/hooks/useReviews';
import { useAppSelector } from '@/lib/hooks/redux';

export type SmartNotificationCategory = 'booking' | 'trip' | 'security';
export type SmartNotificationTone = 'warning' | 'info' | 'success';

export interface SmartNotificationPreferences {
  booking: boolean;
  trip: boolean;
  security: boolean;
}

export interface SmartNotificationItem {
  id: string;
  category: SmartNotificationCategory;
  tone: SmartNotificationTone;
  title: string;
  description: string;
  createdAt: string;
  relativeTime: string;
  unread: boolean;
  actionLabel?: string;
  actionHref?: string;
  bookingId?: string;
}

export interface DeriveSmartNotificationsInput {
  user?: Pick<User, 'id' | 'email' | 'isEmailVerified'> | null;
  bookings?: Array<
    Omit<Partial<Booking>, 'route'> & {
      bookingId?: string;
      paymentDeadline?: string;
      route?: Partial<NonNullable<Booking['route']>>;
    }
  >;
  eligibilityMap?: Record<string, ReviewEligibilityItem>;
  seatHold?: {
    holdId: string | null;
    holdExpiresAt: string | null;
    routeId?: string;
    seats?: string[];
  } | null;
  readIds?: ReadonlySet<string>;
  preferences?: SmartNotificationPreferences;
  now?: Date;
}

const READ_STORAGE_KEY = 'vexeviet_read_notifications';
const PREFS_STORAGE_KEY = 'vexeviet_notification_prefs';
const SYNC_EVENT_NAME = 'vexeviet:notifications-updated';

export const DEFAULT_NOTIFICATION_PREFS: SmartNotificationPreferences = {
  booking: true,
  trip: true,
  security: true,
};

function formatRelativeVi(isoDate: string | undefined, now: Date): string {
  if (!isoDate) return 'Vừa xong';
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return 'Hôm nay';
  const diffMinutes = Math.round((target - now.getTime()) / 60000);

  if (diffMinutes > 0) {
    if (diffMinutes < 60) return `Còn ${diffMinutes} phút`;
    const hours = Math.round(diffMinutes / 60);
    if (hours < 24) return `Khởi hành sau ${hours} giờ`;
    return new Date(isoDate).toLocaleDateString('vi-VN');
  }

  const elapsedMinutes = Math.abs(diffMinutes);
  if (elapsedMinutes < 2) return 'Vừa xong';
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;
  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`;
  const elapsedDays = Math.round(elapsedHours / 24);
  if (elapsedDays <= 7) return `${elapsedDays} ngày trước`;
  return new Date(isoDate).toLocaleDateString('vi-VN');
}

export function deriveSmartNotifications({
  user,
  bookings = [],
  eligibilityMap = {},
  seatHold,
  readIds = new Set<string>(),
  preferences = DEFAULT_NOTIFICATION_PREFS,
  now = new Date(),
}: DeriveSmartNotificationsInput): SmartNotificationItem[] {
  const items: SmartNotificationItem[] = [];
  const nowMs = now.getTime();

  // 1. Active seat hold countdown in current browser session
  if (preferences.booking && seatHold?.holdId && seatHold.holdExpiresAt) {
    const expiresMs = new Date(seatHold.holdExpiresAt).getTime();
    if (!Number.isNaN(expiresMs) && expiresMs > nowMs) {
      const id = `hold:${seatHold.holdId}`;
      const seatText = seatHold.seats?.length ? ` (${seatHold.seats.join(', ')})` : '';
      items.push({
        id,
        category: 'booking',
        tone: 'warning',
        title: `Ghế đang giữ tạm thời${seatText}`,
        description:
          'Hoàn tất thông tin hành khách và thanh toán trước khi hết thời gian giữ ghế.',
        createdAt: seatHold.holdExpiresAt,
        relativeTime: formatRelativeVi(seatHold.holdExpiresAt, now),
        unread: !readIds.has(id),
        actionLabel: 'Tiếp tục đặt vé',
        actionHref: seatHold.routeId ? `/booking/${seatHold.routeId}` : '/booking/passenger-info',
      });
    }
  }

  // 2. Bookings: PENDING payments, upcoming CONFIRMED trips, review eligibility & replies
  for (const booking of bookings) {
    const bookingId = booking.bookingId || booking.id;
    if (!bookingId) continue;

    const code = booking.bookingCode || bookingId.slice(0, 8).toUpperCase();
    const routeLabel =
      booking.route?.origin && booking.route?.destination
        ? `${booking.route.origin} → ${booking.route.destination}`
        : 'Chuyến xe của bạn';

    if (preferences.booking && booking.status === 'PENDING') {
      const id = `booking-pending:${bookingId}`;
      items.push({
        id,
        category: 'booking',
        tone: 'warning',
        title: `Đơn ${code} đang chờ thanh toán`,
        description: `Chuyến ${routeLabel} chưa hoàn tất thanh toán. Thanh toán sớm để giữ chắc chỗ ngồi.`,
        createdAt: booking.paymentDeadline || booking.createdAt || now.toISOString(),
        relativeTime: formatRelativeVi(booking.paymentDeadline || booking.createdAt, now),
        unread: !readIds.has(id),
        actionLabel: 'Thanh toán ngay',
        actionHref: `/booking/payment?bookingId=${encodeURIComponent(bookingId)}`,
        bookingId,
      });
    }

    if (preferences.trip && booking.status === 'CONFIRMED' && booking.route?.departureTime) {
      const depMs = new Date(booking.route.departureTime).getTime();
      const hoursUntilDep = (depMs - nowMs) / (1000 * 60 * 60);
      if (!Number.isNaN(depMs) && hoursUntilDep > -2 && hoursUntilDep <= 72) {
        const id = `trip-upcoming:${bookingId}`;
        items.push({
          id,
          category: 'trip',
          tone: 'info',
          title: `Sắp khởi hành: ${routeLabel}`,
          description: `Mã vé ${code} khởi hành lúc ${new Date(
            booking.route.departureTime
          ).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })}. Vui lòng có mặt trước 15 phút.`,
          createdAt: booking.route.departureTime,
          relativeTime: formatRelativeVi(booking.route.departureTime, now),
          unread: !readIds.has(id),
          actionLabel: 'Mở vé QR',
          actionHref: `/booking/ticket/${encodeURIComponent(bookingId)}`,
          bookingId,
        });
      }
    }

    const eligibility = eligibilityMap[bookingId];
    if (preferences.trip && eligibility?.canReview) {
      const id = `review-eligible:${bookingId}`;
      items.push({
        id,
        category: 'trip',
        tone: 'success',
        title: `Mời đánh giá chuyến ${routeLabel}`,
        description: `Hành trình ${code} đã hoàn tất. Chia sẻ trải nghiệm để giúp cộng đồng hành khách VeXeViet.`,
        createdAt: booking.updatedAt || booking.route?.departureTime || now.toISOString(),
        relativeTime: formatRelativeVi(booking.updatedAt || booking.route?.departureTime, now),
        unread: !readIds.has(id),
        actionLabel: 'Đánh giá nhà xe',
        actionHref: '/profile?tab=bookings',
        bookingId,
      });
    }

    if (preferences.trip && eligibility?.review?.operatorReply) {
      const id = `review-reply:${bookingId}`;
      items.push({
        id,
        category: 'trip',
        tone: 'info',
        title: `Nhà xe đã phản hồi đánh giá đơn ${code}`,
        description: eligibility.review.operatorReply,
        createdAt: eligibility.review.repliedAt || eligibility.review.createdAt,
        relativeTime: formatRelativeVi(
          eligibility.review.repliedAt || eligibility.review.createdAt,
          now
        ),
        unread: !readIds.has(id),
        actionLabel: 'Xem phản hồi',
        actionHref: '/profile?tab=bookings',
        bookingId,
      });
    }
  }

  // 3. Account verification reminder
  if (preferences.security && user && user.isEmailVerified === false) {
    const id = `security:unverified-email:${user.id}`;
    items.push({
      id,
      category: 'security',
      tone: 'warning',
      title: 'Xác thực địa chỉ Email tài khoản',
      description: `Email ${user.email || ''} chưa được xác minh. Xác thực giúp nhận vé điện tử và khôi phục mật khẩu an toàn.`,
      createdAt: now.toISOString(),
      relativeTime: ' Khuyến nghị',
      unread: !readIds.has(id),
      actionLabel: 'Kiểm tra hồ sơ',
      actionHref: '/profile?tab=profile',
    });
  }

  return items;
}

function readStoredSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function readStoredPrefs(): SmartNotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    const parsed = JSON.parse(raw) as Partial<SmartNotificationPreferences>;
    return {
      booking: parsed.booking ?? true,
      trip: parsed.trip ?? true,
      security: parsed.security ?? true,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function useSmartNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { data: bookings = [], isLoading: isLoadingBookings } = useMyBookings(isAuthenticated);
  const bookingState = useAppSelector((state) => state.booking);

  const bookingIds = useMemo(
    () =>
      bookings
        .map((b: Booking & { bookingId?: string }) => b.bookingId || b.id)
        .filter((id): id is string => Boolean(id)),
    [bookings]
  );

  const { data: eligibilityMap } = useReviewEligibility(
    bookingIds,
    isAuthenticated && !isLoadingBookings && bookingIds.length > 0
  );

  const [readIds, setReadIds] = useState<Set<string>>(() => readStoredSet());
  const [preferences, setPreferences] = useState<SmartNotificationPreferences>(() =>
    readStoredPrefs()
  );

  useEffect(() => {
    const syncState = () => {
      setReadIds(readStoredSet());
      setPreferences(readStoredPrefs());
    };
    window.addEventListener('storage', syncState);
    window.addEventListener(SYNC_EVENT_NAME, syncState);
    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener(SYNC_EVENT_NAME, syncState);
    };
  }, []);

  const notifications = useMemo(
    () =>
      deriveSmartNotifications({
        user,
        bookings: bookings as Array<Partial<Booking> & { bookingId?: string; paymentDeadline?: string }>,
        eligibilityMap,
        seatHold: {
          holdId: bookingState.holdId,
          holdExpiresAt: bookingState.holdExpiresAt,
          routeId: bookingState.currentRoute?.id,
          seats: bookingState.heldSeats.length ? bookingState.heldSeats : bookingState.selectedSeats,
        },
        readIds,
        preferences,
      }),
    [user, bookings, eligibilityMap, bookingState, readIds, preferences]
  );

  const persistReadIds = useCallback((next: Set<string>) => {
    setReadIds(next);
    try {
      window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(next)));
      window.dispatchEvent(new Event(SYNC_EVENT_NAME));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      const next = new Set(readIds);
      next.add(id);
      persistReadIds(next);
    },
    [readIds, persistReadIds]
  );

  const markAllAsRead = useCallback(() => {
    const next = new Set(readIds);
    for (const item of notifications) {
      next.add(item.id);
    }
    persistReadIds(next);
  }, [notifications, readIds, persistReadIds]);

  const togglePreference = useCallback(
    (category: SmartNotificationCategory) => {
      const next: SmartNotificationPreferences = {
        ...preferences,
        [category]: !preferences[category],
      };
      setPreferences(next);
      try {
        window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(SYNC_EVENT_NAME));
      } catch {
        // Ignore storage errors
      }
    },
    [preferences]
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading: isLoadingBookings,
    markAsRead,
    markAllAsRead,
    togglePreference,
  };
}
