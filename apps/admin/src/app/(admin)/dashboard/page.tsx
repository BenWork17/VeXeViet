import { AlertTriangle, CreditCard, Route, Ticket, Users } from 'lucide-react';
import { ChartPanel, DonutChart, ManagementQueue, MiniBarChart, PageHeader, Panel, SparkAreaChart, StatCard, StatusBadge, TableShell } from '@/components/ui';
import {
  adminQueues,
  backendContractNotes,
  bookingStatusSummary,
  bookings,
  operators,
  payments,
  revenueTrend,
  routeDemandSummary,
  routes,
} from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';

export default function DashboardPage() {
  const revenue = payments.filter((payment) => payment.status === 'COMPLETED').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter((payment) => payment.status !== 'COMPLETED').length;
  const activeRoutes = routes.filter((route) => route.status === 'ACTIVE').length;

  return (
    <>
      <PageHeader
        eyebrow="Operations overview"
        title="Dashboard vận hành"
        description="Theo dõi booking, doanh thu, thanh toán và tồn kho tuyến xe. Số liệu hiện là mock data chờ backend admin API."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bookings hôm nay" value={String(bookings.length)} helper="3 trạng thái cần theo dõi" icon={Ticket} />
        <StatCard label="Doanh thu hoàn tất" value={formatVnd(revenue)} helper="Từ payment COMPLETED" icon={CreditCard} tone="green" />
        <StatCard label="Payment cần xử lý" value={String(pendingPayments)} helper="Pending hoặc failed" icon={AlertTriangle} tone="amber" />
        <StatCard label="Tuyến đang mở" value={String(activeRoutes)} helper={`${operators.length} nhà xe trong mock`} icon={Route} tone="teal" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartPanel title="Xu hướng doanh thu 7 ngày" description="Đơn vị hiển thị theo triệu VND, dùng để nhìn nhanh ngày cao điểm và ngày cần kích cầu.">
          <SparkAreaChart data={revenueTrend} />
        </ChartPanel>
        <ChartPanel title="Phân bổ trạng thái booking" description="Giúp đội vận hành thấy ngay lượng booking pending hoặc expired cần xử lý.">
          <DonutChart data={bookingStatusSummary} />
        </ChartPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartPanel title="Nhu cầu theo tuyến" description="Ưu tiên mở thêm chuyến cho tuyến có nhu cầu cao.">
          <MiniBarChart data={routeDemandSummary} />
        </ChartPanel>
        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-black text-slate-950">Queue quản lý cần xử lý</h2>
          </div>
          <ManagementQueue items={adminQueues} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <TableShell>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-black text-slate-950">Booking mới nhất</h2>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Mã</th>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Tuyến</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-5 py-4 font-black text-teal-700">{booking.bookingCode}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-950">{booking.customerName}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(booking.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-600">{booking.routeName}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={booking.status} tone={booking.status === 'CONFIRMED' ? 'green' : booking.status === 'EXPIRED' ? 'red' : 'amber'} />
                  </td>
                  <td className="px-5 py-4 font-black text-slate-950">{formatVnd(booking.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-black text-slate-950">Ghi chú contract BE</h2>
          </div>
          <div className="space-y-3">
            {backendContractNotes.map((note) => (
              <div key={note} className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">
                {note}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
