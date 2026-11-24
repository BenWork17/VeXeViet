'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RouteSimulationStatus, TravelPlace } from '../types';
import { getRouteStopProgresses } from '../utils/itinerary-helpers';

interface UseRouteSimulationParams {
  activeDayPlaces: TravelPlace[];
  roadRoute: Array<[number, number]>;
  suggestedRoute: Array<{ lat: number; lng: number }>;
  routeLoading: boolean;
}

export function useRouteSimulation({
  activeDayPlaces,
  roadRoute,
  suggestedRoute,
  routeLoading,
}: UseRouteSimulationParams) {
  const [routeSimulationStatus, setRouteSimulationStatus] =
    useState<RouteSimulationStatus>('idle');
  const [hasSimulationProgress, setHasSimulationProgress] = useState(false);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [activeSimulationPlaceIndex, setActiveSimulationPlaceIndex] = useState<number | null>(
    null,
  );
  const [routeSimulationSpeed, setRouteSimulationSpeed] = useState<1 | 2>(1);

  const routeSimulationProgressRef = useRef(0);
  const routeSimulationBarRef = useRef<HTMLSpanElement | null>(null);
  const routeSimulationListenersRef = useRef<Set<(progress: number) => void>>(new Set());
  const routeSimulationFrameRef = useRef<number | null>(null);
  const routeSimulationLastTickRef = useRef<number | null>(null);

  const canSimulateRoute = activeDayPlaces.length > 0 && roadRoute.length > 1 && !routeLoading;

  const routeSimulationStopProgresses = useMemo(
    () => getRouteStopProgresses(roadRoute, suggestedRoute),
    [roadRoute, suggestedRoute],
  );

  const computeActiveSimulationIndex = useCallback(
    (progress: number): number | null => {
      if (!canSimulateRoute || progress <= 0) return null;
      let activeIndex: number | null = null;
      routeSimulationStopProgresses
        .slice(1, activeDayPlaces.length + 1)
        .forEach((stopProgress, index) => {
          if (progress >= stopProgress - 0.02) {
            activeIndex = index;
          }
        });
      return activeIndex;
    },
    [activeDayPlaces.length, canSimulateRoute, routeSimulationStopProgresses],
  );

  const applySimulationProgress = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(1, next));
      routeSimulationProgressRef.current = clamped;
      if (routeSimulationBarRef.current) {
        routeSimulationBarRef.current.style.transform = `scaleX(${clamped})`;
      }
      routeSimulationListenersRef.current.forEach((listener) => listener(clamped));
      setHasSimulationProgress(clamped > 0);
      setIsSimulationComplete(clamped >= 1);
      setActiveSimulationPlaceIndex(computeActiveSimulationIndex(clamped));
    },
    [computeActiveSimulationIndex],
  );

  const subscribeSimulationProgress = useCallback((listener: (progress: number) => void) => {
    routeSimulationListenersRef.current.add(listener);
    return () => {
      routeSimulationListenersRef.current.delete(listener);
    };
  }, []);

  const getSimulationProgress = useCallback(() => routeSimulationProgressRef.current, []);

  const activeSimulationPlace =
    activeSimulationPlaceIndex === null
      ? null
      : activeDayPlaces[activeSimulationPlaceIndex] ?? null;

  useEffect(() => {
    if (canSimulateRoute) return;
    setRouteSimulationStatus('idle');
    applySimulationProgress(0);
    routeSimulationLastTickRef.current = null;
    if (routeSimulationFrameRef.current !== null) {
      cancelAnimationFrame(routeSimulationFrameRef.current);
      routeSimulationFrameRef.current = null;
    }
  }, [applySimulationProgress, canSimulateRoute]);

  useEffect(() => {
    if (routeSimulationStatus !== 'playing' || !canSimulateRoute) {
      routeSimulationLastTickRef.current = null;
      if (routeSimulationFrameRef.current !== null) {
        cancelAnimationFrame(routeSimulationFrameRef.current);
        routeSimulationFrameRef.current = null;
      }
      return;
    }

    const durationMs = 12000;
    const tick = (timestamp: number) => {
      const previousTimestamp = routeSimulationLastTickRef.current ?? timestamp;
      routeSimulationLastTickRef.current = timestamp;
      const delta = Math.min(Math.max(timestamp - previousTimestamp, 0), 100);
      const next = Math.min(
        1,
        routeSimulationProgressRef.current + (delta / durationMs) * routeSimulationSpeed,
      );
      applySimulationProgress(next);

      if (next >= 1) {
        routeSimulationFrameRef.current = null;
        setRouteSimulationStatus('idle');
        return;
      }
      routeSimulationFrameRef.current = requestAnimationFrame(tick);
    };

    routeSimulationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (routeSimulationFrameRef.current !== null) {
        cancelAnimationFrame(routeSimulationFrameRef.current);
        routeSimulationFrameRef.current = null;
      }
    };
  }, [applySimulationProgress, canSimulateRoute, routeSimulationSpeed, routeSimulationStatus]);

  const toggleRouteSimulation = useCallback(() => {
    if (!canSimulateRoute) return;
    if (routeSimulationStatus === 'playing') {
      setRouteSimulationStatus('paused');
      return;
    }
    if (routeSimulationProgressRef.current >= 1) {
      applySimulationProgress(0);
    }
    setRouteSimulationStatus('playing');
  }, [applySimulationProgress, canSimulateRoute, routeSimulationStatus]);

  const resetRouteSimulation = useCallback(() => {
    setRouteSimulationStatus('idle');
    applySimulationProgress(0);
  }, [applySimulationProgress]);

  const resetSimulationAll = useCallback(() => {
    setRouteSimulationStatus('idle');
    applySimulationProgress(0);
    setRouteSimulationSpeed(1);
  }, [applySimulationProgress]);

  const skipToNextSimulationStop = useCallback(() => {
    if (!canSimulateRoute) return;
    const nextStopProgress = routeSimulationStopProgresses
      .slice(1)
      .find((stopProgress) => stopProgress > routeSimulationProgressRef.current + 0.03);
    applySimulationProgress(nextStopProgress ?? 1);
    setRouteSimulationStatus('paused');
  }, [applySimulationProgress, canSimulateRoute, routeSimulationStopProgresses]);

  return {
    canSimulateRoute,
    routeSimulationStatus,
    hasSimulationProgress,
    isSimulationComplete,
    activeSimulationPlace,
    routeSimulationSpeed,
    setRouteSimulationSpeed,
    routeSimulationBarRef,
    getSimulationProgress,
    subscribeSimulationProgress,
    toggleRouteSimulation,
    resetRouteSimulation,
    resetSimulationAll,
    skipToNextSimulationStop,
  };
}
