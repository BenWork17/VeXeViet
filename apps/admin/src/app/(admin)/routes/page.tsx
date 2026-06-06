import { Plus, Route as RouteIcon } from 'lucide-react';
import { PageHeader, Panel, StatusBadge, TableShell } from '@/components/ui';
import { backendContractNotes, routes } from '@/lib/mock-data';
import { formatVnd } from '@/lib/format';

export default function RoutesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Route inventory"
        title="Quản lý tuyến xe"
        description="Quản lý tuyến, giờ chạy, loại xe, giá vé và tồn ghế. Operator chỉ nên thấy tuyến thuộc operatorId của mình."
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[#063C45] px-4 py-3 text-sm font-black text-white hover:bg-teal-900">
            <Plus className="h-4 w-4" />
            Tạo tuyến
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <TableShell>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Tuyến</th>
                <th className="px-5 py-3">Nhà xe</th>
                <th className="px-5 py-3">Giờ chạy</th>
                <th className="px-5 py-3">Loại xe</th>
                <th className="px-5 py-3">Ghế còn</th>
                <th className="px-5 py-3">Giá</th>
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((route) => (
                <tr key={route.id}>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950">{route.name}</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {route.origin} - {route.destination}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">{route.operatorName}</td>
                  <td className="px-5 py-4 font-black text-teal-700">{route.departureTime}</td>
                  <td className="px-5 py-4 font-semibold text-slate-600">{route.busType}</td>
                  <td className="px-5 py-4 font-black text-slate-950">
                    {route.availableSeats}/{route.totalSeats}
                  </td>
                  <td className="px-5 py-4 font-black text-slate-950">{formatVnd(route.price)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={route.status} tone={route.status === 'ACTIVE' ? 'green' : 'slate'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-teal-700" />
            <h2 className="text-lg font-black text-slate-950">Route contract</h2>
          </div>
          <div className="space-y-3">
            {backendContractNotes.slice(1, 3).map((note) => (
              <div key={note} className="rounded-2xl border border-teal-100 bg-teal-50 p-3 text-sm font-semibold leading-6 text-teal-900">
                {note}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
