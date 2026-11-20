'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button, cn } from '@vexeviet/ui'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ProvinceSelect } from '@/components/ui/province-select'
import { ArrowLeftRight, Search, CalendarDays, Users, MapPin, Navigation, Loader2 } from 'lucide-react'

const searchFormSchema = z
  .object({
    origin: z.string().min(1, 'Vui lòng chọn điểm đi'),
    destination: z.string().min(1, 'Vui lòng chọn điểm đến'),
    departureDate: z
      .date({
        message: 'Vui lòng chọn ngày đi',
      })
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: 'Ngày đi không thể ở quá khứ',
      }),
    returnDate: z.date().optional(),
    passengers: z
      .number({ message: 'Vui lòng nhập số hành khách' })
      .int('Số hành khách phải là số nguyên')
      .min(1, 'Tối thiểu 1 hành khách')
      .max(10, 'Tối đa 10 hành khách'),
  })
  .refine(
    (data) => {
      if (data.origin && data.destination) {
        return data.origin.trim().toLowerCase() !== data.destination.trim().toLowerCase()
      }
      return true
    },
    {
      message: 'Điểm đến phải khác điểm đi',
      path: ['destination'],
    }
  )
  .refine(
    (data) => {
      if (data.returnDate && data.departureDate) {
        return data.returnDate > data.departureDate
      }
      return true
    },
    {
      message: 'Ngày về phải sau ngày đi',
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
    getValues,
    reset,
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

  const [departureDateOpen, setDepartureDateOpen] = React.useState(false)
  const [passengersInput, setPassengersInput] = React.useState(
    String(initialValues?.passengers || 1)
  )

  const initialOrigin = initialValues?.origin || ''
  const initialDestination = initialValues?.destination || ''
  const initialDepartureTime = initialValues?.departureDate?.getTime()
  const initialReturnTime = initialValues?.returnDate?.getTime()
  const initialPassengers = initialValues?.passengers || 1

  React.useEffect(() => {
    reset({
      origin: initialOrigin,
      destination: initialDestination,
      departureDate: initialDepartureTime ? new Date(initialDepartureTime) : undefined,
      returnDate: initialReturnTime ? new Date(initialReturnTime) : undefined,
      passengers: initialPassengers,
    })
    setPassengersInput(String(initialPassengers))
  }, [
    initialOrigin,
    initialDestination,
    initialDepartureTime,
    initialReturnTime,
    initialPassengers,
    reset,
  ])

  const handleSwapLocations = () => {
    const currentOrigin = getValues('origin')
    const currentDestination = getValues('destination')
    setValue('origin', currentDestination, { shouldValidate: true })
    setValue('destination', currentOrigin, { shouldValidate: true })
  }

  const handleFormSubmit = (data: SearchFormValues) => {
    if (onSubmit) {
      onSubmit(data)
      return
    }

    // Format date as local date (YYYY-MM-DD) without timezone conversion
    const year = data.departureDate.getFullYear()
    const month = String(data.departureDate.getMonth() + 1).padStart(2, '0')
    const day = String(data.departureDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

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
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('search-form overflow-visible', className)}
      noValidate
    >
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
          <button
            type="button"
            onClick={handleSwapLocations}
            disabled={isLoading}
            className="swap-button top-[calc(50%+14px)]! right-[-18px]! h-8! w-8! rounded-full! border! border-border! bg-card! text-muted-foreground! shadow-xs! transition-colors hover:border-primary! hover:bg-accent! hover:text-primary!"
            aria-label="Hoán đổi điểm đi và điểm đến"
          >
            <ArrowLeftRight size={14} aria-hidden="true" />
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
              <button type="button" disabled={isLoading} className={cn('search-control flex items-center justify-start border border-input bg-field text-left', !departureDate && 'text-steel', departureDate && 'font-semibold')}>
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
          <label htmlFor="search-passengers" className="search-field-label"><Users aria-hidden="true" /><span>Số khách</span></label>
          <Controller
            name="passengers"
            control={control}
            render={({ field }) => (
              <input
                id="search-passengers"
                type="number"
                inputMode="numeric"
                min={1}
                max={10}
                disabled={isLoading}
                value={passengersInput}
                onChange={(e) => {
                  const raw = e.target.value
                  setPassengersInput(raw)
                  if (raw === '') return
                  const parsed = parseInt(raw, 10)
                  if (!Number.isNaN(parsed)) {
                    field.onChange(parsed)
                  }
                }}
                onBlur={() => {
                  const parsed = parseInt(passengersInput, 10)
                  const clamped = Number.isNaN(parsed) ? 1 : Math.min(10, Math.max(1, parsed))
                  setPassengersInput(String(clamped))
                  field.onChange(clamped)
                  field.onBlur()
                }}
                aria-invalid={Boolean(errors.passengers)}
                className="search-control border border-input bg-field"
                aria-label="Số khách"
              />
            )}
          />
          {errors.passengers && <p className="search-field-error">{errors.passengers.message}</p>}
        </div>
      </div>

      <div className="search-form-footer">
        <div className="search-form-note"><span>Đặt vé nhanh chóng</span><span>500+ tuyến đường</span><span>Giá rõ ràng</span></div>
        <Button type="submit" size="lg" disabled={isLoading} aria-busy={isLoading} className="search-submit">
          {isLoading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Đang tìm...
            </>
          ) : (
            <>
              <Search size={18} className="mr-2" aria-hidden="true" />
              Tìm chuyến xe
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
