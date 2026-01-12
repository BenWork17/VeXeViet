'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { RouteCard, Button } from '@vexeviet/ui';
import { SearchForm, type SearchFormValues } from '@/components/features/search/SearchForm';
import { FilterPanel } from '@/components/features/search/FilterPanel';
import { mockSearchRoutes } from '@vexeviet/api-client';
import { Route, SearchFilters, SearchRoutesResponse } from '@vexeviet/types';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setFilters, setResults, setLoading, setError, setSortBy, setSortOrder, resetFilters } from '@/store/slices/searchSlice';
import { cn } from '@/lib/utils';

function applyFiltersAndSort(
  routes: Route[],
  filters: SearchFilters,
  sortBy: 'price' | 'duration' | 'departure' | 'rating',
  sortOrder: 'asc' | 'desc'
): Route[] {
  let filtered = [...routes];

  // Apply price filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((r) => r.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((r) => r.price <= filters.maxPrice);
  }

  // Apply bus type filter
  if (filters.busTypes && filters.busTypes.length > 0) {
    filtered = filtered.filter((r) => filters.busTypes.includes(r.busType));
  }

  // Apply amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    filtered = filtered.filter((r) =>
      filters.amenities.every((a: string) => r.amenities.includes(a))
    );
  }

  // Apply departure time range filter
  if (filters.departureTimeRange) {
    const { start, end } = filters.departureTimeRange;
    filtered = filtered.filter((r) => {
      const departureHour = parseInt(r.departureTime.split(':')[0] || '0', 10);
      const startHour = parseInt(start.split(':')[0] || '0', 10);
      const endHour = parseInt(end.split(':')[0] || '0', 10);
      
      // Handle ranges that cross midnight (e.g., 18:00 - 24:00)
      if (endHour === 24 || endHour === 0) {
        return departureHour >= startHour;
      }
      
      return departureHour >= startHour && departureHour < endHour;
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'duration': {
        const durationA = parseInt(a.duration.split('h')[0] || '0', 10);
        const durationB = parseInt(b.duration.split('h')[0] || '0', 10);
        comparison = durationA - durationB;
        break;
      }
      case 'departure':
        comparison = a.departureTime.localeCompare(b.departureTime);
        break;
      case 'rating':
        comparison = a.operatorRating - b.operatorRating;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { filters, results, loading, error, sortBy, sortOrder } = useAppSelector((state) => state.search);
  const [searchResults, setSearchResults] = useState<SearchRoutesResponse | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departureDate');
  const passengers = searchParams.get('passengers');

  // Apply client-side filtering and sorting
  const filteredAndSortedRoutes = useMemo(() => {
    if (!searchResults) return [];
    return applyFiltersAndSort(searchResults.data.routes, filters, sortBy, sortOrder);
  }, [searchResults, filters, sortBy, sortOrder]);

  const performSearch = async (values: SearchFormValues) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const result = await mockSearchRoutes({
        origin: values.origin,
        destination: values.destination,
        departureDate: values.departureDate.toISOString().split('T')[0] || '',
        returnDate: values.returnDate?.toISOString().split('T')[0],
        passengers: values.passengers,
        filters: {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          departureTimeRange: filters.departureTimeRange,
          busTypes: filters.busTypes,
          amenities: filters.amenities,
        },
      });
      setSearchResults(result);
      dispatch(setResults(result.data.routes));
    } catch (err) {
      dispatch(setError('Failed to search routes. Please try again.'));
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (origin && destination && departureDate) {
      performSearch({
        origin,
        destination,
        departureDate: new Date(departureDate),
        passengers: passengers ? parseInt(passengers, 10) : 1,
      });
    }
  }, [origin, destination, departureDate, passengers]);

  const handleSearch = (values: SearchFormValues) => {
    const params = new URLSearchParams();
    params.set('origin', values.origin);
    params.set('destination', values.destination);
    const dateStr = values.departureDate.toISOString().split('T')[0];
    if (dateStr) params.set('departureDate', dateStr);
    params.set('passengers', values.passengers.toString());

    if (values.returnDate) {
      const returnDateStr = values.returnDate.toISOString().split('T')[0];
      if (returnDateStr) params.set('returnDate', returnDateStr);
    }

    window.history.pushState({}, '', `/search?${params.toString()}`);
    performSearch(values);
  };

  const handleSelectRoute = (routeId: string) => {
    window.location.href = `/routes/${routeId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Search Header với gradient đẹp */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm Chuyến Xe
            </h1>
            <p className="text-blue-100 mt-2">Tìm kiếm và đặt vé xe khách trực tuyến</p>
          </div>
          <SearchForm
            initialValues={
              origin && destination && departureDate
                ? {
                    origin,
                    destination,
                    departureDate: new Date(departureDate),
                    passengers: passengers ? parseInt(passengers, 10) : 1,
                  }
                : undefined
            }
            onSubmit={handleSearch}
            isLoading={loading}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <FilterPanel
                priceRange={searchResults?.data.filters.priceRange}
                availableBusTypes={searchResults?.data.filters.availableBusTypes}
                availableAmenities={searchResults?.data.filters.availableAmenities}
              />
            </div>
          </aside>

          {/* Mobile Filter Modal với animation */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 lg:hidden backdrop-blur-sm animate-fadeIn">
              <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-slideInRight">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 border-b p-4 flex items-center justify-between shadow-lg">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Bộ Lọc
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <FilterPanel
                    priceRange={searchResults?.data.filters.priceRange}
                    availableBusTypes={searchResults?.data.filters.availableBusTypes}
                    availableAmenities={searchResults?.data.filters.availableAmenities}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort Controls với design đẹp hơn */}
            {!loading && !error && searchResults && searchResults.data.routes.length > 0 && (
              <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl border-2 border-blue-100 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Sắp xếp:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={sortBy === 'price' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          dispatch(setSortBy('price'));
                          if (sortBy === 'price') {
                            dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
                          }
                        }}
                        className={cn(
                          sortBy === 'price' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md text-white' 
                            : 'text-gray-900 border-gray-300'
                        )}
                      >
                        💰 Giá {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Button>
                      <Button
                        variant={sortBy === 'duration' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          dispatch(setSortBy('duration'));
                          if (sortBy === 'duration') {
                            dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
                          }
                        }}
                        className={cn(
                          sortBy === 'duration' 
                            ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-md text-white' 
                            : 'text-gray-900 border-gray-300'
                        )}
                      >
                        ⏱️ Thời gian {sortBy === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Button>
                      <Button
                        variant={sortBy === 'departure' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          dispatch(setSortBy('departure'));
                          if (sortBy === 'departure') {
                            dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
                          }
                        }}
                        className={cn(
                          sortBy === 'departure' 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-md text-white' 
                            : 'text-gray-900 border-gray-300'
                        )}
                      >
                        🕐 Giờ đi {sortBy === 'departure' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Button>
                      <Button
                        variant={sortBy === 'rating' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          dispatch(setSortBy('rating'));
                          if (sortBy === 'rating') {
                            dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
                          }
                        }}
                        className={cn(
                          sortBy === 'rating' 
                            ? 'bg-gradient-to-r from-orange-600 to-orange-700 shadow-md text-white' 
                            : 'text-gray-900 border-gray-300'
                        )}
                      >
                        ⭐ Đánh giá {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden font-medium bg-white hover:bg-blue-50 border-2 border-blue-200"
                    onClick={() => setShowMobileFilters(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </Button>
                </div>
              </div>
            )}

            {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className="w-20 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-32 h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && searchResults && searchResults.data.routes.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or selecting different dates
            </p>
          </div>
        )}

        {!loading && !error && searchResults && filteredAndSortedRoutes.length === 0 && searchResults.data.routes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No routes match your filters</h3>
            <p className="text-gray-600 mb-6">
              We found {searchResults.data.routes.length} routes, but none match your current filter settings. Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={() => dispatch(resetFilters())}>
              Clear all filters
            </Button>
          </div>
        )}

        {!loading && !error && searchResults && filteredAndSortedRoutes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" aria-live="polite" aria-atomic="true">
                  {filteredAndSortedRoutes.length} {filteredAndSortedRoutes.length === 1 ? 'route' : 'routes'} found
                </h2>
                {filteredAndSortedRoutes.length !== searchResults.data.routes.length && (
                  <p className="text-sm text-gray-600 mt-1">
                    Filtered from {searchResults.data.routes.length} total routes
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {origin} → {destination}
              </div>
            </div>

            <div className="space-y-4">
              {filteredAndSortedRoutes.map((route) => (
                <RouteCard key={route.id} route={route} onSelect={handleSelectRoute} />
              ))}
            </div>

            {searchResults.data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={searchResults.data.pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {searchResults.data.pagination.page} of{' '}
                  {searchResults.data.pagination.totalPages}
                </span>
                <button
                  disabled={
                    searchResults.data.pagination.page ===
                    searchResults.data.pagination.totalPages
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !searchResults && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start your search</h3>
            <p className="text-gray-600">
              Enter your travel details above to find available bus routes
            </p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
