import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-3.5 py-1.5 font-sans text-[12px] font-semibold leading-[1.4] transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-error-soft text-error-ink',
        outline: 'border border-border bg-card text-foreground',
        filter: 'border border-border bg-card text-foreground',
        'filter-active': 'bg-primary text-primary-foreground',
        success: 'bg-success-soft text-success-ink',
        warning: 'bg-warning-soft text-warning-ink',
        danger: 'bg-error-soft text-error-ink',
        info: 'bg-info-soft text-info-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={`${badgeVariants({ variant })} ${className || ''}`} {...props} />;
}

export { Badge, badgeVariants };
