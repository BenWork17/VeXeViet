import { AlertTriangle, CreditCard, ShieldCheck } from 'lucide-react';
import { PageHeader, Panel, StatCard, StatusBadge, TableShell } from '@/components/ui';
import { payments } from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';

export default function PaymentsPage() {
  const completed = payments.filter((payment) => payment.status === 'COMPLETED').length;
  const failed = payments.filter((payment) => payment.status === 'FAILED').length;

  return (
    <>
      <PageHeader
        eyebrow="Payment operations"
        title="Giám sát thanh toán"
        description="Theo dõi VNPay, Momo, ZaloPay và các giao dịch cần đối soát với Booking Service."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Hoàn tất" value={String(completed)} helper="Payment COMPLETED" icon={ShieldCheck} tone="green" />
        <StatCard label="Lỗi cần xử lý" value={String(failed)} helper="Đối soát booking sync" icon={AlertTriangle} tone="red" />
        <StatCard label="Tổng giao dịch" value={String(payments.length)} helper="Mock payment service" icon={CreditCard} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Giao dịch</th>
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Cổng</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Rủi ro</th>
                <th className="px-5 py-3 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950">{payment.id}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(payment.updatedAt)}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-teal-700">{payment.bookingCode}</td>
                  <td className="px-5 py-4 font-bold text-slate-700">{payment.provider}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={payment.status} tone={payment.status === 'COMPLETED' ? 'green' : payment.status === 'FAILED' ? 'red' : 'amber'} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge label={payment.risk} tone={payment.risk === 'urgent' ? 'red' : payment.risk === 'watch' ? 'amber' : 'green'} />
                  </td>
                  <td className="px-5 py-4 text-right font-black text-slate-950">{formatVnd(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        <Panel className="p-5">
          <h2 className="text-lg font-black text-slate-950">Luồng cần BE khóa chặt</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Payment webhook cần đồng bộ booking theo thứ tự rõ ràng, có idempotency key, và hạn chế internal endpoint để tránh cập nhật trạng thái trái phép.
          </p>
        </Panel>
      </div>
    </>
  );
}
