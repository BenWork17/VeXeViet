'use client';

import { RouteErrorView } from '@/components/error/RouteErrorView';

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string; requestId?: string; code?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      section="marketing"
      title="Không thể tải trang lúc này"
      backHref="/"
      backLabel="Về trang chủ"
    />
  );
}
