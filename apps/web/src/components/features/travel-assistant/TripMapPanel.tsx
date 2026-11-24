'use client';

import type { CSSProperties, MutableRefObject, ReactNode } from 'react';
import { Navigation, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '@vexeviet/ui';
import {
  Map as MapView,
  MapControls,
  MapMarker,
  MapPopup,
  MapRoute,
  MarkerContent,
  MarkerLabel,
} from '@/components/ui/map';
import {
  DEFAULT_DAY_ROUTE_COLOR,
  type CityGuide,
  type DayRoutePreview,
  type DeparturePoint,
  type RouteSimulationStatus,
  type TravelPlace,
} from './types';
import { MapViewportSync, SimulatedDayRoute, type MapColors } from './TripMapPrimitives';

interface TripMapPanelProps {
  origin: string;
  destination: string;
  guide: CityGuide;
  mapFocusCenter: { lat: number; lng: number };
  mapFocusZoom: number;
  selectedPlace: TravelPlace | null;
  onSelectPlace: (place: TravelPlace | null) => void;
  selectedPlaceDetail: ReactNode;
  compactMap: boolean;
  mapColors: MapColors | null;
  activeDirectionLngLat: Array<[number, number]>;
  roadRouteLngLat: Array<[number, number]>;
  canSimulateRoute: boolean;
  getSimulationProgress: () => number;
  subscribeSimulationProgress: (listener: (progress: number) => void) => () => void;
  departurePoint: DeparturePoint;
  selectedIds: string[];
  selectedPlaceDayMeta: Map<string, { day: number; color: string; order: number }>;
  activeSimulationPlace: TravelPlace | null;
  dayRoutePreviews: DayRoutePreview[];
  activeDayIndex: number;
  onSelectSimulationDay: (dayIndex: number) => void;
  routeSimulationStatus: RouteSimulationStatus;
  onToggleRouteSimulation: () => void;
  onResetRouteSimulation: () => void;
  onSkipToNextSimulationStop: () => void;
  routeLoading: boolean;
  routeError: string | null;
  hasSimulationProgress: boolean;
  isSimulationComplete: boolean;
  routeSimulationSpeed: 1 | 2;
  onChangeSimulationSpeed: (speed: 1 | 2) => void;
  routeSimulationBarRef: MutableRefObject<HTMLSpanElement | null>;
  activeDayPlaces: TravelPlace[];
}

export function TripMapPanel({
  origin,
  destination,
  guide,
  mapFocusCenter,
  mapFocusZoom,
  selectedPlace,
  onSelectPlace,
  selectedPlaceDetail,
  compactMap,
  mapColors,
  activeDirectionLngLat,
  roadRouteLngLat,
  canSimulateRoute,
  getSimulationProgress,
  subscribeSimulationProgress,
  departurePoint,
  selectedIds,
  selectedPlaceDayMeta,
  activeSimulationPlace,
  dayRoutePreviews,
  activeDayIndex,
  onSelectSimulationDay,
  routeSimulationStatus,
  onToggleRouteSimulation,
  onResetRouteSimulation,
  onSkipToNextSimulationStop,
  routeLoading,
  routeError,
  hasSimulationProgress,
  isSimulationComplete,
  routeSimulationSpeed,
  onChangeSimulationSpeed,
  routeSimulationBarRef,
  activeDayPlaces,
}: TripMapPanelProps) {
  return (
    <div className="travel-map-column min-w-0! h-[560px]! lg:h-full! lg:min-h-0! flex! flex-col!">
      <div className="travel-map relative! flex-1! h-full! min-h-0! w-full! overflow-hidden! rounded-xl! border! border-border! shadow-xs">
        <MapView
          center={[mapFocusCenter.lng, mapFocusCenter.lat]}
          zoom={mapFocusZoom}
          attributionControl={{ compact: true }}
          className="travel-map-canvas h-full! w-full! min-h-0!"
        >
          <MapViewportSync
            center={mapFocusCenter}
            zoom={mapFocusZoom}
            focusedPlace={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : null}
          />

          {mapColors && activeDirectionLngLat.length > 1 && (
            <MapRoute
              id="active-direction"
              coordinates={activeDirectionLngLat}
              color={mapColors.ink}
              width={6}
              opacity={0.85}
              interactive={false}
            />
          )}

          {mapColors && roadRouteLngLat.length > 1 && (
            <SimulatedDayRoute
              coordinates={roadRouteLngLat}
              routeColor={mapColors.route}
              progressColor={mapColors.progress}
              canSimulateRoute={canSimulateRoute}
              getProgress={getSimulationProgress}
              subscribeProgress={subscribeSimulationProgress}
            />
          )}

          <MapMarker longitude={departurePoint.lng} latitude={departurePoint.lat} anchor="center">
            <MarkerContent className="travel-departure-marker">
              <Navigation size={14} aria-hidden="true" />
            </MarkerContent>
            <MarkerLabel className="travel-departure-label">Xuất phát</MarkerLabel>
          </MapMarker>

          {guide.places.map((place) => {
            const selected = selectedIds.includes(place.id);
            const dayMeta = selectedPlaceDayMeta.get(place.id);
            const markerColor = dayMeta?.color ?? DEFAULT_DAY_ROUTE_COLOR;
            const simulationActive = activeSimulationPlace?.id === place.id;

            return (
              <MapMarker key={place.id} longitude={place.lng} latitude={place.lat} anchor="center">
                <MarkerContent className="travel-marker-anchor">
                  <button
                    type="button"
                    onClick={() => onSelectPlace(place)}
                    aria-label={`${place.name}${selected ? ' — đã thêm vào lịch' : ' — chưa thêm vào lịch'}`}
                    className={cn(
                      'travel-marker',
                      selected && 'is-selected',
                      simulationActive && 'is-current',
                    )}
                    style={{ '--travel-marker-color': markerColor } as CSSProperties}
                  >
                    <span className="travel-marker-dot" aria-hidden="true">
                      {dayMeta ? dayMeta.order : ''}
                    </span>
                    <span className="travel-marker-label">{place.name}</span>
                  </button>
                </MarkerContent>
              </MapMarker>
            );
          })}

          <MapControls position="top-right" showZoom className="travel-map-controls" />

          {selectedPlace && !compactMap && (
            <MapPopup
              longitude={selectedPlace.lng}
              latitude={selectedPlace.lat}
              offset={18}
              anchor="bottom"
              closeOnClick={false}
              onClose={() => onSelectPlace(null)}
              className="travel-place-popup"
            >
              {selectedPlaceDetail}
            </MapPopup>
          )}
        </MapView>

        <div className="travel-map-card travel-map-info bg-card/95! border! border-border! rounded-xl! shadow-sm!">
          <p className="travel-map-route">
            {origin || 'Nơi ở'} → {destination || 'Thành phố'}
          </p>
          <p className="travel-map-hint">Kéo bản đồ để xem · Chọn điểm để thêm vào lịch</p>
        </div>

        <div className="travel-map-card travel-map-sim bg-card/95! border! border-border! rounded-xl! shadow-sm!">
          <div className="travel-sim-days">
            {dayRoutePreviews.map((day) => (
              <button
                key={`simulation-day-${day.day}`}
                type="button"
                onClick={() => onSelectSimulationDay(day.day - 1)}
                aria-pressed={activeDayIndex === day.day - 1}
                className={cn(
                  'travel-sim-day rounded-lg! border! transition-colors',
                  activeDayIndex === day.day - 1
                    ? 'is-active border-primary! bg-accent! text-accent-foreground!'
                    : 'border-input! bg-card! text-foreground! hover:border-primary/50!',
                )}
              >
                <span className="travel-day-dot" style={{ backgroundColor: day.color }} aria-hidden="true" />
                Ngày {day.day}
              </button>
            ))}
          </div>
          <div className="travel-sim-controls">
            <button
              type="button"
              onClick={onToggleRouteSimulation}
              disabled={!canSimulateRoute}
              className="travel-button travel-button--primary travel-sim-play rounded-lg!"
              aria-label={routeSimulationStatus === 'playing' ? 'Tạm dừng đi thử lộ trình' : 'Đi thử lộ trình'}
            >
              {routeSimulationStatus === 'playing' ? (
                <Pause size={16} aria-hidden="true" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
              {routeLoading ? 'Đang tải đường' : 'Đi thử lộ trình'}
            </button>
            <button
              type="button"
              onClick={onResetRouteSimulation}
              disabled={!canSimulateRoute || !hasSimulationProgress}
              className="travel-icon-button rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
              aria-label="Chạy lại lộ trình"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSkipToNextSimulationStop}
              disabled={!canSimulateRoute || isSimulationComplete}
              className="travel-icon-button rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
              aria-label="Tới điểm tiếp theo"
            >
              <SkipForward size={16} aria-hidden="true" />
            </button>
            <div className="travel-speed gap-1! border-0! bg-transparent! p-0!">
              {[1, 2].map((speed) => {
                const isActiveSpeed = routeSimulationSpeed === speed;
                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => onChangeSimulationSpeed(speed as 1 | 2)}
                    aria-pressed={isActiveSpeed}
                    className={cn(
                      'rounded-md! border! px-2.5! py-1! text-xs! font-bold! transition-colors',
                      isActiveSpeed
                        ? 'is-active bg-primary! text-primary-foreground! border-primary! shadow-xs'
                        : 'bg-card! border-border! text-foreground! hover:border-primary/50! hover:text-primary!',
                    )}
                  >
                    {speed}x
                  </button>
                );
              })}
            </div>
          </div>
          {activeSimulationPlace && hasSimulationProgress && (
            <p className="travel-sim-current" role="status">
              Đang tới: <strong>{activeSimulationPlace.name}</strong>
            </p>
          )}
          <div className="travel-progress" aria-hidden="true">
            <span ref={routeSimulationBarRef} />
          </div>
        </div>

        {(routeLoading || routeError) && activeDayPlaces.length > 0 && (
          <div className="travel-map-card travel-map-status" role="status">
            {routeLoading ? 'OSRM đang dựng tuyến đường…' : routeError}
          </div>
        )}

        <div className="travel-map-card travel-map-note">
          {activeDayPlaces.length > 0
            ? `Ngày ${activeDayIndex + 1}: ${activeDayPlaces.length} điểm, đi thử sẽ quay về điểm xuất phát`
            : 'Chọn điểm để xem lộ trình xem trước'}
        </div>

        {compactMap && selectedPlaceDetail && <div className="travel-place-sheet">{selectedPlaceDetail}</div>}
      </div>
    </div>
  );
}
