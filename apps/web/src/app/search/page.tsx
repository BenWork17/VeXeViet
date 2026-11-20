'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button, cn } from '@vexeviet/ui'
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm'
import { FilterPanel } from '@/components/features/search/FilterPanel'
import { SearchRouteCard } from '@/components/features/search/SearchRouteCard'
import { CardWatermark } from '@/components/brand'
import { FadeIn } from '@/components/motion'
import { searchRoutes } from '@/lib/api/routes'
import { Route, SearchFilters, SearchRoutesResponse } from '@vexeviet/types'
import {
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bus,
  CalendarDays,
  ChevronDown,
  Clock,
  Filter,
  Star,
  TrendingDown,
  Users,
  X,
} from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux'
import {
  setLoading,
  setError,
  setSortBy,
  setSortOrder,
  resetFilters,
} from '@/store/slices/searchSlice'
import { initBooking } from '@/store/slices/bookingSlice'

function applyFiltersAndSort(
  routes: Route[],
  filters: SearchFilters,
  sortBy: 'price' | 'duration' | 'departure' | 'rating',
  sortOrder: 'asc' | 'desc'
): Route[] {
  let filtered = [...routes]

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((r) => {
      const price = typeof r.price === 'string' ? parseFloat(r.price) : r.price;
      return price >= filters.minPrice!;
    })
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((r) => {
      const price = typeof r.price === 'string' ? parseFloat(r.price) : r.price;
      return price <= filters.maxPrice!;
    })
  }

  if (filters.busTypes && filters.busTypes.length > 0) {
    filtered = filtered.filter((r) => filters.busTypes!.includes(r.busType))
  }

  if (filters.amenities && filters.amenities.length > 0) {
    filtered = filtered.filter((r) =>
      filters.amenities!.every((a: string) => r.amenities?.includes(a))
    )
  }

  if (filters.departureTimeRange) {
    const { start, end } = filters.departureTimeRange
    filtered = filtered.filter((r) => {
      let departureHour: number

      if (r.departureTime.includes('T')) {
        const date = new Date(r.departureTime)
        departureHour = date.getHours()
      } else {
        departureHour = parseInt(r.departureTime.split(':')[0] || '0', 10)
      }

      const startHour = parseInt(start.split(':')[0] || '0', 10)
      const endHour = parseInt(end.split(':')[0] || '0', 10)

      if (endHour === 24 || endHour === 0) {
        return departureHour >= startHour
      }

      return departureHour >= startHour && departureHour < endHour
    })
  }

  filtered.sort((a, b) => {
    let comparison = 0
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;

    switch (sortBy) {
      case 'price':
        comparison = priceA - priceB
        break
      case 'duration': {
        const durationA = typeof a.duration === 'number' ? a.duration : 0
        const durationB = typeof b.duration === 'number' ? b.duration : 0
        comparison = durationA - durationB
        break
      }
      case 'departure':
        comparison = a.departureTime.localeCompare(b.departureTime)
        break
      case 'rating': {
        const ratingA = a.operator?.rating ?? 0
        const ratingB = b.operator?.rating ?? 0
        comparison = ratingA - ratingB
        break
      }
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return filtered
}

const SORT_OPTIONS = [
  { id: 'price', label: 'Giá rẻ', icon: TrendingDown },
  { id: 'departure', label: 'Sớm nhất', icon: Clock },
  { id: 'duration', label: 'Nhanh nhất', icon: ArrowUpDown },
  { id: 'rating', label: 'Đánh giá', icon: Star },
] as const

const QUICK_POPULAR_ROUTES = [
  { label: 'TP. HCM → Đà Lạt', fullLabel: 'TP. Hồ Chí Minh → Đà Lạt', origin: 'TP. Hồ Chí Minh', destination: 'Đà Lạt' },
  { label: 'Hà Nội → Sa Pa', fullLabel: 'Hà Nội → Sa Pa', origin: 'Hà Nội', destination: 'Sa Pa' },
  { label: 'Huế → Đà Nẵng', fullLabel: 'Huế → Đà Nẵng', origin: 'Huế', destination: 'Đà Nẵng' },
  { label: 'TP. HCM → Nha Trang', fullLabel: 'TP. Hồ Chí Minh → Nha Trang', origin: 'TP. Hồ Chí Minh', destination: 'Nha Trang' },
] as const

function LoadingSkeleton() {
  return (
    <div className="search-skeletons" role="status">
      <span className="sr-only">Đang tải danh sách chuyến xe</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="search-skeleton-card bg-card! border! border-border! rounded-xl! shadow-xs"
          aria-hidden="true"
        >
          <div className="search-skeleton-line search-skeleton-line-short" />
          <div className="search-skeleton-route">
            <div className="search-skeleton-line" />
            <div className="search-skeleton-line" />
          </div>
          <div className="search-skeleton-line search-skeleton-line-mid" />
        </div>
      ))}
    </div>
  )
}

function parseLocalDate(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim())
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const parsed = new Date(year, month - 1, day)
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed
    }
    return undefined
  }
  const fallback = new Date(dateStr)
  return Number.isNaN(fallback.getTime()) ? undefined : fallback
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { filters, sortBy, sortOrder, loading, error } = useAppSelector((state) => state.search)

  const [searchResults, setSearchResults] = useState<SearchRoutesResponse | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)

  const sheetCloseRef = useRef<HTMLButtonElement>(null)

  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const departureDateStr = searchParams.get('departureDate')
  const departureDate = useMemo(() => parseLocalDate(departureDateStr), [departureDateStr])
  const passengers = searchParams.get('passengers') || '1'

  useEffect(() => {
    let rafId: number | null = null

    const updateScrollState = () => {
      rafId = null
      const scrolled = window.scrollY > 100
      setIsHeaderScrolled((prev) => (prev === scrolled ? prev : scrolled))
    }

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(updateScrollState)
    }

    updateScrollState()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  useEffect(() => {
    if (!showMobileFilters) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    sheetCloseRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileFilters(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [showMobileFilters])

  const filteredAndSortedRoutes = useMemo(() => {
    if (!searchResults) return []
    return applyFiltersAndSort(searchResults.routes, filters, sortBy, sortOrder)
  }, [searchResults, filters, sortBy, sortOrder])

  const performSearch = async (values: SearchFormValues) => {
    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const formattedDate = format(values.departureDate, 'yyyy-MM-dd')

      const response = await searchRoutes({
        origin: values.origin,
        destination: values.destination,
        departureDate: formattedDate,
        passengers: values.passengers
      })

      if (response && response.routes) {
        setSearchResults(response)
      } else {
        dispatch(setError('Không thể tìm thấy chuyến xe'))
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (origin && destination && departureDate) {
      performSearch({
        origin,
        destination,
        departureDate,
        passengers: parseInt(passengers, 10) || 1,
      })
    }
  }, [origin, destination, departureDate, passengers])

  const handleBookRoute = (routeId: string) => {
    const selectedRoute = searchResults?.routes.find((r) => r.id === routeId)
    if (selectedRoute) {
      const priceNum =
        typeof selectedRoute.price === 'string'
          ? parseFloat(selectedRoute.price)
          : selectedRoute.price || 0

      dispatch(
        initBooking({
          id: selectedRoute.id,
          price: priceNum,
          busType: selectedRoute.busType || 'STANDARD',
          from: selectedRoute.origin || origin,
          to: selectedRoute.destination || destination,
          departureTime: selectedRoute.departureTime,
          pickupPoints: (selectedRoute.pickupPoints || []).map((p: any, i: number) => ({
            id: p.id || `p-${i + 1}`,
            time: p.time,
            location: p.location || p.name || '',
            address: p.address,
          })),
          dropoffPoints: (selectedRoute.dropoffPoints || []).map((p: any, i: number) => ({
            id: p.id || `d-${i + 1}`,
            time: p.time,
            location: p.location || p.name || '',
            address: p.address,
          })),
        })
      )
    }
    router.push(`/booking/${routeId}`)
  }

  const handleSort = (optionId: typeof SORT_OPTIONS[number]['id']) => {
    if (sortBy === optionId) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))
    } else {
      dispatch(setSortBy(optionId))
      dispatch(setSortOrder('asc'))
    }
  }

  const handleQuickRoute = (nextOrigin: string, nextDestination: string) => {
    const targetDate = departureDate ? format(departureDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const params = new URLSearchParams({
      origin: nextOrigin,
      destination: nextDestination,
      departureDate: targetDate,
      passengers: passengers || '1',
    })
    router.push(`/search?${params.toString()}`)
  }

  const resultCount = filteredAndSortedRoutes.length

  return (
    <div className="search-page pb-12">
      <FadeIn>
        {/* Unified Compact Search Command Bar */}
        <section
          className="mx-auto w-full max-w-[1520px] px-5 pt-4 pb-5 sm:px-8 xl:px-10"
          aria-label="Tìm chuyến xe"
        >
          <div className="group relative rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
              <CardWatermark variant="dong-son" position="top-right" />
            </div>

            <div className="relative z-10 mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="m-0 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent px-3.5 py-1 font-sans text-sm font-bold tracking-tight text-foreground"
                  aria-label={origin && destination ? `${origin} đến ${destination}` : undefined}
                >
                  <span>{origin || 'Chọn điểm đi'}</span>
                  <ArrowRight size={14} strokeWidth={2.5} className="shrink-0 text-primary" aria-hidden="true" />
                  <span>{destination || 'Chọn điểm đến'}</span>
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-primary" aria-hidden="true" />
                    {departureDate ? format(departureDate, 'dd/MM/yyyy') : 'Chọn ngày đi'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} className="text-primary" aria-hidden="true" />
                    {passengers} hành khách
                  </span>
                  <span className="hidden items-center gap-1.5 sm:inline-flex">
                    <Bus size={14} className="text-primary" aria-hidden="true" />
                    Tất cả loại xe
                  </span>
                </div>
              </div>

              <div className="hidden items-center gap-1.5 md:flex" aria-label="Tuyến phổ biến">
                <span className="mr-1 text-xs font-semibold text-muted-foreground">Gợi ý:</span>
                {QUICK_POPULAR_ROUTES.slice(0, 3).map((routeItem) => {
                  const isCurrent =
                    origin === routeItem.origin && destination === routeItem.destination
                  return (
                    <button
                      key={routeItem.label}
                      type="button"
                      onClick={() => handleQuickRoute(routeItem.origin, routeItem.destination)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                        isCurrent
                          ? 'border-primary bg-accent text-accent-foreground'
                          : 'border-border bg-background/70 text-muted-foreground hover:border-primary/50 hover:bg-accent/60 hover:text-primary'
                      )}
                    >
                      {routeItem.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative z-10">
              <SearchForm
                isLoading={loading}
                className="lg:[&_.search-fields]:grid-cols-4! [&_.search-fields]:gap-4! [&_.search-form-footer]:pt-2! [&_.search-submit]:rounded-xl! [&_.search-submit]:px-6!"
                initialValues={{
                  origin,
                  destination,
                  departureDate,
                  passengers: parseInt(passengers, 10) || 1
                }}
              />
            </div>
          </div>
        </section>

        {/* Main 24-inch Split Layout: 310px Sticky Filter Sidebar + Results */}
        <div className="mx-auto grid w-full max-w-[1520px] grid-cols-1 items-start gap-6 px-5 sm:px-8 lg:grid-cols-[310px_minmax(0,1fr)] xl:px-10">
          <aside className="hidden lg:sticky lg:top-[88px] lg:block">
            <FilterPanel />
          </aside>

          <section className="search-results min-w-0 space-y-4" aria-labelledby="results-heading">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
              <div>
                <h2 id="results-heading" className="m-0 font-sans text-base font-extrabold text-foreground" aria-live="polite">
                  {loading
                    ? 'Đang tìm chuyến...'
                    : error
                      ? 'Chuyến xe chưa tải được'
                      : `${resultCount} chuyến xe phù hợp`}
                </h2>
                <p className="mt-0.5 mb-0 text-xs text-muted-foreground">
                  {origin && destination
                    ? `${origin} → ${destination}${departureDate ? ` · ${format(departureDate, 'dd/MM/yyyy')}` : ''}`
                    : 'Chọn điểm đi và điểm đến để bắt đầu tìm kiếm'}
                </p>
              </div>

              <div className="search-sort flex flex-wrap items-center gap-2" role="group" aria-label="Sắp xếp kết quả">
                <span className="search-sort-label text-xs font-semibold text-muted-foreground">Sắp xếp</span>
                {SORT_OPTIONS.map((option) => {
                  const isActive = sortBy === option.id
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleSort(option.id)}
                      className={cn(
                        'search-sort-button rounded-lg! border! transition-colors',
                        isActive
                          ? 'is-active border-primary! bg-accent! text-accent-foreground! font-bold! shadow-xs'
                          : 'border-input! bg-card! text-foreground! hover:border-primary/50! hover:bg-accent/50! hover:text-primary!'
                      )}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span>{option.label}</span>
                      {isActive && (
                        <ChevronDown
                          size={13}
                          aria-hidden="true"
                          className={cn('search-sort-chevron', sortOrder === 'desc' && 'is-desc')}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              className="search-mobile-filter rounded-lg! border! border-input! bg-card! shadow-xs lg:hidden!"
              aria-expanded={showMobileFilters}
              aria-controls="search-filter-sheet"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter size={18} aria-hidden="true" />
              Bộ lọc và sắp xếp
            </button>

            <div className="search-results-list" aria-busy={loading}>
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div
                  className="search-state search-state-error bg-card! border! border-destructive/30! rounded-2xl! shadow-xs"
                  role="alert"
                >
                  <span className="search-state-icon" aria-hidden="true">
                    <X size={22} />
                  </span>
                  <h3>Không tải được chuyến xe</h3>
                  <p>{error}</p>
                  <Button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="search-secondary-action rounded-lg! border! border-input! bg-card! text-foreground! hover:border-primary! hover:bg-accent!"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : resultCount === 0 ? (
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-xs">
                  <CardWatermark variant="lotus" position="bottom-right" />
                  <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
                    <span
                      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-accent text-primary"
                      aria-hidden="true"
                    >
                      <Bus size={22} />
                    </span>
                    <h3 className="m-0 font-sans text-lg font-extrabold text-foreground">
                      Không tìm thấy chuyến xe phù hợp
                    </h3>
                    <p className="mt-2 mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                      Chưa có chuyến nào khớp với bộ lọc hoặc ngày đã chọn. Bạn có thể xóa bộ lọc hoặc khám phá nhanh các tuyến phổ biến dưới đây.
                    </p>

                    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                      {QUICK_POPULAR_ROUTES.map((routeItem) => (
                        <button
                          key={routeItem.fullLabel}
                          type="button"
                          onClick={() => handleQuickRoute(routeItem.origin, routeItem.destination)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{routeItem.fullLabel}</span>
                          <ArrowRight size={13} className="text-primary" aria-hidden="true" />
                        </button>
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={() => dispatch(resetFilters())}
                      className="search-secondary-action rounded-lg! border! border-input! bg-card! px-4! text-foreground! hover:border-primary! hover:bg-accent!"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="search-route-list m-0 grid list-none gap-4 p-0">
                  {filteredAndSortedRoutes.map((route) => (
                    <li key={route.id}>
                      <SearchRouteCard route={route} onBook={handleBookRoute} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </FadeIn>

      {showMobileFilters && (
        <div className="search-sheet-layer">
          <button
            type="button"
            className="search-sheet-backdrop"
            aria-label="Đóng bộ lọc"
            onClick={() => setShowMobileFilters(false)}
          />
          <div
            id="search-filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-sheet-title"
            className="search-sheet"
          >
            <div className="search-sheet-header">
              <h3 id="search-sheet-title">Bộ lọc tìm kiếm</h3>
              <button
                type="button"
                ref={sheetCloseRef}
                className="search-sheet-close"
                aria-label="Đóng bộ lọc"
                onClick={() => setShowMobileFilters(false)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="search-sheet-body">
              <FilterPanel className="filter-panel-sheet" />
            </div>

            <div className="search-sheet-footer">
              <Button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="search-primary-action search-sheet-submit"
              >
                Xem {resultCount} kết quả
              </Button>
            </div>
          </div>
        </div>
      )}

      {isHeaderScrolled && (
        <button
          type="button"
          className="search-top-button"
          aria-label="Lên đầu trang"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            })
          }
        >
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="search-page search-page-loading" role="status">
          <Bus size={20} aria-hidden="true" />
          <span>Đang tải trang tìm kiếm</span>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
