'use client';

import '@/styles/search.css';
import '@/styles/travel.css';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Search } from 'lucide-react';
import { ProvinceSelect } from '@/components/ui/province-select';
import { searchRoutes } from '@/lib/api/routes';
import { FadeIn } from '@/components/motion';
import type { Route } from '@vexeviet/types';

const TripPlanner = dynamic(
  () => import('@/components/features/travel-assistant').then((mod) => mod.TripPlanner),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full px-4 py-3 lg:px-5"
        role="status"
        aria-live="polite"
      >
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
          <span>Đang tải bản đồ và công cụ lập lịch trình…</span>
        </div>
        <div className="grid gap-4 lg:h-[calc(100dvh-176px)] lg:grid-cols-[390px_minmax(0,1fr)] xl:grid-cols-[410px_minmax(0,1fr)]" aria-hidden="true">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="h-6 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            <div className="h-36 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
          </div>
          <div className="h-[560px] animate-pulse rounded-xl border border-border bg-muted lg:h-full motion-reduce:animate-none" />
        </div>
      </div>
    ),
  },
);

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export default function TravelPlannerPage() {
  const [origin, setOrigin] = useState('Huế');
  const [destination, setDestination] = useState('Đà Nẵng');
  const [departureDate, setDepartureDate] = useState(getTodayString());
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchRoutes({
        origin,
        destination,
        departureDate,
        passengers: 1,
        page: 1,
        pageSize: 20,
      });
      setRoutes(response.routes);
    } catch (err) {
      setRoutes([]);
      const message = err instanceof Error ? err.message : '';
      const isNetworkError = !message || /network error|failed to fetch|timeout|econnrefused|load failed/i.test(message);
      setError(
        isNetworkError
          ? 'Không kết nối được tới hệ thống chuyến xe. Bạn vẫn có thể dựng lịch trình trên bản đồ.'
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const searchControls = (
    <div className="travel-search bg-card! border! border-border! rounded-xl! px-4! py-2.5! shadow-xs">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="travel-search-copy flex! items-center! gap-2.5! min-w-0">
          <h1 className="travel-title m-0! text-lg! xl:text-xl! font-bold! leading-tight! tracking-tight whitespace-nowrap">
            Lập lịch trình du lịch
          </h1>
          <span className="inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground whitespace-nowrap">
            Bản đồ lộ trình
          </span>
        </div>

        <div className="travel-search-form-wrap m-0! border-0! bg-transparent! p-0! shadow-none!">
          <form
            className="travel-search-form flex! flex-wrap! items-center! gap-2.5! lg:flex-nowrap!"
            onSubmit={(event) => {
              event.preventDefault();
              if (!loading) void handleSuggest();
            }}
          >
            <label className="travel-field flex! flex-row! items-center! gap-2! m-0!">
              <span className="travel-field-label m-0! text-xs! font-semibold! text-muted-foreground! whitespace-nowrap">
                Nơi đi
              </span>
              <div className="w-[156px] sm:w-[168px]">
                <ProvinceSelect value={origin} onValueChange={setOrigin} placeholder="Chọn nơi đi" disabled={loading} />
              </div>
            </label>

            <label className="travel-field flex! flex-row! items-center! gap-2! m-0!">
              <span className="travel-field-label m-0! text-xs! font-semibold! text-muted-foreground! whitespace-nowrap">
                Điểm đến
              </span>
              <div className="w-[156px] sm:w-[168px]">
                <ProvinceSelect value={destination} onValueChange={setDestination} placeholder="Chọn điểm đến" disabled={loading} />
              </div>
            </label>

            <label className="travel-field flex! flex-row! items-center! gap-2! m-0!">
              <span className="travel-field-label m-0! text-xs! font-semibold! text-muted-foreground! whitespace-nowrap">
                Ngày đi
              </span>
              <input
                type="date"
                value={departureDate}
                min={getTodayString()}
                onChange={(event) => setDepartureDate(event.target.value)}
                disabled={loading}
                className="travel-input h-10! w-[148px]! rounded-lg! border! border-input! bg-field! px-2.5! text-sm! focus:border-primary!"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !origin || !destination || !departureDate}
              aria-busy={loading}
              className="travel-button travel-button--primary travel-search-submit h-10! shrink-0! rounded-lg! px-4! text-sm! whitespace-nowrap!"
            >
              {loading ? (
                'Đang tìm…'
              ) : (
                <>
                  <Search size={16} aria-hidden="true" />
                  Tìm xe phù hợp
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p className="travel-search-error mt-2! mb-0! text-xs!" role="alert">
          {error}
        </p>
      )}
      {hasSearched && !loading && !error && routes.length === 0 && (
        <p className="travel-search-note mt-2! mb-0! text-xs!">
          Chưa có chuyến xe phù hợp từ hệ thống. Bạn vẫn có thể chọn phương tiện gợi ý để dựng lịch trình.
        </p>
      )}
    </div>
  );

  return (
    <div className="travel-page">
      <FadeIn>
        <TripPlanner origin={origin} destination={destination} departureDate={departureDate} routes={routes} controls={searchControls} />
      </FadeIn>
    </div>
  );
}
