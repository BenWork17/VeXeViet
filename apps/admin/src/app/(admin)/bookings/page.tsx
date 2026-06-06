import { Download, Search } from 'lucide-react';
import { FilterBar, PageHeader, StatusBadge, TableShell } from '@/components/ui';
import { bookings } from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';

export default function BookingsPage() {
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

      <TableShell>
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
    </>
  );
}
