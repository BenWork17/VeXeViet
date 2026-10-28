'use client';

import { Card, PageHeader } from '@/components/ui';
import { KpiStrip } from '@/components/kpi-strip';
import { ChartTabs, ComparisonTable } from '@/components/dashboard-tabs';
import { useAdminSession } from '@/components/session';
import { dashboardStats, operatorDashboardStats } from '@/lib/mock-data';
import { formatVnd } from '@/lib/format';

export default function DashboardPage() {
  const { session, ready } = useAdminSession();

  if (!ready || !session) {
    return (
      <>
        <PageHeader title="Dashboard vận hành" description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất." />
        <div className="mt-6 h-[86px] rounded-card border border-border bg-sheet" />
        <div className="mt-6 h-[420px] rounded-card border border-border bg-sheet" />
      </>
    );
  }

  const stats = session.role === 'OPERATOR' ? operatorDashboardStats : dashboardStats;

  return (
    <>
      <PageHeader
        title="Dashboard vận hành"
        description="Booking, doanh thu, thanh toán và tuyến đang mở trong kỳ 7 ngày gần nhất."
        meta={session.role === 'ADMIN' ? `Toàn hệ thống · ${stats.operatorCount} nhà xe` : undefined}
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
