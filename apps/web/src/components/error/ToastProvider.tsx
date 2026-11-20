'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  leaving?: boolean;
}

const MAX_VISIBLE_TOASTS = 4;
const EXIT_ANIMATION_MS = 160;

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id' | 'leaving'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'bg-success-soft text-success-ink',
  error: 'bg-error-soft text-error-ink',
  warning: 'bg-warning-soft text-warning-ink',
  info: 'bg-info-soft text-info-ink',
};

const ICON_STYLES = {
  success: 'text-success-ink',
  error: 'text-error-ink',
  warning: 'text-warning-ink',
  info: 'text-info-ink',
};

function createToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearToastTimers = useCallback((id: string) => {
    const dismissTimer = dismissTimersRef.current.get(id);
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimersRef.current.delete(id);
    }
    const exitTimer = exitTimersRef.current.get(id);
    if (exitTimer) {
      clearTimeout(exitTimer);
      exitTimersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const dismissTimers = dismissTimersRef.current;
    const exitTimers = exitTimersRef.current;
    return () => {
      dismissTimers.forEach((timer) => clearTimeout(timer));
      dismissTimers.clear();
      exitTimers.forEach((timer) => clearTimeout(timer));
      exitTimers.clear();
    };
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      const dismissTimer = dismissTimersRef.current.get(id);
      if (dismissTimer) {
        clearTimeout(dismissTimer);
        dismissTimersRef.current.delete(id);
      }

      if (exitTimersRef.current.has(id)) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        return;
      }

      setToasts((prev) =>
        prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      );

      const exitTimer = setTimeout(() => {
        exitTimersRef.current.delete(id);
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, EXIT_ANIMATION_MS);
      exitTimersRef.current.set(id, exitTimer);
    },
    [],
  );

  const showToast = useCallback(
    (toast: Omit<Toast, 'id' | 'leaving'>) => {
      const id = createToastId();
      const duration = toast.duration ?? 5000;

      setToasts((prev) => {
        const next = [...prev, { ...toast, id }];
        if (next.length > MAX_VISIBLE_TOASTS) {
          const evicted = next.slice(0, next.length - MAX_VISIBLE_TOASTS);
          evicted.forEach((item) => clearToastTimers(item.id));
          return next.slice(-MAX_VISIBLE_TOASTS);
        }
        return next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissTimersRef.current.delete(id);
          dismissToast(id);
        }, duration);
        dismissTimersRef.current.set(id, timer);
      }
    },
    [clearToastTimers, dismissToast],
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast],
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message, duration: 7000 });
    },
    [showToast],
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      dismissToast,
    }),
    [showToast, showSuccess, showError, showWarning, showInfo, dismissToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div
        role="region"
        aria-label="Thông báo"
        className="pointer-events-none fixed right-4 top-4 z-[95] flex w-[min(calc(100%-2rem),26rem)] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type];
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              aria-atomic="true"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-md border border-border p-4 shadow-hn-md',
                'transition-colors duration-150 motion-reduce:transition-none',
                toast.leaving ? 'hn-toast-exit' : 'hn-toast-enter',
                TOAST_STYLES[toast.type],
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', ICON_STYLES[toast.type])} aria-hidden="true" />

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{toast.title}</h3>
                {toast.message && (
                  <p className="mt-1 text-sm opacity-90">{toast.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label={`Đóng thông báo: ${toast.title}`}
                className="flex-shrink-0 rounded-sm p-0.5 opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
