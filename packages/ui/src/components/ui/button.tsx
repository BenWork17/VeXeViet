import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-sans font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-hn-sm hover:bg-primary-deep',
        secondary:
          'border border-primary bg-transparent text-primary hover:bg-accent hover:text-primary-deep',
        outline:
          'border border-primary bg-transparent text-primary hover:bg-accent',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        danger: 'bg-destructive text-destructive-foreground hover:bg-error-ink',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-error-ink',
      },
      size: {
        sm: 'h-[34px] px-[14px] text-[14px]',
        md: 'h-[42px] px-[20px] text-[16px]',
        lg: 'h-[50px] px-[28px] text-[18px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = Boolean(disabled || isLoading)
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={!asChild ? isDisabled : undefined}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && (
              <svg
                className="mr-2 h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
