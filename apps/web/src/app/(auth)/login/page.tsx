'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthView } from '@/components/features/auth/AuthView';

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-background px-4"
          role="status"
          aria-label="Đang tải trang đăng nhập"
        >
          <Loader2
            className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
      }
    >
      <AuthView />
    </Suspense>
  );
}
