import { clsx } from 'clsx';

export type KpiCell = {
  label: string;
  value: string;
  tone?: 'ink' | 'negative';
};

export function KpiStrip({ cells, className }: { cells: KpiCell[]; className?: string }) {
  return (
    <div className={clsx('grid gap-px overflow-hidden rounded-card border border-border bg-border', className)}>
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="flex min-w-0 items-baseline justify-between gap-4 bg-sheet px-4 py-3.5 sm:block sm:px-5 sm:py-4"
        >
          <p className="text-small font-semibold text-muted">{cell.label}</p>
          <p
            className={clsx(
              'whitespace-nowrap text-title font-normal tabular xl:text-kpi',
              cell.tone === 'negative' ? 'text-negative' : 'text-ink'
            )}
          >
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  );
}
