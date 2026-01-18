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
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
            Origin
          </label>
          <Input
            id="origin"
            placeholder="Enter origin city"
            variant={errors.origin ? 'error' : 'default'}
            disabled={isLoading}
            {...register('origin')}
          />
          {errors.origin && <p className="text-sm text-red-600">{errors.origin.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
            Destination
          </label>
          <Input
            id="destination"
            placeholder="Enter destination city"
            variant={errors.destination ? 'error' : 'default'}
            disabled={isLoading}
            {...register('destination')}
          />
          {errors.destination && (
            <p className="text-sm text-red-600">{errors.destination.message}</p>
          )}
          <button
            type="button"
            onClick={handleSwapLocations}
            disabled={isLoading}
            className="absolute right-0 top-0 mt-8 mr-2 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            aria-label="Swap origin and destination"
          >
            ⇄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Departure Date</label>
          <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className={`w-full justify-start text-left font-normal ${
                  !departureDate ? 'text-gray-400' : ''
                } ${errors.departureDate ? 'border-red-500' : ''}`}
              >
                {departureDate ? format(departureDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start">
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
            <p className="text-sm text-red-600">{errors.departureDate.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Return Date (Optional)</label>
          <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className={`w-full justify-start text-left font-normal ${
                  !returnDate ? 'text-gray-400' : ''
                } ${errors.returnDate ? 'border-red-500' : ''}`}
              >
                {returnDate ? format(returnDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => {
                  setValue('returnDate', date, { shouldValidate: true })
                  setReturnDateOpen(false)
                }}
                disabled={(date: Date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                  (departureDate ? date <= departureDate : false)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.returnDate && (
            <p className="text-sm text-red-600">{errors.returnDate.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="passengers" className="block text-sm font-medium text-gray-700">
            Passengers
          </label>
          <Input
            id="passengers"
            type="number"
            min={1}
            max={10}
            placeholder="1"
            variant={errors.passengers ? 'error' : 'default'}
            disabled={isLoading}
            {...register('passengers', { valueAsNumber: true })}
          />
          {errors.passengers && <p className="text-sm text-red-600">{errors.passengers.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => reset()} disabled={isLoading}>
          Clear
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search Routes'}
        </Button>
      </div>
    </form>
  )
}
