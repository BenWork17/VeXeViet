'use client';

import Link from 'next/link';
import { Button, cn } from '@vexeviet/ui';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ThemeSwitcher } from '@/components/theme';
import { useThemeContext } from '@/components/theme/ThemeProvider';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();
  const { resolvedTheme } = useThemeContext();
  
  const isDark = resolvedTheme === 'dark';
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isHomePage && !isScrolled && !isMenuOpen;

  return (
    <header 
      className={cn(
        "no-print sticky top-0 z-50 w-full transition-all duration-300",
        isTransparent ? "bg-transparent border-transparent shadow-none" : "shadow-md border-b"
      )}
      style={{ 
        backgroundColor: isTransparent ? 'transparent' : (isDark ? '#1a1a1a' : '#ffffff'),
        borderColor: isTransparent ? 'transparent' : (isDark ? '#374151' : '#e5e7eb')
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative h-8 w-12 overflow-hidden rounded-sm shadow-sm transition-transform group-hover:scale-105">
              <div className="absolute inset-0 bg-[#DA251D]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FFFF00]">
                <svg viewBox="0 0 512 512" className="h-4 w-4 fill-current">
                  <path d="M256 36l61.2 188.4H512L348.6 340.2 409.8 528.6 256 412.2 102.2 528.6 163.4 340.2 0 224.4h194.8L256 36z" />
                </svg>
              </div>
            </div>
            <span 
              className="text-xl font-black tracking-tighter italic"
              style={{ color: isTransparent ? (isDark ? '#ffffff' : '#111827') : (isDark ? '#ffffff' : '#111827') }}
            >
              VeXe<span className="text-primary">Viet</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/search" 
              className="text-sm font-semibold hover:text-primary transition-colors"
              style={{ color: isTransparent ? (isDark ? '#f3f4f6' : '#1f2937') : (isDark ? '#e5e7eb' : '#374151') }}
            >
              Search
            </Link>
            {user && (
              <Link 
                href="/profile" 
                className="text-sm font-semibold hover:text-primary transition-colors"
                style={{ color: isTransparent ? (isDark ? '#f3f4f6' : '#1f2937') : (isDark ? '#e5e7eb' : '#374151') }}
              >
                Profile
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeSwitcher />
            
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className={cn(
                    "flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-colors",
                    isTransparent ? "bg-white/10 border-white/20 text-gray-900" : "bg-primary/10 border-primary/20 text-primary"
                  )}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="hover:text-primary"
                  style={{ color: isTransparent ? (isDark ? '#f3f4f6' : '#1f2937') : (isDark ? '#e5e7eb' : '#374151') }}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:text-primary"
                    style={{ color: isTransparent ? (isDark ? '#f3f4f6' : '#1f2937') : (isDark ? '#e5e7eb' : '#374151') }}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    style={{ color: '#ffffff' }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              style={{ color: isTransparent ? (isDark ? '#f3f4f6' : '#1f2937') : (isDark ? '#e5e7eb' : '#374151') }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden border-t py-4 space-y-4 animate-fadeIn -mx-4 px-4"
            style={{ 
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
          >
            <nav className="flex flex-col space-y-3">
              <Link
                href="/search"
                className="px-4 py-2 text-base font-medium rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
                style={{ color: isDark ? '#e5e7eb' : '#374151' }}
              >
                Search
              </Link>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-base font-medium rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4 pt-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
