import { Building2, Plus, Ticket, UserCheck } from 'lucide-react';
import { ActionButton, ChartPanel, MiniBarChart, PageHeader, Panel, StatCard, StatusBadge, TableShell } from '@/components/ui';
import { operators } from '@/lib/mock-data';

export default function OperatorsPage() {
  const reviewCount = operators.filter((operator) => operator.status === 'REVIEW').length;
  const totalMonthlyBookings = operators.reduce((sum, operator) => sum + operator.monthlyBookings, 0);

  return (
    <>
      <PageHeader
        eyebrow="Partner service"
        title="Quản lý nhà xe"
        description="Theo docs, Partner Service là service tương lai cho quản lý nhà xe. Màn này giữ sẵn cấu trúc vận hành cho admin."
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#063C45] px-4 py-3 text-sm font-black text-white hover:bg-teal-900">
            <Plus className="h-4 w-4" />
            Thêm nhà xe
          </button>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Nhà xe active" value={String(operators.filter((operator) => operator.status === 'ACTIVE').length)} helper="Đủ điều kiện bán vé" icon={UserCheck} />
        <StatCard label="Chờ duyệt" value={String(reviewCount)} helper="Cần kiểm tra hồ sơ" icon={Building2} tone="amber" />
        <StatCard label="Booking/tháng" value={String(totalMonthlyBookings)} helper="Tổng từ partner" icon={Ticket} tone="green" />
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <ChartPanel title="Booking theo nhà xe">
          <MiniBarChart data={operators.map((operator) => ({ label: operator.name, value: operator.monthlyBookings || 1, tone: operator.status === 'REVIEW' ? 'amber' : 'teal' }))} />
        </ChartPanel>
        <Panel className="p-5">
          <h2 className="text-lg font-black text-slate-950">Quy trình duyệt partner</h2>
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
            {['Xác minh giấy phép vận tải', 'Kiểm tra thông tin liên hệ', 'Gán operator admin', 'Mở tuyến thử nghiệm'].map((step) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                {step}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <TableShell>
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <ActionButton>Duyệt partner</ActionButton>
          <ActionButton tone="secondary">Gán nhân sự</ActionButton>
          <ActionButton tone="danger">Tạm khóa</ActionButton>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">Nhà xe</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Tuyến hoạt động</th>
              <th className="px-5 py-3">Booking/tháng</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {operators.map((operator) => (
              <tr key={operator.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <span className="font-black text-slate-950">{operator.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-600">{operator.contactEmail}</td>
                <td className="px-5 py-4 font-black text-slate-950">{operator.activeRoutes}</td>
                <td className="px-5 py-4 font-black text-slate-950">{operator.monthlyBookings}</td>
                <td className="px-5 py-4 font-black text-amber-600">{operator.rating || '-'}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={operator.status} tone={operator.status === 'ACTIVE' ? 'green' : operator.status === 'REVIEW' ? 'amber' : 'red'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
