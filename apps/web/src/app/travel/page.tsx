'use client';

import { useState } from 'react';
import { CalendarDays, MapPinned, Navigation, Search } from 'lucide-react';
import { Button, cn } from '@vexeviet/ui';
import { ProvinceSelect } from '@/components/ui/province-select';
import { TripPlanner } from '@/components/features/travel-assistant';
import { searchRoutes } from '@/lib/api/routes';
import type { Route } from '@vexeviet/types';

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
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  const searchControls = (
    <>
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-100/20 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-100">
          <MapPinned className="h-4 w-4" />
          OpenStreetMap
        </div>
        <h1 className="travel-font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          Lập lịch trình du lịch theo bản đồ
        </h1>
        <p className="mt-3 text-sm leading-6 text-teal-50/85">
          Chọn tuyến xe, điểm tham quan và phương tiện nội đô để dựng route preview cùng dự toán chi phí.
        </p>
      </div>

      <div className="rounded-2xl border border-white/25 bg-white/95 p-4 shadow-[0_18px_45px_rgba(3,50,59,0.24)] backdrop-blur">
        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">
              <Navigation className="h-3.5 w-3.5 text-[#0F766E]" />
              Nơi đi
            </span>
            <ProvinceSelect value={origin} onValueChange={setOrigin} placeholder="Chọn nơi đi" disabled={loading} />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">
              <MapPinned className="h-3.5 w-3.5 text-[#0F766E]" />
              Điểm đến
            </span>
            <ProvinceSelect value={destination} onValueChange={setDestination} placeholder="Chọn điểm đến" disabled={loading} />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">
              <CalendarDays className="h-3.5 w-3.5 text-[#0F766E]" />
              Ngày đi
            </span>
            <input
              type="date"
              value={departureDate}
              min={getTodayString()}
              onChange={(event) => setDepartureDate(event.target.value)}
              disabled={loading}
              className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-[#0F172A] outline-none transition-colors focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />
          </label>

          <Button
            type="button"
            onClick={handleSuggest}
            disabled={loading || !origin || !destination || !departureDate}
            className={cn(
              'h-12 w-full rounded-xl bg-[#063C45] px-6 font-black text-white shadow-lg shadow-teal-900/20 hover:bg-[#0F766E]',
              loading && 'cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className="flex w-full items-center gap-3">
                <span className="h-4 w-24 animate-pulse rounded bg-white/35" />
                <span className="h-4 flex-1 animate-pulse rounded bg-white/25" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                Tìm xe phù hợp
              </span>
            )}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        {hasSearched && !loading && !error && routes.length === 0 && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Chưa có chuyến xe phù hợp từ backend, bạn vẫn có thể chọn phương tiện gợi ý để dựng lịch trình.
          </p>
        )}
      </div>

    </>
  );

  return (
    <main className="min-h-screen bg-[#063C45] text-[#0F172A] travel-font-body">
      <TripPlanner origin={origin} destination={destination} departureDate={departureDate} routes={routes} controls={searchControls} />
    </main>
  );
}
