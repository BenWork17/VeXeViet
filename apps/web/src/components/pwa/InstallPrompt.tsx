'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/lib/hooks/usePWA';

const STORAGE_KEY = 'pwa-install-dismissed';
const VISIT_COUNT_KEY = 'pwa-visit-count';
const REQUIRED_VISITS = 2;
const TRANSACTIONAL_ROUTES = ['/search', '/booking', '/payment'];

export function InstallPrompt() {
  const { isInstallable, isInstalled, installPrompt } = usePWAInstall();
  const [shouldShow, setShouldShow] = useState(false);
  const pathname = usePathname();
  const isTransactionalRoute = TRANSACTIONAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isTransactionalRoute) return;

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
  }, [isTransactionalRoute]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShouldShow(false);
  };

  const handleInstall = async () => {
    await installPrompt();
    setShouldShow(false);
  };

  if (isTransactionalRoute || !isInstallable || isInstalled || !shouldShow) return null;

  return (
    <aside className="pwa-prompt" role="complementary" aria-label="Gợi ý cài đặt ứng dụng VeXeViet">
      <div className="pwa-prompt-head">
        <span className="pwa-prompt-icon" aria-hidden="true">
          <Download size={18} />
        </span>
        <div className="pwa-prompt-copy">
          <h3 className="pwa-prompt-title">Cài VeXeViet</h3>
          <p className="pwa-prompt-text">
            Mở nhanh hơn và dùng thuận tiện hơn mỗi lần truy cập.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Đóng gợi ý cài đặt"
          className="pwa-prompt-close"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="pwa-prompt-actions">
        <button type="button" onClick={handleInstall} className="pwa-prompt-install">
          Cài ứng dụng
        </button>
        <button type="button" onClick={handleDismiss} className="pwa-prompt-dismiss">
          Để sau
        </button>
      </div>
    </aside>
  );
}
