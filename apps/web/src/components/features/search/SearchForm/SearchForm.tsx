'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@vexeviet/ui'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const searchFormSchema = z
  .object({
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    departureDate: z
      .date({
        message: 'Departure date is required',
      })
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: 'Departure date cannot be in the past',
      }),
    returnDate: z.date().optional(),
    passengers: z.number().min(1, 'At least 1 passenger').max(10, 'Maximum 10 passengers'),
  })
  .refine(
    (data) => {
      if (data.returnDate && data.departureDate) {
        return data.returnDate > data.departureDate
      }
      return true
    },
    {
      message: 'Return date must be after departure date',
      path: ['returnDate'],
    }
  )

export type SearchFormValues = z.infer<typeof searchFormSchema>

export interface SearchFormProps {
  initialValues?: Partial<SearchFormValues>
  onSubmit?: (values: SearchFormValues) => void
  isLoading?: boolean
  className?: string
}

export function SearchForm({
  initialValues,
  onSubmit,
  isLoading = false,
  className = '',
}: SearchFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      origin: initialValues?.origin || '',
      destination: initialValues?.destination || '',
      departureDate: initialValues?.departureDate || undefined,
      returnDate: initialValues?.returnDate || undefined,
      passengers: initialValues?.passengers || 1,
    },
  })

  const departureDate = watch('departureDate')
  const returnDate = watch('returnDate')
  const origin = watch('origin')
  const destination = watch('destination')

  const [departureDateOpen, setDepartureDateOpen] = React.useState(false)
  const [returnDateOpen, setReturnDateOpen] = React.useState(false)

  const handleSwapLocations = () => {
    const currentOrigin = origin
    const currentDestination = destination
    setValue('origin', currentDestination)
    setValue('destination', currentOrigin)
  }

  const handleFormSubmit = (data: SearchFormValues) => {
    if (onSubmit) {
      onSubmit(data)
      return
    }

    const params = new URLSearchParams()
    params.set('origin', data.origin)
    params.set('destination', data.destination)
    params.set('departureDate', format(data.departureDate, 'yyyy-MM-dd'))
    params.set('passengers', data.passengers.toString())
    if (data.returnDate) {
      params.set('returnDate', format(data.returnDate, 'yyyy-MM-dd'))
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label htmlFor="origin" className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
              Điểm đi
            </label>
            <div className="relative group">
                <Input
                id="origin"
                placeholder="Tỉnh, thành phố..."
                className="pl-10 h-14 rounded-2xl border-4 border-slate-200 bg-white focus:bg-white transition-all focus:border-primary focus:ring-0"
                disabled={isLoading}
                {...register('origin')}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
            </div>
            {errors.origin && <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter">{errors.origin.message}</p>}
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="destination" className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
              Điểm đến
            </label>
            <div className="relative group">
                <Input
                id="destination"
                placeholder="Tỉnh, thành phố..."
                className="pl-10 h-14 rounded-2xl border-4 border-slate-200 bg-white focus:bg-white transition-all focus:border-primary focus:ring-0"
                disabled={isLoading}
                {...register('destination')}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              <button
                type="button"
                onClick={handleSwapLocations}
                disabled={isLoading}
                className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-gray-100 p-2 rounded-full hover:rotate-180 transition-all duration-500 text-primary"
                aria-label="Swap origin and destination"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </button>
            </div>
            {errors.destination && <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter">{errors.destination.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Ngày đi</label>
            <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className={`h-14 rounded-2xl border-4 border-slate-200 bg-white w-full justify-start text-left font-normal transition-all hover:bg-white focus:border-primary ${
                    !departureDate ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100] rounded-3xl overflow-hidden border-none shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={(date) => {
                    if (date) {
                      setValue('departureDate', date, { shouldValidate: true })
                      setDepartureDateOpen(false)
                    }
                  }}
                  disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Số khách</label>
            <div className="relative group">
                <Input
                id="passengers"
                type="number"
                min={1}
                max={10}
                className="pl-10 h-14 rounded-2xl border-4 border-slate-200 bg-white focus:bg-white transition-all focus:border-primary focus:ring-0"
                disabled={isLoading}
                {...register('passengers', { valueAsNumber: true })}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Button 
            type="submit" 
            size="lg"
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-[0_10px_20px_-5px_rgba(139,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(139,0,0,0.4)] transition-all bg-primary text-white dark:bg-gray-800 dark:text-white dark:border dark:border-gray-600 [&:hover]:text-black" 
            disabled={isLoading}
          >
            {isLoading ? 'Đang tìm...' : 'Tìm chuyến xe'}
          </Button>
        </div>
      </div>
    </form>
  )
}
