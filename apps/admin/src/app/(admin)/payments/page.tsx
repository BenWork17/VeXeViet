import { AlertTriangle, CreditCard, ShieldCheck } from 'lucide-react';
import { ActionButton, ChartPanel, DonutChart, ManagementQueue, PageHeader, Panel, StatCard, StatusBadge, TableShell } from '@/components/ui';
import { paymentProviderSummary, payments } from '@/lib/mock-data';
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

      <div className="mb-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        <ChartPanel title="Tỷ trọng cổng thanh toán">
          <DonutChart data={paymentProviderSummary} />
        </ChartPanel>
        <Panel className="p-5">
          <h2 className="text-lg font-black text-slate-950">Reconciliation queue</h2>
          <div className="mt-4">
            <ManagementQueue
              items={[
                { title: 'VNPay pending quá 15 phút', description: 'Tự động gọi provider status API trước khi release ghế.', badge: 'Check', tone: 'amber' },
                { title: 'Payment failed sau khi giữ ghế', description: 'Đồng bộ lại Booking Service để tránh ghế bị treo.', badge: 'Urgent', tone: 'red' },
                { title: 'Hoàn tiền thủ công', description: 'Cần luồng approve 2 bước cho refund giá trị cao.', badge: 'Policy', tone: 'teal' },
              ]}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <TableShell>
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
            <ActionButton>Đối soát lại</ActionButton>
            <ActionButton tone="secondary">Đồng bộ booking</ActionButton>
            <ActionButton tone="danger">Mở case lỗi</ActionButton>
          </div>
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
