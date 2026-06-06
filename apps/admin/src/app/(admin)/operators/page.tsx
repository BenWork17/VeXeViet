import { Building2, Plus } from 'lucide-react';
import { PageHeader, StatusBadge, TableShell } from '@/components/ui';
import { operators } from '@/lib/mock-data';

export default function OperatorsPage() {
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
      <TableShell>
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
