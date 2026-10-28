'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EmptyState,
  ErrorState,
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
import { formatDateTime } from '@/lib/format';
import { roleLabelShort, severityMark } from '@/lib/status';
import type { AuditLogItem, AuditSeverity, ListResponse } from '@/lib/types';

type Filter = 'all' | AuditSeverity;

/**
 * Severity tabs are a convenience filter, not an exhaustive enum: the BE
 * deliberately does not enum-validate `severity`, so an unknown value is a valid
 * question with an empty answer. Adding a new severity server-side needs no
 * change here — it simply shows up under "Tất cả".
 */
const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'info', label: 'Thông tin' },
  { id: 'warning', label: 'Cảnh báo' },
  { id: 'danger', label: 'Nguy hiểm' },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: roleLabelShort.ADMIN,
  OPERATOR: roleLabelShort.OPERATOR,
  CUSTOMER: roleLabelShort.CUSTOMER,
  SYSTEM: 'Hệ thống',
};

const PAGE_SIZE = 20;

function metadataText(metadata: unknown) {
  if (metadata === null || metadata === undefined) return null;
  if (typeof metadata !== 'object') return String(metadata);
  const entries = Object.entries(metadata as Record<string, unknown>);
  if (entries.length === 0) return null;
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
}

export default function AuditLogsPage() {
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

  const params = useMemo(
    () => ({
      severity: filter === 'all' ? undefined : filter,
      actor: term || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [filter, term, page]
  );

  const { data, error, loading, reload, status } = useApi<ListResponse<AuditLogItem>>('/audit-logs', params);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title="Nhật ký thao tác"
        description="Mọi thay đổi do quản trị viên, nhà xe hoặc hệ thống thực hiện, sắp xếp từ mới nhất."
      />

      <ListTabs label="Mức độ nhật ký" tabs={TABS} value={filter} onChange={setFilter} />

      <Toolbar>
        <SearchField placeholder="Tìm người thao tác…" value={query} onChange={setQuery} />
        <span className="text-small text-muted">
          {pagination ? `${pagination.total} bản ghi` : loading ? 'Đang tải…' : '—'}
        </span>
      </Toolbar>

      {error ? (
        <ErrorState message={error.message} code={error.code} status={status} details={error.details} onRetry={reload} />
      ) : loading ? (
        <LoadingRows />
      ) : (
        <>
          <div className="relative mt-4 overflow-x-auto">
            <table className="w-full min-w-[880px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[16%]`}>Thời điểm</th>
                  <th className={`${thClass} w-[18%]`}>Người thao tác</th>
                  <th className={`${thClass} w-[24%]`}>Hành động</th>
                  <th className={`${thClass} w-[20%]`}>Đối tượng</th>
                  <th className={`${thClass} w-[22%]`}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((log) => {
                  const mark = severityMark(log.severity);
                  const detail = metadataText(log.metadata);
                  return (
                    <tr key={log.id} className="transition-colors duration-[120ms] hover:bg-raised">
                      <td className={`${tdClass} tabular text-muted`}>{formatDateTime(log.createdAt)}</td>
                      <td className={tdClass}>
                        <p className="truncate text-ink">{log.actorId ? log.actor : 'Hệ thống'}</p>
                        <p className="truncate text-small text-muted">{ROLE_LABELS[log.role] ?? log.role}</p>
                      </td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2">
                          <StatusPill tone={mark.tone}>{mark.label}</StatusPill>
                          <span className="truncate text-ink">{log.action}</span>
                        </div>
                      </td>
                      <td className={`${tdClass} truncate text-muted`}>{log.target}</td>
                      <td className={`${tdClass} truncate font-mono text-[12px] text-muted`}>
                        {detail ?? <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 ? (
              <EmptyState
                title="Không có bản ghi nào khớp bộ lọc"
                description="Chọn tab Tất cả hoặc xoá từ khoá tìm kiếm để xem toàn bộ nhật ký."
              />
            ) : null}
          </div>

          {pagination ? (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              unit="bản ghi"
              onPage={setPage}
            />
          ) : null}
        </>
      )}
    </>
  );
}
