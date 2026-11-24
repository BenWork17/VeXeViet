'use client'

import Link from 'next/link'
import { Button } from '@vexeviet/ui'
import {
  Bell,
  Compass,
  Headphones,
  Loader2,
  MapPinned,
  Menu,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSmartNotifications } from '@/lib/hooks/useSmartNotifications'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ThemeSwitcher } from '@/components/theme'
import { VietnamFlagIcon } from '@/components/brand'
import { usePathname, useRouter } from 'next/navigation'
import { HEADER_COPY, type Currency, type Locale } from './header.i18n'
import { HeaderHotlinePopover, HeaderLocalePopover } from './HeaderPopovers'
import { MobileNavDrawer } from './MobileNavDrawer'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [isPendingNavigation, startNavigation] = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openPopover, setOpenPopover] = useState<'hotline' | 'lang' | null>(null)
  const [locale, setLocale] = useState<Locale>('vi')
  const [currency, setCurrency] = useState<Currency>('VND')
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { user, logout, isLoggingOut } = useAuth()
  const { unreadCount } = useSmartNotifications()

  const t = HEADER_COPY[locale]
  const showUtilityStrip = pathname !== '/travel'

  useEffect(() => {
    try {
      const savedLang = window.localStorage.getItem('vexeviet_lang')
      const savedCurr = window.localStorage.getItem('vexeviet_currency')
      if (savedLang === 'vi' || savedLang === 'en') {
        setLocale(savedLang)
        document.documentElement.lang = savedLang
      }
      if (savedCurr === 'VND' || savedCurr === 'USD') {
        setCurrency(savedCurr)
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setOpenPopover(null)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen && !openPopover) return

    const previousOverflow = document.body.style.overflow
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPopover(null)
        if (isMenuOpen) {
          setIsMenuOpen(false)
          menuButtonRef.current?.focus()
        }
      }
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
        setOpenPopover(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isMenuOpen, openPopover])

  const handleSelectLocale = (nextLocale: Locale) => {
    setLocale(nextLocale)
    document.documentElement.lang = nextLocale
    try {
      window.localStorage.setItem('vexeviet_lang', nextLocale)
    } catch {
      // ignore
    }
  }

  const handleSelectCurrency = (nextCurrency: Currency) => {
    setCurrency(nextCurrency)
    try {
      window.localStorage.setItem('vexeviet_currency', nextCurrency)
    } catch {
      // ignore
    }
  }

  const handleCopyNumber = (phone: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(phone.replace(/\s+/g, '')).catch(() => {})
    }
    setCopiedPhone(phone)
    window.setTimeout(() => {
      setCopiedPhone((prev) => (prev === phone ? null : prev))
    }, 1800)
  }

  const isCurrentPath = (href: string) =>
    pathname === href || (href !== '/' && Boolean(pathname?.startsWith(`${href}/`)))

  const navItems = [
    { href: '/search', label: t.navSearch, Icon: Ticket, badge: null },
    { href: '/travel', label: t.navTravel, Icon: MapPinned, badge: null },
    { href: '/explore', label: t.navExplore, Icon: Compass, badge: t.navNew },
    {
      href: user ? '/profile/bookings' : '/booking/lookup',
      matchPath: user ? '/profile/bookings' : '/booking/lookup',
      label: t.navOrders,
      Icon: ReceiptText,
      badge: null,
    },
  ]

  const popoverMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 6, scale: 0.98 },
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
      }

  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : ''

  return (
    <>
      {showUtilityStrip && (
        <div className="no-print hidden border-b border-border/60 bg-[#fff7f0] text-[12px] text-muted-foreground lg:block dark:bg-muted/60">
          <div className="mx-auto flex h-9 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 xl:px-10 2xl:max-w-[1536px]">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
                <ShieldCheck size={14} className="text-primary" aria-hidden="true" />
                {t.trustRefund}
              </span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" aria-hidden="true" />
                {t.trustRoutes}
              </span>
              <span className="hidden h-3 w-px bg-border xl:inline-block" aria-hidden="true" />
              <span className="hidden xl:inline">{t.trustInstant}</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/booking/lookup"
                className="inline-flex items-center gap-1.5 font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                <ReceiptText size={13} aria-hidden="true" />
                {t.lookupOrder}
              </Link>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <a
                href="mailto:hello@vexeviet.vn"
                className="inline-flex items-center gap-1.5 font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                <Headphones size={13} aria-hidden="true" />
                {t.support247}
              </a>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <a
                href="tel:19006868"
                className="inline-flex items-center gap-1.5 font-bold text-primary transition-colors hover:text-primary-deep"
              >
                <PhoneCall size={13} aria-hidden="true" />
                1900 6868
              </a>
            </div>
          </div>
        </div>
      )}

      <header
        ref={headerRef}
        className={[
          'site-header no-print border-b bg-card/95 backdrop-blur-md transition-shadow duration-200',
          isScrolled ? 'border-border shadow-[0_6px_24px_-8px_rgba(15,23,42,0.10)]' : 'border-border/80',
        ].join(' ')}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 xl:px-10 2xl:max-w-[1536px]">
          <div className="site-header-inner min-h-[70px]! gap-3! lg:gap-4!">
            <Link
              href="/"
              className="brand-link group inline-flex shrink-0 items-center gap-2.5 rounded-xl py-1 focus-visible:outline-none"
              aria-label="VeXeViet, về trang chủ"
            >
              <VietnamFlagIcon size="md" />
              <div className="flex flex-col leading-none">
                <span className="brand-wordmark tracking-tight whitespace-nowrap transition-colors group-hover:text-foreground">
                  VeXe<span>Viet</span>
                </span>
                <span className="mt-0.5 hidden text-[10px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground 2xl:block">
                  {t.tagline}
                </span>
              </div>
            </Link>

            <nav
              className="site-nav shrink-0 items-center gap-1! rounded-xl border border-border/70 bg-muted/45 p-1"
              aria-label="Điều hướng chính"
            >
              {navItems.map(({ href, matchPath, label, Icon, badge }) => {
                const active = isCurrentPath(matchPath ?? href)
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors',
                      active ? 'text-primary' : 'text-foreground/80 hover:text-primary',
                    ].join(' ')}
                  >
                    {active && (
                      <motion.span
                        layoutId="header-active-nav"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 -z-0 rounded-lg border border-primary/20 bg-card shadow-2xs"
                      />
                    )}
                    <Icon size={15} className="relative z-10 shrink-0" aria-hidden="true" />
                    <span className="relative z-10 whitespace-nowrap">{label}</span>
                    {badge && (
                      <span className="relative z-10 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary">
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="site-actions shrink-0 gap-2!">
              <HeaderHotlinePopover
                t={t}
                isOpen={openPopover === 'hotline'}
                onToggle={() => setOpenPopover((prev) => (prev === 'hotline' ? null : 'hotline'))}
                copiedPhone={copiedPhone}
                onCopyPhone={handleCopyNumber}
                popoverMotion={popoverMotion}
              />

              <HeaderLocalePopover
                t={t}
                locale={locale}
                currency={currency}
                isOpen={openPopover === 'lang'}
                onToggle={() => setOpenPopover((prev) => (prev === 'lang' ? null : 'lang'))}
                onSelectLocale={(code) => {
                  handleSelectLocale(code)
                  setOpenPopover(null)
                }}
                onSelectCurrency={handleSelectCurrency}
                popoverMotion={popoverMotion}
              />

              <ThemeSwitcher />

              <span className="hidden h-5 w-px bg-border lg:inline-block" aria-hidden="true" />

              {user ? (
                <div className="site-user gap-2">
                  <Link
                    href="/profile?tab=notifications"
                    aria-label={
                      unreadCount > 0
                        ? `Thông báo (${unreadCount} chưa đọc)`
                        : 'Trung tâm thông báo'
                    }
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors hover:border-primary/50 hover:bg-accent/60 hover:text-primary"
                  >
                    <Bell size={15} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-primary-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    className="site-account-link inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1.5 text-xs font-bold transition-colors hover:border-primary/50 hover:bg-accent/60"
                    aria-current={isCurrentPath('/profile') ? 'page' : undefined}
                  >
                    <UserAvatar
                      src={user.avatarUrl}
                      fallback={userInitials}
                      className="h-6 w-6"
                      fallbackClassName="bg-primary text-[11px] font-extrabold text-primary-foreground"
                    />
                    <span className="max-w-[120px] truncate">
                      {user.firstName} {user.lastName}
                    </span>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="site-login rounded-lg px-3 text-xs hover:bg-accent/70 hover:text-primary"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? t.loggingOut : t.logout}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="site-login shrink-0 rounded-lg px-3.5 whitespace-nowrap transition-colors hover:bg-accent/70 hover:text-primary"
                    onClick={() => startNavigation(() => router.push('/login'))}
                    disabled={isPendingNavigation}
                  >
                    {isPendingNavigation ? (
                      <>
                        <Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />{' '}
                        {t.opening}
                      </>
                    ) : (
                      t.login
                    )}
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="site-signup shrink-0 rounded-lg! px-4 font-bold whitespace-nowrap shadow-xs transition-colors"
                  >
                    <Link href="/register">{t.register}</Link>
                  </Button>
                </>
              )}

              <button
                ref={menuButtonRef}
                type="button"
                className="site-menu-button rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary/50 hover:bg-accent/70"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <MobileNavDrawer
              t={t}
              locale={locale}
              onSelectLocale={handleSelectLocale}
              isCurrentPath={isCurrentPath}
              isAuthenticated={Boolean(user)}
              isLoggingOut={isLoggingOut}
              isPendingNavigation={isPendingNavigation}
              onLogout={() => logout()}
              onOpenLogin={() => startNavigation(() => router.push('/login'))}
            />
          )}
        </div>
      </header>
    </>
  )
}
