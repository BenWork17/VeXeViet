'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ANALYSIS_STEPS,
  DAY_ROUTE_COLORS,
  DEFAULT_DAY_ROUTE_COLOR,
  MAX_TRIP_DAYS,
  type AnalysisResult,
  type AnalysisState,
  type DayPlan,
  type DayRoutePreview,
  type DeparturePoint,
  type NominatimResult,
  type RouteDirectionStep,
  type TravelPlace,
} from '../types';
import { CITY_TRANSPORT_OPTIONS, resolveCityGuide } from '../data/city-guides';
import {
  getOSRMRoute,
  requestTripAnalysis,
  reverseGeocode,
  searchDeparture,
} from '../services/external-apis';
import {
  createEmptyDayPlans,
  distributePlacesAcrossDays,
  estimateTravelHours,
  fitDayPlansToCount,
  getClosedSuggestedRoute,
  getDayVisitHours,
  getMapCenter,
  getMapZoom,
  getRouteDistance,
  getTransportProfile,
  movePlaceBetweenDayPlans,
  toDeparturePoint,
  toLngLat,
} from '../utils/itinerary-helpers';
import { resolveMapColors, type MapColors } from '../TripMapPrimitives';
import { useRouteSimulation } from './useRouteSimulation';

export function useTripPlanner(destination: string) {
  const guide = useMemo(() => resolveCityGuide(destination), [destination]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dayCount, setDayCount] = useState(1);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(() => createEmptyDayPlans(1));
  const [draggedPlaceId, setDraggedPlaceId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [compactMap, setCompactMap] = useState(false);
  const [selectedActivitiesByPlace, setSelectedActivitiesByPlace] = useState<
    Record<string, string[]>
  >({});
  const [selectedLocalTransportIndex, setSelectedLocalTransportIndex] = useState<number | null>(
    null,
  );
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const [expandedStopIndexes, setExpandedStopIndexes] = useState<number[]>([]);
  const [departurePoint, setDeparturePoint] = useState<DeparturePoint>(() =>
    toDeparturePoint(guide.startPoint),
  );
  const [departureQuery, setDepartureQuery] = useState(guide.startPoint.name);
  const [departureSuggestions, setDepartureSuggestions] = useState<NominatimResult[]>([]);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [departureError, setDepartureError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [roadRoute, setRoadRoute] = useState<Array<[number, number]>>([]);
  const [routeDirections, setRouteDirections] = useState<RouteDirectionStep[][]>([]);
  const [directionsExpanded, setDirectionsExpanded] = useState(false);
  const [activeDirectionId, setActiveDirectionId] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [mapFocusCenter, setMapFocusCenter] = useState(() =>
    getMapCenter([guide.startPoint, ...guide.places]),
  );
  const [mapColors, setMapColors] = useState<MapColors | null>(null);

  const [landmarkError, setLandmarkError] = useState<string | null>(null);
  const [transportError, setTransportError] = useState<string | null>(null);
  const [departurePointError, setDeparturePointError] = useState<string | null>(null);

  const selectedPlaces = useMemo(
    () => guide.places.filter((place) => selectedIds.includes(place.id)),
    [guide.places, selectedIds],
  );
  const placesById = useMemo(
    () => new Map(guide.places.map((place) => [place.id, place])),
    [guide.places],
  );
  const selectedPlacesByDay = useMemo(
    () =>
      dayPlans.map(
        (plan) => plan.placeIds.map((id) => placesById.get(id)).filter(Boolean) as TravelPlace[],
      ),
    [dayPlans, placesById],
  );
  const activeDayPlaces = selectedPlacesByDay[activeDayIndex] ?? [];
  const localTransport =
    selectedLocalTransportIndex === null
      ? null
      : CITY_TRANSPORT_OPTIONS[selectedLocalTransportIndex] ?? null;
  const placeCost = selectedPlaces.reduce((total, place) => total + place.cost, 0);

  const suggestedRoute = useMemo(
    () => getClosedSuggestedRoute(departurePoint, activeDayPlaces),
    [activeDayPlaces, departurePoint],
  );
  const routeDistance = useMemo(() => getRouteDistance(suggestedRoute), [suggestedRoute]);
  const mapFocusZoom = useMemo(() => Math.max(10, getMapZoom(guide.places) - 1), [guide]);

  const roadRouteLngLat = useMemo(() => toLngLat(roadRoute), [roadRoute]);
  const activeDirectionStep = useMemo(
    () => routeDirections.flat().find((step) => step.id === activeDirectionId) ?? null,
    [activeDirectionId, routeDirections],
  );
  const activeDirectionLngLat = useMemo(
    () => toLngLat(activeDirectionStep?.points ?? []),
    [activeDirectionStep],
  );

  const dayRoutePreviews = useMemo<DayRoutePreview[]>(
    () =>
      selectedPlacesByDay.map((places, index) => {
        const plan = dayPlans[index];
        const route = getClosedSuggestedRoute(departurePoint, places);
        const distanceKm = getRouteDistance(route);
        const visitHours = getDayVisitHours(places);
        const travelHours = estimateTravelHours(distanceKm);

        return {
          day: index + 1,
          startTime: plan?.startTime ?? '08:00',
          color: DAY_ROUTE_COLORS[index % DAY_ROUTE_COLORS.length] ?? DEFAULT_DAY_ROUTE_COLOR,
          places,
          route,
          visitHours,
          travelHours,
          totalHours: visitHours + travelHours,
          distanceKm,
        };
      }),
    [dayPlans, departurePoint, selectedPlacesByDay],
  );

  const selectedPlaceDayMeta = useMemo(() => {
    const meta = new Map<string, { day: number; color: string; order: number }>();
    dayRoutePreviews.forEach((day) => {
      day.places.forEach((place, index) => {
        meta.set(place.id, { day: day.day, color: day.color, order: index + 1 });
      });
    });
    return meta;
  }, [dayRoutePreviews]);

  const activeDayPreview = dayRoutePreviews[activeDayIndex] ?? null;

  const simulation = useRouteSimulation({
    activeDayPlaces,
    roadRoute,
    suggestedRoute,
    routeLoading,
  });

  useEffect(() => {
    const nextDeparturePoint = toDeparturePoint(guide.startPoint);
    setSelectedIds([]);
    setDayCount(1);
    setActiveDayIndex(0);
    setDayPlans(createEmptyDayPlans(1));
    setDraggedPlaceId(null);
    setSelectedLocalTransportIndex(null);
    setExpandedPlaceId(null);
    setExpandedStopIndexes([]);
    setAnalysisState('idle');
    setAnalysisStepIndex(0);
    setAnalysisResult(null);
    setDeparturePoint(nextDeparturePoint);
    setDepartureQuery(nextDeparturePoint.label);
    setDepartureSuggestions([]);
    setDepartureError(null);
    setMapFocusCenter(getMapCenter([nextDeparturePoint, ...guide.places]));
    setRoadRoute([]);
    setRouteDirections([]);
    setRouteError(null);
    simulation.resetSimulationAll();
    setLandmarkError(null);
    setTransportError(null);
    setDeparturePointError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide]);

  useEffect(() => {
    if (analysisState !== 'loading') return;
    const interval = window.setInterval(() => {
      setAnalysisStepIndex((current) => (current + 1) % ANALYSIS_STEPS.length);
    }, 1200);
    return () => window.clearInterval(interval);
  }, [analysisState]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setCompactMap(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setMapColors(resolveMapColors());
  }, []);

  useEffect(() => {
    setDayPlans((current) =>
      fitDayPlansToCount(current, dayCount, selectedIds, guide.places, departurePoint),
    );
    setActiveDayIndex((current) => Math.min(current, dayCount - 1));
  }, [dayCount, departurePoint, guide.places, selectedIds]);

  useEffect(() => {
    const query = departureQuery.trim();
    if (query.length < 2 || query === departurePoint.label) {
      setDepartureSuggestions([]);
      setDepartureLoading(false);
      return;
    }

    let cancelled = false;
    setDepartureLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const suggestions = await searchDeparture(query);
        if (!cancelled) {
          setDepartureSuggestions(suggestions);
          setDepartureError(null);
        }
      } catch {
        if (!cancelled) {
          setDepartureSuggestions([]);
          setDepartureError('Không thể tải gợi ý địa chỉ');
        }
      } finally {
        if (!cancelled) setDepartureLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [departurePoint.label, departureQuery]);

  useEffect(() => {
    if (suggestedRoute.length < 2) {
      setRoadRoute([]);
      setRouteDirections([]);
      setRouteLoading(false);
      setRouteError(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);
    setRouteError(null);

    getOSRMRoute(suggestedRoute, getTransportProfile(null, localTransport))
      .then((route) => {
        if (!cancelled) {
          setRoadRoute(route.geometry);
          setRouteDirections(route.legs);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoadRoute([]);
          setRouteDirections([]);
          setRouteError('Không thể tải tuyến đường OSRM');
        }
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [localTransport, suggestedRoute]);

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setAnalysisStepIndex(0);
    simulation.resetRouteSimulation();
  };

  const updateDayCount = (nextDayCount: number) => {
    setDayCount(Math.max(1, Math.min(MAX_TRIP_DAYS, nextDayCount)));
    resetAnalysis();
  };

  const autoDistributeSelectedPlaces = () => {
    setDayPlans(distributePlacesAcrossDays(selectedPlaces, departurePoint, dayCount));
    setActiveDayIndex(0);
    resetAnalysis();
  };

  const movePlaceToDay = (placeId: string, targetDayIndex: number, targetIndex?: number) => {
    setDayPlans((current) =>
      movePlaceBetweenDayPlans(current, placeId, targetDayIndex, targetIndex),
    );
    setActiveDayIndex(targetDayIndex);
    resetAnalysis();
  };

  const updateDayStartTime = (dayIndex: number, startTime: string) => {
    setDayPlans((current) =>
      current.map((plan, index) => (index === dayIndex ? { ...plan, startTime } : plan)),
    );
    resetAnalysis();
  };

  const handlePlaceDrop = (targetDayIndex: number, targetIndex?: number) => {
    if (!draggedPlaceId) return;
    movePlaceToDay(draggedPlaceId, targetDayIndex, targetIndex);
    setDraggedPlaceId(null);
  };

  const togglePlace = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        setDayPlans((plans) =>
          plans.map((plan) => ({
            ...plan,
            placeIds: plan.placeIds.filter((placeId) => placeId !== id),
          })),
        );
        return current.filter((item) => item !== id);
      }
      setDayPlans((plans) => movePlaceBetweenDayPlans(plans, id, activeDayIndex));
      return [...current, id];
    });
    resetAnalysis();
  };

  const addPlaceToTrip = (id: string) => {
    if (!selectedIds.includes(id)) {
      setSelectedIds((current) => [...current, id]);
      setDayPlans((plans) => movePlaceBetweenDayPlans(plans, id, activeDayIndex));
      resetAnalysis();
    }
    setSelectedPlace(null);
  };

  const togglePlaceActivity = (placeId: string, activity: string) => {
    setSelectedActivitiesByPlace((current) => {
      const selectedActivities = current[placeId] ?? [];
      const nextActivities = selectedActivities.includes(activity)
        ? selectedActivities.filter((item) => item !== activity)
        : [...selectedActivities, activity];
      return { ...current, [placeId]: nextActivities };
    });
  };

  const updateDepartureMarker = (lat: number, lon: number, label: string) => {
    setDeparturePoint({ name: label, label, lat, lng: lon });
    setDepartureQuery(label);
    setDepartureSuggestions([]);
    setDepartureError(null);
    setMapFocusCenter({ lat, lng: lon });
    resetAnalysis();
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setDepartureError('Trình duyệt không hỗ trợ định vị');
      return;
    }
    setIsLocating(true);
    setDepartureError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const label = await reverseGeocode(lat, lon);
          updateDepartureMarker(lat, lon, label);
        } catch {
          setDepartureError('Không thể lấy địa chỉ từ vị trí hiện tại');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setDepartureError('Không thể truy cập vị trí hiện tại');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const startAnalysis = async () => {
    setLandmarkError(null);
    setTransportError(null);
    setDeparturePointError(null);

    if (selectedPlaces.length < 2) {
      setLandmarkError('Vui lòng chọn ít nhất 2 địa điểm');
      return;
    }
    if (!localTransport) {
      setTransportError('Vui lòng chọn phương tiện di chuyển');
      return;
    }
    if (!departurePoint) {
      setDeparturePointError('Vui lòng nhập điểm xuất phát');
      return;
    }
    if (analysisState === 'loading') return;

    setAnalysisState('loading');
    setAnalysisStepIndex(0);
    setAnalysisResult(null);

    try {
      const result = await requestTripAnalysis({
        departurePoint,
        selectedPlaces,
        dayCount,
        dayRoutePreviews,
        localTransport,
      });
      setAnalysisResult(result);
      setAnalysisState('complete');
    } catch (error) {
      setAnalysisState('idle');
      setLandmarkError(error instanceof Error ? error.message : 'Lỗi phân tích AI');
    }
  };

  return {
    guide,
    selectedIds,
    selectedPlaces,
    dayCount,
    activeDayIndex,
    setActiveDayIndex,
    draggedPlaceId,
    setDraggedPlaceId,
    selectedPlace,
    setSelectedPlace,
    compactMap,
    selectedActivitiesByPlace,
    selectedLocalTransportIndex,
    setSelectedLocalTransportIndex,
    localTransport,
    placeCost,
    routeDistance,
    mapFocusCenter,
    mapFocusZoom,
    mapColors,
    roadRouteLngLat,
    activeDirectionLngLat,
    dayRoutePreviews,
    selectedPlaceDayMeta,
    activeDayPlaces,
    activeDayPreview,
    departurePoint,
    departureQuery,
    setDepartureQuery,
    departureSuggestions,
    departureLoading,
    departureError,
    setDepartureError,
    isLocating,
    routeDirections,
    directionsExpanded,
    setDirectionsExpanded,
    setActiveDirectionId,
    routeLoading,
    routeError,
    analysisState,
    analysisStepIndex,
    analysisResult,
    expandedPlaceId,
    setExpandedPlaceId,
    expandedStopIndexes,
    setExpandedStopIndexes,
    landmarkError,
    transportError,
    departurePointError,
    resetAnalysis,
    updateDayCount,
    autoDistributeSelectedPlaces,
    updateDayStartTime,
    handlePlaceDrop,
    togglePlace,
    addPlaceToTrip,
    togglePlaceActivity,
    updateDepartureMarker,
    useCurrentLocation,
    startAnalysis,
    ...simulation,
  };
}

export type TripPlannerController = ReturnType<typeof useTripPlanner>;
