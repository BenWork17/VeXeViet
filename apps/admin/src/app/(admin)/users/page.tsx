import { Users } from 'lucide-react';
import { PageHeader, StatusBadge, TableShell } from '@/components/ui';
import { users } from '@/lib/mock-data';

export default function UsersPage() {
  return (
    <>
      <PageHeader
        eyebrow="User service"
        title="Quản lý người dùng"
        description="Danh sách user theo role CUSTOMER, OPERATOR, ADMIN. Chỉ ADMIN được truy cập màn này."
      />
      <TableShell>
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
