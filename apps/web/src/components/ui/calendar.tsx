'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '../../lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-2xl shadow-xl border-2 border-blue-100', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-5',
        caption: 'flex justify-center pt-2 pb-3 relative items-center',
        caption_label: 'text-lg font-black text-gray-900 tracking-tight',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300',
          'hover:bg-blue-600 hover:text-white hover:scale-110 h-9 w-9 bg-white shadow-md p-0',
          'text-blue-600 border-2 border-blue-200'
        ),
        nav_button_previous: 'absolute left-2',
        nav_button_next: 'absolute right-2',
        table: 'w-full border-collapse space-y-1.5 mt-2',
        head_row: 'flex gap-1',
        head_cell: 'text-blue-600 font-bold rounded-md w-11 text-xs uppercase tracking-wider',
        row: 'flex w-full mt-1.5 gap-1',
        cell: 'text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20',
        day: cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-semibold h-11 w-11',
          'text-gray-700 transition-all duration-300 cursor-pointer',
          'hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:scale-110 hover:shadow-lg hover:z-10',
          'aria-selected:opacity-100 relative'
        ),
        day_selected:
          'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg scale-105 font-bold hover:from-blue-700 hover:to-indigo-800 hover:text-white focus:from-blue-700 focus:to-indigo-800 focus:text-white',
        day_today: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold shadow-md hover:from-amber-500 hover:to-orange-600',
        day_outside: 'text-gray-300 opacity-40 hover:opacity-60',
        day_disabled: 'text-gray-200 opacity-30 cursor-not-allowed line-through hover:bg-transparent hover:scale-100 hover:shadow-none',
        day_range_middle: 'aria-selected:bg-blue-100 aria-selected:text-blue-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
