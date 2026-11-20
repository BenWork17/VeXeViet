'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type * as MapLibreGL from 'maplibre-gl';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CheckSquare,
  Compass,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  Mountain,
  Navigation,
  Orbit,
  Pause,
  Pin,
  PinOff,
  Play,
  Plus,
  RotateCcw,
  Square,
  Sun,
  Sunrise,
  Sunset,
  Ticket,
  X,
} from 'lucide-react';
import {
  Map as MapView,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  type MapRef,
} from '@/components/ui/map';
import {
  buildGoogleStreetViewEmbedUrl,
  buildGoogleStreetViewExternalUrl,
  buildSearchRouteUrl,
  buildTravelPlannerUrl,
  type Camera3DVantagePoint,
  type ExploreDestination,
} from '@/lib/data/explore-destinations';

export type Camera3DVantagePointItem = Camera3DVantagePoint;

type DestinationWithOptional3D = ExploreDestination & {
  camera3DAngles?: Camera3DVantagePointItem[];
};

export interface Destination3DCameraViewProps {
  destination: ExploreDestination;
  selectedHighlightIds?: string[];
  onToggleHighlight?: (highlightId: string, destinationId?: string) => void;
  isEmbedded?: boolean;
  onClose?: () => void;
}

export interface Destination3DCameraModalProps {
  destination: ExploreDestination | null;
  isOpen?: boolean;
  onClose: () => void;
  selectedHighlightIds?: string[];
  onToggleHighlight?: (highlightId: string, destinationId?: string) => void;
}

type CameraMode = 'streetview' | 'sphere-360' | 'flycam-map';
type LightingPreset = 'dawn' | 'day' | 'sunset';
type BasemapStyleMode = 'satellite' | 'vector';

const SATELLITE_3D_STYLE: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {
    'esri-world-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'esri-world-imagery-layer',
      type: 'raster',
      source: 'esri-world-imagery',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const FALLBACK_360_IMG =
  'https://placehold.co/1600x900/1f1b18/fb923c?text=VeXeViet+360+Street+View';

function normalizeAngle360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function getShortestAngleDelta(targetYaw: number, currentYaw: number): number {
  let diff = normalizeAngle360(targetYaw) - normalizeAngle360(currentYaw);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * Resolve 360° Street View & 3D Flycam vantage points for any destination
 */
function resolveVantagePoints(dest: ExploreDestination): Camera3DVantagePointItem[] {
  const with3D = dest as DestinationWithOptional3D;
  if (Array.isArray(with3D.camera3DAngles) && with3D.camera3DAngles.length > 0) {
    return with3D.camera3DAngles;
  }

  const [baseLat, baseLng] = dest.coordinates;
  const galleryImgs = [dest.heroImage, ...(dest.gallery || [])];
  const hl0 = dest.highlights[0];
  const hl1 = dest.highlights[1];
  const hl2 = dest.highlights[2];

  return [
    {
      id: `${dest.id}-sv-1`,
      label: `Trung tâm ${dest.displayLocation.split('•')[0]?.trim() || dest.province}`,
      coordinates: [baseLat, baseLng],
      streetViewLatLng: [baseLat, baseLng],
      streetViewHeading: 35,
      streetViewPitch: 4,
      streetViewFov: 90,
      pitch: 66,
      bearing: 35,
      zoom: 15.2,
      altitudeMeters: 220,
      imageUrl: galleryImgs[0] || dest.heroImage,
      panorama360Url: galleryImgs[0] || dest.heroImage,
      description:
        hl0?.description ||
        `Góc nhìn Street View 360° trực diện tại ${dest.displayLocation} — kéo chuột để xoay nhìn toàn cảnh xung quanh.`,
      bestTime: hl0?.goldenHour || 'Bình minh 05:45 – 07:00',
    },
    {
      id: `${dest.id}-sv-2`,
      label: hl1 ? hl1.title : `Góc Đường Phố ${dest.province}`,
      coordinates: [baseLat + 0.0045, baseLng + 0.004],
      streetViewLatLng: [baseLat + 0.0045, baseLng + 0.004],
      streetViewHeading: 120,
      streetViewPitch: 2,
      streetViewFov: 90,
      pitch: 68,
      bearing: 120,
      zoom: 15.6,
      altitudeMeters: 180,
      imageUrl: galleryImgs[1] || dest.heroImage,
      panorama360Url: galleryImgs[1] || dest.heroImage,
      description:
        hl1?.description ||
        `Góc quan sát 360° xung quanh điểm vui chơi nổi bật tại ${dest.displayLocation}.`,
      bestTime: hl1?.goldenHour || 'Hoàng hôn 16:30 – 18:00',
    },
    {
      id: `${dest.id}-sv-3`,
      label: hl2 ? hl2.title : `Tọa Độ Ngắm Cảnh Hoàng Hôn`,
      coordinates: [baseLat - 0.004, baseLng + 0.005],
      streetViewLatLng: [baseLat - 0.004, baseLng + 0.005],
      streetViewHeading: 240,
      streetViewPitch: 5,
      streetViewFov: 90,
      pitch: 64,
      bearing: 240,
      zoom: 15.0,
      altitudeMeters: 150,
      imageUrl: galleryImgs[2] || galleryImgs[0] || dest.heroImage,
      panorama360Url: galleryImgs[2] || galleryImgs[0] || dest.heroImage,
      description:
        hl2?.description ||
        `Khám phá không gian 360° hướng về khu vực giải trí & ẩm thực đặc trưng tại ${dest.province}.`,
      bestTime: hl2?.goldenHour || '17:00 – 19:30',
    },
  ];
}

const COMPASS_LABELS: Array<{ deg: number; label: string; major?: boolean }> = [
  { deg: 0, label: 'N', major: true },
  { deg: 45, label: 'NE' },
  { deg: 90, label: 'E', major: true },
  { deg: 135, label: 'SE' },
  { deg: 180, label: 'S', major: true },
  { deg: 225, label: 'SW' },
  { deg: 270, label: 'W', major: true },
  { deg: 315, label: 'NW' },
];

/**
 * GeoGuessr-style Linear Top Compass Bar
 */
function GeoGuessrCompassBar({ yaw }: { yaw: number }) {
  const normalizedYaw = normalizeAngle360(yaw);
  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let d = 0; d < 360; d += 15) {
      arr.push(d);
    }
    return arr;
  }, []);

  return (
    <div
      aria-label={`La bàn hướng nhìn ${Math.round(normalizedYaw)} độ`}
      className="pointer-events-none relative mx-auto flex h-10 w-64 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-black/75 shadow-lg backdrop-blur-md sm:w-80"
    >
      {/* Center Red/Orange Needle */}
      <div className="absolute top-0 left-1/2 z-20 h-2.5 w-0.5 -translate-x-1/2 bg-primary" />
      <div className="absolute bottom-0 left-1/2 z-20 h-2 w-0.5 -translate-x-1/2 bg-primary/80" />

      {/* Sliding Compass Ticks */}
      <div className="relative h-full w-full">
        {ticks.map((deg) => {
          const delta = getShortestAngleDelta(deg, normalizedYaw);
          if (Math.abs(delta) > 95) return null;
          const leftPercent = 50 + (delta / 90) * 50;
          const cardinal = COMPASS_LABELS.find((c) => c.deg === deg);
          return (
            <div
              key={deg}
              style={{ left: `${leftPercent}%` }}
              className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center justify-center"
            >
              {cardinal ? (
                <span
                  className={`font-mono leading-none ${
                    cardinal.major
                      ? 'text-xs font-extrabold text-white'
                      : 'text-[10px] font-bold text-white/75'
                  } ${cardinal.label === 'N' ? 'text-primary!' : ''}`}
                >
                  {cardinal.label}
                </span>
              ) : (
                <span className="h-1.5 w-px bg-white/35" />
              )}
            </div>
          );
        })}
      </div>

      {/* Heading Readout Pill */}
      <span className="absolute right-2.5 bottom-0.5 font-mono text-[9px] font-bold text-white/65">
        {Math.round(normalizedYaw)}°
      </span>
    </div>
  );
}

export function Destination3DCameraView({
  destination,
  selectedHighlightIds = [],
  onToggleHighlight,
  isEmbedded = false,
  onClose,
}: Destination3DCameraViewProps) {
  const vantagePoints = useMemo(() => resolveVantagePoints(destination), [destination]);
  const [selectedVantageIndex, setSelectedVantageIndex] = useState(0);
  const activeVantage = vantagePoints[selectedVantageIndex] ?? vantagePoints[0]!;

  // Default to Mode 1: Real Google Street View 360° (GeoGuessr / OpenGuessr style)
  const [cameraMode, setCameraMode] = useState<CameraMode>('streetview');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Street View state
  const [svResetCounter, setSvResetCounter] = useState<number>(0);
  const [svLoading, setSvLoading] = useState<boolean>(true);
  const [miniMapExpanded, setMiniMapExpanded] = useState<boolean>(false);
  const [miniMapPinned, setMiniMapPinned] = useState<boolean>(false);

  // 360° Interactive Sphere state (Mode 2)
  const [yaw, setYaw] = useState<number>(
    normalizeAngle360(activeVantage.streetViewHeading ?? activeVantage.bearing ?? 0),
  );
  const [spherePitch, setSpherePitch] = useState<number>(activeVantage.streetViewPitch ?? 0);
  const [fovZoom, setFovZoom] = useState<number>(1.25); // 1.05 to 2.1
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

  // Flycam 3D Map state (Mode 3)
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

  // Reset states when destination changes
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

  // Sync image when active vantage changes
  useEffect(() => {
    setSphereImgSrc(activeVantage.panorama360Url || activeVantage.imageUrl);
  }, [activeVantage.panorama360Url, activeVantage.imageUrl]);

  // Switch vantage point across all 3 modes
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

  // Auto-pan 360° in Sphere Mode or 360° Orbit in Flycam Map Mode
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

  // Pointer drag handlers for 360° Sphere Viewer (Mode 2)
  const handleSpherePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on buttons inside the viewer
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
    // Natural drag-to-look sensitivity (drag left -> look right, like Google Street View)
    const nextYaw = normalizeAngle360(dragStartRef.current.startYaw - dx * 0.28);
    const nextPitch = Math.max(-28, Math.min(28, dragStartRef.current.startPitch + dy * 0.16));
    setYaw(nextYaw);
    setSpherePitch(nextPitch);
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

  // Place destination's entertainment highlights around the 360° horizon
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
      return {
        light: SATELLITE_3D_STYLE,
        dark: SATELLITE_3D_STYLE,
      };
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

  // Seamless 360° strip horizontal translation based on yaw (0°–360°)
  // One full panorama panel spans 100% of strip width; we render 3 panels [-1, 0, 1]
  const yawFraction = normalizeAngle360(yaw) / 360; // 0 to 1
  const stripTranslatePercent = -yawFraction * 100;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-border-strong bg-background text-foreground ${
        isFullscreen ? 'fixed inset-2 z-[var(--z-modal)] shadow-2xl sm:inset-4' : ''
      }`}
    >
      {/* Top Bar: Mode Switcher (Street View 360° | Toàn Cảnh 360° Sphere | Flycam 3D) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-primary-foreground">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            STREET VIEW 360° • GEOGUESSR MODE
          </span>
          <h3 className="text-sm font-bold text-foreground sm:text-base">
            {destination.displayLocation}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 3-Mode Tab Bar */}
          <div
            className="inline-flex flex-wrap rounded-xl border border-border bg-surface-soft p-1"
            role="tablist"
            aria-label="Chọn chế độ nhìn xung quanh 360 độ"
          >
            <button
              type="button"
              role="tab"
              aria-selected={cameraMode === 'streetview'}
              onClick={() => setCameraMode('streetview')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                cameraMode === 'streetview'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Street View 360°</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={cameraMode === 'sphere-360'}
              onClick={() => setCameraMode('sphere-360')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                cameraMode === 'sphere-360'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Orbit className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Toàn Cảnh 360° Sphere</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={cameraMode === 'flycam-map'}
              onClick={() => setCameraMode('flycam-map')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                cameraMode === 'flycam-map'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Flycam 3D Vệ Tinh</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            aria-label={isFullscreen ? 'Thu nhỏ khung xem 360°' : 'Mở rộng toàn màn hình 360°'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-soft text-foreground transition-colors hover:border-primary hover:text-primary"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {!isEmbedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng trình xem Street View 360°"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-soft text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* GeoGuessr Spot Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-soft px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            ĐIỂM ĐỨNG 360°:
          </span>
          {vantagePoints.map((vp, idx) => {
            const isActive = idx === selectedVantageIndex;
            return (
              <button
                key={vp.id}
                type="button"
                onClick={() => handleSelectVantage(idx)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent'
                }`}
              >
                <Camera className="h-3 w-3" aria-hidden="true" />
                <span>
                  Điểm #{idx + 1}: {vp.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mode-specific quick tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:border-primary hover:text-primary"
            title="Quay về góc nhìn xuất phát (Return to Start)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Quay về xuất phát</span>
          </button>

          {cameraMode === 'streetview' && (
            <a
              href={svExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mở Google Street View</span>
            </a>
          )}

          {cameraMode === 'sphere-360' && (
            <>
              <button
                type="button"
                onClick={() => setIsAutoPanning((p) => !p)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                  isAutoPanning
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary'
                }`}
              >
                {isAutoPanning ? (
                  <>
                    <Pause className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span>Dừng xoay</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span>Tự xoay 360°</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setLighting('dawn')}
                  className={`rounded px-1.5 py-0.5 font-bold ${
                    lighting === 'dawn'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Ánh sáng Bình minh"
                >
                  <Sunrise className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setLighting('day')}
                  className={`rounded px-1.5 py-0.5 font-bold ${
                    lighting === 'day'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Ánh sáng Ban ngày"
                >
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setLighting('sunset')}
                  className={`rounded px-1.5 py-0.5 font-bold ${
                    lighting === 'sunset'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Ánh sáng Hoàng hôn"
                >
                  <Sunset className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </>
          )}

          {cameraMode === 'flycam-map' && (
            <>
              <button
                type="button"
                onClick={() => setIsOrbitingMap((o) => !o)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                  isOrbitingMap
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary'
                }`}
              >
                {isOrbitingMap ? (
                  <>
                    <Pause className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span>Dừng Orbit</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span>Xoay 360°</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  setBasemapMode((m) => (m === 'satellite' ? 'vector' : 'satellite'))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:border-primary"
              >
                <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>{basemapMode === 'satellite' ? 'Vệ Tinh' : 'Vector 3D'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main 360° / 3D Viewport Stage */}
      <div
        className={`relative w-full overflow-hidden bg-[#0e0d0c] ${
          isFullscreen ? 'flex-1 min-h-[460px]' : 'h-[440px] sm:h-[520px]'
        }`}
      >
        {/* ============================================================
            MODE 1: REAL GOOGLE STREET VIEW 360° (GEOGUESSR / OPENGUESSR)
           ============================================================ */}
        {cameraMode === 'streetview' && (
          <div className="relative h-full w-full">
            {svLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/65 text-xs text-white backdrop-blur-xs">
                <Orbit className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
                <span className="font-mono font-bold">
                  Đang kết nối Google Street View 360° tại {activeVantage.label}...
                </span>
              </div>
            )}

            <iframe
              key={`${activeVantage.id}-${svResetCounter}`}
              src={svEmbedUrl}
              title={`Google Street View 360° tại ${activeVantage.label}`}
              allowFullScreen
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setSvLoading(false)}
              className="h-full w-full border-0"
            />

            {/* Top-Left GeoGuessr Info Overlay */}
            <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-2 rounded-lg bg-black/75 px-3 py-1.5 font-mono text-[11px] font-bold text-white shadow-md backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span>STREET VIEW 360° • KÉO CHUỘT ĐỂ NHÌN XUNG QUANH</span>
              </div>
              <div className="hidden max-w-sm rounded-lg border border-white/15 bg-black/70 px-3 py-1.5 text-[11px] text-white/90 backdrop-blur-md sm:block">
                <strong className="text-secondary">{activeVantage.label}:</strong>{' '}
                {activeVantage.description}
              </div>
            </div>

            {/* Bottom-Left Quick Fallback Switch to 360° Sphere */}
            <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCameraMode('sphere-360')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/80 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-md transition-colors hover:border-primary hover:bg-primary"
              >
                <Orbit className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Chuyển Toàn Cảnh 360° Sphere (có La bàn & Hotspot)</span>
              </button>
            </div>

            {/* GeoGuessr Signature Collapsible Bottom-Right Mini-Map Radar */}
            <div
              onMouseEnter={() => setMiniMapExpanded(true)}
              onMouseLeave={() => {
                if (!miniMapPinned) setMiniMapExpanded(false);
              }}
              className={`absolute right-3 bottom-3 z-30 overflow-hidden rounded-xl border-2 border-white/40 bg-card shadow-2xl transition-all duration-300 ${
                miniMapExpanded || miniMapPinned
                  ? 'h-56 w-72 sm:h-64 sm:w-80'
                  : 'h-32 w-44 sm:h-36 sm:w-52'
              }`}
            >
              {/* Mini-Map Header */}
              <div className="absolute top-1.5 right-1.5 left-1.5 z-20 flex items-center justify-between gap-1">
                <span className="rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                  RADAR ĐIỂM ĐỨNG ({vantagePoints.length})
                </span>
                <button
                  type="button"
                  onClick={() => setMiniMapPinned((p) => !p)}
                  aria-label={miniMapPinned ? 'Bỏ ghim bản đồ mini' : 'Ghim mở rộng bản đồ mini'}
                  className="inline-flex h-6 w-6 items-center justify-center rounded bg-black/80 text-white hover:bg-primary"
                  title={miniMapPinned ? 'Thu gọn khi rời chuột' : 'Ghim mở rộng bản đồ'}
                >
                  {miniMapPinned ? (
                    <PinOff className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Pin className="h-3 w-3" aria-hidden="true" />
                  )}
                </button>
              </div>

              <MapView
                ref={miniMapRef}
                center={[
                  (activeVantage.streetViewLatLng ?? activeVantage.coordinates)[1],
                  (activeVantage.streetViewLatLng ?? activeVantage.coordinates)[0],
                ]}
                zoom={13}
                className="h-full w-full"
              >
                {vantagePoints.map((vp, idx) => {
                  const [vLat, vLng] = vp.streetViewLatLng ?? vp.coordinates;
                  const isCurrent = idx === selectedVantageIndex;
                  return (
                    <MapMarker
                      key={vp.id}
                      longitude={vLng}
                      latitude={vLat}
                      onClick={() => handleSelectVantage(idx)}
                    >
                      <MarkerContent>
                        <button
                          type="button"
                          title={`Nhảy tới ${vp.label}`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 font-mono text-[10px] font-extrabold shadow-md transition-transform hover:scale-125 ${
                            isCurrent
                              ? 'scale-110 border-white bg-primary text-primary-foreground ring-4 ring-primary/40'
                              : 'border-primary bg-card text-foreground'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      </MarkerContent>
                    </MapMarker>
                  );
                })}
              </MapView>
            </div>
          </div>
        )}

        {/* ============================================================
            MODE 2: INTERACTIVE 360° DRAG-TO-LOOK SPHERE (GEOGUESSR / PANNELLUM)
           ============================================================ */}
        {cameraMode === 'sphere-360' && (
          <div
            onPointerDown={handleSpherePointerDown}
            onPointerMove={handleSpherePointerMove}
            onPointerUp={handleSpherePointerUp}
            onPointerCancel={handleSpherePointerUp}
            onWheel={handleSphereWheel}
            className={`relative h-full w-full touch-none overflow-hidden select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Seamless 360° Cylindrical Tiled Panorama Strip */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                isStepping ? 'scale-105 opacity-75' : 'opacity-100'
              }`}
              style={{
                transform: `scale(${fovZoom}) translateY(${spherePitch * 0.45}%)`,
                transition: isDragging ? 'none' : 'transform 160ms ease-out',
              }}
            >
              <div
                className="relative flex h-full w-[300%]"
                style={{
                  transform: `translate3d(${stripTranslatePercent / 3}%, 0, 0)`,
                }}
              >
                {[-1, 0, 1].map((tileIdx) => (
                  <div key={tileIdx} className="relative h-full w-1/3 shrink-0 overflow-hidden">
                    <img
                      src={sphereImgSrc}
                      alt={activeVantage.label}
                      draggable={false}
                      onError={() => setSphereImgSrc(FALLBACK_360_IMG)}
                      className={`h-full w-full object-cover ${lightingFilterClass} ${
                        tileIdx % 2 !== 0 ? '-scale-x-100' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
            </div>

            {/* GeoGuessr Linear Top Compass Bar */}
            <div className="pointer-events-none absolute top-3 right-0 left-0 z-20 flex flex-col items-center gap-1.5 px-4">
              <GeoGuessrCompassBar yaw={yaw} />
              <span className="rounded-full bg-black/65 px-3 py-0.5 font-mono text-[10px] font-bold text-white/90 backdrop-blur-xs">
                Kéo ngang/dọc để xoay 360° • Cuộn chuột để Zoom • Bấm mũi tên dưới đất để di chuyển
              </span>
            </div>

            {/* 360° Horizon POI Hotspots (Appear dynamically as you look around!) */}
            {highlightHotspots.map(({ highlight, yawAngle, pitchAngle }, idx) => {
              const deltaYaw = getShortestAngleDelta(yawAngle, yaw);
              if (Math.abs(deltaYaw) > 65) return null; // Outside current FOV
              const leftPercent = 50 + (deltaYaw / 60) * 46;
              const topPercent = 48 + (pitchAngle - spherePitch) * 0.8;
              const isSelectedSpot = activeHotspotId === highlight.id;
              const isClipped = selectedHighlightIds.includes(highlight.id);

              return (
                <div
                  key={highlight.id}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspotId(highlight.id)}
                    className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition-transform hover:scale-110 ${
                      isSelectedSpot
                        ? 'border-white bg-primary text-primary-foreground ring-4 ring-primary/40'
                        : isClipped
                          ? 'border-primary bg-accent/95 text-accent-foreground'
                          : 'border-white/85 bg-black/75 text-white hover:border-primary'
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="max-w-[165px] truncate">{highlight.title}</span>
                    <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                      {idx + 1}
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Right-side GeoGuessr Zoom (+/-) Controls */}
            <div className="absolute top-1/2 right-3 z-20 flex -translate-y-1/2 flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setFovZoom((z) => Math.min(2.1, Number((z + 0.15).toFixed(2))))}
                aria-label="Phóng to góc nhìn 360°"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-black/75 text-white shadow-lg backdrop-blur-md hover:border-primary hover:bg-primary"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setFovZoom((z) => Math.max(1.08, Number((z - 0.15).toFixed(2))))}
                aria-label="Thu nhỏ góc nhìn 360°"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-black/75 text-white shadow-lg backdrop-blur-md hover:border-primary hover:bg-primary"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* On-Ground 3D Street View Walking Chevrons (GeoGuessr signature!) */}
            <div
              className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3"
              style={{ perspective: '420px' }}
            >
              <button
                type="button"
                onClick={() => handleSelectVantage(selectedVantageIndex - 1)}
                title="Quay lại điểm đứng trước"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-black/65 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-primary hover:bg-primary"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectVantage(selectedVantageIndex + 1)}
                style={{ transform: 'rotateX(38deg)' }}
                className="group flex flex-col items-center gap-0.5 rounded-2xl border-2 border-white/85 bg-primary/90 px-5 py-2 text-xs font-extrabold text-primary-foreground shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:bg-primary"
              >
                <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Đi tới điểm kế tiếp
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectVantage(selectedVantageIndex + 1)}
                title="Chuyển sang điểm đứng tiếp theo"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/70 bg-black/65 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-primary hover:bg-primary"
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Bottom-Left Active Vantage Caption */}
            <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden max-w-xs rounded-xl border border-white/20 bg-black/75 p-3 text-xs text-white backdrop-blur-md lg:block">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-secondary">
                <Eye className="h-3 w-3" aria-hidden="true" />
                <span>{activeVantage.label}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/90">
                {activeVantage.description}
              </p>
            </div>

            {/* Bottom-Right Active POI Hotspot Quick Pin Card */}
            {activeHotspotId && (
              <div className="absolute right-4 bottom-4 z-20 hidden w-64 rounded-xl border border-primary/50 bg-card/95 p-3 text-xs text-foreground shadow-xl backdrop-blur-md md:block">
                {(() => {
                  const spot =
                    destination.highlights.find((h) => h.id === activeHotspotId) ??
                    destination.highlights[0];
                  if (!spot) return null;
                  const isChecked = selectedHighlightIds.includes(spot.id);
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-extrabold uppercase text-primary">
                          ĐIỂM VUI CHƠI TRONG TẦM NHÌN
                        </span>
                        <span className="font-mono text-[10px] font-bold text-primary">
                          {spot.estimatedCost}
                        </span>
                      </div>
                      <p className="font-bold text-foreground">{spot.title}</p>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">
                        {spot.description}
                      </p>
                      {onToggleHighlight && (
                        <button
                          type="button"
                          onClick={() => onToggleHighlight(spot.id, destination.id)}
                          className={`mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                            isChecked
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-primary/40 bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                          }`}
                        >
                          {isChecked ? (
                            <>
                              <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Đã ghim vào lịch trình</span>
                            </>
                          ) : (
                            <>
                              <Square className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Tích chọn điểm vui chơi</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            MODE 3: FLYCAM 3D SATELLITE / VECTOR ORBIT (MAPLIBRE 3D)
           ============================================================ */}
        {cameraMode === 'flycam-map' && (
          <div className="relative h-full w-full">
            <MapView
              ref={mapRef}
              center={[
                (activeVantage.streetViewLatLng ?? activeVantage.coordinates)[1],
                (activeVantage.streetViewLatLng ?? activeVantage.coordinates)[0],
              ]}
              zoom={mapZoom}
              pitch={mapPitch}
              bearing={mapBearing}
              maxPitch={78}
              styles={mapStyles}
              onViewportChange={(vp) => {
                setMapPitch(Math.round(vp.pitch));
                setMapBearing(Math.round(vp.bearing));
                setMapZoom(Number(vp.zoom.toFixed(1)));
              }}
              className="h-full w-full"
            >
              {/* Main Flycam Pin */}
              <MapMarker
                longitude={(activeVantage.streetViewLatLng ?? activeVantage.coordinates)[1]}
                latitude={(activeVantage.streetViewLatLng ?? activeVantage.coordinates)[0]}
              >
                <MarkerContent>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/30">
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  </div>
                </MarkerContent>
                <MarkerLabel position="top">
                  <span className="rounded-md bg-card/95 px-2.5 py-1 font-mono text-[11px] font-extrabold text-foreground shadow-md">
                    {activeVantage.label} ({activeVantage.altitudeMeters}m)
                  </span>
                </MarkerLabel>
              </MapMarker>

              {/* Floating 3D Highlight Pins */}
              {highlightHotspots.map(({ highlight, lat, lng }, idx) => {
                const isChecked = selectedHighlightIds.includes(highlight.id);
                return (
                  <MapMarker
                    key={highlight.id}
                    longitude={lng}
                    latitude={lat}
                    onClick={() => {
                      setActiveHotspotId(highlight.id);
                      mapRef.current?.flyTo({
                        center: [lng, lat],
                        pitch: 68,
                        bearing: (idx * 65 - 30) % 360,
                        zoom: 16,
                        duration: 1300,
                        essential: true,
                      });
                    }}
                  >
                    <MarkerContent>
                      <button
                        type="button"
                        className={`flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-extrabold shadow-lg transition-transform hover:scale-110 ${
                          isChecked
                            ? 'border-white bg-primary text-primary-foreground'
                            : 'border-primary bg-card/95 text-foreground'
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <span>#{idx + 1}</span>
                      </button>
                    </MarkerContent>
                    <MarkerLabel position="bottom">
                      <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        {highlight.title}
                      </span>
                    </MarkerLabel>
                  </MapMarker>
                );
              })}
            </MapView>

            {/* Flycam HUD Telemetry Pill */}
            <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 rounded-lg bg-black/75 px-3 py-1.5 font-mono text-[11px] font-bold text-white backdrop-blur-md">
              <span className="text-primary">FLYCAM 3D</span>
              <span>|</span>
              <span>ALT: {activeVantage.altitudeMeters}m</span>
              <span>|</span>
              <span>PITCH: {mapPitch}°</span>
              <span>|</span>
              <span>HDG: {normalizeAngle360(mapBearing)}°</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Telemetry / Gimbal Controls & Direct Booking CTAs */}
      <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {cameraMode === 'flycam-map' ? (
            <>
              <label className="flex items-center gap-2 font-mono">
                <span className="font-bold text-muted-foreground">Pitch 3D:</span>
                <input
                  type="range"
                  min={0}
                  max={75}
                  value={mapPitch}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMapPitch(val);
                    mapRef.current?.setPitch(val);
                  }}
                  className="h-1.5 w-24 accent-primary"
                />
                <span className="w-8 font-bold text-foreground">{mapPitch}°</span>
              </label>

              <label className="flex items-center gap-2 font-mono">
                <span className="font-bold text-muted-foreground">Xoay 360°:</span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={normalizeAngle360(mapBearing)}
                  onChange={(e) => {
                    setIsOrbitingMap(false);
                    const val = Number(e.target.value);
                    setMapBearing(val);
                    mapRef.current?.setBearing(val);
                  }}
                  className="h-1.5 w-24 accent-primary"
                />
                <span className="w-10 font-bold text-foreground">
                  {Math.round(normalizeAngle360(mapBearing))}°
                </span>
              </label>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground">
                GPS: {(activeVantage.streetViewLatLng ?? activeVantage.coordinates)[0].toFixed(4)}°N,{' '}
                {(activeVantage.streetViewLatLng ?? activeVantage.coordinates)[1].toFixed(4)}°E
              </span>
              <span aria-hidden="true">•</span>
              <span>
                Khung giờ vàng: <strong className="text-primary">{activeVantage.bestTime}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Direct Conversion CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={travelUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong bg-surface-soft px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-accent"
          >
            <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Lập lộ trình tới đây</span>
          </Link>

          <Link
            href={searchUrl}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep"
          >
            <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Đặt vé xe đi {destination.province} ({destination.busPriceFormatted})
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Destination3DCameraModal({
  destination,
  isOpen = true,
  onClose,
  selectedHighlightIds = [],
  onToggleHighlight,
}: Destination3DCameraModalProps) {
  useEffect(() => {
    if (!destination || !isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destination, isOpen, onClose]);

  if (!destination || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Street View 360° tại ${destination.displayLocation}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hn-sheet-up w-full max-w-6xl shadow-2xl">
        <Destination3DCameraView
          destination={destination}
          selectedHighlightIds={selectedHighlightIds}
          onToggleHighlight={onToggleHighlight}
          isEmbedded={false}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
