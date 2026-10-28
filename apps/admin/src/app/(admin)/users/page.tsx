'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EmptyState,
  ErrorState,
  Kebab,
  LoadingRows,
  PageHeader,
  Pager,
  SearchField,
  StatusPill,
  Toolbar,
  tdClass,
  thClass,
} from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { useApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { accountMark, roleLabelShort } from '@/lib/status';
import type { AdminUser, ListResponse, UserStatus } from '@/lib/types';

type Filter = 'all' | UserStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Hoạt động' },
  { id: 'PENDING_VERIFICATION', label: 'Chờ xác minh' },
  { id: 'SUSPENDED', label: 'Tạm khoá' },
  { id: 'DELETED', label: 'Đã xoá' },
];

const ROLE_OPTIONS: Array<{ id: 'all' | 'ADMIN' | 'OPERATOR' | 'CUSTOMER'; label: string }> = [
  { id: 'all', label: 'Mọi vai trò' },
  { id: 'CUSTOMER', label: 'Khách hàng' },
  { id: 'OPERATOR', label: 'Nhà xe' },
  { id: 'ADMIN', label: 'Quản trị' },
];

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [role, setRole] = useState<'all' | 'ADMIN' | 'OPERATOR' | 'CUSTOMER'>('all');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim().slice(0, 100)), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [filter, role, term]);

  const params = useMemo(
    () => ({
      status: filter === 'all' ? undefined : filter,
      role: role === 'all' ? undefined : role,
      q: term || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [filter, role, term, page]
  );

  const { data, error, loading, reload, status } = useApi<ListResponse<AdminUser>>('/users/admin/all', params);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Tài khoản khách hàng, nhà xe và quản trị viên cùng trạng thái xác minh email, số điện thoại."
      />

      <ListTabs label="Trạng thái người dùng" tabs={TABS} value={filter} onChange={setFilter} />

      <Toolbar>
        <SearchField placeholder="Tìm tên, email, số điện thoại…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <div role="group" aria-label="Vai trò" className="flex items-center gap-1">
            {ROLE_OPTIONS.map((item) => {
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
          <span className="text-small text-muted">
            {pagination ? `${pagination.total} người dùng` : loading ? 'Đang tải…' : '—'}
          </span>
        </div>
      </Toolbar>

      {error ? (
        <ErrorState message={error.message} code={error.code} status={status} details={error.details} onRetry={reload} />
      ) : loading ? (
        <LoadingRows />
      ) : (
        <>
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

          {pagination ? (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              unit="người dùng"
              onPage={setPage}
            />
          ) : null}
        </>
      )}
    </>
  );
}
