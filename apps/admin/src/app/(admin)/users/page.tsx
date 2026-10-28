'use client';

import { useMemo, useState } from 'react';
import { EmptyState, Kebab, PageHeader, SearchField, SortSelect, StatusPill, Toolbar, tdClass, thClass } from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { users } from '@/lib/mock-data';
import { formatDate } from '@/lib/format';
import { accountMark, roleLabelShort } from '@/lib/status';
import type { UserRole } from '@vexeviet/types';
import type { UserStatus } from '@/lib/types';

type Filter = 'all' | UserStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Hoạt động' },
  { id: 'PENDING_VERIFICATION', label: 'Chờ xác minh' },
  { id: 'SUSPENDED', label: 'Tạm khoá' },
  { id: 'DELETED', label: 'Đã xoá' },
];

const SORTS = ['Mới nhất', 'Tên A–Z'];

const ROLES: Array<{ id: 'all' | UserRole; label: string }> = [
  { id: 'all', label: 'Mọi vai trò' },
  { id: 'CUSTOMER', label: 'Khách hàng' },
  { id: 'OPERATOR', label: 'Nhà xe' },
  { id: 'ADMIN', label: 'Quản trị' },
];

export default function UsersPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [role, setRole] = useState<'all' | UserRole>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0] ?? 'Mới nhất');

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', users.length]]);
    for (const user of users) map.set(user.status, (map.get(user.status) ?? 0) + 1);
    return map;
  }, []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = users.filter((user) => {
      if (filter !== 'all' && user.status !== filter) return false;
      if (role !== 'all' && user.role !== role) return false;
      if (!term) return true;
      return [user.name, user.email, user.phone ?? ''].join(' ').toLowerCase().includes(term);
    });

    return [...filtered].sort((a, b) =>
      sort === 'Tên A–Z' ? a.name.localeCompare(b.name, 'vi') : b.createdAt.localeCompare(a.createdAt)
    );
  }, [filter, role, query, sort]);

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Tài khoản khách hàng, nhà xe và quản trị viên cùng trạng thái xác minh email, số điện thoại."
      />

      <ListTabs
        label="Trạng thái người dùng"
        tabs={TABS.map((tab) => ({ ...tab, count: counts.get(tab.id) ?? 0 }))}
        value={filter}
        onChange={setFilter}
      />

      <Toolbar>
        <SearchField placeholder="Tìm tên, email, số điện thoại…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <div role="group" aria-label="Vai trò" className="flex items-center gap-1">
            {ROLES.map((item) => {
              const active = item.id === role;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRole(item.id)}
                  className={
                    active
                      ? 'h-8 rounded-control bg-active px-2.5 text-[13px] font-semibold text-ink transition-colors duration-[120ms]'
                      : 'h-8 rounded-control px-2.5 text-[13px] text-muted transition-colors duration-[120ms] hover:text-ink'
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <SortSelect label="Sắp xếp" value={sort} options={SORTS} onChange={setSort} />
        </div>
      </Toolbar>

      <div className="relative mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] table-fixed border-collapse">
          <thead>
            <tr>
              <th className={`${thClass} w-[24%]`}>Người dùng</th>
              <th className={`${thClass} w-[24%]`}>Liên hệ</th>
              <th className={`${thClass} w-[12%]`}>Vai trò</th>
              <th className={`${thClass} w-[14%]`}>Xác minh</th>
              <th className={`${thClass} w-[13%]`}>Trạng thái</th>
              <th className={`${thClass} w-[10%]`}>Tham gia</th>
              <th className={`${thClass} w-[36px]`}>
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => {
              const mark = accountMark(user.status);
              return (
                <tr key={user.id} className="transition-colors duration-[120ms] hover:bg-raised">
                  <td className={`${tdClass} truncate font-semibold`}>{user.name}</td>
                  <td className={tdClass}>
                    <p className="truncate text-ink">{user.email}</p>
                    <p className="truncate text-small tabular text-muted">
                      {user.phone ?? <span className="text-muted">—</span>}
                    </p>
                  </td>
                  <td className={`${tdClass} text-muted`}>{roleLabelShort[user.role]}</td>
                  <td className={`${tdClass} text-muted`}>
                    {user.isEmailVerified ? 'Email' : '—'}
                    <span className="mx-1 text-rule">·</span>
                    {user.isPhoneVerified ? 'SĐT' : '—'}
                  </td>
                  <td className={tdClass}>
                    <StatusPill tone={mark.tone}>{mark.label}</StatusPill>
                  </td>
                  <td className={`${tdClass} tabular text-muted`}>{formatDate(user.createdAt)}</td>
                  <td className={`${tdClass} text-right`}>
                    <Kebab label={`Hành động cho ${user.name}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 ? (
          <EmptyState
            title="Không có người dùng nào khớp bộ lọc"
            description="Chọn tab Tất cả, đặt vai trò về Mọi vai trò hoặc xoá từ khoá tìm kiếm."
          />
        ) : null}
      </div>
    </>
  );
}
