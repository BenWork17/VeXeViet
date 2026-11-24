'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import type { MapRef } from '@/components/ui/map';
import {
  buildGoogleStreetViewEmbedUrl,
  buildGoogleStreetViewExternalUrl,
  buildSearchRouteUrl,
  buildTravelPlannerUrl,
  type ExploreDestination,
} from '@/lib/data/explore-destinations';
import {
  normalizeAngle360,
  resolveVantagePoints,
  SATELLITE_3D_STYLE,
  type BasemapStyleMode,
  type CameraMode,
  type LightingPreset,
} from './GeoGuessrCompassBar';

export function useCameraChoreography(destination: ExploreDestination) {
  const vantagePoints = useMemo(() => resolveVantagePoints(destination), [destination]);
  const [selectedVantageIndex, setSelectedVantageIndex] = useState(0);
  const activeVantage = vantagePoints[selectedVantageIndex] ?? vantagePoints[0]!;

  const [cameraMode, setCameraMode] = useState<CameraMode>('streetview');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Street View state
  const [svResetCounter, setSvResetCounter] = useState<number>(0);
  const [svLoading, setSvLoading] = useState<boolean>(true);
  const [miniMapExpanded, setMiniMapExpanded] = useState<boolean>(false);
  const [miniMapPinned, setMiniMapPinned] = useState<boolean>(false);

  // 360° Interactive Sphere state
  const [yaw, setYaw] = useState<number>(
    normalizeAngle360(activeVantage.streetViewHeading ?? activeVantage.bearing ?? 0),
  );
  const [spherePitch, setSpherePitch] = useState<number>(activeVantage.streetViewPitch ?? 0);
  const [fovZoom, setFovZoom] = useState<number>(1.25);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoPanning, setIsAutoPanning] = useState<boolean>(false);
  const [lighting, setLighting] = useState<LightingPreset>('day');
  const [sphereImgSrc, setSphereImgSrc] = useState<string>(
    activeVantage.panorama360Url || activeVantage.imageUrl,
  );
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startYaw: number; startPitch: number } | null>(
    null,
  );

  // Flycam 3D Map state
  const [basemapMode, setBasemapMode] = useState<BasemapStyleMode>('satellite');
  const [mapPitch, setMapPitch] = useState<number>(activeVantage.pitch || 65);
  const [mapBearing, setMapBearing] = useState<number>(activeVantage.bearing || -30);
  const [mapZoom, setMapZoom] = useState<number>(activeVantage.zoom || 15);
  const [isOrbitingMap, setIsOrbitingMap] = useState<boolean>(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(
    destination.highlights[0]?.id ?? null,
  );

  const mapRef = useRef<MapRef | null>(null);
  const miniMapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    const first = vantagePoints[0];
    if (!first) return;
    setSelectedVantageIndex(0);
    setSvLoading(true);
    setSvResetCounter((c) => c + 1);
    setYaw(normalizeAngle360(first.streetViewHeading ?? first.bearing ?? 0));
    setSpherePitch(first.streetViewPitch ?? 0);
    setSphereImgSrc(first.panorama360Url || first.imageUrl);
    setMapPitch(first.pitch || 65);
    setMapBearing(first.bearing || -30);
    setMapZoom(first.zoom || 15);
    setActiveHotspotId(destination.highlights[0]?.id ?? null);
  }, [destination.id, vantagePoints, destination.highlights]);

  useEffect(() => {
    setSphereImgSrc(activeVantage.panorama360Url || activeVantage.imageUrl);
  }, [activeVantage.panorama360Url, activeVantage.imageUrl]);

  const handleSelectVantage = useCallback(
    (index: number) => {
      const safeIndex = ((index % vantagePoints.length) + vantagePoints.length) % vantagePoints.length;
      const target = vantagePoints[safeIndex];
      if (!target) return;

      setIsStepping(true);
      window.setTimeout(() => setIsStepping(false), 320);

      setSelectedVantageIndex(safeIndex);
      setSvLoading(true);
      setYaw(normalizeAngle360(target.streetViewHeading ?? target.bearing ?? 0));
      setSpherePitch(target.streetViewPitch ?? 0);
      setMapPitch(target.pitch || 65);
      setMapBearing(target.bearing || -30);
      setMapZoom(target.zoom || 15);

      const [lat, lng] = target.streetViewLatLng ?? target.coordinates;
      mapRef.current?.flyTo({
        center: [lng, lat],
        pitch: target.pitch || 65,
        bearing: target.bearing || 0,
        zoom: target.zoom || 15.2,
        duration: 1500,
        essential: true,
      });
      miniMapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 13.5,
        duration: 900,
        essential: true,
      });
    },
    [vantagePoints],
  );

  useEffect(() => {
    if (cameraMode === 'sphere-360' && isAutoPanning && !isDragging) {
      const timer = window.setInterval(() => {
        setYaw((prev) => normalizeAngle360(prev + 0.65));
      }, 30);
      return () => window.clearInterval(timer);
    }

    if (cameraMode === 'flycam-map' && isOrbitingMap) {
      const timer = window.setInterval(() => {
        setMapBearing((prev) => {
          const next = normalizeAngle360(prev + 1.2);
          mapRef.current?.rotateTo(next, { duration: 0 });
          return next;
        });
      }, 45);
      return () => window.clearInterval(timer);
    }

    return undefined;
  }, [cameraMode, isAutoPanning, isDragging, isOrbitingMap]);

  const handleSpherePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setIsAutoPanning(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: yaw,
      startPitch: spherePitch,
    };
  };

  const handleSpherePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setYaw(normalizeAngle360(dragStartRef.current.startYaw - dx * 0.28));
    setSpherePitch(Math.max(-28, Math.min(28, dragStartRef.current.startPitch + dy * 0.16)));
  };

  const handleSpherePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleSphereWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFovZoom((prev) => {
      const next = prev - e.deltaY * 0.0008;
      return Math.max(1.08, Math.min(2.1, Number(next.toFixed(2))));
    });
  };

  const handleResetView = () => {
    if (cameraMode === 'streetview') {
      setSvLoading(true);
      setSvResetCounter((c) => c + 1);
    } else if (cameraMode === 'sphere-360') {
      setIsAutoPanning(false);
      setYaw(normalizeAngle360(activeVantage.streetViewHeading ?? activeVantage.bearing ?? 0));
      setSpherePitch(activeVantage.streetViewPitch ?? 0);
      setFovZoom(1.25);
    } else {
      setIsOrbitingMap(false);
      handleSelectVantage(selectedVantageIndex);
    }
  };

  const highlightHotspots = useMemo(() => {
    const [baseLat, baseLng] = activeVantage.streetViewLatLng ?? destination.coordinates;
    const yawSlots = [15, 105, 195, 285];
    const pitchSlots = [4, -4, 6, -2];
    const mapOffsets: Array<[number, number]> = [
      [0.0024, -0.0028],
      [-0.0028, 0.0034],
      [0.0036, 0.0032],
      [-0.002, -0.0036],
    ];
    return destination.highlights.map((hl, idx) => {
      const offset = mapOffsets[idx % mapOffsets.length]!;
      return {
        highlight: hl,
        yawAngle: yawSlots[idx % yawSlots.length]!,
        pitchAngle: pitchSlots[idx % pitchSlots.length]!,
        lat: baseLat + offset[0],
        lng: baseLng + offset[1],
      };
    });
  }, [destination, activeVantage]);

  const mapStyles = useMemo(() => {
    if (basemapMode === 'satellite') {
      return { light: SATELLITE_3D_STYLE, dark: SATELLITE_3D_STYLE };
    }
    return undefined;
  }, [basemapMode]);

  const lightingFilterClass =
    lighting === 'dawn'
      ? 'sepia-[.16] saturate-[1.25] hue-rotate-[-8deg] brightness-105'
      : lighting === 'sunset'
        ? 'sepia-[.26] saturate-[1.4] contrast-[1.06] brightness-95'
        : 'saturate-[1.08] contrast-[1.02]';

  const svEmbedUrl = useMemo(() => buildGoogleStreetViewEmbedUrl(activeVantage), [activeVantage]);
  const svExternalUrl = useMemo(() => buildGoogleStreetViewExternalUrl(activeVantage), [activeVantage]);
  const searchUrl = buildSearchRouteUrl(destination);
  const travelUrl = buildTravelPlannerUrl(destination);
  const stripTranslatePercent = -(normalizeAngle360(yaw) / 360) * 100;

  return {
    vantagePoints,
    selectedVantageIndex,
    activeVantage,
    cameraMode,
    setCameraMode,
    isFullscreen,
    setIsFullscreen,
    svResetCounter,
    svLoading,
    setSvLoading,
    miniMapExpanded,
    setMiniMapExpanded,
    miniMapPinned,
    setMiniMapPinned,
    yaw,
    spherePitch,
    fovZoom,
    setFovZoom,
    isDragging,
    isAutoPanning,
    setIsAutoPanning,
    lighting,
    setLighting,
    sphereImgSrc,
    setSphereImgSrc,
    isStepping,
    basemapMode,
    setBasemapMode,
    mapPitch,
    setMapPitch,
    mapBearing,
    setMapBearing,
    mapZoom,
    setMapZoom,
    isOrbitingMap,
    setIsOrbitingMap,
    activeHotspotId,
    setActiveHotspotId,
    mapRef,
    miniMapRef,
    handleSelectVantage,
    handleSpherePointerDown,
    handleSpherePointerMove,
    handleSpherePointerUp,
    handleSphereWheel,
    handleResetView,
    highlightHotspots,
    mapStyles,
    lightingFilterClass,
    svEmbedUrl,
    svExternalUrl,
    searchUrl,
    travelUrl,
    stripTranslatePercent,
  };
}
