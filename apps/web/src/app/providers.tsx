'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const err = error as { status?: number; response?: { status?: number } };
  return err.response?.status ?? err.status;
}

/**
 * React Query Provider with optimized defaults
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 1 minute
            staleTime: 60_000,
            // Cache time: 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry up to 2 times on network/5xx errors; never retry 4xx client errors
            retry: (failureCount, error) => {
              const status = getErrorStatus(error);
              if (status !== undefined && status >= 400 && status < 500) {
                return false;
              }
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Refetch stale data on mount while keeping fresh cached data
            refetchOnMount: true,
          },
          mutations: {
            // Never auto-retry non-idempotent mutations (e.g. booking/payment)
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
