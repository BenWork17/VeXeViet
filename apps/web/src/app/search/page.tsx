'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button, cn } from '@vexeviet/ui'
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm'
import { FilterPanel } from '@/components/features/search/FilterPanel'
import { SearchRouteCard } from '@/components/features/search/SearchRouteCard'
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

function LoadingSkeleton() {
  return (
    <div className="search-skeletons" role="status">
      <span className="sr-only">Đang tải danh sách chuyến xe</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="search-skeleton-card" aria-hidden="true">
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
  const passengers = searchParams.get('passengers') || '1'

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    if (origin && destination && departureDateStr) {
      performSearch({
        origin,
        destination,
        departureDate: new Date(departureDateStr),
        passengers: parseInt(passengers, 10),
      })
    }
  }, [origin, destination, departureDateStr, passengers])

  const handleBookRoute = (routeId: string) => {
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

  const resultCount = filteredAndSortedRoutes.length

  return (
    <div className="search-page">
      <header className="search-page-header">
        <div className="site-container">
          <h1
            className="search-route-heading"
            aria-label={origin && destination ? `${origin} đến ${destination}` : undefined}
          >
            <span className="search-route-stop">
              <span className="search-route-city">{origin || 'Chọn điểm đi'}</span>
            </span>
            <span className="search-route-bridge" aria-hidden="true">
              <span className="search-route-line" />
              <ArrowRight size={18} strokeWidth={2.4} />
            </span>
            <span className="search-route-stop search-route-stop-arrival">
              <span className="search-route-city">{destination || 'Chọn điểm đến'}</span>
            </span>
          </h1>

          <p className="search-trip-meta">
            <span>
              <CalendarDays size={16} aria-hidden="true" />
              {departureDateStr ? format(new Date(departureDateStr), 'dd/MM/yyyy') : 'Chọn ngày đi'}
            </span>
            <span>
              <Users size={16} aria-hidden="true" />
              {passengers} hành khách
            </span>
            <span>
              <Bus size={16} aria-hidden="true" />
              Tất cả loại xe
            </span>
          </p>
        </div>
      </header>

      <section className="search-form-section" aria-label="Tìm chuyến xe">
        <div className="site-container">
          <div className="search-form-panel">
            <SearchForm
              isLoading={loading}
              initialValues={{
                origin,
                destination,
                departureDate: departureDateStr ? new Date(departureDateStr) : undefined,
                passengers: parseInt(passengers, 10)
              }}
            />
          </div>
        </div>
      </section>

      <div className="site-container search-layout">
        <aside className="search-sidebar">
          <FilterPanel />
        </aside>

        <main className="search-results">
          <div className="search-toolbar">
            <div>
              <h2 id="results-heading" aria-live="polite">
                {loading
                  ? 'Đang tìm chuyến...'
                  : error
                    ? 'Chuyến xe chưa tải được'
                    : `${resultCount} chuyến xe`}
              </h2>
              <p>{origin && destination ? `${origin} đến ${destination}` : 'Chọn điểm đi và điểm đến để bắt đầu'}</p>
            </div>

            <div className="search-sort" role="group" aria-label="Sắp xếp kết quả">
              <span className="search-sort-label">Sắp xếp</span>
              {SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option.id
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSort(option.id)}
                    className={cn('search-sort-button', isActive && 'is-active')}
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
            className="search-mobile-filter"
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
              <div className="search-state search-state-error" role="alert">
                <span className="search-state-icon" aria-hidden="true">
                  <X size={22} />
                </span>
                <h3>Không tải được chuyến xe</h3>
                <p>{error}</p>
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="search-secondary-action"
                >
                  Thử lại
                </Button>
              </div>
            ) : resultCount === 0 ? (
              <div className="search-state">
                <span className="search-state-icon" aria-hidden="true">
                  <Bus size={22} />
                </span>
                <h3>Không tìm thấy chuyến xe</h3>
                <p>
                  Chưa có chuyến nào khớp với bộ lọc hiện tại. Bạn thử bỏ bớt bộ lọc hoặc chọn ngày khác.
                </p>
                <Button
                  type="button"
                  onClick={() => dispatch(resetFilters())}
                  className="search-secondary-action"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <ul className="search-route-list">
                {filteredAndSortedRoutes.map((route) => (
                  <li key={route.id}>
                    <SearchRouteCard route={route} onBook={handleBookRoute} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

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
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
