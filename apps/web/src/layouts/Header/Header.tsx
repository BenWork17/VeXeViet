'use client'

import Link from 'next/link'
import { Button } from '@vexeviet/ui'
import { Loader2, MapPinned, Menu, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { ThemeSwitcher } from '@/components/theme'
import { usePathname, useRouter } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPendingNavigation, startNavigation] = useTransition()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout, isLoggingOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className={`site-header no-print${isScrolled ? ' is-scrolled' : ''}`}>
      <div className="site-container">
        <div className="site-header-inner">
          <Link href="/" className="brand-link" aria-label="VeXeViet, về trang chủ">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 512 512" focusable="false">
                <path d="M256 36l61.2 188.4H512L348.6 340.2 409.8 528.6 256 412.2 102.2 528.6 163.4 340.2 0 224.4h194.8L256 36z" />
              </svg>
            </span>
            <span className="brand-wordmark">VeXe<span>Viet</span></span>
          </Link>

          <nav className="site-nav" aria-label="Điều hướng chính">
            <Link href="/search">Tìm vé</Link>
            <Link href="/travel" className="site-nav-icon-link"><MapPinned size={16} aria-hidden="true" /> Bản đồ du lịch</Link>
            {user && <Link href="/profile">Tài khoản</Link>}
          </nav>

          <div className="site-actions">
            <ThemeSwitcher />
            {user ? (
              <div className="site-user">
                <Link href="/profile" className="site-account-link">
                  <UserIcon size={16} aria-hidden="true" />
                  <span>{user.firstName} {user.lastName}</span>
                </Link>
                <Button type="button" variant="ghost" size="sm" className="site-login" onClick={() => logout()} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="site-login"
                  onClick={() => startNavigation(() => router.push('/login'))}
                  disabled={isPendingNavigation}
                >
                  {isPendingNavigation ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Đang mở...</> : 'Đăng nhập'}
                </Button>
                <Button asChild type="button" size="sm" className="site-signup">
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
            <button
              type="button"
              className="site-menu-button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="site-mobile-menu">
            <nav aria-label="Điều hướng trên thiết bị di động">
              <Link href="/search"><span>Tìm vé</span></Link>
              <Link href="/travel"><MapPinned size={17} aria-hidden="true" /><span>Bản đồ du lịch</span></Link>
              {user ? (
                <>
                  <Link href="/profile"><UserIcon size={17} aria-hidden="true" /><span>Tài khoản</span></Link>
                  <button type="button" onClick={() => logout()} disabled={isLoggingOut}>
                    {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => startNavigation(() => router.push('/login'))} disabled={isPendingNavigation}>
                    {isPendingNavigation ? 'Đang mở...' : 'Đăng nhập'}
                  </button>
                  <Link href="/register"><span>Đăng ký</span></Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
