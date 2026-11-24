import type { ReactNode } from 'react';
import type { Route } from '@vexeviet/types';

export const MAX_TRIP_DAYS = 5;
export const DAY_TIME_LIMIT_HOURS = 12;
export const DEFAULT_CITY_SPEED_KMH = 24;
export const DAY_ROUTE_COLORS = [
  'var(--color-primary)',
  'var(--color-info-ink)',
  'var(--color-warning-ink)',
  'var(--color-success-ink)',
  'var(--color-primary-deep)',
];
export const DEFAULT_DAY_ROUTE_COLOR = 'var(--color-primary)';
export const PLACEHOLDER_TONE = 'FEF3C7';
export const PLACEHOLDER_INK = '92400E';

export const ANALYSIS_STEPS = [
  'Tối ưu thứ tự địa điểm…',
  'Tính toán chi phí di chuyển…',
  'Dự đoán chi phí tham quan…',
  'Hoàn thiện lộ trình…',
];

export type PlaceCategory = 'landmark' | 'beach' | 'food' | 'culture' | 'nature';
export type TransportKind = 'route' | 'fallback';
export type OSRMProfile = 'driving' | 'walking' | 'cycling';
export type AnalysisState = 'idle' | 'loading' | 'complete';
export type RouteSimulationStatus = 'idle' | 'playing' | 'paused';

export type DayPlan = {
  day: number;
  startTime: string;
  placeIds: string[];
};

export type TravelPlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  cost: number;
  durationHours: number;
  bestTime: string;
  lat: number;
  lng: number;
  wikiSlug?: string;
  imageUrl?: string;
};

export type CostRange = { min: number; max: number };

export type StopAnalysis = {
  place: string;
  order: number;
  activityCost: {
    entranceFee: CostRange;
    servicesCost: CostRange;
    note: string;
  };
  transportFromPrevious: {
    vehicle: string;
    distanceKm: number;
    costPerKm: CostRange;
    totalCost: CostRange;
    note: string;
  };
};

export type AnalysisResult = {
  optimizedRoute: Array<StartPoint | TravelPlace>;
  routeExplanation: string;
  totalSummary: {
    activityCostTotal: CostRange;
    transportCostTotal: CostRange;
    grandTotal: CostRange;
  };
  stops: StopAnalysis[];
  transportTips: string;
  totalDistanceKm: number;
};

export type StartPoint = {
  name: string;
  lat: number;
  lng: number;
};

export type DeparturePoint = StartPoint & {
  label: string;
};

export type DayRoutePreview = {
  day: number;
  startTime: string;
  color: string;
  places: TravelPlace[];
  route: Array<StartPoint | TravelPlace>;
  visitHours: number;
  travelHours: number;
  totalHours: number;
  distanceKm: number;
};

export type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export type RouteDirectionStep = {
  id: string;
  legIndex: number;
  instruction: string;
  streetName: string;
  distance: number;
  icon: string;
  points: Array<[number, number]>;
};

export type OSRMRouteResult = {
  geometry: Array<[number, number]>;
  legs: RouteDirectionStep[][];
};

export type CityGuide = {
  center: string;
  startPoint: StartPoint;
  places: TravelPlace[];
  localTransport: Array<{ label: string; price: number; note: string }>;
};

export type TransportOption = {
  id: string;
  kind: TransportKind;
  label: string;
  note: string;
  price: number;
  route?: Route;
};

export type LocalTransportOption = {
  id: string;
  label: string;
  price: number;
  note: string;
};

export type PlaceDetails = {
  desc: string;
  tip: string;
  hours: string;
  activities: string[];
  keywords: string[];
  photoId: string;
};

export interface TripPlannerProps {
  origin: string;
  destination: string;
  departureDate?: string | null;
  routes: Route[];
  controls?: ReactNode;
  className?: string;
}
