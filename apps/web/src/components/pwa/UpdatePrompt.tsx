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
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'bg-blue-600 text-white',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <RefreshCw className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">A new version is available</span>
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={updateApp}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md',
            'bg-white text-blue-600',
            'hover:bg-blue-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600'
          )}
        >
          Update Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notification"
          className={cn(
            'p-1.5 rounded-md',
            'hover:bg-blue-500 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-white'
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
