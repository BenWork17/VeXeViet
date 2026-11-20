'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/layouts/Header/Header';
import { Footer } from '@/layouts/Footer/Footer';
import { NavigationProgress } from '@/components/ui/navigation-progress';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header/footer for booking flow
  const isBookingFlow = pathname?.startsWith('/booking') || pathname?.includes('/booking/');

  if (isBookingFlow) {
    return (
      <>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <div className="flex flex-col min-h-screen">{children}</div>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
