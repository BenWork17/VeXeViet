'use client'

import '@/styles/home.css'
import '@/styles/search.css'
import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@vexeviet/ui'
import type { SearchFormValues } from '@/components/features/search/SearchForm'
import { useRouter } from 'next/navigation'
import { HandFramingHero } from '@/components/features/home/HandFramingHero'
import { PopularRoutesSection } from '@/components/features/home/PopularRoutesSection'
import { StatsSection } from '@/components/features/home/StatsSection'
import { CardWatermark } from '@/components/brand'
import { FadeIn } from '@/components/motion'
import { ArrowRight, Clock3, MapPin, Search, ShieldCheck, TicketCheck } from 'lucide-react'

const SearchForm = dynamic(
  () => import('@/components/features/search/SearchForm').then((mod) => mod.SearchForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 py-2" role="status" aria-live="polite">
        <span className="sr-only">Đang tải biểu mẫu tìm chuyến xe</span>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            </div>
          ))}
        </div>
        <div className="flex justify-end" aria-hidden="true">
          <div className="h-11 w-40 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        </div>
      </div>
    ),
  }
)

export default function HomePage() {
  const router = useRouter()

  const scrollToSection = useCallback((id: string) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }, [])

  const handleSearch = (values: SearchFormValues) => {
    const year = values.departureDate.getFullYear()
    const month = String(values.departureDate.getMonth() + 1).padStart(2, '0')
    const day = String(values.departureDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    const params = new URLSearchParams()
    params.set('origin', values.origin)
    params.set('destination', values.destination)
    params.set('departureDate', formattedDate)
    params.set('passengers', values.passengers.toString())

    if (values.returnDate) {
      const returnYear = values.returnDate.getFullYear()
      const returnMonth = String(values.returnDate.getMonth() + 1).padStart(2, '0')
      const returnDay = String(values.returnDate.getDate()).padStart(2, '0')
      params.set('returnDate', `${returnYear}-${returnMonth}-${returnDay}`)
    }

    router.push(`/search?${params.toString()}`)
  }

  return (
    <FadeIn className="overflow-x-clip bg-background text-foreground">
      {/* Hero Section — Full-width 24-inch widescreen layout */}
      <section className="bg-background pt-6 pb-10 lg:pt-8 lg:pb-12">
        <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
          {/* Compact balanced hero header row — buttons sit to the right of the title like original, shifted inward away from top-right hand */}
          <div className="mb-7 flex flex-col gap-5 lg:mb-9 lg:flex-row lg:items-end lg:justify-between lg:pr-60 xl:pr-72">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent px-3.5 py-1 text-xs font-bold tracking-wide text-accent-foreground">
                <ShieldCheck size={14} aria-hidden="true" />
                <span>Thông tin chuyến xe minh bạch trước khi bạn đặt</span>
              </div>
              <h1 className="text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl xl:text-[3.65rem]">
                Đi xa cùng VeXeViet.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Chọn tuyến, so sánh giờ chạy và giữ chỗ trong vài bước rõ ràng. VeXeViet giúp bạn lên đường nhẹ nhàng hơn.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 lg:pb-1">
              <Button
                type="button"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-deep"
                onClick={() => scrollToSection('search-section')}
              >
                <Search size={17} aria-hidden="true" />
                <span>Tìm chuyến xe</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-border-strong bg-card px-5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
                onClick={() => scrollToSection('popular-routes')}
              >
                <span>Xem tuyến phổ biến</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* First-Person POV Hand-Framing Hero Visual (lowers hands & expands vista on scroll) */}
          <HandFramingHero />

          {/* Integrated Search Card cleanly placed below Hero */}
          <div
            id="search-section"
            aria-labelledby="search-heading"
            className="relative z-10 mt-8 w-full lg:mt-10"
          >
            <div className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md sm:p-6 lg:px-8 lg:py-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              >
                <CardWatermark variant="route-ribbon" position="bottom-right" />
              </div>

              <div className="relative z-10">
                <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 id="search-heading" className="text-xl text-foreground sm:text-2xl">
                      Tìm đúng chuyến cho hành trình của bạn
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground sm:text-sm" aria-label="Lợi ích khi tìm vé">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} className="text-primary" aria-hidden="true" />
                      Chọn tỉnh, thành phố linh hoạt
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={15} className="text-primary" aria-hidden="true" />
                      So sánh giờ chạy phù hợp
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <TicketCheck size={15} className="text-primary" aria-hidden="true" />
                      Giữ chỗ nhanh, giá minh bạch
                    </span>
                  </div>
                </div>

                <SearchForm
                  onSubmit={handleSearch}
                  className="lg:[&_.search-fields]:grid-cols-4! [&_.search-fields]:gap-5! [&_.search-form-footer]:pt-1 [&_.search-submit]:rounded-xl! [&_.search-submit]:px-7!"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PopularRoutesSection />
      <StatsSection />

      {/* Bottom CTA Banner */}
      <section className="bg-background py-10 lg:py-14" aria-labelledby="cta-heading">
        <div className="mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12">
          <div className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-11">
            <CardWatermark variant="dong-son" position="top-right" />
            <div className="relative z-10 max-w-2xl space-y-2">
              <h2 id="cta-heading" className="text-2xl text-foreground sm:text-3xl lg:text-4xl">
                Sẵn sàng cho cung đường tiếp theo?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Chọn tuyến xe phù hợp hôm nay, để ngày khởi hành chỉ còn là một điểm hẹn nhẹ nhàng.
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-deep"
                onClick={() => scrollToSection('search-section')}
              >
                <Search size={18} aria-hidden="true" />
                <span>Tìm chuyến xe</span>
              </Button>
              <Button
                asChild
                type="button"
                variant="outline"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-border-strong bg-card px-6 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
              >
                <a href="mailto:hello@vexeviet.vn?subject=T%C6%B0%20v%E1%BA%A5n%20%C4%91%E1%BA%B7t%20v%C3%A9">
                  Liên hệ tư vấn
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  )
}
