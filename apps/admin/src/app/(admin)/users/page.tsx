import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import { ActionButton, ChartPanel, MiniBarChart, PageHeader, Panel, StatCard, StatusBadge, TableShell } from '@/components/ui';
import { userRoleSummary, users } from '@/lib/mock-data';

export default function UsersPage() {
  const unverified = users.filter((user) => !user.verified).length;

  return (
    <>
      <PageHeader
        eyebrow="User service"
        title="Quản lý người dùng"
        description="Danh sách user theo role CUSTOMER, OPERATOR, ADMIN. Chỉ ADMIN được truy cập màn này."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Tổng user mock" value={String(users.length)} helper="Chờ endpoint list users" icon={Users} />
        <StatCard label="Chưa xác thực" value={String(unverified)} helper="Cần nhắc verify" icon={ShieldCheck} tone="amber" />
        <StatCard label="Operator account" value={String(users.filter((user) => user.role === 'OPERATOR').length)} helper="Tài khoản nhà xe" icon={UserPlus} tone="teal" />
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        <ChartPanel title="Cơ cấu role">
          <MiniBarChart data={userRoleSummary} />
        </ChartPanel>
        <Panel className="p-5">
          <h2 className="text-lg font-black text-slate-950">Chức năng quản lý user</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton>Mời operator</ActionButton>
            <ActionButton tone="secondary">Reset mật khẩu</ActionButton>
            <ActionButton tone="secondary">Gửi verify email</ActionButton>
            <ActionButton tone="danger">Tạm khóa user</ActionButton>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">Các thao tác này cần endpoint admin có audit log và phân quyền ADMIN rõ ràng.</p>
        </Panel>
      </div>
      <TableShell>
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <ActionButton>Gửi xác thực</ActionButton>
          <ActionButton tone="secondary">Đổi role</ActionButton>
          <ActionButton tone="danger">Khóa tài khoản</ActionButton>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">Người dùng</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Xác thực</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <Users className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-black text-slate-950">{user.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{user.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge label={user.role} tone={user.role === 'ADMIN' ? 'teal' : user.role === 'OPERATOR' ? 'blue' : 'slate'} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge label={user.verified ? 'VERIFIED' : 'UNVERIFIED'} tone={user.verified ? 'green' : 'amber'} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge label={user.status} tone={user.status === 'ACTIVE' ? 'green' : user.status === 'SUSPENDED' ? 'red' : 'amber'} />
                </td>
                <td className="px-5 py-4 font-semibold text-slate-600">{user.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
