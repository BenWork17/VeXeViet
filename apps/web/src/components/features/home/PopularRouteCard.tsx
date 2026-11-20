'use client'

import { memo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CardWatermark } from '@/components/brand'
import { formatCurrency } from '@/lib/utils'
import type { Route } from '@vexeviet/types'

const BUS_TYPE_LABELS: Record<string, string> = {
  LIMOUSINE: 'Limousine',
  SLEEPER_BUS: 'Giường nằm',
  STANDARD: 'Tiêu chuẩn',
  VIP: 'VIP',
  SLEEPER: 'Giường nằm',
}

interface PopularRouteCardProps {
  route: Route
  index: number
}

export const PopularRouteCard = memo(({ route }: PopularRouteCardProps) => {
  const [isNavigating, setIsNavigating] = useState(false)
  const price = typeof route.price === 'string' ? parseFloat(route.price) : route.price
  const formattedPrice = formatCurrency(price)

  return (
    <Link
      href={`/routes/${route.id}`}
      onClick={() => setIsNavigating(true)}
      className={`group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 text-foreground no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isNavigating ? 'pointer-events-none opacity-70' : ''
      }`}
      aria-label={`Xem tuyến ${route.origin} đến ${route.destination}`}
    >
      <CardWatermark
        variant="lotus"
        position="bottom-right"
        className="transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-primary/15 bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">
            {BUS_TYPE_LABELS[route.busType] || 'Xe khách'}
          </span>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {route.duration ? (
              <span>
                {Math.floor(route.duration / 60)}h{route.duration % 60 ? `${route.duration % 60}m` : ''}
              </span>
            ) : null}
            {route.duration && route.distance ? <span aria-hidden="true">·</span> : null}
            {route.distance ? <span>{route.distance} km</span> : null}
          </div>
        </div>

        <div className="relative my-5 space-y-3.5" aria-label={`${route.origin} đến ${route.destination}`}>
          <div
            aria-hidden="true"
            className="absolute top-3 bottom-3 left-[4.5px] w-px bg-border"
          />
          <div className="relative flex items-start gap-3">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-card"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Điểm đi</p>
              <div className="truncate text-base font-bold text-foreground">{route.origin}</div>
            </div>
          </div>
          <div className="relative flex items-start gap-3">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-primary bg-primary"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Điểm đến</p>
              <div className="truncate text-base font-bold text-foreground">{route.destination}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Giá từ</p>
          <div className="text-xl font-extrabold text-primary">{formattedPrice}</div>
        </div>
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
          aria-hidden="true"
        >
          {isNavigating ? '…' : <ArrowRight size={16} />}
        </span>
      </div>
    </Link>
  )
})

PopularRouteCard.displayName = 'PopularRouteCard'
