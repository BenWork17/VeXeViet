'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button, cn } from '@vexeviet/ui'
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm'
import { FilterPanel } from '@/components/features/search/FilterPanel'
import { SearchRouteCard } from '@/components/features/search/SearchRouteCard'
import { searchRoutes } from '@/lib/api/routes'
import { Route, SearchFilters, SearchRoutesResponse } from '@vexeviet/types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X,
  ArrowUpDown,
  TrendingDown,
  Clock,
  Star,
  Bus
} from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux'
import {
  setFilters,
  setLoading,
  setError,
  setSortBy,
  setSortOrder,
  resetFilters,
} from '@/store/slices/searchSlice'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
}

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
      
      // Handle ISO datetime format (e.g., "2026-02-15T08:00:00.000Z")
      if (r.departureTime.includes('T')) {
        const date = new Date(r.departureTime)
        departureHour = date.getHours()
      } else {
        // Handle HH:mm format
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
      case 'rating':
        const ratingA = a.operator?.rating ?? 0
        const ratingB = b.operator?.rating ?? 0
        comparison = ratingA - ratingB
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return filtered
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="relative bg-white rounded-3xl border border-gray-100 p-6 overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="space-y-2">
                  <div className="w-40 h-5 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="w-24 h-4 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex-1 space-y-3">
                  <div className="w-full h-8 bg-gray-50 rounded-xl animate-pulse" />
                  <div className="w-20 h-4 bg-gray-50 rounded-lg mx-auto animate-pulse" />
                </div>
                <div className="w-24 h-1 bg-gray-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="w-full h-8 bg-gray-50 rounded-xl animate-pulse" />
                  <div className="w-20 h-4 bg-gray-50 rounded-lg mx-auto animate-pulse" />
                </div>
              </div>
            </div>
            <div className="w-32 space-y-4">
              <div className="w-full h-10 bg-gray-50 rounded-xl animate-pulse" />
              <div className="w-full h-12 bg-primary/10 rounded-2xl animate-pulse" />
            </div>
          </div>
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
    router.push(`/booking/${routeId}?departureDate=${departureDateStr}&passengers=${passengers}`)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Hero Section - Modern & Gradient */}
      <div className="relative overflow-hidden bg-primary pt-24 pb-32 lg:pt-32 lg:pb-48">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-400/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            {/* Search Summary Header */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="text-center md:text-right">
                <p className="text-blue-100 text-sm font-medium uppercase tracking-widest mb-1">Điểm đi</p>
                <h1 className="text-3xl md:text-5xl font-black text-white">{origin || 'Hà Nội'}</h1>
              </div>
              
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"
                >
                  <ArrowRight className="text-white w-6 h-6" />
                </motion.div>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2" />
              </div>

              <div className="text-center md:text-left">
                <p className="text-blue-100 text-sm font-medium uppercase tracking-widest mb-1">Điểm đến</p>
                <h1 className="text-3xl md:text-5xl font-black text-white">{destination || 'Đà Nẵng'}</h1>
              </div>
            </div>

            {/* Sub Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold">
                <CalendarIcon className="w-4 h-4 text-blue-300" />
                {departureDateStr ? format(new Date(departureDateStr), 'dd/MM/yyyy') : 'Chọn ngày'}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold">
                <Users className="w-4 h-4 text-blue-300" />
                {passengers} hành khách
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold uppercase tracking-wide">
                <Bus className="w-4 h-4 text-blue-300" />
                Tất cả loại xe
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. Floating Search Form Integration */}
      <div className="container mx-auto px-4 -mt-16 relative z-30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100"
        >
          <SearchForm 
            isLoading={loading}
            initialValues={{
              origin,
              destination,
              departureDate: departureDateStr ? new Date(departureDateStr) : undefined,
              passengers: parseInt(passengers, 10)
            }}
          />
        </motion.div>
      </div>

      {/* 3. Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
            >
              <FilterPanel className="shadow-xl shadow-gray-200/50" />
              
              <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="font-black text-xl mb-2">Ưu đãi đặc biệt</h4>
                  <p className="text-blue-100 text-sm mb-4">Giảm ngay 20% khi đặt vé khứ hồi trong hôm nay!</p>
                  <Button variant="secondary" className="w-full font-bold">Nhận mã ngay</Button>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </aside>

          {/* Results Column */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* Results Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {loading ? 'Đang tìm kiếm...' : (
                      <>
                        <span className="text-primary">{filteredAndSortedRoutes.length}</span> chuyến xe
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">Phù hợp với tìm kiếm của bạn</p>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <span className="text-sm font-bold text-gray-400 mr-2 whitespace-nowrap">Sắp xếp:</span>
                <div className="flex items-center p-1.5 bg-gray-100 rounded-2xl">
                  {[
                    { id: 'price', label: 'Giá rẻ', icon: TrendingDown },
                    { id: 'departure', label: 'Sớm nhất', icon: Clock },
                    { id: 'duration', label: 'Nhanh nhất', icon: ArrowUpDown },
                    { id: 'rating', label: 'Đánh giá', icon: Star },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (sortBy === option.id) {
                          dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'))
                        } else {
                          dispatch(setSortBy(option.id as any))
                          dispatch(setSortOrder('asc'))
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                        sortBy === option.id 
                          ? "bg-white text-primary shadow-md scale-105" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                      )}
                    >
                      <option.icon className={cn("w-4 h-4", sortBy === option.id && "text-primary")} />
                      <span>{option.label}</span>
                      {sortBy === option.id && (
                        <ChevronDown className={cn("w-3 h-3 transition-transform", sortOrder === 'desc' && "rotate-180")} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg text-gray-900 font-black"
            >
              <Filter className="w-5 h-5 text-primary" />
              Lọc & Sắp xếp
            </button>

            {/* Content States */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSkeleton />
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-100 rounded-3xl p-12 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-200">
                    <X className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-red-900 mb-2">Oops! Đã có lỗi xảy ra</h3>
                  <p className="text-red-700 max-w-md mx-auto mb-8">{error}</p>
                  <Button size="lg" onClick={() => window.location.reload()} className="rounded-2xl px-8">Thử lại ngay</Button>
                </motion.div>
              ) : filteredAndSortedRoutes.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border-2 border-gray-100 border-dashed p-20 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Bus className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-8">Chúng tôi không tìm thấy chuyến xe nào phù hợp với yêu cầu của bạn. Hãy thử thay đổi bộ lọc hoặc ngày đi.</p>
                  <Button variant="outline" size="lg" onClick={() => dispatch(resetFilters())} className="rounded-2xl px-8">Xóa tất cả bộ lọc</Button>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-6"
                >
                  {filteredAndSortedRoutes.map((route, idx) => (
                    <motion.div key={route.id} variants={fadeInUp}>
                      <SearchRouteCard 
                        route={route} 
                        onBook={handleBookRoute}
                        className="transition-all duration-300"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* 4. Mobile Bottom Sheet Filter */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[40px] z-[9999] overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="p-6">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-gray-900">Bộ lọc tìm kiếm</h3>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 150px)' }}>
                  <FilterPanel className="border-0 shadow-none p-0 mb-20" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-white via-white to-white/80 border-t border-gray-100">
                  <Button 
                    size="lg" 
                    className="w-full rounded-2xl h-14 font-black shadow-xl"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Xem {filteredAndSortedRoutes.length} kết quả
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Quick Nav - Desktop Only */}
      <div className={cn(
        "fixed bottom-8 right-8 z-50 transition-all duration-500 transform",
        isHeaderScrolled ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      )}>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronUp className="w-8 h-8 font-bold" />
        </button>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="relative">
            <div className="w-20 h-20 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bus className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
