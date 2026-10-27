'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '../../lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-6 bg-card text-foreground border border-border rounded-md shadow-hn', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-5',
        caption: 'flex justify-center pt-2 pb-3 relative items-center',
        caption_label: 'text-lg font-semibold text-foreground tracking-tight',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'inline-flex items-center justify-center rounded-md h-9 w-9 p-0',
          'text-muted-foreground border border-border bg-card',
          'transition-colors duration-150',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        ),
        nav_button_previous: 'absolute left-2',
        nav_button_next: 'absolute right-2',
        table: 'w-full border-collapse space-y-1.5 mt-2',
        head_row: 'flex gap-1',
        head_cell: 'text-muted-foreground font-semibold rounded-sm w-11 text-xs uppercase tracking-wider',
        row: 'flex w-full mt-1.5 gap-1',
        cell: 'text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium h-11 w-11',
          'text-foreground transition-colors duration-150 cursor-pointer',
          'hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'aria-selected:opacity-100 relative'
        ),
        day_selected:
          'bg-primary text-primary-foreground font-semibold hover:bg-primary-deep hover:text-primary-foreground focus:bg-primary-deep focus:text-primary-foreground',
        day_today: 'border border-primary text-foreground font-semibold',
        day_outside: 'text-muted-foreground opacity-50 hover:opacity-100',
        day_disabled: 'text-muted-foreground opacity-40 cursor-not-allowed line-through hover:bg-transparent',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
