'use client';

import { useEffect, useRef, useState } from 'react';
import type { DashboardPoint } from '@/lib/types';

const FALLBACK_W = 720;
const H = 220;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;
const PAD_LEFT = 48;
const PAD_RIGHT = 8;

function useWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(FALLBACK_W);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

function ticks(max: number, count = 4) {
  const step = max / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(step * index));
}

function compact(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}tr`;
  if (value >= 1_000) return `${Math.round(value / 100) / 10}k`;
  return String(value);
}

export function LineChart({ data }: { data: DashboardPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const { ref, width } = useWidth();
  const W = width;
  const max = Math.max(...data.map((point) => point.value), 1);
  const plotW = W - PAD_LEFT - PAD_RIGHT;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const x = (index: number) => PAD_LEFT + (data.length === 1 ? plotW / 2 : (index / (data.length - 1)) * plotW);
  const y = (value: number) => PAD_TOP + plotH - (value / max) * plotH;

  const path = data.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(point.value)}`).join(' ');
  const last = data.length - 1;

  return (
    <div className="relative" ref={ref}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[220px] w-full"
        role="img"
        aria-label="Biểu đồ doanh thu theo ngày"
        onPointerLeave={() => setHover(null)}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (plotW <= 0) return;
          const ratio = ((event.clientX - rect.left) / rect.width) * W;
          const step = (ratio - PAD_LEFT) / plotW;
          setHover(Math.max(0, Math.min(last, Math.round(step * last))));
        }}
      >
        {ticks(max).map((tick) => (
          <g key={tick}>
            <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={y(tick)} y2={y(tick)} stroke="var(--rule)" strokeWidth="1" />
            <text x={PAD_LEFT - 10} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="var(--muted)">
              {compact(tick)}
            </text>
          </g>
        ))}

        {data.map((point, index) => (
          <text key={point.label} x={x(index)} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--muted)">
            {point.label}
          </text>
        ))}

        <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="butt" />

        {hover !== null && data[hover] ? (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD_TOP}
              y2={H - PAD_BOTTOM}
              stroke="var(--control)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="4" fill="var(--chart-1)" />
          </g>
        ) : null}
      </svg>

      {hover !== null && data[hover] ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-control border border-border bg-sheet px-2 py-1 text-small text-ink"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}
        >
          <span className="text-muted">{data[hover].label}</span> <span className="tabular">{data[hover].value.toLocaleString('vi-VN')}</span>
        </div>
      ) : null}
    </div>
  );
}

export function BarList({ data, unit }: { data: DashboardPoint[]; unit?: string }) {
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <ul className="space-y-0">
      {data.map((point) => (
        <li key={point.label} className="flex h-9 items-center gap-4">
          <span className="w-[110px] shrink-0 truncate text-[13px] text-ink">{point.label}</span>
          <span className="h-2 min-w-0 flex-1" aria-hidden="true">
            <span
              className="block h-2 rounded-[2px]"
              style={{ width: `${Math.max((point.value / max) * 100, 2)}%`, background: 'var(--chart-1)' }}
            />
          </span>
          <span className="w-[56px] shrink-0 text-right text-[13px] tabular text-ink">
            {unit ? `${point.value}${unit}` : point.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
