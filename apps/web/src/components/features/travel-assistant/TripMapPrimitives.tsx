'use client';

import { memo, useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { MapRoute, MarkerContent, RouteMarker, RouteProgress, useMap } from '@/components/ui/map';
import { fetchWikiImage } from './services/external-apis';

const MAP_COLOR_VARIABLES = {
  ink: '--foreground',
  route: '--primary',
  progress: '--primary-deep',
} as const;

export type MapColors = { ink: string; route: string; progress: string };

function readCssColor(variable: string): string {
  if (typeof window === 'undefined') return '';
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

export function resolveMapColors(): MapColors | null {
  const colors = {
    ink: readCssColor(MAP_COLOR_VARIABLES.ink),
    route: readCssColor(MAP_COLOR_VARIABLES.route),
    progress: readCssColor(MAP_COLOR_VARIABLES.progress),
  };

  return colors.ink && colors.route && colors.progress ? colors : null;
}

export const LandmarkImage = ({ wikiSlug, name, imageUrl }: { wikiSlug?: string; name: string; imageUrl?: string }) => {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (imageUrl) {
      setSrc(imageUrl);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    if (!wikiSlug) {
      setSrc('');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    fetchWikiImage(wikiSlug, name).then((url) => {
      if (active) {
        setSrc(url);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [imageUrl, wikiSlug, name]);

  if (loading)
    return (
      <div className="travel-image-state" role="status" aria-live="polite">
        <span>Đang tải ảnh…</span>
      </div>
    );

  if (!src)
    return (
      <div className="travel-image-state" aria-hidden="true">
        <MapPin size={22} />
      </div>
    );

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className="travel-image"
      onError={() => {
        setSrc('');
      }}
    />
  );
};

export const SimulatedDayRoute = memo(function SimulatedDayRoute({
  coordinates,
  routeColor,
  progressColor,
  canSimulateRoute,
  getProgress,
  subscribeProgress,
}: {
  coordinates: [number, number][];
  routeColor: string;
  progressColor: string;
  canSimulateRoute: boolean;
  getProgress: () => number;
  subscribeProgress: (listener: (progress: number) => void) => () => void;
}) {
  const [progress, setProgress] = useState(getProgress);

  useEffect(() => {
    setProgress(getProgress());
    return subscribeProgress(setProgress);
  }, [getProgress, subscribeProgress]);

  return (
    <MapRoute
      id="day-road-route"
      coordinates={coordinates}
      color={routeColor}
      width={3}
      opacity={0.55}
      progress={progress}
      interactive={false}
    >
      <RouteProgress color={progressColor} width={5} />
      {canSimulateRoute && progress > 0 && (
        <RouteMarker at="progress" anchor="center">
          <MarkerContent className="travel-route-marker">
            <Navigation size={13} aria-hidden="true" />
          </MarkerContent>
        </RouteMarker>
      )}
    </MapRoute>
  );
});

export function MapViewportSync({
  center,
  zoom,
  focusedPlace,
}: {
  center: { lat: number; lng: number };
  zoom: number;
  focusedPlace: { lat: number; lng: number } | null;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    map.flyTo({
      center: [center.lng, center.lat],
      zoom,
      duration: 700,
      essential: true,
    });
  }, [center.lat, center.lng, isLoaded, map, zoom]);

  useEffect(() => {
    if (!map || !isLoaded || !focusedPlace) return;

    if (window.matchMedia('(max-width: 767px)').matches) {
      map.easeTo({
        center: [focusedPlace.lng, focusedPlace.lat],
        duration: 450,
        essential: true,
      });
      return;
    }

    const container = map.getContainer();
    const point = map.project([focusedPlace.lng, focusedPlace.lat]);
    const targetY = container.clientHeight * 0.72;
    const center = map.unproject([
      point.x,
      point.y + container.clientHeight / 2 - targetY,
    ]);

    map.easeTo({
      center,
      duration: 450,
      essential: true,
    });
  }, [focusedPlace, isLoaded, map]);

  return null;
}
