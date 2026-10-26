'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { usePopularRoutes } from '@/lib/hooks/useRoutes'
import { PopularRouteCard } from './PopularRouteCard'

export function PopularRoutesSection() {
  const { data: popularRoutesData, isLoading } = usePopularRoutes()
  const displayedRoutes = useMemo(() => popularRoutesData?.slice(0, 8) || [], [popularRoutesData])

  return (
    <section id="popular-routes" className="routes-section" aria-labelledby="routes-heading">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <h2 id="routes-heading">Những tuyến được chọn nhiều</h2>
            <p>Những cung đường quen thuộc để bạn bắt đầu kế hoạch đi xa.</p>
          </div>
          {displayedRoutes.length > 0 && (
            <Link href="/routes" className="text-link">
              Xem tất cả tuyến
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="route-grid">
          {isLoading ? (
            <div className="route-loading" aria-live="polite">Đang tải tuyến phổ biến...</div>
          ) : displayedRoutes.length > 0 ? (
            displayedRoutes.map((route, index) => <PopularRouteCard key={route.id} route={route} index={index} />)
          ) : (
            <div className="route-empty">
              <h3>Chưa có tuyến đường nổi bật</h3>
              <p>Vui lòng thử lại sau hoặc tìm kiếm tuyến đường bạn cần.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
