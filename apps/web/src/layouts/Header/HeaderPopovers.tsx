'use client'

import { Check, ChevronDown, Clock, Copy, Headphones, Mail, PhoneCall } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Currency, HeaderCopy, Locale } from './header.i18n'
import { MiniFlagBadge } from './MiniFlagBadge'

interface PopoverMotionProps {
  initial?: { opacity: number; y: number; scale: number }
  animate?: { opacity: number; y: number; scale: number }
  exit?: { opacity: number; y: number; scale: number }
  transition?: { duration: number; ease: readonly [number, number, number, number] }
}

export function HeaderHotlinePopover({
  t,
  isOpen,
  onToggle,
  copiedPhone,
  onCopyPhone,
  popoverMotion,
}: {
  t: HeaderCopy
  isOpen: boolean
  onToggle: () => void
  copiedPhone: string | null
  onCopyPhone: (phone: string) => void
  popoverMotion: PopoverMotionProps
}) {
  return (
    <div className="relative hidden shrink-0 md:block">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={[
          'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-bold transition-all',
          isOpen
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
            isOpen ? 'rotate-180 text-primary' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
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
                  onClick={() => onCopyPhone('1900 6868')}
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
                  onClick={() => onCopyPhone('1900 6869')}
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
  )
}

export function HeaderLocalePopover({
  t,
  locale,
  currency,
  isOpen,
  onToggle,
  onSelectLocale,
  onSelectCurrency,
  popoverMotion,
}: {
  t: HeaderCopy
  locale: Locale
  currency: Currency
  isOpen: boolean
  onToggle: () => void
  onSelectLocale: (locale: Locale) => void
  onSelectCurrency: (currency: Currency) => void
  popoverMotion: PopoverMotionProps
}) {
  return (
    <div className="relative hidden shrink-0 sm:block">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Đổi ngôn ngữ và tiền tệ"
        className={[
          'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-bold transition-all',
          isOpen
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
            isOpen ? 'rotate-180 text-primary' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
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
                    onClick={() => onSelectLocale(item.code)}
                    className={[
                      'flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors',
                      selected ? 'bg-accent text-primary' : 'text-foreground hover:bg-muted/70',
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
                    onClick={() => onSelectCurrency(curr.code)}
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
  )
}
