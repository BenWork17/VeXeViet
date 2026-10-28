import { clsx } from 'clsx';

export type PillTone = 'positive' | 'negative' | 'warning' | 'neutral' | 'info';

const pillTones: Record<PillTone, string> = {
  positive: 'bg-pill-positive-bg text-pill-positive-ink',
  negative: 'bg-pill-negative-bg text-pill-negative-ink',
  warning: 'bg-pill-warning-bg text-pill-warning-ink',
  neutral: 'bg-pill-neutral-bg text-pill-neutral-ink',
  info: 'bg-pill-info-bg text-pill-info-ink',
};

export function StatusPill({ tone = 'neutral', children }: { tone?: PillTone; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center rounded-[4px] px-2 py-[2px] text-small font-semibold', pillTones[tone])}>
      {children}
    </span>
  );
}

export function Missing({ label = 'Không có dữ liệu' }: { label?: string }) {
  return (
    <span className="text-muted" title={label} aria-label={label}>
      —
    </span>
  );
}

export function PageHeader({
  title,
  description,
  meta,
  action,
}: {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-title font-normal text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">{description}</p> : null}
        {meta ? <p className="mt-1 text-[13px] text-muted">{meta}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Button({
  children,
  tone = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  tone?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-control font-semibold transition-colors duration-[120ms]',
        size === 'md' ? 'h-9 px-3 text-[13px]' : 'h-8 px-2.5 text-[13px]',
        tone === 'primary'
          ? 'bg-ink text-white hover:bg-[#292524]'
          : 'border border-control bg-sheet text-ink hover:bg-active',
        className
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-card border border-border bg-sheet', className)}>{children}</section>;
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{children}</div>;
}

export function SearchField({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (next: string) => void }) {
  return (
    <label className="relative block w-full sm:w-[288px]">
      <span className="sr-only">{placeholder}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="7" cy="7" r="4.25" />
        <path d="m10.2 10.2 3 3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-control border border-control bg-sheet pl-8 pr-3 text-[13px] text-ink transition-colors duration-[120ms] placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </label>
  );
}

export function SortSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (next: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded-control border border-control bg-sheet pl-2 pr-7 text-[13px] text-ink transition-colors duration-[120ms] focus:border-accent focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-t border-rule px-0 py-10">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-md text-[13px] leading-5 text-muted">{description}</p>
    </div>
  );
}

export function Kebab({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-grid h-7 w-7 place-items-center rounded-control text-muted transition-colors duration-[120ms] hover:bg-active hover:text-ink"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <circle cx="3" cy="8" r="1.2" />
        <circle cx="8" cy="8" r="1.2" />
        <circle cx="13" cy="8" r="1.2" />
      </svg>
    </button>
  );
}

export const thClass = 'pb-2 pr-4 text-left text-small font-normal text-muted last:pr-0';
export const thNumberClass = 'pb-2 pr-4 text-right text-small font-normal text-muted';
export const tdClass = 'h-12 border-t border-rule pr-4 align-middle text-[13px] text-ink last:pr-0';
export const tdNumberClass = 'h-12 border-t border-rule pr-4 text-right align-middle text-[13px] tabular text-ink';
