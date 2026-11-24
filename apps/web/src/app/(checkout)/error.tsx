'use client';

import { RouteErrorView } from '@/components/error/RouteErrorView';

export default function CheckoutError({
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
      section="checkout"
      title="Gián đoạn quy trình đặt vé"
      backHref="/search"
      backLabel="Tìm lại chuyến xe"
    />
  );
}
