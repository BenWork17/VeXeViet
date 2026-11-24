'use client';

import { RouteErrorView } from '@/components/error/RouteErrorView';

export default function AuthError({
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
      section="auth"
      title="Gián đoạn xác thực tài khoản"
      backHref="/login"
      backLabel="Quay lại đăng nhập"
    />
  );
}
