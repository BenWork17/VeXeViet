'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const duration = toast.duration || 5000;

    setToasts((prev) => [...prev, { ...toast, id }]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 7000 });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed right-4 top-4 z-50 flex max-w-md flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type];

          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-start gap-3 rounded-md border border-border p-4 shadow-hn-md',
                'transition-colors duration-150 motion-reduce:transition-none',
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
                onClick={() => dismissToast(toast.id)}
                aria-label={`Đóng thông báo: ${toast.title}`}
                className="flex-shrink-0 rounded-sm opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/[0.125] motion-reduce:transition-none"
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
