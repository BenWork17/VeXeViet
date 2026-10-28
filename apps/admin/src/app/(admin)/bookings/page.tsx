'use client';

import { useMemo, useState } from 'react';
import { Button, EmptyState, Kebab, PageHeader, SearchField, SortSelect, StatusPill, Toolbar, tdClass, tdNumberClass, thClass, thNumberClass } from '@/components/ui';
import { ListTabs } from '@/components/list-tabs';
import { bookings } from '@/lib/mock-data';
import { formatDateTime, formatVnd } from '@/lib/format';
import { bookingMark, paymentMark } from '@/lib/status';
import type { BookingStatus } from '@/lib/types';

type Filter = 'all' | BookingStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xử lý' },
  { id: 'CONFIRMED', label: 'Đã xác nhận' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'EXPIRED', label: 'Hết hạn' },
  { id: 'CANCELLED', label: 'Đã huỷ' },
];

const SORTS = ['Mới nhất', 'Khởi hành sớm nhất', 'Giá trị cao nhất'];

export default function BookingsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0] ?? 'Mới nhất');

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', bookings.length]]);
    for (const booking of bookings) map.set(booking.status, (map.get(booking.status) ?? 0) + 1);
    return map;
  }, []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = bookings.filter((booking) => {
      if (filter !== 'all' && booking.status !== filter) return false;
      if (!term) return true;
      return [booking.bookingCode, booking.customerName, booking.customerEmail, booking.routeName, booking.operatorName]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'Khởi hành sớm nhất') return a.departureDate.localeCompare(b.departureDate);
      if (sort === 'Giá trị cao nhất') return b.totalAmount - a.totalAmount;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [filter, query, sort]);

  return (
    <>
      <PageHeader
        title="Quản lý booking"
        description="Đặt vé, ghế, trạng thái booking và trạng thái thanh toán."
        action={<Button tone="secondary">Xuất dữ liệu</Button>}
      />

      <ListTabs
        label="Trạng thái booking"
        tabs={TABS.map((tab) => ({ ...tab, count: counts.get(tab.id) ?? 0 }))}
        value={filter}
        onChange={setFilter}
      />

      <Toolbar>
        <SearchField placeholder="Tìm mã booking, khách, tuyến…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">{rows.length} booking</span>
          <SortSelect label="Sắp xếp" value={sort} options={SORTS} onChange={setSort} />
        </div>
      </Toolbar>

      <div className="relative mt-4 overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed border-collapse">
          <thead>
            <tr>
              <th className={`${thClass} w-[18%]`}>Booking</th>
              <th className={`${thClass} w-[22%]`}>Khách hàng</th>
              <th className={`${thClass} w-[20%]`}>Nhà xe / tuyến</th>
              <th className={`${thClass} w-[8%]`}>Ghế</th>
              <th className={`${thClass} w-[11%]`}>Booking</th>
              <th className={`${thClass} w-[11%]`}>Payment</th>
              <th className={`${thNumberClass} w-[11%]`}>Tổng tiền</th>
              <th className={`${thClass} w-[36px]`}>
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((booking) => {
              const mark = bookingMark(booking.status);
              const pay = booking.paymentStatus ? paymentMark(booking.paymentStatus) : null;
              return (
                <tr key={booking.id} className="transition-colors duration-[120ms] hover:bg-raised">
                  <td className={tdClass}>
                    <p className="font-semibold text-ink">{booking.bookingCode}</p>
                    <p className="text-small text-muted">{formatDateTime(booking.createdAt)}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="truncate text-ink">{booking.customerName}</p>
                    <p className="truncate text-small text-muted">{booking.customerEmail}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="truncate text-ink">{booking.operatorName}</p>
                    <p className="truncate text-small text-muted">{booking.routeName}</p>
                  </td>
                  <td className={`${tdClass} tabular text-muted`}>{booking.seats.join(', ')}</td>
                  <td className={tdClass}>
                    <StatusPill tone={mark.tone}>{mark.label}</StatusPill>
                  </td>
                  <td className={tdClass}>
                    {pay ? <StatusPill tone={pay.tone}>{pay.label}</StatusPill> : <span className="text-muted">—</span>}
                  </td>
                  <td className={tdNumberClass}>{formatVnd(booking.totalAmount)}</td>
                  <td className={`${tdClass} text-right`}>
                    <Kebab label={`Hành động cho ${booking.bookingCode}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 ? (
          <EmptyState
            title="Không có booking nào khớp bộ lọc"
            description="Xoá từ khoá tìm kiếm hoặc chọn tab Tất cả để xem toàn bộ booking."
          />
        ) : null}
      </div>
    </>
  );
}
