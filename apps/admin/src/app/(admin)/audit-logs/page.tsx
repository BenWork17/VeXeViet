import { Activity } from 'lucide-react';
import { PageHeader, StatusBadge, TableShell } from '@/components/ui';
import { auditLogs } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/format';

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Audit trail"
        title="Nhật ký quản trị"
        description="Theo dõi thao tác nhạy cảm của ADMIN và OPERATOR. Backend cần bổ sung endpoint audit log nếu chưa có."
      />
      <TableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">Thời gian</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Hành động</th>
              <th className="px-5 py-3">Target</th>
              <th className="px-5 py-3">Mức độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-5 py-4 font-semibold text-slate-600">{formatDateTime(log.createdAt)}</td>
                <td className="px-5 py-4 font-black text-slate-950">{log.actor}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={log.role} tone={log.role === 'ADMIN' ? 'teal' : 'blue'} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <Activity className="h-4 w-4 text-teal-700" />
                    {log.action}
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-600">{log.target}</td>
                <td className="px-5 py-4">
                  <StatusBadge label={log.severity} tone={log.severity === 'danger' ? 'red' : log.severity === 'warning' ? 'amber' : 'green'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
