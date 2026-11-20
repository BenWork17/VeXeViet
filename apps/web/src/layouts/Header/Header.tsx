'use client'

import Link from 'next/link'
import { Button } from '@vexeviet/ui'
import {
  Check,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Headphones,
  Loader2,
  Mail,
  MapPinned,
  Menu,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Ticket,
  User as UserIcon,
  X,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ThemeSwitcher } from '@/components/theme'
import { VietnamFlagIcon } from '@/components/brand'
import { usePathname, useRouter } from 'next/navigation'

type Locale = 'vi' | 'en'
type Currency = 'VND' | 'USD'

const HEADER_COPY: Record<
  Locale,
  {
    trustRefund: string
    trustRoutes: string
    trustInstant: string
    lookupOrder: string
    support247: string
    tagline: string
    navSearch: string
    navTravel: string
    navExplore: string
    navOrders: string
    navNew: string
    hotlineLabel: string
    hotlineTitle: string
    hotlineSubtitle: string
    hotlineBooking: string
    hotlineEmergency: string
    hotlineEmail: string
    hotlineHours: string
    copied: string
    copy: string
    langTitle: string
    currencyTitle: string
    login: string
    opening: string
    register: string
    logout: string
    loggingOut: string
    account: string
  }
> = {
  vi: {
    trustRefund: 'Hoàn tiền 150% nếu nhà xe hủy chuyến',
    trustRoutes: '500+ tuyến xe toàn quốc',
    trustInstant: 'Xuất vé điện tử tức thì',
    lookupOrder: 'Tra cứu đơn hàng',
    support247: 'Trung tâm hỗ trợ',
    tagline: 'Đặt vé xe trực tuyến',
    navSearch: 'Tìm vé',
    navTravel: 'Bản đồ du lịch',
    navExplore: 'Khám phá',
    navOrders: 'Đơn của tôi',
    navNew: 'Mới',
    hotlineLabel: 'Hotline',
    hotlineTitle: 'Tổng đài hỗ trợ VeXeViet 24/7',
    hotlineSubtitle: 'Đội ngũ tư vấn đặt vé & xử lý sự cố chuyến đi',
    hotlineBooking: 'Đặt vé & Tư vấn lộ trình',
    hotlineEmergency: 'Hỗ trợ khẩn cấp & Khiếu nại',
    hotlineEmail: 'Email hỗ trợ khách hàng',
    hotlineHours: 'Hoạt động 24/7 — Kể cả Thứ 7, Chủ nhật & Lễ Tết',
    copied: 'Đã chép',
    copy: 'Chép',
    langTitle: 'Ngôn ngữ hiển thị',
    currencyTitle: 'Đơn vị tiền tệ',
    login: 'Đăng nhập',
    opening: 'Đang mở...',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    loggingOut: 'Đang đăng xuất...',
    account: 'Tài khoản',
  },
  en: {
    trustRefund: '150% refund guarantee if operator cancels',
    trustRoutes: '500+ nationwide routes',
    trustInstant: 'Instant e-ticket confirmation',
    lookupOrder: 'My Bookings',
    support247: 'Help Center',
    tagline: 'Vietnam Bus Booking',
    navSearch: 'Book Tickets',
    navTravel: 'Trip Map',
    navExplore: 'Explore',
    navOrders: 'My Trips',
    navNew: 'New',
    hotlineLabel: 'Hotline',
    hotlineTitle: 'VeXeViet 24/7 Support Desk',
    hotlineSubtitle: 'Live booking assistance & trip issue resolution',
    hotlineBooking: 'Ticket Booking & Routes',
    hotlineEmergency: 'Urgent Support & Claims',
    hotlineEmail: 'Customer Support Email',
    hotlineHours: 'Open 24/7 — Including weekends & public holidays',
    copied: 'Copied',
    copy: 'Copy',
    langTitle: 'Display Language',
    currencyTitle: 'Currency',
    login: 'Sign In',
    opening: 'Opening...',
    register: 'Sign Up',
    logout: 'Sign Out',
    loggingOut: 'Signing out...',
    account: 'Account',
  },
}

function MiniFlagBadge({ code }: { code: Locale }) {
  if (code === 'vi') {
    return (
      <svg viewBox="0 0 24 16" className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-2xs ring-1 ring-black/10" aria-hidden="true">
        <rect width="24" height="16" fill="#DA251D" />
        <polygon
          points="12,3.2 13.1,6.6 16.7,6.6 13.8,8.7 14.9,12.1 12,10 9.1,12.1 10.2,8.7 7.3,6.6 10.9,6.6"
          fill="#FFCD00"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 16" className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-2xs ring-1 ring-black/10" aria-hidden="true">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#FFFFFF" strokeWidth="3.2" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#FFFFFF" strokeWidth="4.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  )
}

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

  const t = HEADER_COPY[locale]
  // Keep /travel full-viewport map height untouched by hiding top utility strip on /travel
  const showUtilityStrip = pathname !== '/travel'

  // Hydrate persisted language & currency preferences
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
      // Ignore storage errors in restricted environments
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setOpenPopover(null)
  }, [pathname])

  // Close popovers / mobile menu on Escape or outside click
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
    pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`))

  const navItems = [
    { href: '/search', label: t.navSearch, Icon: Ticket, badge: null },
    { href: '/travel', label: t.navTravel, Icon: MapPinned, badge: null },
    { href: '/explore', label: t.navExplore, Icon: Compass, badge: t.navNew },
    {
      href: user ? '/profile/bookings' : '/login?redirect=/profile/bookings',
      matchPath: '/profile/bookings',
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
      {/* Tier 1: Static OTA Trust & Utility Bar — scrolls away naturally with page flow (ZERO sticky-height jitter!) */}
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
                href={user ? '/profile/bookings' : '/login?redirect=/profile/bookings'}
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

      {/* Tier 2: Fixed-Height Sticky Main Navigation Bar */}
      <header
        ref={headerRef}
        className={[
          'site-header no-print border-b bg-card/95 backdrop-blur-md transition-shadow duration-200',
          isScrolled ? 'border-border shadow-[0_6px_24px_-8px_rgba(15,23,42,0.10)]' : 'border-border/80',
        ].join(' ')}
      >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 xl:px-10 2xl:max-w-[1536px]">
        <div className="site-header-inner min-h-[70px]! gap-3! lg:gap-4!">
          {/* Brand Logo */}
          <Link
            href="/"
            className="brand-link group inline-flex shrink-0 items-center gap-2.5 rounded-xl py-1 focus-visible:outline-none"
            aria-label="VeXeViet, về trang chủ"
          >
            <VietnamFlagIcon size="md" />
            <div className="flex flex-col leading-none">
              <span className="brand-wordmark whitespace-nowrap tracking-tight transition-colors group-hover:text-foreground">
                VeXe<span>Viet</span>
              </span>
              <span className="mt-0.5 hidden whitespace-nowrap text-[10px] font-semibold tracking-wide text-muted-foreground 2xl:block">
                {t.tagline}
              </span>
            </div>
          </Link>

          {/* Center Navigation with Animated Active Pill */}
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
                    'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors',
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

          {/* Right Utility & Auth Actions */}
          <div className="site-actions shrink-0 gap-2!">
            {/* 1. Compact Hotline Trigger Button (numbers reveal in popover on click) */}
            <div className="relative hidden shrink-0 md:block">
              <button
                type="button"
                onClick={() => setOpenPopover((prev) => (prev === 'hotline' ? null : 'hotline'))}
                aria-expanded={openPopover === 'hotline'}
                aria-haspopup="dialog"
                className={[
                  'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-bold transition-all',
                  openPopover === 'hotline'
                    ? 'border-primary bg-accent text-primary shadow-2xs'
                    : 'border-primary/30 bg-accent/70 text-accent-foreground hover:border-primary hover:bg-accent',
                ].join(' ')}
              >
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <PhoneCall size={14} className="shrink-0 text-primary" aria-hidden="true" />
                <span>{t.hotlineLabel}</span>
                <ChevronDown
                  size={13}
                  className={[
                    'shrink-0 text-muted-foreground transition-transform duration-200',
                    openPopover === 'hotline' ? 'rotate-180 text-primary' : '',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {openPopover === 'hotline' && (
                  <motion.div
                    {...popoverMotion}
                    role="dialog"
                    aria-label={t.hotlineTitle}
                    className="absolute right-0 mt-2.5 w-[332px] origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_42px_-12px_rgba(15,23,42,0.18)]"
                  >
                    <div className="border-b border-border bg-[#fff7f0] px-4 py-3.5 dark:bg-muted/60">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Headphones size={16} className="text-primary" aria-hidden="true" />
                        <span>{t.hotlineTitle}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.hotlineSubtitle}</p>
                    </div>

                    <div className="space-y-2.5 p-3.5">
                      {/* Primary Hotline */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-accent/45 p-3">
                        <a href="tel:19006868" className="min-w-0 flex-1 no-underline">
                          <div className="text-[11px] font-semibold text-muted-foreground">{t.hotlineBooking}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-base font-extrabold tracking-tight text-primary tabular-nums">
                            <PhoneCall size={15} aria-hidden="true" />
                            <span>1900 6868</span>
                          </div>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('1900 6868')}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          {copiedPhone === '1900 6868' ? (
                            <>
                              <Check size={12} className="text-emerald-600" aria-hidden="true" />
                              <span>{t.copied}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} aria-hidden="true" />
                              <span>{t.copy}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Secondary Emergency Line */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
                        <a href="tel:19006869" className="min-w-0 flex-1 no-underline">
                          <div className="text-[11px] font-semibold text-muted-foreground">{t.hotlineEmergency}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-foreground tabular-nums">
                            <PhoneCall size={14} className="text-primary" aria-hidden="true" />
                            <span>1900 6869</span>
                          </div>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('1900 6869')}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          {copiedPhone === '1900 6869' ? (
                            <>
                              <Check size={12} className="text-emerald-600" aria-hidden="true" />
                              <span>{t.copied}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} aria-hidden="true" />
                              <span>{t.copy}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Email support */}
                      <a
                        href="mailto:hello@vexeviet.vn"
                        className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground no-underline transition-colors hover:border-primary/50 hover:bg-accent/40"
                      >
                        <Mail size={15} className="text-primary" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-normal text-muted-foreground">{t.hotlineEmail}</div>
                          <div className="truncate font-semibold">hello@vexeviet.vn</div>
                        </div>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 border-t border-border bg-muted/40 px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
                      <Clock size={12} className="text-primary" aria-hidden="true" />
                      <span>{t.hotlineHours}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Compact Language & Currency Switcher (details open in dropdown on click) */}
            <div className="relative hidden shrink-0 sm:block">
              <button
                type="button"
                onClick={() => setOpenPopover((prev) => (prev === 'lang' ? null : 'lang'))}
                aria-expanded={openPopover === 'lang'}
                aria-haspopup="menu"
                aria-label="Đổi ngôn ngữ và tiền tệ"
                className={[
                  'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-bold transition-all',
                  openPopover === 'lang'
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50',
                ].join(' ')}
              >
                <MiniFlagBadge code={locale} />
                <span className="uppercase">{locale}</span>
                <ChevronDown
                  size={13}
                  className={[
                    'shrink-0 text-muted-foreground transition-transform duration-200',
                    openPopover === 'lang' ? 'rotate-180 text-primary' : '',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {openPopover === 'lang' && (
                  <motion.div
                    {...popoverMotion}
                    role="menu"
                    aria-label={t.langTitle}
                    className="absolute right-0 mt-2.5 w-[248px] origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-[0_18px_42px_-12px_rgba(15,23,42,0.18)]"
                  >
                    <div className="mb-2 px-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t.langTitle}
                    </div>
                    <div className="space-y-1">
                      {[
                        { code: 'vi' as const, label: 'Tiếng Việt', sub: 'Việt Nam' },
                        { code: 'en' as const, label: 'English', sub: 'International' },
                      ].map((item) => {
                        const selected = locale === item.code
                        return (
                          <button
                            key={item.code}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            onClick={() => {
                              handleSelectLocale(item.code)
                              setOpenPopover(null)
                            }}
                            className={[
                              'flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors',
                              selected
                                ? 'bg-accent text-primary'
                                : 'text-foreground hover:bg-muted/70',
                            ].join(' ')}
                          >
                            <span className="flex items-center gap-2.5">
                              <MiniFlagBadge code={item.code} />
                              <span>
                                <span className="block text-xs font-bold">{item.label}</span>
                                <span className="block text-[10px] text-muted-foreground">{item.sub}</span>
                              </span>
                            </span>
                            {selected && <Check size={14} className="text-primary" aria-hidden="true" />}
                          </button>
                        )
                      })}
                    </div>

                    <div className="my-2.5 h-px bg-border" />

                    <div className="mb-2 px-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t.currencyTitle}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { code: 'VND' as const, label: 'VND (₫)' },
                        { code: 'USD' as const, label: 'USD ($)' },
                      ].map((curr) => {
                        const selected = currency === curr.code
                        return (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => handleSelectCurrency(curr.code)}
                            className={[
                              'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors',
                              selected
                                ? 'border-primary bg-accent text-primary'
                                : 'border-border bg-card text-foreground hover:border-primary/40',
                            ].join(' ')}
                          >
                            {curr.label}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Theme Switcher */}
            <ThemeSwitcher />

            {/* Subtle vertical divider between utilities and auth */}
            <span className="hidden h-5 w-px bg-border lg:inline-block" aria-hidden="true" />

            {/* 4. Auth / User Profile Actions */}
            {user ? (
              <div className="site-user gap-2">
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
                  className="site-login shrink-0 whitespace-nowrap rounded-lg px-3.5 transition-colors hover:bg-accent/70 hover:text-primary"
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
                  className="site-signup shrink-0 whitespace-nowrap rounded-lg! px-4 font-bold shadow-xs transition-colors"
                >
                  <Link href="/register">{t.register}</Link>
                </Button>
              </>
            )}

            {/* Mobile Hamburger Button */}
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

        {/* Mobile Drawer Menu (with Hotline & Language Switcher included) */}
        {isMenuOpen && (
          <div className="site-mobile-menu border-t border-border/70 pb-5 pt-3">
            {/* Quick Hotline & Language Row for Mobile */}
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
                    onClick={() => handleSelectLocale(code)}
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
                href={user ? '/profile/bookings' : '/login?redirect=/profile/bookings'}
                aria-current={isCurrentPath('/profile/bookings') ? 'page' : undefined}
              >
                <ReceiptText size={17} aria-hidden="true" />
                <span>{t.navOrders}</span>
              </Link>
              {user ? (
                <>
                  <Link href="/profile" aria-current={isCurrentPath('/profile') ? 'page' : undefined}>
                    <UserIcon size={17} aria-hidden="true" />
                    <span>{t.account}</span>
                  </Link>
                  <button type="button" onClick={() => logout()} disabled={isLoggingOut}>
                    {isLoggingOut ? t.loggingOut : t.logout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startNavigation(() => router.push('/login'))}
                    disabled={isPendingNavigation}
                  >
                    {isPendingNavigation ? t.opening : t.login}
                  </button>
                  <Link href="/register" aria-current={isCurrentPath('/register') ? 'page' : undefined}>
                    <span>{t.register}</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
      </header>
    </>
  )
}
