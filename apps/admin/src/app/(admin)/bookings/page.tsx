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
import { bookingMark, paymentMark } from '@/lib/status';
import type { AdminBooking, BookingStatus, ListResponse } from '@/lib/types';

type Filter = 'all' | BookingStatus;

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xử lý' },
  { id: 'CONFIRMED', label: 'Đã xác nhận' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'EXPIRED', label: 'Hết hạn' },
  { id: 'CANCELLED', label: 'Đã huỷ' },
];

/**
 * Only the four values `adminBookingQuerySchema` accepts. The old "highest
 * value" option had no server-side equivalent and would have been a no-op.
 */
const SORTS: Array<{ label: string; value: string }> = [
  { label: 'Mới nhất', value: '-createdAt' },
  { label: 'Cũ nhất', value: 'createdAt' },
  { label: 'Khởi hành sớm nhất', value: 'departureDate' },
  { label: 'Khởi hành muộn nhất', value: '-departureDate' },
];

const PAGE_SIZE = 20;

export default function BookingsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState(SORTS[0]?.value ?? '-createdAt');
  const [page, setPage] = useState(1);

  // `q` is debounced so typing does not issue a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim().slice(0, 100)), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [filter, term, sort]);

  const params = useMemo(
    () => ({
      status: filter === 'all' ? undefined : filter,
      q: term || undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    }),
    [filter, term, sort, page]
  );

  const { data, error, loading, reload, status } = useApi<ListResponse<AdminBooking>>('/bookings/admin/all', params);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHeader
        title="Quản lý booking"
        description="Đặt vé, ghế, trạng thái booking và trạng thái thanh toán."
        action={
          <Button tone="secondary" disabled title={DEFERRED_TITLE}>
            Xuất dữ liệu
          </Button>
        }
      />

      <ListTabs label="Trạng thái booking" tabs={TABS} value={filter} onChange={setFilter} />

      <Toolbar>
        <SearchField placeholder="Tìm mã booking, khách, tuyến…" value={query} onChange={setQuery} />
        <div className="flex items-center gap-4">
          <span className="text-small text-muted">
            {pagination ? `${pagination.total} booking` : loading ? 'Đang tải…' : '—'}
          </span>
          <SortSelect label="Sắp xếp" value={sort} options={SORTS} onChange={(next) => setSort(next)} />
        </div>
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
                      <td className={`${tdClass} tabular text-muted`}>
                        {booking.seats.length > 0 ? booking.seats.join(', ') : '—'}
                      </td>
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

          {pagination ? (
            <Pager
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              unit="booking"
              onPage={setPage}
            />
          ) : null}
        </>
      )}
    </>
  );
}
