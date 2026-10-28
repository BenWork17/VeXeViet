'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  DEFERRED_TITLE,
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
  tdNumberClass,
  thClass,
  thNumberClass,
} from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { useApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { accountMark } from '@/lib/status';
import type { AdminOperator, ListResponse, OperatorStatus } from '@/lib/types';

type Filter = 'all' | OperatorStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Hoạt động' },
  { id: 'PENDING_VERIFICATION', label: 'Chờ xác minh' },
  { id: 'SUSPENDED', label: 'Tạm khoá' },
  { id: 'DELETED', label: 'Đã xoá' },
];

const PAGE_SIZE = 20;

/**
 * `/routes/admin/operators` accepts `q`, `page` and `limit` only — no `status`.
 * The status tabs were a client-side filter over one page, so they are gone
 * rather than pretending to narrow the server result.
 */
export default function OperatorsPage() {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim().slice(0, 100)), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [term]);

  const params = useMemo(
    () => ({ q: term || undefined, page, limit: PAGE_SIZE }),
    [term, page]
  );

  const { data, error, loading, reload, status } = useApi<ListResponse<AdminOperator>>('/routes/admin/operators', params);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title="Nhà xe đối tác"
        description="Hồ sơ nhà xe, số tuyến đang mở, sản lượng booking trong tháng và trạng thái xác minh."
        action={
          <Button tone="secondary" disabled title={DEFERRED_TITLE}>
            Mời nhà xe
          </Button>
        }
      />

      <Toolbar>
        <SearchField placeholder="Tìm nhà xe, email liên hệ…" value={query} onChange={setQuery} />
        <span className="text-small text-muted">
          {pagination ? `${pagination.total} nhà xe` : loading ? 'Đang tải…' : '—'}
        </span>
      </Toolbar>

      {error ? (
        <ErrorState message={error.message} code={error.code} status={status} details={error.details} onRetry={reload} />
      ) : loading ? (
        <LoadingRows />
      ) : (
        <>
          <div className="relative mt-4 overflow-x-auto">
            <table className="w-full min-w-[840px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[26%]`}>Nhà xe</th>
                  <th className={`${thClass} w-[24%]`}>Liên hệ</th>
                  <th className={`${thNumberClass} w-[13%]`}>Tuyến đang mở</th>
                  <th className={`${thNumberClass} w-[14%]`}>Booking tháng</th>
                  <th className={`${thClass} w-[13%]`}>Trạng thái</th>
                  <th className={`${thClass} w-[10%]`}>Tham gia</th>
                  <th className={`${thClass} w-[36px]`}>
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((operator) => {
                  const mark = accountMark(operator.status);
                  return (
                    <tr key={operator.id} className="transition-colors duration-[120ms] hover:bg-raised">
                      <td className={`${tdClass} truncate font-semibold`}>{operator.name}</td>
                      <td className={`${tdClass} truncate text-muted`}>{operator.contactEmail}</td>
                      <td className={tdNumberClass}>{operator.activeRoutes}</td>
                      <td className={tdNumberClass}>{operator.monthlyBookings}</td>
                      <td className={tdClass}>
                        <StatusPill tone={mark.tone}>{mark.label}</StatusPill>
                      </td>
                      <td className={`${tdClass} tabular text-muted`}>{formatDate(operator.createdAt)}</td>
                      <td className={`${tdClass} text-right`}>
                        <Kebab label={`Hành động cho ${operator.name}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 ? (
              <EmptyState
                title="Không có nhà xe nào khớp bộ lọc"
                description="Xoá từ khoá tìm kiếm để xem toàn bộ nhà xe đối tác."
              />
            ) : null}
          </div>

          {pagination ? (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              unit="nhà xe"
              onPage={setPage}
            />
          ) : null}
        </>
      )}
    </>
  );
}
