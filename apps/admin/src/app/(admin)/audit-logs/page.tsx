import { Activity, FileSearch, ShieldAlert } from 'lucide-react';
import { ActionButton, ChartPanel, ManagementQueue, MiniBarChart, PageHeader, Panel, StatCard, StatusBadge, TableShell } from '@/components/ui';
import { auditLogs, auditSeveritySummary } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/format';

export default function AuditLogsPage() {
  const dangerLogs = auditLogs.filter((log) => log.severity === 'danger').length;

  return (
    <>
      <PageHeader
        eyebrow="Audit trail"
        title="Nhật ký quản trị"
        description="Theo dõi thao tác nhạy cảm của ADMIN và OPERATOR. Backend cần bổ sung endpoint audit log nếu chưa có."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Log trong ngày" value={String(auditLogs.length)} helper="Mock event" icon={Activity} />
        <StatCard label="Cảnh báo cao" value={String(dangerLogs)} helper="Cần review ngay" icon={ShieldAlert} tone="red" />
        <StatCard label="Đối tượng bị tác động" value="3" helper="Booking, route, payment" icon={FileSearch} tone="teal" />
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <ChartPanel title="Mức độ audit">
          <MiniBarChart data={auditSeveritySummary} />
        </ChartPanel>
        <Panel className="p-5">
          <h2 className="text-lg font-black text-slate-950">Security review queue</h2>
          <div className="mt-4">
            <ManagementQueue
              items={[
                { title: 'Payment failed investigation', description: 'Cần kiểm tra actor, requestId và payment provider response.', badge: 'Danger', tone: 'red' },
                { title: 'Route inventory changed', description: 'Theo dõi thay đổi ghế còn lại khi route gần sold out.', badge: 'Warning', tone: 'amber' },
                { title: 'Admin login audit', description: 'Nên lưu IP/device cho mọi phiên đăng nhập admin.', badge: 'Policy', tone: 'teal' },
              ]}
            />
          </div>
        </Panel>
      </div>
      <TableShell>
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <ActionButton>Xuất audit</ActionButton>
          <ActionButton tone="secondary">Tạo incident</ActionButton>
          <ActionButton tone="secondary">Lọc theo actor</ActionButton>
        </div>
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
