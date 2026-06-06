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
