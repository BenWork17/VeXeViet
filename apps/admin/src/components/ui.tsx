import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export function StatusBadge({ label, tone = 'slate' }: { label: string; tone?: 'teal' | 'amber' | 'green' | 'red' | 'slate' | 'blue' }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return <span className={clsx('inline-flex rounded-full border px-2.5 py-1 text-xs font-black', tones[tone])}>{label}</span>;
}

export function StatCard({ label, value, helper, icon: Icon, tone = 'teal' }: { label: string; value: string; helper: string; icon: LucideIcon; tone?: 'teal' | 'amber' | 'green' | 'red' }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{helper}</p>
        </div>
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-3xl border border-slate-200 bg-white shadow-sm', className)}>{children}</section>;
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center">{children}</div>;
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">{children}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
      <p className="text-lg font-black text-slate-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ActionButton({
  children,
  tone = 'primary',
}: {
  children: React.ReactNode;
  tone?: 'primary' | 'secondary' | 'danger';
}) {
  const tones = {
    primary: 'bg-[#063C45] text-white hover:bg-teal-900',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'border border-red-100 bg-red-50 text-red-700 hover:bg-red-100',
  };

  return <button className={clsx('rounded-xl px-3 py-2 text-xs font-black transition-colors', tones[tone])}>{children}</button>;
}

export function ChartPanel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Panel className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p> : null}
      </div>
      {children}
    </Panel>
  );
}

export function MiniBarChart({ data }: { data: Array<{ label: string; value: number; tone?: 'teal' | 'amber' | 'red' | 'green' }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const tones = {
    teal: 'bg-teal-600',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    green: 'bg-emerald-500',
  };

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-700">{item.label}</span>
            <span className="font-black text-slate-950">{item.value}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div className={clsx('h-3 rounded-full', tones[item.tone ?? 'teal'])} style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SparkAreaChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / max) * 82 - 8;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPoints = `0,100 ${points} 100,100`;

  return (
    <div>
      <svg viewBox="0 0 100 100" className="h-48 w-full overflow-visible" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id="adminTrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline points={fillPoints} fill="url(#adminTrendFill)" stroke="none" />
        <polyline points={points} fill="none" stroke="#0f766e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {data.map((item, index) => {
          const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
          const y = 100 - (item.value / max) * 82 - 8;
          return <circle key={item.label} cx={x} cy={y} r="2.2" fill="#f59e0b" stroke="#fff" strokeWidth="1" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs font-black text-slate-400">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let current = 0;

  const gradient = data
    .map((item) => {
      const start = current;
      current += (item.value / total) * 100;
      return `${item.color} ${start}% ${current}%`;
    })
    .join(', ');

  return (
    <div className="flex items-center gap-6">
      <div className="grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
          <span className="text-2xl font-black text-slate-950">{total}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-bold text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-black text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ManagementQueue({
  items,
}: {
  items: Array<{ title: string; description: string; badge: string; tone?: 'teal' | 'amber' | 'green' | 'red' | 'slate' | 'blue' }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">{item.title}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{item.description}</p>
            </div>
            <StatusBadge label={item.badge} tone={item.tone ?? 'slate'} />
          </div>
        </div>
      ))}
    </div>
  );
}
