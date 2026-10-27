'use client';

import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useServiceWorker } from '@/lib/hooks/useServiceWorker';
import { cn } from '@/lib/utils';

export function UpdatePrompt() {
  const { hasUpdate, updateApp } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!hasUpdate || dismissed) return null;

  return (
    <div
      role="alert"
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2',
        'flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 shadow-hn-md',
        'text-foreground transition-colors duration-150 motion-reduce:transition-none',
      )}
    >
      <RefreshCw className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
      <span className="text-sm font-semibold">A new version is available</span>
      <div className="ml-2 flex items-center gap-2">
        <button
          onClick={updateApp}
          className={cn(
            'inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold',
            'bg-primary text-primary-foreground hover:bg-primary-deep',
            'transition-colors duration-150 motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.125]',
          )}
        >
          Update Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notification"
          className={cn(
            'rounded-sm p-1.5 text-muted-foreground hover:text-foreground',
            'transition-colors duration-150 motion-reduce:transition-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125]',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
