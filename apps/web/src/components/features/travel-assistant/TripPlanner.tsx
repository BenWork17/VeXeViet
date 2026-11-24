'use client';

import { cn } from '@vexeviet/ui';
import type { TripPlannerProps } from './types';
import { useTripPlanner } from './hooks/useTripPlanner';
import { TripPlaceModal } from './TripPlaceModal';
import { TripSidebar } from './TripSidebar';
import { TripMapPanel } from './TripMapPanel';

export type { TripPlannerProps };

export function TripPlanner({
  origin,
  destination,
  departureDate,
  controls,
  className,
}: TripPlannerProps) {
  const planner = useTripPlanner(destination);

  const selectedPlaceDetail = planner.selectedPlace ? (
    <TripPlaceModal
      place={planner.selectedPlace}
      selected={planner.selectedIds.includes(planner.selectedPlace.id)}
      selectedActivities={
        planner.selectedActivitiesByPlace[planner.selectedPlace.id] ?? []
      }
      onClose={() => planner.setSelectedPlace(null)}
      onToggleActivity={planner.togglePlaceActivity}
      onAddPlace={planner.addPlaceToTrip}
    />
  ) : null;

  return (
    <section
      className={cn(
        'travel-shell w-full! max-w-none! px-3! py-3! sm:px-4! lg:px-5!',
        className,
      )}
    >
      <div className="travel-shell-inner w-full! max-w-none! mx-0!">
        {controls ? <header className="travel-hero mb-3! p-0!">{controls}</header> : null}

        <div className="travel-workspace grid! grid-cols-1! gap-4! items-stretch! lg:h-[calc(100dvh-176px)]! lg:min-h-[540px]! lg:grid-cols-[390px_minmax(0,1fr)]! xl:grid-cols-[410px_minmax(0,1fr)]!">
          <TripSidebar planner={planner} departureDate={departureDate} />

          <TripMapPanel
            origin={origin}
            destination={destination}
            guide={planner.guide}
            mapFocusCenter={planner.mapFocusCenter}
            mapFocusZoom={planner.mapFocusZoom}
            selectedPlace={planner.selectedPlace}
            onSelectPlace={planner.setSelectedPlace}
            selectedPlaceDetail={selectedPlaceDetail}
            compactMap={planner.compactMap}
            mapColors={planner.mapColors}
            activeDirectionLngLat={planner.activeDirectionLngLat}
            roadRouteLngLat={planner.roadRouteLngLat}
            canSimulateRoute={planner.canSimulateRoute}
            getSimulationProgress={planner.getSimulationProgress}
            subscribeSimulationProgress={planner.subscribeSimulationProgress}
            departurePoint={planner.departurePoint}
            selectedIds={planner.selectedIds}
            selectedPlaceDayMeta={planner.selectedPlaceDayMeta}
            activeSimulationPlace={planner.activeSimulationPlace}
            dayRoutePreviews={planner.dayRoutePreviews}
            activeDayIndex={planner.activeDayIndex}
            onSelectSimulationDay={(dayIndex) => {
              planner.setActiveDayIndex(dayIndex);
              planner.resetRouteSimulation();
            }}
            routeSimulationStatus={planner.routeSimulationStatus}
            onToggleRouteSimulation={planner.toggleRouteSimulation}
            onResetRouteSimulation={planner.resetRouteSimulation}
            onSkipToNextSimulationStop={planner.skipToNextSimulationStop}
            routeLoading={planner.routeLoading}
            routeError={planner.routeError}
            hasSimulationProgress={planner.hasSimulationProgress}
            isSimulationComplete={planner.isSimulationComplete}
            routeSimulationSpeed={planner.routeSimulationSpeed}
            onChangeSimulationSpeed={planner.setRouteSimulationSpeed}
            routeSimulationBarRef={planner.routeSimulationBarRef}
            activeDayPlaces={planner.activeDayPlaces}
          />
        </div>
      </div>
    </section>
  );
}
