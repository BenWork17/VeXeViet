'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Lightweight App Router top navigation progress bar.
 * - Zero external dependencies
 * - GPU-composited `transform: scaleX(...)`
 * - Respects `prefers-reduced-motion`
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRef = useRef(false);
  const trickleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (doneTimerRef.current) {
      clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  const finish = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    setProgress(1);
    doneTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
  };

  const start = () => {
    clearTimers();
    activeRef.current = true;
    setVisible(true);
    setProgress(0.18);

    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.88) return prev;
        const step = prev < 0.5 ? 0.14 : prev < 0.75 ? 0.06 : 0.02;
        return Math.min(prev + step, 0.88);
      });
    }, 220);

    // Safety fallback in case navigation is aborted or handled client-side
    safetyTimerRef.current = setTimeout(() => {
      finish();
    }, 10_000);
  };

  // Complete progress whenever route or query params settle
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Listen for internal link clicks and browser back/forward
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (nextUrl.origin !== window.location.origin) return;

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
      if (currentPath === nextPath) return;

      start();
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent"
    >
      <div
        className="h-full w-full origin-left bg-primary transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
        style={{
          transform: `scaleX(${progress})`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
