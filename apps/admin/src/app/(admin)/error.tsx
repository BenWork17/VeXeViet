'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, LayoutDashboard, RefreshCw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[55vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-sheet p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-control bg-pill-negative-bg text-pill-negative-ink">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="font-display text-section font-normal text-ink">Không thể tải màn hình quản trị</h1>
        <p className="mt-1.5 text-[13px] leading-5 text-muted">
          Đã xảy ra lỗi ngoài ý muốn khi hiển thị dữ liệu. Bạn có thể thử tải lại hoặc quay về Dashboard.
        </p>
        {process.env.NODE_ENV === 'development' && error.message ? (
          <pre className="mt-4 max-h-32 overflow-auto rounded-control border border-rule bg-raised p-3 text-left font-mono text-small text-negative">
            {error.message}
          </pre>
        ) : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-control bg-ink px-3.5 text-[13px] font-semibold text-white transition-colors duration-[120ms] hover:bg-[#292524]"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Thử lại
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-control border border-control bg-sheet px-3.5 text-[13px] font-semibold text-ink transition-colors duration-[120ms] hover:bg-active"
          >
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
            Về Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
