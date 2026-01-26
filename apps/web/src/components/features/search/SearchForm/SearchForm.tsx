'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, Input, cn } from '@vexeviet/ui'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ProvinceSelect } from '@/components/ui/province-select'
import { ArrowLeftRight, Search, CalendarDays, Users, MapPin, Navigation } from 'lucide-react'

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
  const [isSwapping, setIsSwapping] = React.useState(false)

  const handleSwapLocations = () => {
    setIsSwapping(true)
    const currentOrigin = origin
    const currentDestination = destination
    
    setTimeout(() => {
      setValue('origin', currentDestination)
      setValue('destination', currentOrigin)
      setIsSwapping(false)
    }, 300)
  }

  const handleFormSubmit = (data: SearchFormValues) => {
    // Format date as local date (YYYY-MM-DD) without timezone conversion
    const year = data.departureDate.getFullYear()
    const month = String(data.departureDate.getMonth() + 1).padStart(2, '0')
    const day = String(data.departureDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    if (onSubmit) {
      onSubmit(data)
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6 overflow-visible', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 overflow-visible">
        {/* Origin & Destination - 5 columns */}
        <div className="lg:col-span-5 relative z-[99999] overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative overflow-visible">
            {/* Origin Field */}
            <div className="group overflow-visible">
              <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-2 ml-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Điểm đi</span>
              </label>
              <div className={cn(
                "relative transition-all duration-300 overflow-visible",
                isSwapping && "scale-95 opacity-50"
              )}>
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
                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity -z-10" />
              </div>
            </div>

            {/* Swap Button - Center */}
            <button
              type="button"
              onClick={handleSwapLocations}
              disabled={isLoading || isSwapping}
              className={cn(
                "absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 z-[10001]",
                "w-10 h-10 rounded-full",
                "bg-gradient-to-br from-primary to-blue-600 text-white",
                "shadow-lg shadow-primary/30",
                "hover:shadow-xl hover:shadow-primary/40 hover:scale-110",
                "active:scale-95",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center",
                "group/swap",
                isSwapping && "animate-spin"
              )}
              aria-label="Hoán đổi điểm đi và điểm đến"
            >
              <ArrowLeftRight className="w-4 h-4 group-hover/swap:rotate-180 transition-transform duration-500" />
            </button>

            {/* Destination Field */}
            <div className="group overflow-visible">
              <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-2 ml-1">
                <Navigation className="w-3.5 h-3.5 text-secondary" />
                <span>Điểm đến</span>
              </label>
              <div className={cn(
                "relative transition-all duration-300 overflow-visible",
                isSwapping && "scale-95 opacity-50"
              )}>
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
                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-xl bg-secondary/10 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity -z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Passengers - 4 columns */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {/* Departure Date */}
          <div className="group">
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-2 ml-1">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              <span>Ngày đi</span>
            </label>
            <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isLoading}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl",
                    "bg-gray-50 border-2 border-gray-100",
                    "hover:border-primary/50 hover:bg-white",
                    "focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10",
                    "transition-all duration-200",
                    "flex items-center justify-start text-left",
                    "group-hover:shadow-lg group-hover:shadow-primary/5",
                    !departureDate && "text-gray-400",
                    departureDate && "text-gray-900 font-medium"
                  )}
                >
                  <CalendarDays className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="text-sm">
                    {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10002] rounded-2xl shadow-2xl border-0" align="start">
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
            {errors.departureDate && (
              <p className="text-[10px] font-medium text-red-500 mt-1.5 ml-1 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
                {errors.departureDate.message}
              </p>
            )}
          </div>

          {/* Passengers */}
          <div className="group">
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-2 ml-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Số khách</span>
            </label>
            <Controller
              name="passengers"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    disabled={isLoading}
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-xl",
                      "bg-gray-50 border-2 border-gray-100",
                      "hover:border-primary/50 hover:bg-white",
                      "focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 focus:outline-none",
                      "transition-all duration-200",
                      "text-sm font-medium text-gray-900",
                      "group-hover:shadow-lg group-hover:shadow-primary/5"
                    )}
                  />
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-primary group-focus-within:text-primary transition-colors" />
                </div>
              )}
            />
            {errors.passengers && (
              <p className="text-[10px] font-medium text-red-500 mt-1.5 ml-1 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
                {errors.passengers.message}
              </p>
            )}
          </div>
        </div>

        {/* Search Button - 3 columns */}
        <div className="lg:col-span-3 flex items-end">
          <Button 
            type="submit" 
            size="lg"
            disabled={isLoading}
            className={cn(
              "w-full h-12 rounded-xl",
              "bg-gradient-to-r from-primary via-blue-600 to-primary bg-[length:200%_100%]",
              "hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-primary/30",
              "active:scale-[0.98]",
              "text-white font-bold text-base",
              "transition-all duration-500",
              "group/btn relative overflow-hidden"
            )}
          >
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            
            {isLoading ? (
              <span className="flex items-center justify-center relative z-10">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tìm...
              </span>
            ) : (
              <span className="flex items-center justify-center relative z-10">
                <Search className="w-5 h-5 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                Tìm chuyến xe
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>Đặt vé nhanh chóng</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>500+ tuyến đường</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Giá tốt nhất</span>
        </div>
      </div>
    </form>
  )
}
