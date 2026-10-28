'use client';

import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import type { DashboardPoint } from '@/lib/types';
import { BarList, LineChart } from './charts';

type Tab = { id: 'revenue' | 'bookings'; label: string };

const TABS: Tab[] = [
  { id: 'revenue', label: 'Doanh thu' },
  { id: 'bookings', label: 'Booking' },
];

export function ChartTabs({ revenueTrend, bookingStatusSummary }: { revenueTrend: DashboardPoint[]; bookingStatusSummary: DashboardPoint[] }) {
  const [selected, setSelected] = useState<'revenue' | 'bookings'>('revenue');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    setSelected(TABS[next]?.id ?? 'revenue');
    refs.current[next]?.focus();
  };

  const data = selected === 'revenue' ? revenueTrend : bookingStatusSummary;

  return (
    <div>
      <div role="tablist" aria-label="Chuỗi dữ liệu dashboard" className="flex gap-6 border-b border-border">
        {TABS.map((tab, index) => {
          const active = selected === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="tab"
              type="button"
              id={`dash-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`dash-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={clsx(
                'relative -mb-px pb-2.5 text-[13px] transition-colors duration-[120ms]',
                active ? 'font-semibold text-ink' : 'font-normal text-muted hover:text-ink'
              )}
            >
              {tab.label}
              {active ? <span aria-hidden="true" className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent" /> : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`dash-panel-${selected}`}
        aria-labelledby={`dash-tab-${selected}`}
        className="pt-5"
        tabIndex={0}
      >
        {selected === 'revenue' ? <LineChart data={data} /> : <BarList data={data} />}
      </div>
    </div>
  );
}

export function ComparisonTable({ data }: { data: DashboardPoint[] }) {
  const rows = data.slice(-3).map((point, index, list) => {
    const previous = index > 0 ? list[index - 1] : undefined;
    const delta = previous ? point.value - previous.value : null;
    return { ...point, delta };
  });

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="pb-1 text-left text-[14px] font-normal text-muted">Ngày</th>
          <th className="pb-1 text-right text-[14px] font-normal text-muted">Doanh thu</th>
          <th className="pb-1 text-right text-[14px] font-normal text-muted">So với ngày trước</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="h-9">
            <td className="border-t border-rule text-[13px] text-ink">{row.label}</td>
            <td className="border-t border-rule text-right text-[13px] tabular text-ink">{row.value.toLocaleString('vi-VN')}</td>
            <td className="border-t border-rule text-right text-[13px] tabular">
              {row.delta === null ? (
                <span className="text-muted">—</span>
              ) : (
                <span className={row.delta < 0 ? 'text-negative' : 'text-positive'}>
                  {row.delta > 0 ? '+' : ''}
                  {row.delta.toLocaleString('vi-VN')}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
