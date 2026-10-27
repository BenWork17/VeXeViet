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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'
