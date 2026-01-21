'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@vexeviet/ui'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ProvinceSelect } from '@/components/ui/province-select'
import { ArrowLeftRight } from 'lucide-react'

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
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
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
    // Format date as local date (YYYY-MM-DD) without timezone conversion
    const year = data.departureDate.getFullYear()
    const month = String(data.departureDate.getMonth() + 1).padStart(2, '0')
    const day = String(data.departureDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    if (onSubmit) {
      onSubmit(data)
      return
    }

    const params = new URLSearchParams()
    params.set('origin', data.origin)
    params.set('destination', data.destination)
    params.set('departureDate', formattedDate)
    params.set('passengers', data.passengers.toString())
    if (data.returnDate) {
      const returnYear = data.returnDate.getFullYear()
      const returnMonth = String(data.returnDate.getMonth() + 1).padStart(2, '0')
      const returnDay = String(data.returnDate.getDate()).padStart(2, '0')
      params.set('returnDate', `${returnYear}-${returnMonth}-${returnDay}`)
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Origin & Destination - 5 columns */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-3 relative z-[10000]">
          <div className="space-y-1.5">
            <label htmlFor="origin" className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-2">
              Điểm đi
            </label>
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <ProvinceSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Chọn điểm đi"
                  disabled={isLoading}
                  error={errors.origin?.message}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="destination" className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-2">
              Điểm đến
            </label>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <ProvinceSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Chọn điểm đến"
                  disabled={isLoading}
                  error={errors.destination?.message}
                />
              )}
            />
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwapLocations}
            disabled={isLoading}
            className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-[10001] bg-primary hover:bg-primary/90 shadow-lg p-2 rounded-full hover:scale-110 transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Hoán đổi điểm đi và điểm đến"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date & Passengers - 4 columns */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-2">Ngày đi</label>
            <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className={`h-12 rounded-xl border-2 border-gray-200 bg-white w-full justify-start text-left font-normal transition-all hover:bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm ${
                    !departureDate ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10002]" align="start">
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
            {errors.departureDate && <p className="text-[10px] font-medium text-red-500 mt-1 ml-2">{errors.departureDate.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-2">Số khách</label>
            <Controller
              name="passengers"
              control={control}
              render={({ field }) => (
                <div className="relative group">
                  <Input
                    id="passengers"
                    type="number"
                    min={1}
                    max={10}
                    className="pl-9 h-12 rounded-xl border-2 border-gray-200 bg-white focus:bg-white transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={isLoading}
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                </div>
              )}
            />
            {errors.passengers && <p className="text-[10px] font-medium text-red-500 mt-1 ml-2">{errors.passengers.message}</p>}
          </div>
        </div>

        {/* Search Button - 3 columns */}
        <div className="lg:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-transparent ml-2 hidden lg:block">Action</label>
          <Button 
            type="submit" 
            size="lg"
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tìm...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm chuyến xe
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
