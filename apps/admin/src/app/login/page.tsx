'use client';

import { useRouter } from 'next/navigation';
import { getDemoSession, useAdminSession } from '@/components/session';

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAdminSession();

  const signIn = (kind: 'admin' | 'operator') => {
    setSession(getDemoSession(kind));
    router.replace('/dashboard');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ground px-4 py-10">
      <section className="w-full max-w-[380px] rounded-sheet border border-border bg-sheet px-6 py-7">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-[2px] bg-accent" />
          <span className="text-small font-semibold text-muted">VeXeViet Operations</span>
        </div>

        <h1 className="mt-4 font-display text-title font-normal text-ink">Đăng nhập quản trị</h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">Đăng nhập bản demo — dữ liệu mẫu cho tới khi nối backend.</p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => signIn('admin')}
            className="inline-flex h-9 items-center justify-center rounded-control bg-ink px-3 text-[13px] font-semibold text-white transition-colors duration-[120ms] hover:bg-[#292524]"
          >
            Vào với quyền ADMIN
          </button>
          <button
            type="button"
            onClick={() => signIn('operator')}
            className="inline-flex h-9 items-center justify-center rounded-control border border-control bg-sheet px-3 text-[13px] font-semibold text-ink transition-colors duration-[120ms] hover:bg-active"
          >
            Vào với quyền OPERATOR
          </button>
        </div>

        <p className="mt-5 border-t border-rule pt-4 text-small leading-5 text-muted">
          ADMIN xem toàn hệ thống. OPERATOR chỉ thấy dashboard, booking, thanh toán và tuyến thuộc nhà xe của mình.
        </p>
      </section>
    </main>
  );
}
