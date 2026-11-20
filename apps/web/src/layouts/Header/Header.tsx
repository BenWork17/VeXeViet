'use client'

import Link from 'next/link'
import { Button } from '@vexeviet/ui'
import { Compass, Loader2, MapPinned, Menu, User as UserIcon, X } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { ThemeSwitcher } from '@/components/theme'
import { VietnamFlagIcon } from '@/components/brand'
import { usePathname, useRouter } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPendingNavigation, startNavigation] = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { user, logout, isLoggingOut } = useAuth()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isMenuOpen])

  const isCurrentPath = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`))

  return (
    <header
      ref={headerRef}
      className="site-header no-print border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 xl:px-10 2xl:max-w-[1536px]">
        <div className="site-header-inner min-h-[76px] gap-6">
          <Link
            href="/"
            className="brand-link group inline-flex items-center gap-3 rounded-lg py-1 focus-visible:outline-none"
            aria-label="VeXeViet, về trang chủ"
          >
            <VietnamFlagIcon size="md" />
            <span className="brand-wordmark tracking-tight transition-colors group-hover:text-foreground">
              VeXe<span>Viet</span>
            </span>
          </Link>

          <nav className="site-nav gap-2 lg:gap-3" aria-label="Điều hướng chính">
            <Link
              href="/search"
              aria-current={isCurrentPath('/search') ? 'page' : undefined}
              className={[
                'rounded-lg px-3.5 py-2 transition-colors',
                isCurrentPath('/search')
                  ? 'bg-accent text-primary'
                  : 'hover:bg-accent/70 hover:text-primary',
              ].join(' ')}
            >
              Tìm vé
            </Link>
            <Link
              href="/travel"
              className={[
                'site-nav-icon-link rounded-lg px-3.5 py-2 transition-colors',
                isCurrentPath('/travel')
                  ? 'bg-accent text-primary'
                  : 'hover:bg-accent/70 hover:text-primary',
              ].join(' ')}
              aria-current={isCurrentPath('/travel') ? 'page' : undefined}
            >
              <MapPinned size={16} aria-hidden="true" /> Bản đồ du lịch
            </Link>
            <Link
              href="/explore"
              className={[
                'site-nav-icon-link rounded-lg px-3.5 py-2 transition-colors',
                isCurrentPath('/explore')
                  ? 'bg-accent text-primary'
                  : 'hover:bg-accent/70 hover:text-primary',
              ].join(' ')}
              aria-current={isCurrentPath('/explore') ? 'page' : undefined}
            >
              <Compass size={16} aria-hidden="true" /> Khám phá
            </Link>
            {user && (
              <Link
                href="/profile"
                aria-current={isCurrentPath('/profile') ? 'page' : undefined}
                className={[
                  'rounded-lg px-3.5 py-2 transition-colors',
                  isCurrentPath('/profile')
                    ? 'bg-accent text-primary'
                    : 'hover:bg-accent/70 hover:text-primary',
                ].join(' ')}
              >
                Tài khoản
              </Link>
            )}
          </nav>

          <div className="site-actions gap-3">
            <ThemeSwitcher />
            {user ? (
              <div className="site-user gap-2">
                <Link
                  href="/profile"
                  className="site-account-link inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-accent/70"
                  aria-current={isCurrentPath('/profile') ? 'page' : undefined}
                >
                  <UserIcon size={16} aria-hidden="true" />
                  <span>{user.firstName} {user.lastName}</span>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="site-login rounded-lg px-3.5 hover:bg-accent/70 hover:text-primary"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="site-login rounded-lg px-3.5 transition-colors hover:bg-accent/70 hover:text-primary"
                  onClick={() => startNavigation(() => router.push('/login'))}
                  disabled={isPendingNavigation}
                >
                  {isPendingNavigation ? (
                    <>
                      <Loader2 size={15} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Đang mở...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
                <Button asChild size="sm" className="site-signup rounded-lg! px-4 font-bold transition-colors">
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              className="site-menu-button rounded-lg p-2 transition-colors hover:bg-accent/70"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="site-mobile-menu border-t border-border/70 pb-4 pt-3">
            <nav aria-label="Điều hướng trên thiết bị di động">
              <Link href="/search" aria-current={isCurrentPath('/search') ? 'page' : undefined}><span>Tìm vé</span></Link>
              <Link href="/travel" aria-current={isCurrentPath('/travel') ? 'page' : undefined}><MapPinned size={17} aria-hidden="true" /><span>Bản đồ du lịch</span></Link>
              <Link href="/explore" aria-current={isCurrentPath('/explore') ? 'page' : undefined}><Compass size={17} aria-hidden="true" /><span>Khám phá</span></Link>
              {user ? (
                <>
                  <Link href="/profile" aria-current={isCurrentPath('/profile') ? 'page' : undefined}><UserIcon size={17} aria-hidden="true" /><span>Tài khoản</span></Link>
                  <button type="button" onClick={() => logout()} disabled={isLoggingOut}>
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => startNavigation(() => router.push('/login'))} disabled={isPendingNavigation}>
                    {isPendingNavigation ? 'Đang mở...' : 'Đăng nhập'}
                  </button>
                  <Link href="/register" aria-current={isCurrentPath('/register') ? 'page' : undefined}><span>Đăng ký</span></Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
