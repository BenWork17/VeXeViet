'use client';

import { Check, LocateFixed, Minus, Plus } from 'lucide-react';
import { cn } from '@vexeviet/ui';
import { DAY_TIME_LIMIT_HOURS, MAX_TRIP_DAYS } from './types';
import { CITY_TRANSPORT_OPTIONS } from './data/city-guides';
import { formatMoney } from './utils/itinerary-helpers';
import type { TripPlannerController } from './hooks/useTripPlanner';
import { TripAnalysisResults } from './TripAnalysisResults';
import { TripSelectedPlacesSection } from './TripSelectedPlacesSection';

interface TripSidebarProps {
  planner: TripPlannerController;
  departureDate?: string | null;
}

export function TripSidebar({ planner, departureDate }: TripSidebarProps) {
  const {
    guide,
    selectedPlaces,
    placeCost,
    activeDayIndex,
    setActiveDayIndex,
    routeDistance,
    departureQuery,
    setDepartureQuery,
    setDepartureError,
    departureLoading,
    departureSuggestions,
    updateDepartureMarker,
    useCurrentLocation,
    isLocating,
    departureError,
    departurePoint,
    dayCount,
    updateDayCount,
    dayRoutePreviews,
    autoDistributeSelectedPlaces,
    handlePlaceDrop,
    updateDayStartTime,
    draggedPlaceId,
    setDraggedPlaceId,
    togglePlace,
    activeDayPlaces,
    activeDayPreview,
    selectedPlaceDayMeta,
    expandedPlaceId,
    setExpandedPlaceId,
    selectedLocalTransportIndex,
    setSelectedLocalTransportIndex,
    resetAnalysis,
    localTransport,
    transportError,
    landmarkError,
    departurePointError,
    analysisState,
    startAnalysis,
    analysisStepIndex,
    analysisResult,
    routeDirections,
    directionsExpanded,
    setDirectionsExpanded,
    expandedStopIndexes,
    setExpandedStopIndexes,
    setActiveDirectionId,
  } = planner;

  return (
    <aside
      className="travel-rail lg:h-full! lg:min-h-0! lg:overflow-y-auto! lg:overscroll-contain! lg:pr-1!"
      aria-label="Bảng lập lịch trình"
    >
      <div className="travel-rail-inner space-y-3! gap-3!">
        <section
          className="travel-panel travel-panel--ledger bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
          aria-labelledby="travel-destination-title"
        >
          <div className="travel-panel-head">
            <div>
              <h2 id="travel-destination-title" className="travel-panel-title">
                {guide.center}
              </h2>
              <p className="travel-panel-note">
                Chọn địa điểm trên bản đồ hoặc trong danh sách để thêm vào lịch trình.
              </p>
            </div>
            <p className="travel-count">
              <strong>{selectedPlaces.length}</strong>
              <span>/{guide.places.length} điểm</span>
            </p>
          </div>

          <dl className="travel-ledger">
            <div className="travel-ledger-row">
              <dt>Chi phí điểm đến</dt>
              <dd>{formatMoney(placeCost)}</dd>
            </div>
            <div className="travel-ledger-row">
              <dt>Quãng đường ngày {activeDayIndex + 1}</dt>
              <dd>{routeDistance.toFixed(1)} km</dd>
            </div>
          </dl>
        </section>

        <section
          className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
          aria-labelledby="travel-departure-title"
        >
          <div className="travel-panel-head">
            <div>
              <h2 id="travel-departure-title" className="travel-panel-title">
                Điểm xuất phát
              </h2>
              <p className="travel-panel-note">Tìm địa chỉ của bạn hoặc dùng vị trí hiện tại.</p>
            </div>
          </div>

          <label className="travel-field">
            <span className="travel-field-label">Địa chỉ xuất phát</span>
            <input
              type="text"
              value={departureQuery}
              onChange={(event) => {
                setDepartureQuery(event.target.value);
                setDepartureError(null);
              }}
              placeholder="Nhập điểm xuất phát của bạn…"
              className="travel-input rounded-lg! border! border-input! bg-field! focus:border-primary!"
            />
          </label>
          {departureLoading && (
            <p className="travel-inline-status" role="status" aria-live="polite">
              Đang tìm địa chỉ…
            </p>
          )}
          {departureSuggestions.length > 0 && (
            <div className="travel-suggestions rounded-lg! border! border-border! bg-card! shadow-sm">
              {departureSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() =>
                    updateDepartureMarker(
                      Number(suggestion.lat),
                      Number(suggestion.lon),
                      suggestion.display_name,
                    )
                  }
                  className="travel-suggestion"
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={isLocating}
            className="travel-button travel-button--quiet rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
          >
            <LocateFixed size={17} aria-hidden="true" />
            {isLocating ? 'Đang lấy vị trí…' : 'Dùng vị trí hiện tại'}
          </button>

          {departureError && (
            <p className="travel-error" role="alert">
              {departureError}
            </p>
          )}
          <p className="travel-current-point">Đang dùng: {departurePoint.label}</p>
        </section>

        <section
          className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
          aria-labelledby="travel-days-title"
        >
          <div className="travel-panel-head">
            <div>
              <h2 id="travel-days-title" className="travel-panel-title">
                Lịch trình theo ngày
              </h2>
              <p className="travel-panel-note">
                {dayCount} ngày vui chơi · tối đa {DAY_TIME_LIMIT_HOURS} giờ mỗi ngày
              </p>
            </div>
            <div
              className="travel-stepper rounded-lg! border! border-input! bg-field!"
              role="group"
              aria-label="Số ngày"
            >
              <button
                type="button"
                onClick={() => updateDayCount(dayCount - 1)}
                disabled={dayCount <= 1}
                aria-label="Giảm số ngày"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span aria-live="polite">{dayCount}</span>
              <button
                type="button"
                onClick={() => updateDayCount(dayCount + 1)}
                disabled={dayCount >= MAX_TRIP_DAYS}
                aria-label="Tăng số ngày"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="travel-day-tabs">
            {dayRoutePreviews.map((day) => (
              <button
                key={day.day}
                type="button"
                onClick={() => setActiveDayIndex(day.day - 1)}
                aria-pressed={activeDayIndex === day.day - 1}
                className={cn(
                  'travel-day-tab rounded-lg! border! transition-colors',
                  activeDayIndex === day.day - 1
                    ? 'is-active border-primary! bg-accent! text-accent-foreground!'
                    : 'border-input! bg-card! hover:border-primary/50!',
                )}
              >
                <span className="travel-day-tab-name">
                  <span
                    className="travel-day-dot"
                    style={{ backgroundColor: day.color }}
                    aria-hidden="true"
                  />
                  Ngày {day.day}
                </span>
                <span
                  className={cn(
                    'travel-day-tab-meta',
                    day.totalHours > DAY_TIME_LIMIT_HOURS && 'is-over',
                  )}
                >
                  {day.places.length} điểm · {day.totalHours.toFixed(1)}h
                </span>
              </button>
            ))}
          </div>

          <div className="travel-day-actions">
            <button
              type="button"
              onClick={autoDistributeSelectedPlaces}
              disabled={selectedPlaces.length === 0}
              className="travel-button travel-button--quiet rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
            >
              Chia đều theo ngày
            </button>
            <p>Tối đa {DAY_TIME_LIMIT_HOURS} giờ mỗi ngày, gồm tham quan và di chuyển.</p>
          </div>

          <div className="travel-day-list">
            {dayRoutePreviews.map((day) => (
              <div
                key={`day-plan-${day.day}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handlePlaceDrop(day.day - 1)}
                className={cn(
                  'travel-day-card rounded-lg! border! transition-colors',
                  activeDayIndex === day.day - 1
                    ? 'is-active border-primary/50! bg-accent/35!'
                    : 'border-border! bg-card!',
                )}
              >
                <div className="travel-day-card-head">
                  <button
                    type="button"
                    onClick={() => setActiveDayIndex(day.day - 1)}
                    className="travel-day-select"
                  >
                    <span className="travel-day-name">
                      <span
                        className="travel-day-dot"
                        style={{ backgroundColor: day.color }}
                        aria-hidden="true"
                      />
                      Ngày {day.day}
                    </span>
                    <span className="travel-day-meta">
                      {day.distanceKm.toFixed(1)} km · {day.visitHours.toFixed(1)}h tham quan ·{' '}
                      {day.travelHours.toFixed(1)}h di chuyển
                    </span>
                  </button>
                  <span
                    className={cn(
                      'travel-hours',
                      day.totalHours > DAY_TIME_LIMIT_HOURS && 'is-over',
                    )}
                  >
                    {day.totalHours.toFixed(1)}h
                  </span>
                </div>

                <label className="travel-time-row">
                  <span>Giờ xuất phát</span>
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(event) => updateDayStartTime(day.day - 1, event.target.value)}
                    className="travel-time-input rounded-md! border! border-input! bg-field!"
                  />
                </label>

                <div className="travel-stop-list">
                  {day.places.length === 0 ? (
                    <p className="travel-empty-row">Kéo địa điểm vào ngày này</p>
                  ) : (
                    day.places.map((place, index) => (
                      <div
                        key={`${day.day}-${place.id}`}
                        draggable
                        onDragStart={() => setDraggedPlaceId(place.id)}
                        onDragEnd={() => setDraggedPlaceId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.stopPropagation();
                          handlePlaceDrop(day.day - 1, index);
                        }}
                        className={cn('travel-stop', draggedPlaceId === place.id && 'is-dragging')}
                      >
                        <span
                          className="travel-stop-number"
                          style={{ backgroundColor: day.color }}
                        >
                          {index + 1}
                        </span>
                        <div className="travel-stop-copy">
                          <p>{place.name}</p>
                          <p>
                            {place.durationHours}h · {place.bestTime}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePlace(place.id)}
                          className="travel-icon-button"
                          aria-label={`Bỏ ${place.name} khỏi lịch`}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="travel-day-summary">
            <div>
              <h3>
                {activeDayPlaces.length > 0
                  ? `Ngày ${activeDayIndex + 1}: ${activeDayPlaces.length} điểm`
                  : 'Chưa có địa điểm nào'}
              </h3>
              <p>Quãng đường ước tính {routeDistance.toFixed(1)} km</p>
            </div>
            <dl className="travel-metrics">
              <div className="travel-metric">
                <dt>Tham quan</dt>
                <dd>{activeDayPreview?.visitHours.toFixed(1) ?? '0.0'}h</dd>
              </div>
              <div className="travel-metric">
                <dt>Di chuyển</dt>
                <dd>{activeDayPreview?.travelHours.toFixed(1) ?? '0.0'}h</dd>
              </div>
              <div className="travel-metric">
                <dt>Tổng</dt>
                <dd
                  className={cn(
                    (activeDayPreview?.totalHours ?? 0) > DAY_TIME_LIMIT_HOURS && 'is-over',
                  )}
                >
                  {activeDayPreview?.totalHours.toFixed(1) ?? '0.0'}h
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <TripSelectedPlacesSection
          centerName={guide.center}
          selectedPlaces={selectedPlaces}
          selectedPlaceDayMeta={selectedPlaceDayMeta}
          activeDayIndex={activeDayIndex}
          expandedPlaceId={expandedPlaceId}
          onToggleExpand={(placeId) =>
            setExpandedPlaceId((current) => (current === placeId ? null : placeId))
          }
          onTogglePlace={togglePlace}
        />

        <section
          className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
          aria-labelledby="travel-transport-title"
        >
          <div className="travel-panel-head">
            <div>
              <h2 id="travel-transport-title" className="travel-panel-title">
                Phương tiện trong thành phố
              </h2>
              <p className="travel-panel-note">Chọn cách di chuyển giữa các điểm trong ngày.</p>
            </div>
          </div>
          <div className="travel-transport-list">
            {CITY_TRANSPORT_OPTIONS.map((item, index) => {
              const selected = selectedLocalTransportIndex === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocalTransportIndex(index);
                    resetAnalysis();
                  }}
                  aria-pressed={selected}
                  className={cn(
                    'travel-transport rounded-lg! border! transition-colors',
                    selected
                      ? 'is-selected border-primary! bg-accent! text-accent-foreground! ring-1 ring-primary/20'
                      : 'border-input! bg-card! hover:border-primary/50! hover:bg-accent/40!',
                  )}
                >
                  <span className="travel-transport-copy">
                    <span className="travel-transport-name">{item.label}</span>
                    <span className="travel-transport-note">{item.note}</span>
                  </span>
                  {selected && (
                    <Check
                      className="travel-transport-check text-primary!"
                      size={18}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
          aria-labelledby="travel-analysis-title"
        >
          <div className="travel-panel-head">
            <div>
              <h2 id="travel-analysis-title" className="travel-panel-title">
                Phân tích lịch trình
              </h2>
              <p className="travel-panel-note">
                Kiểm tra thứ tự điểm, thời gian và chi phí dự kiến trước khi đi.
              </p>
            </div>
          </div>

          <ul className="travel-checklist">
            <li className={localTransport ? 'is-done' : undefined}>
              <Check size={16} aria-hidden="true" />
              Phương tiện nội đô
            </li>
            {transportError && (
              <li className="travel-checklist-error" role="alert">
                {transportError}
              </li>
            )}
            <li className={selectedPlaces.length >= 2 ? 'is-done' : undefined}>
              <Check size={16} aria-hidden="true" />
              {selectedPlaces.length} địa điểm đã chọn
            </li>
            {landmarkError && (
              <li className="travel-checklist-error" role="alert">
                {landmarkError}
              </li>
            )}
            <li className={departurePoint ? 'is-done' : undefined}>
              <Check size={16} aria-hidden="true" />
              Điểm xuất phát
            </li>
            {departurePointError && (
              <li className="travel-checklist-error" role="alert">
                {departurePointError}
              </li>
            )}
          </ul>

          <button
            type="button"
            disabled={analysisState === 'loading'}
            onClick={startAnalysis}
            aria-busy={analysisState === 'loading'}
            className="travel-button travel-button--primary rounded-lg!"
          >
            {analysisState === 'loading' ? 'Đang phân tích…' : 'Phân tích lộ trình'}
          </button>
        </section>

        <TripAnalysisResults
          analysisState={analysisState}
          analysisStepIndex={analysisStepIndex}
          analysisResult={analysisResult}
          departureDate={departureDate}
          localTransport={localTransport}
          selectedPlaces={selectedPlaces}
          activeDayPlaces={activeDayPlaces}
          departurePoint={departurePoint}
          routeDirections={routeDirections}
          directionsExpanded={directionsExpanded}
          onToggleDirectionsExpanded={() => setDirectionsExpanded((current) => !current)}
          expandedStopIndexes={expandedStopIndexes}
          onToggleStopDetails={(index) =>
            setExpandedStopIndexes((current) =>
              current.includes(index)
                ? current.filter((item) => item !== index)
                : [...current, index],
            )
          }
          onHoverDirectionStep={setActiveDirectionId}
        />
      </div>
    </aside>
  );
}
