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
import { useAdminSession } from '@/components/session';
import { useApi } from '@/lib/api';
import { formatDateTime, formatVnd } from '@/lib/format';
import { busTypeLabel, routeMark } from '@/lib/status';
import type { AdminRoute, ListResponse, RouteStatus } from '@/lib/types';

type Filter = 'all' | RouteStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Đang mở' },
  { id: 'INACTIVE', label: 'Tạm dừng' },
  { id: 'DELETED', label: 'Đã xoá' },
];

const PAGE_SIZE = 20;

/** Copy for a filter `/routes/my/routes` cannot apply (§6). */
const OPERATOR_FILTER_TITLE = 'Chưa hỗ trợ cho nhà xe';

export default function RoutesPage() {
  const { session, ready } = useAdminSession();
  const isOperator = session?.role === 'OPERATOR';

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim().slice(0, 100)), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [filter, term]);

  const path = !ready || !session ? null : isOperator ? '/routes/my/routes' : '/routes/admin/all';

  /**
   * An OPERATOR sends `page` and `limit` only. The accepted endpoint has no
   * query validator and its controller reads nothing but those two — sending
   * `q`/`status`/`includeDeleted` would be silently ignored, which would look
   * wired while filtering nothing. The controls are disabled instead, never
   * faked client-side over a single page.
   */
  const params = useMemo(
    () =>
      isOperator
        ? { page, limit: PAGE_SIZE }
        : {
            status: filter === 'all' ? undefined : filter,
            q: term || undefined,
            page,
            limit: PAGE_SIZE,
          },
    [isOperator, filter, term, page]
  );

  const { data, error, loading, reload, status } = useApi<ListResponse<AdminRoute>>(path, params);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title="Quản lý tuyến xe"
        description="Tuyến, giờ chạy, loại xe, giá vé và tồn ghế. Nhà xe chỉ thấy tuyến thuộc phạm vi của mình."
        action={
          <Button disabled title={DEFERRED_TITLE}>
            Tạo tuyến
          </Button>
        }
      />

      <ListTabs
        label="Trạng thái tuyến"
        tabs={TABS}
        value={filter}
        onChange={setFilter}
        disabled={isOperator}
        disabledTitle={OPERATOR_FILTER_TITLE}
      />

      <Toolbar>
        <SearchField
          placeholder="Tìm tuyến, nhà xe, điểm đi…"
          value={query}
          onChange={setQuery}
          disabled={isOperator}
          title={isOperator ? OPERATOR_FILTER_TITLE : undefined}
        />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">
            {pagination ? `${pagination.total} tuyến` : loading ? 'Đang tải…' : '—'}
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
            <table className="w-full min-w-[920px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[26%]`}>Tuyến</th>
                  <th className={`${thClass} w-[15%]`}>Nhà xe</th>
                  <th className={`${thClass} w-[16%]`}>Giờ chạy</th>
                  <th className={`${thClass} w-[11%]`}>Loại xe</th>
                  <th className={`${thNumberClass} w-[11%]`}>Ghế còn</th>
                  <th className={`${thNumberClass} w-[11%]`}>Giá</th>
                  <th className={`${thClass} w-[10%]`}>Trạng thái</th>
                  <th className={`${thClass} w-[36px]`}>
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((route) => {
                  const mark = routeMark(route.status);
                  const seatKnown = route.availableSeats !== null && route.totalSeats !== null;
                  return (
                    <tr key={route.id} className="transition-colors duration-[120ms] hover:bg-raised">
                      <td className={tdClass}>
                        <p className="truncate text-ink">{route.name}</p>
                        <p className="truncate text-small text-muted">
                          {route.origin} – {route.destination}
                        </p>
                      </td>
                      <td className={`${tdClass} truncate`}>{route.operatorName}</td>
                      <td className={`${tdClass} tabular text-muted`}>{formatDateTime(route.departureTime)}</td>
                      <td className={`${tdClass} text-muted`}>{busTypeLabel[route.busType]}</td>
                      <td className={tdNumberClass}>
                        {seatKnown ? (
                          <>
                            {route.availableSeats} <span className="text-muted">/ {route.totalSeats}</span>
                          </>
                        ) : (
                          <span className="text-muted" title="Chưa có dữ liệu ghế">
                            —
                          </span>
                        )}
                      </td>
                      <td className={tdNumberClass}>{formatVnd(route.price)}</td>
                      <td className={tdClass}>
                        <StatusPill tone={mark.tone}>{mark.label}</StatusPill>
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <Kebab label={`Hành động cho ${route.name}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 ? (
              <EmptyState
                title="Không có tuyến nào khớp bộ lọc"
                description="Chọn tab Tất cả hoặc xoá từ khoá tìm kiếm để xem toàn bộ tuyến."
              />
            ) : null}
          </div>

          {pagination ? (
            <Pager page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} unit="tuyến" onPage={setPage} />
          ) : null}
        </>
      )}
    </>
  );
}
