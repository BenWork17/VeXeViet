'use client';

import { Card, ErrorState, PageHeader } from '@/components/ui';
import { KpiStrip } from '@/components/kpi-strip';
import { ChartTabs, ComparisonTable } from '@/components/dashboard-tabs';
import { useAdminSession } from '@/components/session';
import { useApi } from '@/lib/api';
import type { AdminDashboardStats, ItemResponse } from '@/lib/types';
import { formatVnd } from '@/lib/format';

/** The console's own window; the BE clamps 1..90 and defaults to 7. */
const DASHBOARD_DAYS = 7;

export default function DashboardPage() {
  const { session, ready } = useAdminSession();
  const path = ready && session ? '/bookings/admin/dashboard' : null;
  const { data: envelope, error, loading, reload, status } = useApi<ItemResponse<AdminDashboardStats>>(path, { days: DASHBOARD_DAYS });
  // `useApi` hands back the whole `{ success, data }` body, exactly as the service
  // sent it. The stats live one level down; destructuring them here is what keeps
  // a malformed body from reaching a chart (a stray `undefined.map` crashed the
  // whole dashboard before this).
  const stats = envelope?.data;

  const meta = session?.role === 'ADMIN' && stats ? `Toàn hệ thống · ${stats.operatorCount} nhà xe` : undefined;

  if (!ready || !session) {
    return (
      <>
        <PageHeader title="Dashboard vận hành" description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất." />
        <div className="mt-6 h-[86px] rounded-card border border-border bg-sheet" />
        <div className="mt-6 h-[420px] rounded-card border border-border bg-sheet" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Dashboard vận hành"
          description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất."
        />
        <Card className="mt-6 px-6 pb-6 pt-1">
          <ErrorState message={error.message} code={error.code} status={status} details={error.details} onRetry={reload} />
        </Card>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Dashboard vận hành" description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất." />
        <div className="mt-6 h-[86px] rounded-card border border-border bg-raised" aria-busy="true" />
        <div className="mt-6 h-[420px] rounded-card border border-border bg-raised" aria-busy="true" />
      </>
    );
  }

  // A 2xx whose body carries no `data` is a malformed response, not an empty
  // dashboard. Rendering the skeleton here instead would spin forever.
  if (!stats) {
    return (
      <>
        <PageHeader title="Dashboard vận hành" description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất." />
        <Card className="mt-6 px-6 pb-6 pt-1">
          <ErrorState
            message="Máy chủ trả về dữ liệu không đúng định dạng (thiếu phần data)."
            code="UNEXPECTED_RESPONSE"
            status={status}
            details={[]}
            onRetry={reload}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard vận hành"
        description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất."
        meta={meta}
      />

      <div className="mt-6">
        <KpiStrip
          className="grid-cols-1 sm:grid-cols-4"
          cells={[
            { label: 'Booking hôm nay', value: String(stats.todayBookings) },
            { label: 'Doanh thu hoàn tất', value: formatVnd(stats.revenueCompleted) },
            {
              label: 'Payment cần xử lý',
              value: String(stats.paymentsNeedingAction),
              tone: stats.paymentsNeedingAction > 0 ? 'negative' : 'ink',
            },
            { label: 'Tuyến đang mở', value: String(stats.activeRoutes) },
          ]}
        />
      </div>

      <Card className="mt-6 p-6">
        <ChartTabs revenueTrend={stats.revenueTrend} bookingStatusSummary={stats.bookingStatusSummary} />
        <div className="mt-6">
          <ComparisonTable data={stats.revenueTrend} />
        </div>
      </Card>
    </>
  );
}
