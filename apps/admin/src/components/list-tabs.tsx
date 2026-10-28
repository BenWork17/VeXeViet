'use client';

import { clsx } from 'clsx';

export function ListTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  disabled = false,
  disabledTitle,
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  value: T;
  onChange: (next: T) => void;
  label: string;
  /** Renders the whole tablist inert — for a filter the endpoint cannot apply. */
  disabled?: boolean;
  disabledTitle?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledTitle : undefined}
      className="mt-5 flex gap-6 overflow-x-auto border-b border-border"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={disabled}
            tabIndex={disabled ? -1 : active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.preventDefault();
              const index = tabs.findIndex((item) => item.id === value);
              const delta = event.key === 'ArrowRight' ? 1 : -1;
              const next = tabs[(index + delta + tabs.length) % tabs.length];
              if (next) onChange(next.id);
            }}
            className={clsx(
              'relative -mb-px whitespace-nowrap pb-2.5 text-[13px] transition-colors duration-[120ms]',
              disabled
                ? 'cursor-not-allowed text-control'
                : active
                  ? 'font-semibold text-ink'
                  : 'font-normal text-muted hover:text-ink'
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' ? <span className="ml-1.5 tabular text-muted">{tab.count}</span> : null}
            {active && !disabled ? <span aria-hidden="true" className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent" /> : null}
          </button>
        );
      })}
    </div>
  );
}
