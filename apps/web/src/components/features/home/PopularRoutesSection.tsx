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
    <section
      id="popular-routes"
      className="border-y border-border/60 bg-accent/30 py-12 lg:py-16"
      aria-labelledby="routes-heading"
    >
      <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h2 id="routes-heading" className="text-3xl text-foreground lg:text-4xl">
              Những tuyến được chọn nhiều
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Những cung đường quen thuộc để bạn bắt đầu kế hoạch đi xa nhanh chóng.
            </p>
          </div>
          {displayedRoutes.length > 0 && (
            <Link
              href="/routes"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/25 bg-card px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-accent"
            >
              Xem tất cả tuyến
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy={isLoading}>
          {isLoading ? (
            <>
              <span className="sr-only" role="status" aria-live="polite">
                Đang tải danh sách tuyến phổ biến
              </span>
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="pointer-events-none flex min-h-[250px] select-none flex-col justify-between rounded-xl border border-border bg-card p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                      <span className="h-4 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    </div>
                    <div className="my-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full border-2 border-primary/40" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                          <div className="h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/40" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-14 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                          <div className="h-5 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between border-t border-border/60 pt-4">
                    <div className="space-y-1.5">
                      <div className="h-3 w-12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                      <div className="h-6 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                    </div>
                    <span className="h-9 w-9 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                  </div>
                </div>
              ))}
            </>
          ) : displayedRoutes.length > 0 ? (
            displayedRoutes.map((route, index) => <PopularRouteCard key={route.id} route={route} index={index} />)
          ) : (
            <div className="col-span-full rounded-xl border border-border bg-card px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-foreground">Chưa có tuyến đường nổi bật</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Vui lòng thử lại sau hoặc tìm kiếm tuyến đường bạn cần ở thanh tìm kiếm phía trên.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
