'use client';

import { useMemo, useState } from 'react';
import { Button, EmptyState, Kebab, PageHeader, SearchField, SortSelect, StatusPill, Toolbar, tdClass, tdNumberClass, thClass, thNumberClass } from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { operators } from '@/lib/mock-data';
import { formatDate } from '@/lib/format';
import { accountMark } from '@/lib/status';
import type { OperatorStatus } from '@/lib/types';

type Filter = 'all' | OperatorStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Hoạt động' },
  { id: 'PENDING_VERIFICATION', label: 'Chờ xác minh' },
  { id: 'SUSPENDED', label: 'Tạm khoá' },
  { id: 'DELETED', label: 'Đã xoá' },
];

const SORTS = ['Tên nhà xe', 'Tuyến đang mở', 'Booking tháng'];

export default function OperatorsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0] ?? 'Tên nhà xe');

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', operators.length]]);
    for (const operator of operators) map.set(operator.status, (map.get(operator.status) ?? 0) + 1);
    return map;
  }, []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = operators.filter((operator) => {
      if (filter !== 'all' && operator.status !== filter) return false;
      if (!term) return true;
      return [operator.name, operator.contactEmail].join(' ').toLowerCase().includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'Tuyến đang mở') return b.activeRoutes - a.activeRoutes;
      if (sort === 'Booking tháng') return b.monthlyBookings - a.monthlyBookings;
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [filter, query, sort]);

  return (
    <>
      <PageHeader
        title="Nhà xe đối tác"
        description="Hồ sơ nhà xe, số tuyến đang mở, sản lượng booking trong tháng và trạng thái xác minh."
        action={<Button tone="secondary">Mời nhà xe</Button>}
      />

      <ListTabs
        label="Trạng thái nhà xe"
        tabs={TABS.map((tab) => ({ ...tab, count: counts.get(tab.id) ?? 0 }))}
        value={filter}
        onChange={setFilter}
      />

      <Toolbar>
        <SearchField placeholder="Tìm nhà xe, email liên hệ…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">{rows.length} nhà xe</span>
          <SortSelect label="Sắp xếp" value={sort} options={SORTS} onChange={setSort} />
        </div>
      </Toolbar>

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
            description="Chọn tab Tất cả hoặc xoá từ khoá tìm kiếm để xem toàn bộ nhà xe."
          />
        ) : null}
      </div>
    </>
  );
}
