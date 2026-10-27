'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2',
        'flex items-center gap-2 rounded-md border border-border px-4 py-3 shadow-hn-md',
        'text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none',
        !isOnline ? 'bg-error-soft text-error-ink' : 'bg-success-soft text-success-ink',
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span>You are offline. Some features may be unavailable.</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" aria-hidden="true" />
          <span>Back online</span>
        </>
      )}
    </div>
  );
}
