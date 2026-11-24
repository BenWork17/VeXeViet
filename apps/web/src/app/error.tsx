'use client';

import { RouteErrorView } from '@/components/error/RouteErrorView';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string; requestId?: string; code?: string };
  reset: () => void;
}) {
  return <RouteErrorView error={error} reset={reset} section="root" />;
}
