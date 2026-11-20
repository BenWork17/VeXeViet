'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-background px-4 py-12">
      <div
        role="alert"
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-hn-md sm:p-8"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-soft text-error-ink">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl text-foreground">Đã có lỗi xảy ra</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'Không thể tải trang lúc này. Vui lòng thử lại hoặc quay về trang chủ.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
