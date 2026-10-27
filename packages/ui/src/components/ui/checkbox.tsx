import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../lib/utils';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, ...props }, ref) => {
  const isChecked = props.checked === true || props.checked === 'indeterminate';

  return (
    <div className="group flex cursor-pointer items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'peer flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-colors duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isChecked
            ? 'border-primary bg-primary'
            : 'border-border-strong bg-field group-hover:border-primary',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          {props.checked === 'indeterminate' ? (
            <div className="h-0.5 w-2.5 rounded-full bg-primary-foreground" />
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={props.id}
          className={cn(
            'cursor-pointer select-none text-sm font-semibold text-foreground transition-colors duration-200 ease-out',
            isChecked ? 'text-primary' : 'group-hover:text-primary'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
