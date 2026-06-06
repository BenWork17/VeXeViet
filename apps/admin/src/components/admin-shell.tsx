'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Activity,
  BarChart3,
  Bell,
  Bus,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Search,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { canAccessSection, roleLabel } from '@/lib/rbac';
import type { AdminSection } from '@/lib/types';
import { useAdminSession } from './session';

const navItems: Array<{ href: string; section: AdminSection; label: string; icon: LucideIcon }> = [
  { href: '/dashboard', section: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', section: 'bookings', label: 'Bookings', icon: Ticket },
  { href: '/payments', section: 'payments', label: 'Payments', icon: CreditCard },
  { href: '/routes', section: 'routes', label: 'Routes', icon: Route },
  { href: '/operators', section: 'operators', label: 'Operators', icon: Bus },
  { href: '/users', section: 'users', label: 'Users', icon: Users },
  { href: '/audit-logs', section: 'audit-logs', label: 'Audit logs', icon: Activity },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready, logout } = useAdminSession();

  useEffect(() => {
    if (ready && !session) router.replace('/login');
  }, [ready, router, session]);

  const activeSection = useMemo<AdminSection>(() => {
    const match = navItems.find((item) => pathname.startsWith(item.href));
    return match?.section ?? 'dashboard';
  }, [pathname]);

  useEffect(() => {
    if (ready && session && !canAccessSection(session.role, activeSection)) {
      router.replace('/dashboard');
    }
  }, [activeSection, ready, router, session]);

  if (!ready || !session) {
    return <div className="min-h-screen bg-[#063C45]" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-teal-900/30 bg-[#063C45] p-4 text-white lg:block">
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-lg font-black text-teal-950">VX</div>
            <div>
              <p className="text-lg font-black">VeXeViet</p>
              <p className="text-xs font-semibold text-teal-100/80">Operations Admin</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              const allowed = canAccessSection(session.role, item.section);
              if (!allowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-colors',
                    active ? 'bg-white text-[#063C45] shadow-lg shadow-teal-950/20' : 'text-teal-50/85 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-amber-100">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-black uppercase">{roleLabel(session.role)}</span>
            </div>
            <p className="truncate text-sm font-black">{session.name}</p>
            <p className="truncate text-xs text-teal-100/70">{session.email}</p>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label="Admin navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden min-w-[280px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400 md:flex">
              <Search className="h-4 w-4" />
              Tìm booking, route, user...
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Mock data</span>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <BarChart3 className="hidden h-5 w-5 text-teal-700 sm:block" />
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              const allowed = canAccessSection(session.role, item.section);
              if (!allowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black',
                    active ? 'bg-[#063C45] text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
