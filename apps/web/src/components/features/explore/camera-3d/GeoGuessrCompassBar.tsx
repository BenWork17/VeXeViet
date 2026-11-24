'use client';

import { useMemo } from 'react';
import type * as MapLibreGL from 'maplibre-gl';
import type { Camera3DVantagePoint, ExploreDestination } from '@/lib/data/explore-destinations';

export type Camera3DVantagePointItem = Camera3DVantagePoint;
export type CameraMode = 'streetview' | 'sphere-360' | 'flycam-map';
export type LightingPreset = 'dawn' | 'day' | 'sunset';
export type BasemapStyleMode = 'satellite' | 'vector';

type DestinationWithOptional3D = ExploreDestination & {
  camera3DAngles?: Camera3DVantagePointItem[];
};

export const SATELLITE_3D_STYLE: MapLibreGL.StyleSpecification = {
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

export const FALLBACK_360_IMG =
  'https://placehold.co/1600x900/1f1b18/fb923c?text=VeXeViet+360+Street+View';

export function normalizeAngle360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function getShortestAngleDelta(targetYaw: number, currentYaw: number): number {
  let diff = normalizeAngle360(targetYaw) - normalizeAngle360(currentYaw);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export function resolveVantagePoints(dest: ExploreDestination): Camera3DVantagePointItem[] {
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

export function GeoGuessrCompassBar({ yaw }: { yaw: number }) {
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
      <div className="absolute top-0 left-1/2 z-20 h-2.5 w-0.5 -translate-x-1/2 bg-primary" />
      <div className="absolute bottom-0 left-1/2 z-20 h-2 w-0.5 -translate-x-1/2 bg-primary/80" />

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

      <span className="absolute right-2.5 bottom-0.5 font-mono text-[9px] font-bold text-white/65">
        {Math.round(normalizedYaw)}°
      </span>
    </div>
  );
}
