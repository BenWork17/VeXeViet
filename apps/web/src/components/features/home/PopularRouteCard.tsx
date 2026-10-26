'use client'

import { memo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BusFront, Clock3, MapPin } from 'lucide-react'
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
      className={`route-card${isNavigating ? ' pointer-events-none opacity-70' : ''}`}
      aria-label={`Xem tuyến ${route.origin} đến ${route.destination}`}
    >
      <div>
        <div className="route-card-top">
          <span className="route-card-icon" aria-hidden="true"><BusFront size={18} /></span>
          <span className="route-card-type">{BUS_TYPE_LABELS[route.busType] || 'Xe khách'}</span>
        </div>

        <div className="route-path" aria-label={`${route.origin} đến ${route.destination}`}>
          <div className="route-stop">
            <span className="route-stop-dot" aria-hidden="true" />
            <div>
              <p className="route-stop-label">Điểm đi</p>
              <div className="route-stop-name">{route.origin}</div>
            </div>
          </div>
          <div className="route-stop">
            <span className="route-stop-dot" aria-hidden="true" />
            <div>
              <p className="route-stop-label">Điểm đến</p>
              <div className="route-stop-name">{route.destination}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="route-card-bottom">
        <div>
          <div className="route-meta">
            {route.duration ? <span><Clock3 size={13} aria-hidden="true" /> {Math.floor(route.duration / 60)}h{route.duration % 60 ? `${route.duration % 60}m` : ''}</span> : null}
            {route.distance ? <span><MapPin size={13} aria-hidden="true" /> {route.distance}km</span> : null}
          </div>
          <p className="route-price-label">Giá từ</p>
          <div className="route-price">{formattedPrice}</div>
        </div>
        <span className="route-card-arrow" aria-hidden="true">
          {isNavigating ? '...' : <ArrowRight size={20} />}
        </span>
      </div>
    </Link>
  )
})

PopularRouteCard.displayName = 'PopularRouteCard'
