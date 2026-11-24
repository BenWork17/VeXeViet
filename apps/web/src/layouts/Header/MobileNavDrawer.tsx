'use client'

import Link from 'next/link'
import { Compass, MapPinned, PhoneCall, ReceiptText, Ticket, User as UserIcon } from 'lucide-react'
import type { HeaderCopy, Locale } from './header.i18n'
import { MiniFlagBadge } from './MiniFlagBadge'

export function MobileNavDrawer({
  t,
  locale,
  onSelectLocale,
  isCurrentPath,
  isAuthenticated,
  isLoggingOut,
  isPendingNavigation,
  onLogout,
  onOpenLogin,
}: {
  t: HeaderCopy
  locale: Locale
  onSelectLocale: (locale: Locale) => void
  isCurrentPath: (href: string) => boolean
  isAuthenticated: boolean
  isLoggingOut: boolean
  isPendingNavigation: boolean
  onLogout: () => void
  onOpenLogin: () => void
}) {
  return (
    <div className="site-mobile-menu border-t border-border/70 pt-3 pb-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-accent/55 px-3.5 py-2.5">
        <a
          href="tel:19006868"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-primary no-underline"
        >
          <PhoneCall size={14} aria-hidden="true" />
          <span>Hotline 24/7: 1900 6868</span>
        </a>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          {(['vi', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onSelectLocale(code)}
              className={[
                'inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase transition-colors',
                locale === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              <MiniFlagBadge code={code} />
              <span>{code}</span>
            </button>
          ))}
        </div>
      </div>

      <nav aria-label="Điều hướng trên thiết bị di động">
        <Link href="/search" aria-current={isCurrentPath('/search') ? 'page' : undefined}>
          <Ticket size={17} aria-hidden="true" />
          <span>{t.navSearch}</span>
        </Link>
        <Link href="/travel" aria-current={isCurrentPath('/travel') ? 'page' : undefined}>
          <MapPinned size={17} aria-hidden="true" />
          <span>{t.navTravel}</span>
        </Link>
        <Link href="/explore" aria-current={isCurrentPath('/explore') ? 'page' : undefined}>
          <Compass size={17} aria-hidden="true" />
          <span>{t.navExplore}</span>
        </Link>
        <Link
          href={isAuthenticated ? '/profile/bookings' : '/booking/lookup'}
          aria-current={
            isCurrentPath(isAuthenticated ? '/profile/bookings' : '/booking/lookup')
              ? 'page'
              : undefined
          }
        >
          <ReceiptText size={17} aria-hidden="true" />
          <span>{t.navOrders}</span>
        </Link>
        {isAuthenticated && (
          <Link href="/booking/lookup" aria-current={isCurrentPath('/booking/lookup') ? 'page' : undefined}>
            <ReceiptText size={17} aria-hidden="true" />
            <span>{t.lookupOrder}</span>
          </Link>
        )}
        {isAuthenticated ? (
          <>
            <Link href="/profile" aria-current={isCurrentPath('/profile') ? 'page' : undefined}>
              <UserIcon size={17} aria-hidden="true" />
              <span>{t.account}</span>
            </Link>
            <button type="button" onClick={onLogout} disabled={isLoggingOut}>
              {isLoggingOut ? t.loggingOut : t.logout}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onOpenLogin} disabled={isPendingNavigation}>
              {isPendingNavigation ? t.opening : t.login}
            </button>
            <Link href="/register" aria-current={isCurrentPath('/register') ? 'page' : undefined}>
              <span>{t.register}</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
