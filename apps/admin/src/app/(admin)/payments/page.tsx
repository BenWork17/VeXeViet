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
  SortSelect,
  StatusPill,
  Toolbar,
  tdClass,
  tdNumberClass,
  thClass,
  thNumberClass,
} from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { useApi } from '@/lib/api';
import { formatDateTime, formatVnd } from '@/lib/format';
import { paymentMark, riskMark } from '@/lib/status';
import type { AdminPayment, AdminPaymentSummary, ListResponse, PaymentStatus } from '@/lib/types';

type Filter = 'all' | PaymentStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ thanh toán' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'FAILED', label: 'Thất bại' },
  { id: 'REFUNDED', label: 'Hoàn tiền' },
];

/**
 * `/payments/admin/all` accepts no `sort` at all — the previous "Số tiền cao
 * nhất" option was client-side only and would have reordered one page while
 * claiming a sorted list. Sort control removed rather than faked.
 */
const PAGE_SIZE = 20;

/** The summary window, independent of the row filter below (§8). */
const SUMMARY_DAYS = 7;

export default function PaymentsPage() {
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
      status: filter === 'all' ? undefined : filter,
      bookingCode: term || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [filter, term, page]
  );

  const list = useApi<ListResponse<AdminPayment>>('/payments/admin/all', params);
  const summary = useApi<{ success: true; data: AdminPaymentSummary }>('/payments/admin/summary', { days: SUMMARY_DAYS });

  const rows = list.data?.data ?? [];
  const pagination = list.data?.pagination;
  const stats = summary.data?.data;

  return (
    <>
      <PageHeader
        title="Giám sát thanh toán"
        description="VNPay, Momo, ZaloPay, chuyển khoản và tiền mặt, kèm trạng thái đối soát."
        action={
          <Button tone="secondary" disabled title={DEFERRED_TITLE}>
            Đối soát lại
          </Button>
        }
      />

      <ListTabs label="Trạng thái thanh toán" tabs={TABS} value={filter} onChange={setFilter} />

      <Toolbar>
        <SearchField placeholder="Tìm mã booking, mã giao dịch…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">
            {pagination ? `${pagination.total} giao dịch` : list.loading ? 'Đang tải…' : '—'}
          </span>
        </div>
      </Toolbar>

      {list.error ? (
        <ErrorState
          message={list.error.message}
          code={list.error.code}
          status={list.status}
          details={list.error.details}
          onRetry={list.reload}
        />
      ) : list.loading ? (
        <LoadingRows />
      ) : (
        <>
          <div className="relative mt-4 overflow-x-auto">
            <table className="w-full min-w-[880px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className={`${thClass} w-[20%]`}>Giao dịch</th>
                  <th className={`${thClass} w-[14%]`}>Booking</th>
                  <th className={`${thClass} w-[13%]`}>Cổng</th>
                  <th className={`${thClass} w-[16%]`}>Trạng thái</th>
                  <th className={`${thClass} w-[13%]`}>Rủi ro</th>
                  <th className={`${thNumberClass} w-[11%]`}>Số tiền</th>
                  <th className={`${thClass} w-[36px]`}>
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((payment) => {
                  const mark = paymentMark(payment.status);
                  const risk = riskMark(payment.risk);
                  return (
                    <tr key={payment.id} className="transition-colors duration-[120ms] hover:bg-raised">
                      <td className={tdClass}>
                        <p className="truncate font-mono text-[12px] text-ink">{payment.transactionRef}</p>
                        <p className="text-small text-muted">{formatDateTime(payment.updatedAt)}</p>
                      </td>
                      <td className={`${tdClass} font-semibold`}>{payment.bookingCode}</td>
                      <td className={tdClass}>
                        <p className="text-ink">{payment.provider}</p>
                        <p className="text-small text-muted">{payment.method}</p>
                      </td>
                      <td className={tdClass}>
                        <StatusPill tone={mark.tone}>{mark.label}</StatusPill>
                      </td>
                      <td className={tdClass}>
                        <StatusPill tone={risk.tone}>{risk.label}</StatusPill>
                      </td>
                      <td className={tdNumberClass}>{formatVnd(payment.amount)}</td>
                      <td className={`${tdClass} text-right`}>
                        <Kebab label={`Hành động cho ${payment.transactionRef}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 ? (
              <EmptyState
                title="Không có giao dịch nào khớp bộ lọc"
                description="Chọn tab Tất cả hoặc xoá từ khoá tìm kiếm để xem lại toàn bộ giao dịch."
              />
            ) : null}
          </div>

          {pagination ? (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              unit="giao dịch"
              onPage={setPage}
            />
          ) : null}
        </>
      )}

      <div className="mt-6 border-t border-rule pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-small font-semibold text-muted">Tổng hợp {SUMMARY_DAYS} ngày gần nhất</p>
          {summary.loading ? <p className="text-small text-muted">Đang tải…</p> : null}
        </div>

        {summary.error ? (
          <p role="alert" className="mt-2 max-w-lg text-[13px] leading-5 text-negative">
            {summary.error.message}
          </p>
        ) : stats ? (
          <div className="mt-3 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-small text-muted">Tổng đã thu</p>
              <p className="mt-1 text-[18px] tabular text-ink">{formatVnd(stats.totalCompleted)}</p>
            </div>
            <div>
              <p className="text-small text-muted">Giao dịch hết hạn</p>
              <p className="mt-1 text-[18px] tabular text-ink">{stats.expiredCount}</p>
            </div>
            <div>
              <p className="text-small text-muted">Cổng dùng nhiều nhất</p>
              <p className="mt-1 text-[18px] text-ink">{stats.providerTrend[0]?.label ?? '—'}</p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
