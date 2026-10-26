'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
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
    <div className="travel-search">
      <div className="travel-search-copy">
        <h1 className="travel-title">Lập lịch trình du lịch theo bản đồ</h1>
        <p className="travel-subtitle">
          Chọn tuyến xe, điểm tham quan và phương tiện nội đô để dựng lộ trình, xem quãng đường và dự toán chi phí trên nền bản đồ OpenStreetMap.
        </p>
      </div>

      <div className="travel-search-form-wrap">
        <form
          className="travel-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!loading) void handleSuggest();
          }}
        >
          <label className="travel-field">
            <span className="travel-field-label">Nơi đi</span>
            <ProvinceSelect value={origin} onValueChange={setOrigin} placeholder="Chọn nơi đi" disabled={loading} />
          </label>

          <label className="travel-field">
            <span className="travel-field-label">Điểm đến</span>
            <ProvinceSelect value={destination} onValueChange={setDestination} placeholder="Chọn điểm đến" disabled={loading} />
          </label>

          <label className="travel-field">
            <span className="travel-field-label">Ngày đi</span>
            <input
              type="date"
              value={departureDate}
              min={getTodayString()}
              onChange={(event) => setDepartureDate(event.target.value)}
              disabled={loading}
              className="travel-input"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !origin || !destination || !departureDate}
            aria-busy={loading}
            className="travel-button travel-button--primary travel-search-submit"
          >
            {loading ? (
              'Đang tìm chuyến xe…'
            ) : (
              <>
                <Search size={18} aria-hidden="true" />
                Tìm xe phù hợp
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="travel-search-error" role="alert">
            {error}
          </p>
        )}
        {hasSearched && !loading && !error && routes.length === 0 && (
          <p className="travel-search-note">
            Chưa có chuyến xe phù hợp từ hệ thống. Bạn vẫn có thể chọn phương tiện gợi ý để dựng lịch trình.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <main className="travel-page">
      <TripPlanner origin={origin} destination={destination} departureDate={departureDate} routes={routes} controls={searchControls} />
    </main>
  );
}
