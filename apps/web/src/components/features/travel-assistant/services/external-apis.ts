import { DAY_TIME_LIMIT_HOURS } from '../types';
import { TRANSPORT_RATES } from '../data/city-guides';
import type {
  AnalysisResult,
  DayRoutePreview,
  DeparturePoint,
  LocalTransportOption,
  NominatimResult,
  OSRMProfile,
  OSRMRouteResult,
  TravelPlace,
} from '../types';

const WIKI_TITLE_ALIASES: Record<string, string> = {
  'Dragon_Bridge,_Da_Nang,_Vietnam': 'Dragon_Bridge_(Da_Nang)',
  'My_Khe_beach_2': 'My_Khe_Beach',
  'Son_Tra_Da_Nang': 'Sơn_Trà_Mountain',
  'Ngu_Hanh_Son_Da_Nang': 'Marble_Mountains_(Vietnam)',
  'Golden_Bridge_(Ba_Na_Hills)': 'Golden_Bridge_(Vietnam)',
  'Chua_Linh_Ung_Son_Tra': 'Linh_Ung_Pagoda',
  'Nhat_Le_beach_Quang_Binh': 'Nhật_Lệ_Beach',
  'Quang_Phu_sand_dunes': 'Quang_Phu_Sand_Dunes',
  'Hoi_An_Ancient_Town': 'Hoi_An',
  'Japanese_Bridge,_Hoi_An': 'Japanese_Covered_Bridge',
  'Nha_Trang_Beach': 'Nha_Trang',
  'Vinpearl_Land_Nha_Trang': 'VinWonders_Nha_Trang',
  'Xuan_Huong_Lake': 'Xuân_Hương_Lake',
  'Cu_Lan_Village': 'Cù_Lần_Village',
};

type WikiSearchResponse = {
  query?: {
    pages?: Record<string, {
      thumbnail?: {
        source?: string;
      };
    }>;
  };
};

function getWikiImageFromSummary(data: any): string {
  return data.thumbnail?.source ?? data.originalimage?.source ?? '';
}

export async function fetchWikiImage(slug: string, searchQuery: string): Promise<string> {
  const title = WIKI_TITLE_ALIASES[slug] ?? slug;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      const image = getWikiImageFromSummary(data);
      if (image) return image;
    }
  } catch {
    // Fall through to MediaWiki search below.
  }

  try {
    const search = new URL('https://en.wikipedia.org/w/api.php');
    search.searchParams.set('action', 'query');
    search.searchParams.set('generator', 'search');
    search.searchParams.set('gsrsearch', `${searchQuery} Vietnam`);
    search.searchParams.set('gsrlimit', '1');
    search.searchParams.set('prop', 'pageimages');
    search.searchParams.set('piprop', 'thumbnail');
    search.searchParams.set('pithumbsize', '640');
    search.searchParams.set('format', 'json');
    search.searchParams.set('origin', '*');

    const res = await fetch(search.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) return '';
    const data = (await res.json()) as WikiSearchResponse;
    const page = Object.values(data.query?.pages ?? {})[0];
    return page?.thumbnail?.source ?? '';
  } catch {
    return '';
  }
}

export function formatDirectionDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getManeuverIcon(type?: string, modifier?: string): string {
  if (type === 'arrive') return 'Đến';
  if (type === 'depart') return 'Đi';
  if (modifier?.includes('left')) return modifier.includes('slight') ? '↖' : '↰';
  if (modifier?.includes('right')) return modifier.includes('slight') ? '↗' : '↱';
  if (type === 'continue' || type === 'straight' || modifier === 'straight') return '↑';
  return '↗';
}

function getDirectionInstruction(type?: string, modifier?: string): string {
  if (type === 'arrive') return 'Đến nơi';
  if (type === 'depart') return 'Bắt đầu';
  if (modifier?.includes('left')) return 'Rẽ trái';
  if (modifier?.includes('right')) return 'Rẽ phải';
  return 'Đi thẳng';
}

export async function getOSRMRoute(waypoints: Array<{ lat: number; lng: number }>, profile: OSRMProfile = 'driving'): Promise<OSRMRouteResult> {
  const coords = waypoints.map((point) => `${point.lng},${point.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  const data = await res.json() as {
    routes?: Array<{
      geometry?: {
        coordinates?: Array<[number, number]>;
      };
      legs?: Array<{
        steps?: Array<{
          name?: string;
          distance?: number;
          maneuver?: {
            type?: string;
            modifier?: string;
          };
          geometry?: {
            coordinates?: Array<[number, number]>;
          };
        }>;
      }>;
    }>;
  };

  const route = data.routes?.[0];
  const geometry = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];
  const legs = route?.legs?.map((leg, legIndex) =>
    (leg.steps ?? []).map((step, stepIndex) => {
      const type = step.maneuver?.type;
      const modifier = step.maneuver?.modifier;
      const streetName = step.name || 'đường chưa đặt tên';
      const instruction = getDirectionInstruction(type, modifier);

      return {
        id: `${legIndex}-${stepIndex}`,
        legIndex,
        instruction,
        streetName,
        distance: step.distance ?? 0,
        icon: getManeuverIcon(type, modifier),
        points: step.geometry?.coordinates?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [],
      };
    })
  ) ?? [];

  return { geometry, legs };
}

export async function searchDeparture(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=vn`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'vi' },
  });

  if (!res.ok) return [];

  return await res.json() as NominatimResult[];
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'vi' },
  });

  if (!res.ok) return 'Vị trí hiện tại';

  const data = await res.json() as { display_name?: string };
  return data.display_name || 'Vị trí hiện tại';
}

export async function requestTripAnalysis(params: {
  departurePoint: DeparturePoint;
  selectedPlaces: TravelPlace[];
  dayCount: number;
  dayRoutePreviews: DayRoutePreview[];
  localTransport: LocalTransportOption;
}): Promise<AnalysisResult> {
  const { departurePoint, selectedPlaces, dayCount, dayRoutePreviews, localTransport } = params;
  const prompt = `
    Bạn là một trợ lý du lịch AI chuyên nghiệp, hãy tạo một lịch trình du lịch tối ưu và phân tích chi phí cho chuyến đi.
    Dựa trên điểm xuất phát, các địa điểm đã chọn và phương tiện di chuyển nội đô, hãy tạo một lộ trình tối ưu nhất.
    Sau đó, phân tích chi phí cho từng chặng di chuyển và từng địa điểm tham quan/dịch vụ.

    Điểm xuất phát: ${departurePoint.label} (${departurePoint.lat}, ${departurePoint.lng})
    Các địa điểm đã chọn: ${selectedPlaces.map((p) => p.name).join(', ')}
    Số ngày vui chơi: ${dayCount}
    Kế hoạch hiện tại theo ngày:
    ${dayRoutePreviews
      .map(
        (day) =>
          `Ngày ${day.day}, xuất phát ${day.startTime}: ${
            day.places.map((place) => `${place.name} (${place.durationHours} giờ)`).join(', ') ||
            'Chưa có địa điểm'
          }; tổng ước tính ${day.totalHours.toFixed(1)} giờ`,
      )
      .join('\n    ')}
    Phương tiện di chuyển nội đô: ${localTransport.label}

    Yêu cầu đầu ra JSON chính xác theo cấu trúc AnalysisResult (days, optimizedRoute, routeExplanation, totalSummary, stops, transportTips, totalDistanceKm).
    Calculate transport costs using these rates:
    ${Object.entries(TRANSPORT_RATES)
      .map(([, value]) => `- ${value.label}: ${value.min}-${value.max}đ/km`)
      .join('\n    ')}
    Chia lịch theo đúng ${dayCount} ngày, mỗi ngày tối đa khoảng ${DAY_TIME_LIMIT_HOURS} giờ.
  `;

  const res = await fetch('/api/analyze-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi phân tích AI');
  }
  return data as AnalysisResult;
}
