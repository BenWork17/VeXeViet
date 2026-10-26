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
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('search-form overflow-visible', className)}>
      <div className="search-fields overflow-visible">
        <div className="search-field province-field">
          <label className="search-field-label"><MapPin aria-hidden="true" /><span>Điểm đi</span></label>
          <Controller
            name="origin"
            control={control}
            render={({ field }) => (
              <ProvinceSelect value={field.value} onValueChange={field.onChange} placeholder="Chọn điểm đi" disabled={isLoading} error={errors.origin?.message} />
            )}
          />
          <button type="button" onClick={handleSwapLocations} disabled={isLoading || isSwapping} className="swap-button" aria-label="Hoán đổi điểm đi và điểm đến">
            <ArrowLeftRight size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="search-field">
          <label className="search-field-label"><Navigation aria-hidden="true" /><span>Điểm đến</span></label>
          <Controller
            name="destination"
            control={control}
            render={({ field }) => (
              <ProvinceSelect value={field.value} onValueChange={field.onChange} placeholder="Chọn điểm đến" disabled={isLoading} error={errors.destination?.message} />
            )}
          />
        </div>

        <div className="search-field">
          <label className="search-field-label"><CalendarDays aria-hidden="true" /><span>Ngày đi</span></label>
          <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
            <PopoverTrigger asChild>
              <button type="button" disabled={isLoading} className={cn('search-control flex items-center justify-start text-left', !departureDate && 'text-steel', departureDate && 'font-semibold')}>
                <CalendarDays size={16} className="mr-3 text-primary" aria-hidden="true" />
                <span>{departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Chọn ngày'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={departureDate} onSelect={(date) => { if (date) { setValue('departureDate', date, { shouldValidate: true }); setDepartureDateOpen(false) } }} disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
            </PopoverContent>
          </Popover>
          {errors.departureDate && <p className="search-field-error">{errors.departureDate.message}</p>}
        </div>

        <div className="search-field">
          <label className="search-field-label"><Users aria-hidden="true" /><span>Số khách</span></label>
          <Controller
            name="passengers"
            control={control}
            render={({ field }) => <input type="number" min={1} max={10} disabled={isLoading} value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} className="search-control" aria-label="Số khách" />}
          />
          {errors.passengers && <p className="search-field-error">{errors.passengers.message}</p>}
        </div>
      </div>

      <div className="search-form-footer">
        <div className="search-form-note"><span>Đặt vé nhanh chóng</span><span>500+ tuyến đường</span><span>Giá rõ ràng</span></div>
        <Button type="submit" size="lg" disabled={isLoading} className="search-submit">
          {isLoading ? 'Đang tìm...' : <><Search size={18} className="mr-2" aria-hidden="true" />Tìm chuyến xe</>}
        </Button>
      </div>
    </form>
  )
}
