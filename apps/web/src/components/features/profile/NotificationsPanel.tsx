'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellOff, CheckCheck, ExternalLink } from 'lucide-react';
import type {
  SmartNotificationCategory,
  SmartNotificationItem,
  SmartNotificationPreferences,
} from '@/lib/hooks/useSmartNotifications';

interface NotificationsPanelProps {
  notifications: SmartNotificationItem[];
  unreadCount: number;
  preferences: SmartNotificationPreferences;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onTogglePreference: (category: SmartNotificationCategory) => void;
  onNavigateTab?: (tab: 'profile' | 'bookings' | 'notifications') => void;
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  preferences,
  onMarkAsRead,
  onMarkAllAsRead,
  onTogglePreference,
  onNavigateTab,
}: NotificationsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const visibleItems =
    filter === 'unread' ? notifications.filter((item) => item.unread) : notifications;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <NotificationSetting
          title="Thông báo đặt vé"
          description="Trạng thái giữ chỗ và đơn chờ thanh toán."
          enabled={preferences.booking}
          onToggle={() => onTogglePreference('booking')}
        />
        <NotificationSetting
          title="Cập nhật chuyến đi"
          description="Vé sắp khởi hành, đánh giá và phản hồi nhà xe."
          enabled={preferences.trip}
          onToggle={() => onTogglePreference('trip')}
        />
        <NotificationSetting
          title="Bảo mật tài khoản"
          description="Nhắc xác thực email và an toàn đăng nhập."
          enabled={preferences.security}
          onToggle={() => onTogglePreference('security')}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              filter === 'all'
                ? 'bg-card text-foreground shadow-hn-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              filter === 'unread'
                ? 'bg-card text-foreground shadow-hn-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <CheckCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 px-6 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card text-muted-foreground">
            <BellOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg text-foreground">
            {filter === 'unread' ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo mới'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Khi bạn có đơn vé chờ thanh toán, chuyến sắp khởi hành hoặc phản hồi từ nhà xe, hệ thống
            sẽ hiển thị ngay tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          {visibleItems.map((item) => {
            const handleInternalTab = () => {
              onMarkAsRead(item.id);
              if (item.actionHref === '/profile?tab=bookings' && onNavigateTab) {
                onNavigateTab('bookings');
              } else if (item.actionHref === '/profile?tab=profile' && onNavigateTab) {
                onNavigateTab('profile');
              }
            };

            const isSamePageTab =
              item.actionHref === '/profile?tab=bookings' ||
              item.actionHref === '/profile?tab=profile';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.unread) onMarkAsRead(item.id);
                }}
                className={`flex gap-4 rounded-md border p-4 transition-colors ${
                  item.unread
                    ? 'border-primary/30 bg-accent/35'
                    : 'border-border bg-card opacity-85'
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-current ${
                    item.tone === 'warning'
                      ? 'text-warning'
                      : item.tone === 'success'
                        ? 'text-success'
                        : 'text-info'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.unread && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                          Mới
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.relativeTime}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>

                  {item.actionLabel && item.actionHref && (
                    <div className="mt-3">
                      {isSamePageTab && onNavigateTab ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInternalTab();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                        >
                          {item.actionLabel}
                        </button>
                      ) : (
                        <Link
                          href={item.actionHref}
                          onClick={() => onMarkAsRead(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                        >
                          {item.actionLabel}
                          <ExternalLink className="h-3 w-3 opacity-80" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
          <span
            className={`h-4 w-4 rounded-full bg-card shadow-hn-sm transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
