'use client';

import { useMemo, useState } from 'react';
import { Button, EmptyState, Kebab, PageHeader, SearchField, SortSelect, StatusPill, Toolbar, tdClass, tdNumberClass, thClass, thNumberClass } from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { routes } from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';
import { busTypeLabel, routeMark } from '@/lib/status';
import type { RouteStatus } from '@/lib/types';

type Filter = 'all' | RouteStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Đang mở' },
  { id: 'INACTIVE', label: 'Tạm dừng' },
  { id: 'DELETED', label: 'Đã xoá' },
];

const SORTS = ['Giờ chạy', 'Giá vé', 'Ghế còn'];

export default function RoutesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0] ?? 'Giờ chạy');

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', routes.length]]);
    for (const route of routes) map.set(route.status, (map.get(route.status) ?? 0) + 1);
    return map;
  }, []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = routes.filter((route) => {
      if (filter !== 'all' && route.status !== filter) return false;
      if (!term) return true;
      return [route.name, route.operatorName, route.origin, route.destination].join(' ').toLowerCase().includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'Giá vé') return b.price - a.price;
      if (sort === 'Ghế còn') return (b.availableSeats ?? -1) - (a.availableSeats ?? -1);
      return a.departureTime.localeCompare(b.departureTime);
    });
  }, [filter, query, sort]);

  return (
    <>
      <PageHeader
        title="Quản lý tuyến xe"
        description="Tuyến, giờ chạy, loại xe, giá vé và tồn ghế. Nhà xe chỉ thấy tuyến thuộc phạm vi của mình."
        action={<Button>Tạo tuyến</Button>}
      />

      <ListTabs
        label="Trạng thái tuyến"
        tabs={TABS.map((tab) => ({ ...tab, count: counts.get(tab.id) ?? 0 }))}
        value={filter}
        onChange={setFilter}
      />

      <Toolbar>
        <SearchField placeholder="Tìm tuyến, nhà xe, điểm đi…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">{rows.length} tuyến</span>
          <SortSelect label="Sắp xếp" value={sort} options={SORTS} onChange={setSort} />
        </div>
      </Toolbar>

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
    </>
  );
}
