'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: () => Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWAInstall(): UsePWAInstallReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt = null;

      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
          'event',
          'pwa_installed',
          { event_category: 'PWA' }
        );
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPrompt = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
          'event',
          'pwa_install_prompt_response',
          { event_category: 'PWA', event_label: outcome }
        );
      }

      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
    } finally {
      deferredPrompt = null;
    }
  }, []);

  return { isInstallable, isInstalled, installPrompt };
}
