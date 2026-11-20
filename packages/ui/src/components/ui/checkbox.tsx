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
>(({ className, label, id, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className="group flex items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          'peer flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border-2 border-border-strong bg-field transition-colors duration-200 ease-out motion-reduce:transition-none',
          'hover:border-primary group-hover:border-primary',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
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
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            'cursor-pointer select-none text-sm font-semibold text-foreground transition-colors duration-200 ease-out motion-reduce:transition-none',
            'group-hover:text-primary peer-data-[state=checked]:text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
