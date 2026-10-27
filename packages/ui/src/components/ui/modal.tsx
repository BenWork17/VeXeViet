import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-foreground/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg border border-border bg-card p-6 text-card-foreground shadow-hn-lg',
          className
        )}
      >
        {children}
      </div>
    </div>
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

export function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn('font-display text-[20px] leading-[1.35] tracking-tight text-card-foreground', className)}
      {...props}
    />
  );
}

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <p
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
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  );
}
