'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/lib/hooks/usePWA';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pwa-install-dismissed';
const VISIT_COUNT_KEY = 'pwa-visit-count';
const REQUIRED_VISITS = 2;

export function InstallPrompt() {
  const { isInstallable, isInstalled, installPrompt } = usePWAInstall();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());

    if (visitCount >= REQUIRED_VISITS) {
      setShouldShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShouldShow(false);
  };

  const handleInstall = async () => {
    await installPrompt();
    setShouldShow(false);
  };

  if (!isInstallable || isInstalled || !shouldShow) return null;

  return (
    <div
      role="complementary"
      aria-label="Install app prompt"
      className={cn(
        'fixed bottom-4 left-4 right-4 mx-auto max-w-md z-50',
        'bg-white rounded-xl shadow-xl border border-gray-200',
        'p-4',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
          <Download className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Install VeXeViet</h3>
          <p className="text-sm text-gray-600 mt-1">
            Install our app for faster access and offline support.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg',
                'bg-primary text-white',
                'hover:bg-primary/90 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg',
                'text-gray-600',
                'hover:bg-gray-100 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-gray-300'
              )}
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className={cn(
            'flex-shrink-0 p-1 rounded-md',
            'text-gray-400 hover:text-gray-600',
            'hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-gray-300'
          )}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
