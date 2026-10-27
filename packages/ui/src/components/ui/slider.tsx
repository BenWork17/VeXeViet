import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {Array.from({ length: (props.value?.length || props.defaultValue?.length || 1) }).map(
      (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            'block h-5 w-5 rounded-full border-2 border-primary bg-field transition-colors duration-200 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:pointer-events-none disabled:opacity-50',
            'hover:bg-accent'
          )}
        />
      )
    )}
  </SliderPrimitive.Root>
));

Slider.displayName = 'Slider';
