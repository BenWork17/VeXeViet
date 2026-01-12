import Link from 'next/link';
import { Button } from '@vexeviet/ui';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500" />
          <span className="text-xl font-bold text-gray-900">VeXeViet</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/search" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Search
          </Link>
          <Link href="/my-bookings" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            My Bookings
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Sign Up
          </Button>
          <Button size="sm">
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
