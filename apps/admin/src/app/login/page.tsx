'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { getDemoSession, useAdminSession } from '@/components/session';

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAdminSession();

  const signIn = (kind: 'admin' | 'operator') => {
    setSession(getDemoSession(kind));
    router.replace('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#063C45] px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-amber-100">
            <ShieldCheck className="h-4 w-4" />
            VeXeViet Operations
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">Admin quản lý vận hành vé xe theo thời gian thực.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-teal-50/75">
            Bản MVP này gom Dashboard, Booking, Route, Payment, Operator, User và Audit log vào một web admin riêng, dùng mock data cho tới khi backend bổ sung endpoint quản trị.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {['Booking ops', 'Route inventory', 'Payment risk'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-teal-50">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/15 bg-white p-6 text-slate-950 shadow-2xl shadow-teal-950/40">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Demo login</p>
            <h2 className="mt-2 text-2xl font-black">Chọn quyền truy cập</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Backend contract hiện chưa trả role trong LoginResponse, nên phần này tạm mô phỏng phiên đăng nhập.</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn('admin')}
              className="group flex w-full items-center justify-between rounded-2xl border border-teal-100 bg-teal-50 p-4 text-left hover:border-teal-300"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#063C45] text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-black">ADMIN</span>
                  <span className="text-sm font-semibold text-slate-500">Toàn quyền hệ thống</span>
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-teal-700 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => signIn('operator')}
              className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-200"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Building2 className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-black">OPERATOR</span>
                  <span className="text-sm font-semibold text-slate-500">Quản lý dữ liệu nhà xe</span>
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-teal-700 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
