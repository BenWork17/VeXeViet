import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'flex h-[42px] w-full rounded-md border bg-field px-3.5 py-2.5 font-sans text-[14px] font-semibold text-foreground transition-colors duration-200 ease-out file:border-0 file:bg-transparent file:text-[14px] file:font-medium placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring-focus disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input hover:border-primary',
        error: 'border-2 border-destructive focus-visible:border-destructive focus-visible:ring-error-ring',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
