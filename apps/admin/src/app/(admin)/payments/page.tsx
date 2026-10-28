'use client';

import { useMemo, useState } from 'react';
import { Button, EmptyState, Kebab, PageHeader, SearchField, SortSelect, StatusPill, Toolbar, tdClass, tdNumberClass, thClass, thNumberClass } from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { paymentSummary, payments } from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';
import { paymentMark, riskMark } from '@/lib/status';
import type { PaymentStatus } from '@/lib/types';

type Filter = 'all' | PaymentStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ thanh toán' },
  { id: 'PROCESSING', label: 'Đang xử lý' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'FAILED', label: 'Thất bại' },
  { id: 'REFUNDED', label: 'Hoàn tiền' },
];

const SORTS = ['Mới nhất', 'Số tiền cao nhất'];

export default function PaymentsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0] ?? 'Mới nhất');

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', payments.length]]);
    for (const payment of payments) map.set(payment.status, (map.get(payment.status) ?? 0) + 1);
    return map;
  }, []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = payments.filter((payment) => {
      if (filter !== 'all' && payment.status !== filter) return false;
      if (!term) return true;
      return [payment.bookingCode, payment.transactionRef, payment.provider].join(' ').toLowerCase().includes(term);
    });

    return [...filtered].sort((a, b) =>
      sort === 'Số tiền cao nhất' ? b.amount - a.amount : b.updatedAt.localeCompare(a.updatedAt)
    );
  }, [filter, query, sort]);

  return (
    <>
      <PageHeader
        title="Giám sát thanh toán"
        description="VNPay, Momo, ZaloPay, chuyển khoản và tiền mặt, kèm trạng thái đối soát."
        action={<Button tone="secondary">Đối soát lại</Button>}
      />

      <ListTabs
        label="Trạng thái thanh toán"
        tabs={TABS.map((tab) => ({ ...tab, count: counts.get(tab.id) ?? 0 }))}
        value={filter}
        onChange={setFilter}
      />

      <Toolbar>
        <SearchField placeholder="Tìm mã booking, mã giao dịch…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">{rows.length} giao dịch</span>
          <SortSelect label="Sắp xếp" value={sort} options={SORTS} onChange={setSort} />
        </div>
      </Toolbar>

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

      <div className="mt-6 grid gap-6 border-t border-rule pt-5 md:grid-cols-3">
        <div>
          <p className="text-small text-muted">Tổng đã thu</p>
          <p className="mt-1 text-[18px] tabular text-ink">{formatVnd(paymentSummary.totalCompleted)}</p>
        </div>
        <div>
          <p className="text-small text-muted">Giao dịch hết hạn</p>
          <p className="mt-1 text-[18px] tabular text-ink">{paymentSummary.expiredCount}</p>
        </div>
        <div>
          <p className="text-small text-muted">Cổng dùng nhiều nhất</p>
          <p className="mt-1 text-[18px] text-ink">{paymentSummary.providerTrend[0]?.label ?? '—'}</p>
        </div>
      </div>
    </>
  );
}
