'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/layouts/Header/Header';
import { Footer } from '@/layouts/Footer/Footer';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header/footer for booking flow
  const isBookingFlow = pathname?.startsWith('/booking');

  if (isBookingFlow) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
