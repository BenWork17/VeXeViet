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
  disabled = false,
  isLoading = false,
  title,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  tone?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
  'aria-label'?: string;
}) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      title={title}
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-control font-semibold transition-colors duration-[120ms]',
        size === 'md' ? 'h-9 px-3 text-[13px]' : 'h-8 px-2.5 text-[13px]',
        isDisabled
          ? 'cursor-not-allowed border border-control bg-raised text-muted'
          : tone === 'primary'
            ? 'bg-ink text-white hover:bg-[#292524]'
            : 'border border-control bg-sheet text-ink hover:bg-active',
        className
      )}
    >
      {isLoading ? (
        <svg
          className="h-3.5 w-3.5 shrink-0 animate-spin motion-reduce:animate-none"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

/** Copy the console uses for any control whose endpoint is not wired yet (§7). */
export const DEFERRED_TITLE = 'Chưa nối ở bước này';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-card border border-border bg-sheet', className)}>{children}</section>;
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{children}</div>;
}

export function SearchField({
  placeholder,
  value,
  onChange,
  disabled = false,
  title,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <label className="relative block w-full sm:w-[288px]" title={title}>
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
        disabled={disabled}
        className="h-8 w-full rounded-control border border-control bg-sheet pl-8 pr-3 text-[13px] text-ink transition-colors duration-[120ms] placeholder:text-muted focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:border-rule disabled:bg-raised disabled:text-muted"
      />
    </label>
  );
}

export function SortSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  title,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (next: string) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted" title={title}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-8 rounded-control border border-control bg-sheet pl-2 pr-7 text-[13px] text-ink transition-colors duration-[120ms] focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:border-rule disabled:bg-raised disabled:text-muted"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
      aria-disabled="true"
      disabled
      title={DEFERRED_TITLE}
      className="inline-grid h-7 w-7 cursor-not-allowed place-items-center rounded-control text-control"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <circle cx="3" cy="8" r="1.2" />
        <circle cx="8" cy="8" r="1.2" />
        <circle cx="13" cy="8" r="1.2" />
      </svg>
    </button>
  );
}

/**
 * Rendered read failure (§10.6). Distinct from `EmptyState` on purpose: a failed
 * request must never be presented as "there is nothing here" (D10).
 */
export function ErrorState({
  message,
  code,
  status,
  details = [],
  onRetry,
}: {
  message: string;
  code?: string;
  status?: number | null;
  details?: string[];
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="mt-4 border-t border-rule py-8">
      <p className="text-[14px] font-semibold text-ink">Không tải được dữ liệu</p>
      <p className="mt-1 max-w-lg text-[13px] leading-5 text-muted">{message}</p>
      {details.length > 0 ? (
        <ul className="mt-2 max-w-lg space-y-0.5 text-small leading-5 text-muted">
          {details.slice(0, 5).map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-small tabular text-muted">
        {code ?? 'ERROR'}
        {typeof status === 'number' ? ` · HTTP ${status}` : ' · không có phản hồi từ máy chủ'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 h-8 rounded-control border border-control bg-sheet px-2.5 text-[13px] font-semibold text-ink transition-colors duration-[120ms] hover:bg-active"
        >
          Thử lại
        </button>
      ) : null}
    </div>
  );
}

/** Loading placeholder for a table body — structured skeleton rows prevent layout jump. */
export function LoadingRows({ label = 'Đang tải dữ liệu…', rows = 6 }: { label?: string; rows?: number }) {
  return (
    <div className="mt-4 border-t border-rule pt-3" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex h-12 items-center gap-4 border-b border-rule/70 pb-2.5 last:border-b-0">
            <div className="h-3.5 w-[18%] animate-pulse rounded bg-active motion-reduce:animate-none" />
            <div className="h-3.5 w-[24%] animate-pulse rounded bg-active/80 motion-reduce:animate-none" />
            <div className="h-3.5 w-[22%] animate-pulse rounded bg-active/70 motion-reduce:animate-none" />
            <div className="h-5 w-[12%] animate-pulse rounded bg-active/80 motion-reduce:animate-none" />
            <div className="ml-auto h-3.5 w-[12%] animate-pulse rounded bg-active motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Server-side pager. Uses the returned `pagination`, never `data.length` (§8). */
export function Pager({
  page,
  totalPages,
  total,
  unit,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  unit: string;
  onPage: (next: number) => void;
}) {
  const last = Math.max(totalPages, 1);
  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-rule pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-small text-muted">
        {total} {unit} · trang {page}/{last}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="h-8 rounded-control border border-control bg-sheet px-2.5 text-[13px] text-ink transition-colors duration-[120ms] hover:bg-active disabled:cursor-not-allowed disabled:border-rule disabled:bg-raised disabled:text-muted"
        >
          Trang trước
        </button>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= last}
          className="h-8 rounded-control border border-control bg-sheet px-2.5 text-[13px] text-ink transition-colors duration-[120ms] hover:bg-active disabled:cursor-not-allowed disabled:border-rule disabled:bg-raised disabled:text-muted"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

export const thClass = 'pb-2 pr-4 text-left text-small font-normal text-muted last:pr-0';
export const thNumberClass = 'pb-2 pr-4 text-right text-small font-normal text-muted';
export const tdClass = 'h-12 border-t border-rule pr-4 align-middle text-[13px] text-ink last:pr-0';
export const tdNumberClass = 'h-12 border-t border-rule pr-4 text-right align-middle text-[13px] tabular text-ink';
