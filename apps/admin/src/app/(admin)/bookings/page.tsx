import { CheckCircle2, Clock, Download, MessageSquare, Search, ShieldAlert, TicketX } from 'lucide-react';
import { ActionButton, ChartPanel, FilterBar, MiniBarChart, PageHeader, Panel, StatCard, StatusBadge, TableShell } from '@/components/ui';
import { bookings } from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';

export default function BookingsPage() {
  const pending = bookings.filter((booking) => booking.status === 'PENDING').length;
  const confirmed = bookings.filter((booking) => booking.status === 'CONFIRMED').length;
  const failedPayment = bookings.filter((booking) => booking.paymentStatus === 'FAILED').length;
  const firstBooking = bookings[0];

  return (
    <>
      <PageHeader
        eyebrow="Booking management"
        title="Quản lý booking"
        description="Màn hình theo dõi đặt vé, ghế, trạng thái booking và trạng thái thanh toán theo docs Booking Service."
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#063C45] px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-teal-900">
            <Download className="h-4 w-4" />
            Xuất dữ liệu
          </button>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đang giữ chỗ" value={String(pending)} helper="Cần nhắc thanh toán" icon={Clock} tone="amber" />
        <StatCard label="Đã xác nhận" value={String(confirmed)} helper="Sẵn sàng xuất vé" icon={CheckCircle2} tone="green" />
        <StatCard label="Payment lỗi" value={String(failedPayment)} helper="Cần đối soát" icon={ShieldAlert} tone="red" />
        <StatCard label="Ghế bị mất" value="3" helper="Expired booking hôm nay" icon={TicketX} tone="teal" />
      </div>
      <FilterBar>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400">
          <Search className="h-4 w-4" />
          Tìm mã booking, email, tuyến...
        </div>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
          <option>Tất cả trạng thái</option>
          <option>PENDING</option>
          <option>CONFIRMED</option>
          <option>EXPIRED</option>
        </select>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <TableShell>
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
            <ActionButton>Xác nhận hàng loạt</ActionButton>
            <ActionButton tone="secondary">Gửi nhắc thanh toán</ActionButton>
            <ActionButton tone="danger">Hủy booking lỗi</ActionButton>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Nhà xe / tuyến</th>
                <th className="px-5 py-3">Ghế</th>
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-black text-teal-700">{booking.bookingCode}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(booking.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-950">{booking.customerName}</p>
                    <p className="text-xs text-slate-500">{booking.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-950">{booking.operatorName}</p>
                    <p className="text-xs text-slate-500">{booking.routeName}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-700">{booking.seats.join(', ')}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={booking.status} tone={booking.status === 'CONFIRMED' ? 'green' : booking.status === 'EXPIRED' ? 'red' : 'amber'} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge label={booking.paymentStatus} tone={booking.paymentStatus === 'COMPLETED' ? 'green' : booking.paymentStatus === 'FAILED' ? 'red' : 'amber'} />
                  </td>
                  <td className="px-5 py-4 text-right font-black text-slate-950">{formatVnd(booking.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        <div className="space-y-6">
          <Panel className="p-5">
            <h2 className="text-lg font-black text-slate-950">Chi tiết nhanh</h2>
            {firstBooking ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-teal-50 p-4">
                  <p className="text-xs font-black uppercase text-teal-700">Đang chọn</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{firstBooking.bookingCode}</p>
                  <p className="text-sm font-semibold text-slate-600">{firstBooking.customerName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="font-black text-slate-400">Seats</p>
                    <p className="mt-1 font-black text-slate-950">{firstBooking.seats.join(', ')}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="font-black text-slate-400">Amount</p>
                    <p className="mt-1 font-black text-slate-950">{formatVnd(firstBooking.totalAmount)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton>Giữ ghế thêm</ActionButton>
                  <ActionButton tone="secondary">Gửi email</ActionButton>
                  <ActionButton tone="secondary">Ghi chú</ActionButton>
                </div>
              </div>
            ) : null}
          </Panel>
          <ChartPanel title="Booking theo trạng thái">
            <MiniBarChart
              data={[
                { label: 'Pending', value: pending, tone: 'amber' },
                { label: 'Confirmed', value: confirmed, tone: 'green' },
                { label: 'Payment failed', value: failedPayment, tone: 'red' },
              ]}
            />
          </ChartPanel>
          <Panel className="p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <MessageSquare className="h-5 w-5" />
              <h2 className="font-black text-slate-950">Ghi chú vận hành</h2>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">Khi BE có endpoint audit/note, panel này nên lưu lịch sử hỗ trợ từng booking.</p>
          </Panel>
        </div>
      </div>
    </>
  );
}
