'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Copy, Home, RotateCcw } from 'lucide-react';

export interface RouteErrorViewProps {
  error: Error & { digest?: string; requestId?: string; code?: string };
  reset: () => void;
  title?: string;
  backHref?: string;
  backLabel?: string;
  section?: string;
}

export function RouteErrorView({
  error,
  reset,
  title = 'Đã có lỗi xảy ra',
  backHref = '/',
  backLabel = 'Về trang chủ',
  section = 'app',
}: RouteErrorViewProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error(`[VeXeViet ErrorBoundary:${section}]`, error);
  }, [error, section]);

  const refId = error.requestId || error.digest || null;

  const handleCopyRef = () => {
    if (!refId || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(refId).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-background px-4 py-12">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-hn-md sm:p-8"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-soft text-error-ink">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {error.message || 'Không thể tải trang lúc này. Vui lòng thử lại hoặc quay về trang trước.'}
        </p>

        {refId && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            <span>Mã tra cứu: {refId}</span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-sans text-[11px] font-bold text-primary hover:bg-accent"
              aria-label="Sao chép mã tra cứu lỗi"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Đã chép' : 'Chép'}</span>
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors duration-150 hover:bg-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Thử lại
          </button>
          <Link
            href={backHref}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
