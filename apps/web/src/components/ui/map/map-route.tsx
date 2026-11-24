"use client";

import type * as MapLibreGL from "maplibre-gl";
import type * as GeoJSON from "geojson";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMap, resolveBeforeId } from "./map-core";
import { MapMarker, type MapMarkerProps } from "./map-markers";

/** A position along a route: an endpoint, the progress cut, or a 0-1 fraction. */
type RouteAnchor = "start" | "end" | "progress" | number;

type RouteMeasure = {
  /** Distance from the first coordinate to each vertex. */
  cumulative: number[];
  /** Length of the whole route. `0` for routes with fewer than two vertices. */
  total: number;
};

const EMPTY_ROUTE_MEASURE: RouteMeasure = { cumulative: [], total: 0 };
const EMPTY_COORDINATES: [number, number][] = [];

function clampFraction(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Cumulative length along the route. Segment lengths use an equirectangular
 * approximation (longitude scaled by cos(latitude)) — accurate enough for
 * splitting a route at a fraction, and much cheaper than haversine.
 */
function measureRoute(coordinates: [number, number][]): RouteMeasure {
  if (coordinates.length < 2) return EMPTY_ROUTE_MEASURE;

  const cumulative = [0];
  let total = 0;

  for (let i = 1; i < coordinates.length; i += 1) {
    const [lng1, lat1] = coordinates[i - 1]!;
    const [lng2, lat2] = coordinates[i]!;
    const midLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
    total += Math.hypot((lng2 - lng1) * Math.cos(midLat), lat2 - lat1);
    cumulative.push(total);
  }

  return { cumulative, total };
}

/** Index of the segment that contains `distance`, clamped to the route. */
function findSegmentIndex(cumulative: number[], distance: number) {
  let low = 0;
  let high = cumulative.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cumulative[mid]! < distance) low = mid + 1;
    else high = mid;
  }

  return Math.min(low === 0 ? 0 : low - 1, cumulative.length - 2);
}

/** The [longitude, latitude] sitting `fraction` of the way along the route. */
function pointAtFraction(
  coordinates: [number, number][],
  measure: RouteMeasure,
  fraction: number,
): [number, number] | null {
  if (coordinates.length === 0) return null;
  if (coordinates.length === 1 || measure.total === 0) return coordinates[0]!;

  const target = measure.total * clampFraction(fraction);
  const index = findSegmentIndex(measure.cumulative, target);
  const [lng1, lat1] = coordinates[index]!;
  const [lng2, lat2] = coordinates[index + 1]!;
  const segment = measure.cumulative[index + 1]! - measure.cumulative[index]!;
  const ratio =
    segment === 0 ? 0 : (target - measure.cumulative[index]!) / segment;

  return [lng1 + (lng2 - lng1) * ratio, lat1 + (lat2 - lat1) * ratio];
}

/**
 * The portion of the route up to `fraction`. The final point is interpolated,
 * so the slice ends exactly at the fraction rather than at the nearest vertex.
 */
function sliceAtFraction(
  coordinates: [number, number][],
  measure: RouteMeasure,
  fraction: number,
): [number, number][] {
  if (coordinates.length < 2) return [];

  const t = clampFraction(fraction);
  if (t <= 0 || measure.total === 0) return [];
  if (t >= 1) return coordinates;

  const target = measure.total * t;
  const index = findSegmentIndex(measure.cumulative, target);
  const point = pointAtFraction(coordinates, measure, t);
  const traveled = coordinates.slice(0, index + 1);
  if (point) traveled.push(point);

  return traveled;
}

type RouteContextValue = {
  /** Resolved route id — child layers namespace themselves with it. */
  id: string;
  /** True once the base source and layer are on the map. */
  ready: boolean;
  coordinates: [number, number][];
  /** The traveled slice of the route. Empty when `progress` is unset. */
  traveled: [number, number][];
  progress: number | undefined;
  /** Base line style, with `active` overrides already applied. */
  color: string;
  width: number;
  opacity: number;
  dashArray: [number, number] | undefined;
  /** Layer the route sits below. Child layers insert before it too. */
  beforeId: string | undefined;
  /**
   * Resolves an anchor to a coordinate. `null` when the route is empty, or
   * for `"progress"` while `progress` is unset.
   */
  pointAt: (at: RouteAnchor) => [number, number] | null;
  /** Registers a child layer so it follows the route when `active` flips. */
  registerLayer: (layerId: string) => () => void;
};

const RouteContext = createContext<RouteContextValue | null>(null);

function useMapRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("Route components must be used within MapRoute");
  }
  return context;
}

type MapRouteProps = {
  /** Optional unique identifier for the route layer */
  id?: string;
  /**
   * The route as [longitude, latitude] pairs. This is the only input the
   * component needs, so any routing service works: fetch in the parent and
   * pass the geometry (for GeoJSON responses, `route.geometry.coordinates`).
   */
  coordinates: [number, number][];
  /** Line color as CSS color value (default: "#92400E") */
  color?: string;
  /** Line width in pixels (default: 3) */
  width?: number;
  /** Line opacity from 0 to 1 (default: 0.8) */
  opacity?: number;
  /** Dash pattern [dash length, gap length] for dashed lines */
  dashArray?: [number, number];
  /**
   * Fraction of the route already covered, from 0 to 1. Drives `RouteProgress`
   * and the `"progress"` anchor on `RouteMarker`.
   */
  progress?: number;
  /**
   * Marks this route as the selected one: it moves above sibling routes and
   * switches to the `active*` styles below. (default: false)
   */
  active?: boolean;
  /** Line color while `active`. Falls back to `color`. */
  activeColor?: string;
  /** Line width while `active`. Falls back to `width`. */
  activeWidth?: number;
  /** Line opacity while `active`. Falls back to `opacity`. */
  activeOpacity?: number;
  /** Dash pattern while `active`. Falls back to `dashArray`. */
  activeDashArray?: [number, number];
  /** Optional MapLibre layer id to insert the route layers before (z-order control). */
  beforeId?: string;
  /** Callback when the route line is clicked */
  onClick?: () => void;
  /** Callback when mouse enters the route line */
  onMouseEnter?: () => void;
  /** Callback when mouse leaves the route line */
  onMouseLeave?: () => void;
  /** Whether the route is interactive - shows pointer cursor on hover (default: true) */
  interactive?: boolean;
  /** Route subcomponents (RouteProgress, RouteMarker) */
  children?: ReactNode;
};

function MapRoute({
  id: propId,
  coordinates: coordinatesProp,
  color = "#92400E",
  width = 3,
  opacity = 0.8,
  dashArray,
  progress,
  active = false,
  activeColor,
  activeWidth,
  activeOpacity,
  activeDashArray,
  beforeId,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
  children,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;
  const [ready, setReady] = useState(false);

  // Callers often pass `data?.coordinates ?? []`, a fresh array each render.
  // Collapse empties to one shared instance so nothing downstream re-runs.
  const coordinates =
    coordinatesProp.length > 0 ? coordinatesProp : EMPTY_COORDINATES;

  const resolvedColor = active ? (activeColor ?? color) : color;
  const resolvedWidth = active ? (activeWidth ?? width) : width;
  const resolvedOpacity = active ? (activeOpacity ?? opacity) : opacity;
  const resolvedDashArray = active ? (activeDashArray ?? dashArray) : dashArray;

  const measure = useMemo(() => measureRoute(coordinates), [coordinates]);
  const traveled = useMemo(
    () =>
      progress === undefined
        ? []
        : sliceAtFraction(coordinates, measure, progress),
    [coordinates, measure, progress],
  );

  const pointAt = useCallback(
    (at: RouteAnchor) => {
      if (coordinates.length === 0) return null;
      if (at === "start") return coordinates[0]!;
      if (at === "end") return coordinates[coordinates.length - 1]!;
      if (at === "progress") {
        if (progress === undefined) return null;
        return pointAtFraction(coordinates, measure, progress);
      }
      return pointAtFraction(coordinates, measure, at);
    },
    [coordinates, measure, progress],
  );

  // Child layers, in the order they mounted. Kept in a ref so registering one
  // doesn't re-render the route.
  const childLayersRef = useRef<string[]>([]);
  const registerLayer = useCallback((childLayerId: string) => {
    childLayersRef.current = [...childLayersRef.current, childLayerId];
    return () => {
      childLayersRef.current = childLayersRef.current.filter(
        (entry) => entry !== childLayerId,
      );
    };
  }, []);

  // Add source and layer on mount
  useEffect(() => {
    if (!isLoaded || !map) return;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      },
    });

    map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": resolvedColor,
          "line-width": resolvedWidth,
          "line-opacity": resolvedOpacity,
          ...(resolvedDashArray && { "line-dasharray": resolvedDashArray }),
        },
      },
      resolveBeforeId(map, beforeId),
    );

    // Children add their layers once this is set, which keeps them above the
    // base line: child effects would otherwise run before this one.
    setReady(true);

    return () => {
      setReady(false);
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);

  // When coordinates change, update the source data
  useEffect(() => {
    if (!isLoaded || !map) return;

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates.length < 2 ? [] : coordinates,
        },
      });
    }
  }, [isLoaded, map, coordinates, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;

    map.setPaintProperty(layerId, "line-color", resolvedColor);
    map.setPaintProperty(layerId, "line-width", resolvedWidth);
    map.setPaintProperty(layerId, "line-opacity", resolvedOpacity);
    map.setPaintProperty(layerId, "line-dasharray", resolvedDashArray);
  }, [
    isLoaded,
    map,
    layerId,
    resolvedColor,
    resolvedWidth,
    resolvedOpacity,
    resolvedDashArray,
  ]);

  // Raise the active route (and anything it owns) above its siblings. With a
  // `beforeId` it moves to the top of the group below that layer instead.
  // Siblings that mount later (alternatives arriving from a request) add
  // their layers on top, so the raise also re-runs on style changes.
  useEffect(() => {
    if (!ready || !map || !active) return;

    // Which layers exist, ignoring their order.
    let lastLayerSet = "";

    const raise = () => {
      const order = map.getLayersOrder();

      // React only when layers are added or removed, never to a reorder.
      // `moveLayer` fires "styledata" itself, so reacting to order would loop
      // — with one route against its own move, and with two `active` routes
      // against each other, forever.
      const layerSet = [...order].sort().join("|");
      if (layerSet === lastLayerSet) return;
      lastLayerSet = layerSet;

      const owned = [layerId, ...childLayersRef.current].filter((entry) =>
        map.getLayer(entry),
      );
      if (owned.length === 0) return;

      const before = resolveBeforeId(map, beforeId);
      const limit = before ? order.indexOf(before) : order.length;
      const top = order.slice(Math.max(0, limit - owned.length), limit);
      if (owned.every((entry, index) => top[index] === entry)) return;

      for (const entry of owned) map.moveLayer(entry, before);
    };

    raise();
    map.on("styledata", raise);

    return () => {
      map.off("styledata", raise);
    };
  }, [ready, map, active, layerId, beforeId]);

  // Handle click and hover events
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;

    const handleClick = () => {
      onClick?.();
    };
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
      onMouseEnter?.();
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      onMouseLeave?.();
    };

    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);
    };
  }, [
    isLoaded,
    map,
    layerId,
    onClick,
    onMouseEnter,
    onMouseLeave,
    interactive,
  ]);

  const contextValue = useMemo(
    () => ({
      id,
      ready,
      coordinates,
      traveled,
      progress,
      color: resolvedColor,
      width: resolvedWidth,
      opacity: resolvedOpacity,
      dashArray: resolvedDashArray,
      beforeId,
      pointAt,
      registerLayer,
    }),
    [
      id,
      ready,
      coordinates,
      traveled,
      progress,
      resolvedColor,
      resolvedWidth,
      resolvedOpacity,
      resolvedDashArray,
      beforeId,
      pointAt,
      registerLayer,
    ],
  );

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  );
}

type RouteProgressProps = {
  /** Line color for the traveled portion. Defaults to the route's color. */
  color?: string;
  /** Line width in pixels. Defaults to the route's width. */
  width?: number;
  /** Line opacity from 0 to 1. Defaults to the route's opacity. */
  opacity?: number;
  /** Dash pattern [dash length, gap length] for dashed lines. */
  dashArray?: [number, number];
};

/**
 * Draws the traveled portion of the parent `MapRoute` on top of the base line.
 * Renders nothing until the route has a `progress` value.
 */
function RouteProgress({
  color,
  width,
  opacity,
  dashArray,
}: RouteProgressProps) {
  const { map, isLoaded } = useMap();
  const route = useMapRoute();
  const { ready, traveled, registerLayer, beforeId } = route;

  const sourceId = `route-progress-source-${route.id}`;
  const layerId = `route-progress-layer-${route.id}`;

  const resolvedColor = color ?? route.color;
  const resolvedWidth = width ?? route.width;
  const resolvedOpacity = opacity ?? route.opacity;

  // Added only once the parent's layer exists, so this always paints above it.
  useEffect(() => {
    if (!ready || !map) return;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      },
    });

    // Sits directly above the parent line: same `beforeId` boundary, added
    // after it.
    map.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": resolvedColor,
          "line-width": resolvedWidth,
          "line-opacity": resolvedOpacity,
          ...(dashArray && { "line-dasharray": dashArray }),
        },
      },
      resolveBeforeId(map, beforeId),
    );

    const unregister = registerLayer(layerId);

    return () => {
      unregister();
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, map]);

  useEffect(() => {
    if (!ready || !map) return;

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: traveled.length < 2 ? [] : traveled,
        },
      });
    }
  }, [ready, map, traveled, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;

    map.setPaintProperty(layerId, "line-color", resolvedColor);
    map.setPaintProperty(layerId, "line-width", resolvedWidth);
    map.setPaintProperty(layerId, "line-opacity", resolvedOpacity);
    map.setPaintProperty(layerId, "line-dasharray", dashArray);
  }, [
    isLoaded,
    map,
    layerId,
    resolvedColor,
    resolvedWidth,
    resolvedOpacity,
    dashArray,
  ]);

  return null;
}

type RouteMarkerProps = {
  /**
   * Where to pin the marker: an endpoint, the route's progress point, or a
   * 0-1 fraction along the line.
   */
  at: RouteAnchor;
} & Omit<MapMarkerProps, "longitude" | "latitude">;

/**
 * A `MapMarker` anchored to a position along the parent `MapRoute`. Takes the
 * same children as `MapMarker` (`MarkerContent`, `MarkerPopup`, ...).
 */
function RouteMarker({ at, children, ...markerProps }: RouteMarkerProps) {
  const { pointAt } = useMapRoute();
  const position = pointAt(at);

  // Nothing to pin to yet: the route is empty (coordinates usually arrive
  // from a request), or `at="progress"` is waiting on a `progress` value.
  if (!position) return null;

  return (
    <MapMarker longitude={position[0]} latitude={position[1]} {...markerProps}>
      {children}
    </MapMarker>
  );
}

export { MapRoute, RouteProgress, RouteMarker };
export type { MapRouteProps, RouteProgressProps, RouteMarkerProps, RouteAnchor };
