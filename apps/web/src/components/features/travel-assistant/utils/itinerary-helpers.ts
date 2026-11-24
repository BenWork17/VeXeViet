import type { SyntheticEvent } from 'react';
import type { Route } from '@vexeviet/types';
import {
  DAY_TIME_LIMIT_HOURS,
  DEFAULT_CITY_SPEED_KMH,
  PLACEHOLDER_INK,
  PLACEHOLDER_TONE,
  type DayPlan,
  type DeparturePoint,
  type OSRMProfile,
  type PlaceDetails,
  type StartPoint,
  type TransportOption,
  type TravelPlace,
} from '../types';
import { PLACE_DETAILS } from '../data/city-guides';

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRouteTime(value?: string): string {
  if (!value) return 'Đang cập nhật';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return value;
}

export function getMapCenter(places: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (!places.length) return { lat: 16.0544, lng: 108.2022 };
  return {
    lat: places.reduce((total, place) => total + place.lat, 0) / places.length,
    lng: places.reduce((total, place) => total + place.lng, 0) / places.length,
  };
}

export function getMapZoom(places: TravelPlace[]): number {
  if (places.length < 2) return 13;
  const latSpan = Math.max(...places.map((place) => place.lat)) - Math.min(...places.map((place) => place.lat));
  const lngSpan = Math.max(...places.map((place) => place.lng)) - Math.min(...places.map((place) => place.lng));
  const span = Math.max(latSpan, lngSpan);
  if (span > 0.35) return 10;
  if (span > 0.14) return 11;
  if (span > 0.07) return 12;
  return 13;
}

export function getDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const latDelta = (to.lat - from.lat) * 111;
  const avgLat = ((from.lat + to.lat) / 2) * (Math.PI / 180);
  const lngDelta = (to.lng - from.lng) * 111 * Math.cos(avgLat);
  return Math.sqrt(latDelta * latDelta + lngDelta * lngDelta);
}

export function toLngLat(points: Array<[number, number]>): Array<[number, number]> {
  return points.map(([lat, lng]) => [lng, lat]);
}

export function getRouteStopProgresses(
  roadRoute: Array<[number, number]>,
  stops: Array<{ lat: number; lng: number }>
): number[] {
  if (roadRoute.length < 2) return stops.map(() => 0);

  const cumulative = [0];
  let total = 0;
  for (let index = 1; index < roadRoute.length; index += 1) {
    const [previousLat, previousLng] = roadRoute[index - 1]!;
    const [lat, lng] = roadRoute[index]!;
    total += getDistanceKm({ lat: previousLat, lng: previousLng }, { lat, lng });
    cumulative.push(total);
  }

  return stops.map((stop) => {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    roadRoute.forEach(([lat, lng], index) => {
      const distance = getDistanceKm(stop, { lat, lng });
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return total > 0 ? Math.max(0, Math.min(1, cumulative[nearestIndex]! / total)) : 0;
  });
}

export function getSuggestedRoute(startPoint: StartPoint, places: TravelPlace[]): Array<StartPoint | TravelPlace> {
  const remaining = [...places];
  const route: Array<StartPoint | TravelPlace> = [startPoint];
  let current: { lat: number; lng: number } = startPoint;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    remaining.forEach((place, index) => {
      const distance = getDistanceKm(current, place);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const [nearestPlace] = remaining.splice(nearestIndex, 1);
    if (!nearestPlace) break;
    route.push(nearestPlace);
    current = nearestPlace;
  }

  return route;
}

export function getClosedSuggestedRoute(startPoint: StartPoint, places: TravelPlace[]): Array<StartPoint | TravelPlace> {
  const route = getSuggestedRoute(startPoint, places);
  if (places.length === 0) return route;
  return [...route, startPoint];
}

export function getRouteDistance(route: Array<StartPoint | TravelPlace>): number {
  if (route.length < 2) return 0;

  return route.slice(1).reduce((total, stop, index) => {
    return total + getDistanceKm(route[index]!, stop);
  }, 0);
}

export function createEmptyDayPlans(dayCount: number): DayPlan[] {
  return Array.from({ length: dayCount }, (_, index) => ({ day: index + 1, startTime: '08:00', placeIds: [] }));
}

export function estimateTravelHours(distanceKm: number): number {
  return distanceKm / DEFAULT_CITY_SPEED_KMH;
}

export function getDayVisitHours(places: TravelPlace[]): number {
  return places.reduce((total, place) => total + place.durationHours, 0);
}

export function getDayTotalHours(startPoint: StartPoint, places: TravelPlace[]): number {
  const route = getClosedSuggestedRoute(startPoint, places);
  return getDayVisitHours(places) + estimateTravelHours(getRouteDistance(route));
}

export function distributePlacesAcrossDays(places: TravelPlace[], startPoint: StartPoint, dayCount: number): DayPlan[] {
  const plans = createEmptyDayPlans(dayCount);
  const remaining = [...places].sort((a, b) => b.durationHours - a.durationHours);

  remaining.forEach((place) => {
    let targetDayIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    plans.forEach((plan, index) => {
      const dayPlaces = plan.placeIds
        .map((id) => places.find((item) => item.id === id))
        .filter(Boolean) as TravelPlace[];
      const nextPlaces = [...dayPlaces, place];
      const nextHours = getDayTotalHours(startPoint, nextPlaces);
      const overflow = Math.max(0, nextHours - DAY_TIME_LIMIT_HOURS);
      const score = overflow * 100 + nextHours;

      if (score < bestScore) {
        bestScore = score;
        targetDayIndex = index;
      }
    });

    plans[targetDayIndex]?.placeIds.push(place.id);
  });

  return plans;
}

export function fitDayPlansToCount(plans: DayPlan[], dayCount: number, selectedIds: string[], places: TravelPlace[], startPoint: StartPoint): DayPlan[] {
  const selectedSet = new Set(selectedIds);
  const cleanedPlans = createEmptyDayPlans(dayCount);

  plans.forEach((plan, index) => {
    if (index >= dayCount) return;
    cleanedPlans[index]!.startTime = plan.startTime || cleanedPlans[index]!.startTime;
    cleanedPlans[index]!.placeIds = plan.placeIds.filter((id) => selectedSet.has(id));
  });

  const assignedIds = new Set(cleanedPlans.flatMap((plan) => plan.placeIds));
  const missingPlaces = places.filter((place) => selectedSet.has(place.id) && !assignedIds.has(place.id));

  if (missingPlaces.length === 0) return cleanedPlans;

  const distributedMissing = distributePlacesAcrossDays(missingPlaces, startPoint, dayCount);
  distributedMissing.forEach((plan, index) => {
    cleanedPlans[index]!.placeIds.push(...plan.placeIds);
  });

  return cleanedPlans;
}

export function movePlaceBetweenDayPlans(plans: DayPlan[], placeId: string, targetDayIndex: number, targetIndex?: number): DayPlan[] {
  const nextPlans = plans.map((plan) => ({
    ...plan,
    placeIds: plan.placeIds.filter((id) => id !== placeId),
  }));
  const targetPlan = nextPlans[targetDayIndex];
  if (!targetPlan) return nextPlans;

  const insertIndex = Math.max(0, Math.min(targetIndex ?? targetPlan.placeIds.length, targetPlan.placeIds.length));
  targetPlan.placeIds.splice(insertIndex, 0, placeId);
  return nextPlans;
}

export function toDeparturePoint(point: StartPoint): DeparturePoint {
  return {
    ...point,
    label: point.name,
  };
}

export function getTransportProfile(option: TransportOption | null, localTransport: { label: string } | null): OSRMProfile {
  const label = (localTransport?.label || option?.label || '').toLowerCase();

  if (label.includes('đi bộ') || label.includes('walking')) return 'walking';
  if (label.includes('xe máy')) return 'driving';
  if (label.includes('ô tô') || label.includes('taxi') || label.includes('grab') || label.includes('xe riêng')) return 'driving';
  if (label.includes('xe buýt') || label.includes('buýt') || label.includes('bus') || label.includes('xe khách')) return 'driving';

  return 'driving';
}

export function getPlaceImageUrl(place: TravelPlace, width = 320, height = 200): string {
  // This function is no longer needed as LandmarkImage component handles image fetching
  // It's kept as a fallback for non-LandmarkImage usage, but will return a placeholder
  return `https://placehold.co/${width}x${height}/${PLACEHOLDER_TONE}/${PLACEHOLDER_INK}?text=${encodeURIComponent(place.name)}`;
}

export function getPlaceDetails(place: TravelPlace): PlaceDetails {
  return PLACE_DETAILS[place.id] ?? {
    desc: place.description + ' Đây là điểm dừng dễ kết hợp trong lịch trình, phù hợp để tham quan và chụp ảnh trong ngày.',
    tip: 'Đi vào buổi sáng hoặc chiều muộn để thời tiết dễ chịu hơn.',
    hours: 'Đang cập nhật',
    activities: getPlaceTags(place, place.name).map((tag) => tag.replace(/^[^\s]+ /, '')),
    keywords: [place.name + ' Vietnam', 'Vietnam travel', 'Vietnam landmark', 'Vietnam local culture'],
    photoId: '1528127269322-539801943592', // Fallback Unsplash ID
  };
}

export function getPlaceGalleryUrls(place: TravelPlace): string[] {
  // This function is no longer needed as LandmarkImage component handles image fetching
  // It's kept as a fallback for non-LandmarkImage usage, but will return a placeholder
  return [`https://placehold.co/640x400/${PLACEHOLDER_TONE}/${PLACEHOLDER_INK}?text=${encodeURIComponent(place.name)}`];
}

export function handlePlaceImageError(event: SyntheticEvent<HTMLImageElement>, place: TravelPlace) {
  event.currentTarget.src = `https://placehold.co/320x200/${PLACEHOLDER_TONE}/${PLACEHOLDER_INK}?text=${encodeURIComponent(place.name)}`;
  event.currentTarget.style.objectFit = 'cover';
}

export function getPlaceDistrict(place: TravelPlace, cityName: string): string {
  const name = place.name.toLowerCase();

  if (name.includes('mỹ khê') || name.includes('son tra') || name.includes('sơn trà') || name.includes('linh ứng')) return 'Sơn Trà';
  if (name.includes('ngũ hành')) return 'Ngũ Hành Sơn';
  if (name.includes('cầu rồng') || name.includes('chợ cồn') || name.includes('hải sản')) return 'Hải Châu';
  if (name.includes('đại nội') || name.includes('thiên mụ') || name.includes('sông hương') || name.includes('bún bò')) return 'TP Huế';
  if (name.includes('nhật lệ') || name.includes('đồng hới') || name.includes('quang phú')) return 'Đồng Hới';
  if (name.includes('phong nha') || name.includes('thiên đường')) return 'Bố Trạch';

  return cityName.replace('Trung tâm ', '').replace(' - Quảng Bình', '');
}

export function getPlaceRating(place: TravelPlace): string {
  const rating = 4.4 + ((place.id.length % 6) / 10);
  return Math.min(rating, 4.9).toFixed(1);
}

export function getPlaceTags(place: TravelPlace, cityName: string): string[] {
  const name = place.name.toLowerCase();
  const tagMap: Array<[string, string[]]> = [
    ['mỹ khê', ['Lướt sóng', 'Tắm biển', 'Hoàng hôn']],
    ['bà nà', ['Cáp treo', 'Công viên', 'Săn mây']],
    ['cầu rồng', ['Check-in', 'Phun lửa T7-CN', 'Đi bộ']],
    ['ngũ hành', ['Leo núi', 'Chùa chiền', 'Điêu khắc']],
    ['bảo tàng chăm', ['Lịch sử', 'Văn hóa', 'Triển lãm']],
    ['linh ứng', ['Tâm linh', 'View biển', 'Check-in']],
    ['sơn trà', ['Động vật', 'Thiên nhiên', 'Phượt']],
    ['đại nội', ['Cung đình', 'Lịch sử', 'Check-in']],
    ['thiên mụ', ['Tâm linh', 'Sông Hương', 'Hoàng hôn']],
    ['sông hương', ['Du thuyền', 'Cầu Trường Tiền', 'Ca Huế']],
    ['bún bò', ['Ẩm thực', 'Đặc sản', 'Buổi sáng']],
    ['nhật lệ', ['Tắm biển', 'Hải sản', 'Hoàng hôn']],
    ['phong nha', ['Sông Son', 'Hang động', 'Di sản']],
    ['thiên đường', ['Hang động', 'Thạch nhũ', 'Trek nhẹ']],
    ['quang phú', ['Trượt cát', 'Check-in', 'Hoàng hôn']],
    ['hà nội', ['Phố cổ', 'Ẩm thực', 'Dạo phố']],
    ['hồ chí minh', ['Đô thị', 'Cà phê', 'Mua sắm']],
    ['hội an', ['Phố cổ', 'Đạp xe', 'Check-in']],
    ['nha trang', ['Lặn biển', 'Tắm biển', 'Tour đảo']],
    ['đà lạt', ['Thiên nhiên', 'Cà phê', 'Vườn hoa']],
  ];

  const matched = tagMap.find(([keyword]) => name.includes(keyword) || cityName.toLowerCase().includes(keyword));
  if (matched) return matched[1];

  if (place.category === 'food') return ['Ẩm thực', 'Địa phương', 'Đặc sản'];
  if (place.category === 'beach') return ['Tắm biển', 'Check-in', 'Hoàng hôn'];
  if (place.category === 'culture') return ['Lịch sử', 'Văn hóa', 'Tham quan'];
  if (place.category === 'nature') return ['Thiên nhiên', 'Dạo chơi', 'Check-in'];
  return ['Check-in', 'Tham quan', 'Nổi bật'];
}

export function getRoutePrice(route: Route): number {
  return typeof route.price === 'string' ? Number(route.price) : route.price;
}

export function getTransportOptions(routes: Route[]): TransportOption[] {
  if (routes.length > 0) {
    return [...routes]
      .sort((a, b) => getRoutePrice(a) - getRoutePrice(b))
      .slice(0, 4)
      .map((route) => ({
        id: 'route-' + route.id,
        kind: 'route',
        label: route.busType === 'LIMOUSINE' || route.busType === 'VIP' ? 'Limousine/VIP' : route.busType === 'SLEEPER' || route.busType === 'SLEEPER_BUS' ? 'Xe giường nằm' : 'Xe khách tiêu chuẩn',
        note: formatRouteTime(route.departureTime) + ' - ' + formatRouteTime(route.arrivalTime),
        price: getRoutePrice(route),
        route,
      }));
  }

  return [
    { id: 'fallback-sleeper', kind: 'fallback', label: 'Xe giường nằm', note: 'Gợi ý cho chặng dài, ưu tiên chuyến đêm.', price: 280000 },
    { id: 'fallback-limousine', kind: 'fallback', label: 'Limousine', note: 'Thoải mái hơn, hợp nhóm nhỏ hoặc gia đình.', price: 420000 },
    { id: 'fallback-standard', kind: 'fallback', label: 'Xe tiêu chuẩn', note: 'Phương án tiết kiệm chi phí.', price: 220000 },
  ];
}

export function formatVND(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ';
}
