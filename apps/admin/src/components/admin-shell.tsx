'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Activity, Bus, CreditCard, LayoutDashboard, Menu, Route, Ticket, Users, X } from 'lucide-react';
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

function NavList({ pathname, role, onNavigate }: { pathname: string; role: Parameters<typeof canAccessSection>[0]; onNavigate?: () => void }) {
  return (
    <nav className="mt-6 space-y-0.5" aria-label="Khu vực quản trị">
      {navItems.map((item) => {
        if (!canAccessSection(role, item.section)) return null;
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'relative flex h-9 items-center gap-2.5 rounded-control pl-3 pr-2 text-[13px] transition-colors duration-[120ms]',
              active ? 'bg-active font-semibold text-ink' : 'font-normal text-muted hover:bg-active hover:text-ink'
            )}
          >
            {active ? <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-[1px] bg-accent" /> : null}
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready, logout } = useAdminSession();
  const [drawer, setDrawer] = useState(false);

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
    return <div className="min-h-screen bg-ground" />;
  }

  const sectionLabel = navItems.find((item) => item.section === activeSection)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-ground">
      <div className="lg:grid lg:grid-cols-[228px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-5 py-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-control bg-accent text-[12px] font-semibold text-white">VX</span>
              <span className="font-display text-section text-ink">VeXeViet</span>
            </div>

            <NavList pathname={pathname} role={session.role} />

            <div className="mt-auto border-t border-border pt-4">
              <p className="text-small font-semibold text-ink">{roleLabel(session.role)}</p>
              <p className="mt-0.5 truncate text-small text-muted">{session.email}</p>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="mt-2 h-8 rounded-control px-2 text-[13px] text-muted transition-colors duration-[120ms] hover:bg-active hover:text-ink"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 pb-2 pr-2">
          <header className="flex h-12 items-center gap-3 px-5 lg:px-6">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="grid h-8 w-8 place-items-center rounded-control text-ink transition-colors duration-[120ms] hover:bg-active lg:hidden"
              aria-label="Mở điều hướng"
              aria-expanded={drawer}
            >
              <Menu className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <p className="hidden text-[13px] text-muted lg:block">{sectionLabel}</p>
          </header>

          <main className="min-h-[calc(100vh-56px)] rounded-sheet border border-border bg-sheet px-6 py-6">
            {children}
          </main>
        </div>
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng điều hướng"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-ink/20 transition-opacity duration-[160ms]"
          />
          <div className="absolute inset-y-0 left-0 w-[264px] bg-ground px-4 py-5 transition-transform duration-[160ms]">
            <div className="flex items-center justify-between">
              <span className="font-display text-section text-ink">VeXeViet</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="grid h-8 w-8 place-items-center rounded-control text-muted transition-colors duration-[120ms] hover:bg-active hover:text-ink"
                aria-label="Đóng điều hướng"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <NavList pathname={pathname} role={session.role} onNavigate={() => setDrawer(false)} />
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-small font-semibold text-ink">{roleLabel(session.role)}</p>
              <p className="mt-0.5 truncate text-small text-muted">{session.email}</p>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="mt-2 h-8 rounded-control px-2 text-[13px] text-muted transition-colors duration-[120ms] hover:bg-active hover:text-ink"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
