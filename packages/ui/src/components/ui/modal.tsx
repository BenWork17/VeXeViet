'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let activeScrollLocks = 0;
let savedBodyOverflow = '';
let savedBodyPaddingRight = '';

function lockBodyScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (activeScrollLocks === 0) {
    savedBodyOverflow = document.body.style.overflow;
    savedBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
  }
  activeScrollLocks += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  activeScrollLocks = Math.max(0, activeScrollLocks - 1);
  if (activeScrollLocks === 0) {
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.paddingRight = savedBodyPaddingRight;
  }
}

interface ModalContextValue {
  titleId: string;
  descriptionId: string;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function Modal({ open, onClose, children, className, ariaLabel }: ModalProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(open);
  const [isVisible, setIsVisible] = React.useState(false);

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setShouldRender(true);
      const rafId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => {
      setShouldRender(false);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    lockBodyScroll();

    const focusTimer = window.requestAnimationFrame(() => {
      const dialogEl = dialogRef.current;
      if (!dialogEl) return;
      const focusable = dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0]?.focus();
      } else {
        dialogEl.focus();
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const dialogEl = dialogRef.current;
        if (!dialogEl) return;
        const focusable = Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) {
          e.preventDefault();
          dialogEl.focus();
          return;
        }
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first || !dialogEl.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !dialogEl.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  if (!isMounted || !shouldRender) return null;

  return createPortal(
    <ModalContext.Provider value={{ titleId, descriptionId }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-describedby={descriptionId}
      >
        <div
          className={cn(
            'fixed inset-0 bg-foreground/45 backdrop-blur-[2px] transition-opacity duration-150 ease-out motion-reduce:transition-none',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={cn(
            'relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-hn-lg outline-none',
            'transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none',
            isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.98] opacity-0',
            className
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ModalTitle({ className, id, ...props }: ModalTitleProps) {
  const ctx = React.useContext(ModalContext);
  return (
    <h2
      id={id ?? ctx?.titleId}
      className={cn('font-display text-[20px] leading-[1.35] tracking-tight text-card-foreground', className)}
      {...props}
    />
  );
}

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ModalDescription({ className, id, ...props }: ModalDescriptionProps) {
  const ctx = React.useContext(ModalContext);
  return (
    <p
      id={id ?? ctx?.descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalContent({ className, ...props }: ModalContentProps) {
  return <div className={cn('py-4', className)} {...props} />;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}
