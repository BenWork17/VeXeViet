'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import {
  Check,
  ChevronDown,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  X,
} from 'lucide-react';
import { cn } from '@vexeviet/ui';
import {
  Map as MapView,
  MapControls,
  MapMarker,
  MapPopup,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  RouteMarker,
  RouteProgress,
  useMap,
} from '@/components/ui/map';
import type { Route } from '@vexeviet/types';

const MAX_TRIP_DAYS = 5;
const DAY_TIME_LIMIT_HOURS = 12;
const DEFAULT_CITY_SPEED_KMH = 24;
const DAY_ROUTE_COLORS = [
  'var(--color-primary)',
  'var(--color-info-ink)',
  'var(--color-warning-ink)',
  'var(--color-success-ink)',
  'var(--color-primary-deep)',
];
const DEFAULT_DAY_ROUTE_COLOR = 'var(--color-primary)';

const PLACEHOLDER_TONE = 'FEF3C7';
const PLACEHOLDER_INK = '92400E';

const MAP_COLOR_VARIABLES = {
  ink: '--foreground',
  route: '--primary',
  progress: '--primary-deep',
} as const;

type MapColors = { ink: string; route: string; progress: string };

function readCssColor(variable: string): string {
  if (typeof window === 'undefined') return '';
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

function resolveMapColors(): MapColors | null {
  const colors = {
    ink: readCssColor(MAP_COLOR_VARIABLES.ink),
    route: readCssColor(MAP_COLOR_VARIABLES.route),
    progress: readCssColor(MAP_COLOR_VARIABLES.progress),
  };

  return colors.ink && colors.route && colors.progress ? colors : null;
}

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

async function fetchWikiImage(slug: string, searchQuery: string): Promise<string> {
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

const LandmarkImage = ({ wikiSlug, name, imageUrl }: { wikiSlug?: string; name: string; imageUrl?: string }) => {
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

type PlaceCategory = 'landmark' | 'beach' | 'food' | 'culture' | 'nature';
type TransportKind = 'route' | 'fallback';
type OSRMProfile = 'driving' | 'walking' | 'cycling';
type AnalysisState = 'idle' | 'loading' | 'complete';
type RouteSimulationStatus = 'idle' | 'playing' | 'paused';
type DayPlan = {
  day: number;
  startTime: string;
  placeIds: string[];
};

  type TravelPlace = {
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

  type CostRange = { min: number; max: number };

  type StopAnalysis = {
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

  type AnalysisResult = {
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

type StartPoint = {
  name: string;
  lat: number;
  lng: number;
};

type DeparturePoint = StartPoint & {
  label: string;
};

type DayRoutePreview = {
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

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type RouteDirectionStep = {
  id: string;
  legIndex: number;
  instruction: string;
  streetName: string;
  distance: number;
  icon: string;
  points: Array<[number, number]>;
};

type OSRMRouteResult = {
  geometry: Array<[number, number]>;
  legs: RouteDirectionStep[][];
};

type CityGuide = {
  center: string;
  startPoint: StartPoint;
  places: TravelPlace[];
  localTransport: Array<{ label: string; price: number; note: string }>;
};

type TransportOption = {
  id: string;
  kind: TransportKind;
  label: string;
  note: string;
  price: number;
  route?: Route;
};

type LocalTransportOption = {
  id: string;
  label: string;
  price: number;
  note: string;
};

type PlaceDetails = {
  desc: string;
  tip: string;
  hours: string;
  activities: string[];
  keywords: string[];
  photoId: string;
};

const CITY_GUIDES: Record<string, CityGuide> = {
  'Đà Nẵng': {
    center: 'Trung tâm Đà Nẵng',
    startPoint: { name: 'Khách sạn trung tâm Đà Nẵng', lat: 16.0678, lng: 108.2208 },
    places: [
      { id: 'dragon-bridge', name: 'Cầu Rồng', category: 'landmark', description: 'Biểu tượng thành phố, đẹp nhất vào buổi tối.', cost: 0, durationHours: 1, bestTime: '19:30', lat: 16.0613, lng: 108.2270, wikiSlug: 'Dragon_Bridge,_Da_Nang,_Vietnam', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/C%E1%BA%A7u_R%E1%BB%93ng.jpg/960px-C%E1%BA%A7u_R%E1%BB%93ng.jpg' },
      { id: 'my-khe', name: 'Biển Mỹ Khê', category: 'beach', description: 'Tắm biển, ngắm bình minh và ăn hải sản.', cost: 50000, durationHours: 2, bestTime: '05:30', lat: 16.0641, lng: 108.2475, wikiSlug: 'My_Khe_beach_2', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=960' },
      { id: 'son-tra', name: 'Bán đảo Sơn Trà', category: 'nature', description: 'Chùa Linh Ứng, cung đường ven biển và điểm ngắm cảnh.', cost: 80000, durationHours: 3, bestTime: '08:00', lat: 16.1188, lng: 108.2875, wikiSlug: 'Son_Tra_Da_Nang', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ban_dao_Son_Tra.jpg/960px-Ban_dao_Son_Tra.jpg' },
      { id: 'ngu-hanh-son', name: 'Ngũ Hành Sơn', category: 'culture', description: 'Hang động, chùa và làng đá mỹ nghệ.', cost: 80000, durationHours: 2, bestTime: '15:00', lat: 15.9955, lng: 108.2591, wikiSlug: 'Ngu_Hanh_Son_Da_Nang', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Ngu_hanh_son_toan_canh.jpg/960px-Ngu_hanh_son_toan_canh.jpg' },
      { id: 'seafood', name: 'Nhà hàng hải sản', category: 'food', description: 'Bữa tối hải sản gần biển Mỹ Khê.', cost: 250000, durationHours: 1.5, bestTime: '18:00', lat: 16.0677, lng: 108.2459, wikiSlug: 'Seafood_restaurant_in_Da_Nang', imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=960' },
      { id: 'con-market', name: 'Chợ Cồn', category: 'food', description: 'Ăn vặt, đặc sản địa phương, mua quà.', cost: 120000, durationHours: 1.5, bestTime: '16:00', lat: 16.0718, lng: 108.2177, wikiSlug: 'Cho_Con_Da_Nang', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=960' },
      { id: 'ba-na-hills', name: 'Bà Nà Hills', category: 'landmark', description: 'Khu du lịch nghỉ dưỡng trên núi với Cầu Vàng nổi tiếng.', cost: 750000, durationHours: 4, bestTime: '08:00', lat: 16.0189, lng: 107.9969, wikiSlug: 'Golden_Bridge_(Ba_Na_Hills)', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Golden_Bridge_at_Ba_Na_Hills_20250718.jpg/960px-Golden_Bridge_at_Ba_Na_Hills_20250718.jpg' },
      { id: 'linh-ung-pagoda', name: 'Chùa Linh Ứng', category: 'culture', description: 'Ngôi chùa lớn với tượng Phật Quan Âm cao nhất Việt Nam.', cost: 0, durationHours: 1.5, bestTime: '10:00', lat: 16.1006, lng: 108.2771, wikiSlug: 'Chua_Linh_Ung_Son_Tra', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Linh_Ung_Pagoda_18.jpg/960px-Linh_Ung_Pagoda_18.jpg' },
    ],
    // Add image URLs here in the future if needed
    localTransport: [
      { label: 'Grab/taxi nội đô', price: 350000, note: 'Phù hợp nhóm 2-4 người, linh hoạt theo điểm đã chọn.' },
      { label: 'Thuê xe máy', price: 180000, note: 'Tiết kiệm, hợp lịch Cầu Rồng - Mỹ Khê - Chợ Cồn.' },
      { label: 'Xe riêng theo ngày', price: 900000, note: 'Tốt cho gia đình hoặc lịch Sơn Trà - Ngũ Hành Sơn.' },
    ],
  },
  'Quảng Bình': {
    center: 'Đồng Hới - Quảng Bình',
    startPoint: { name: 'Khách sạn trung tâm Đồng Hới', lat: 17.4689, lng: 106.6223 },
    places: [
      { id: 'nhat-le', name: 'Biển Nhật Lệ', category: 'beach', description: 'Dạo biển, ăn hải sản và ngắm hoàng hôn.', cost: 70000, durationHours: 2, bestTime: '16:30', lat: 17.4850, lng: 106.6325, wikiSlug: 'Nhat_Le_beach_Quang_Binh' },
      { id: 'phong-nha', name: 'Phong Nha - Kẻ Bàng', category: 'nature', description: 'Di sản thiên nhiên, tour hang động nổi bật.', cost: 450000, durationHours: 5, bestTime: '08:00', lat: 17.5906, lng: 106.2836, wikiSlug: 'Phong_Nha-Ke_Bang_National_Park' },
      { id: 'thien-duong', name: 'Động Thiên Đường', category: 'nature', description: 'Hang động lớn, nên đi buổi sáng.', cost: 300000, durationHours: 3, bestTime: '09:00', lat: 17.5203, lng: 106.2269, wikiSlug: 'Paradise_Cave,_Vietnam' },
      { id: 'quang-phu', name: 'Đồi cát Quang Phú', category: 'landmark', description: 'Chụp ảnh, trượt cát, hợp chiều muộn.', cost: 60000, durationHours: 1.5, bestTime: '16:00', lat: 17.5347, lng: 106.6043, wikiSlug: 'Quang_Phu_sand_dunes' },
      { id: 'dong-hoi-food', name: 'Nhà hàng hải sản Đồng Hới', category: 'food', description: 'Hải sản và cháo canh địa phương.', cost: 220000, durationHours: 1.5, bestTime: '18:30', lat: 17.4832, lng: 106.6228, wikiSlug: 'Dong_Hoi_seafood' },
    ],
    localTransport: [
      { label: 'Taxi/Grab nội đô', price: 250000, note: 'Tốt cho Nhật Lệ, Quang Phú, trung tâm Đồng Hới.' },
      { label: 'Thuê xe máy', price: 160000, note: 'Tiết kiệm nếu chỉ đi quanh Đồng Hới.' },
      { label: 'Xe tour Phong Nha', price: 650000, note: 'Nên chọn nếu đi hang động vì quãng đường xa.' },
    ],
  },
  'Huế': {
    center: 'Trung tâm Huế',
    startPoint: { name: 'Khách sạn trung tâm Huế', lat: 16.4635, lng: 107.5904 },
    places: [
      { id: 'dai-noi', name: 'Đại Nội Huế', category: 'culture', description: 'Điểm chính để tìm hiểu cố đô.', cost: 200000, durationHours: 3, bestTime: '08:00', lat: 16.4692, lng: 107.5777, wikiSlug: 'Imperial_City,_Hue' },
      { id: 'thien-mu', name: 'Chùa Thiên Mụ', category: 'culture', description: 'Chùa cổ bên sông Hương.', cost: 30000, durationHours: 1.5, bestTime: '15:30', lat: 16.4536, lng: 107.5457, wikiSlug: 'Thien_Mu_Pagoda' },
      { id: 'song-huong', name: 'Sông Hương', category: 'landmark', description: 'Dạo thuyền hoặc đi bộ buổi tối.', cost: 150000, durationHours: 1.5, bestTime: '19:00', lat: 16.4661, lng: 107.5927, wikiSlug: 'Perfume_River' },
      { id: 'bun-bo', name: 'Bún bò Huế', category: 'food', description: 'Bữa sáng hoặc tối đặc trưng.', cost: 60000, durationHours: 1, bestTime: '07:00', lat: 16.4637, lng: 107.5909, wikiSlug: 'Bun_bo_Hue' },
      { id: 'tu-duc-tomb', name: 'Lăng Tự Đức', category: 'culture', description: 'Lăng tẩm của vua Tự Đức, kiến trúc cổ kính.', cost: 150000, durationHours: 2, bestTime: '14:00', lat: 16.4200, lng: 107.5790, wikiSlug: 'Tomb_of_Tu_Duc' },
    ],
    localTransport: [
      { label: 'Taxi nội đô', price: 280000, note: 'Hợp nhóm nhỏ và lịch Đại Nội - Thiên Mụ.' },
      { label: 'Thuê xe máy', price: 150000, note: 'Linh hoạt, phù hợp đi lăng tẩm và quán ăn.' },
      { label: 'Xích lô/kết hợp đi bộ', price: 250000, note: 'Hợp khu Đại Nội và phố trung tâm.' },
    ],
  },
  'Hội An': {
    center: 'Phố cổ Hội An',
    startPoint: { name: 'Khách sạn trung tâm Hội An', lat: 15.8794, lng: 108.3360 },
    places: [
      { id: 'ancient-town', name: 'Phố cổ Hội An', category: 'culture', description: 'Di sản văn hóa thế giới, dạo phố, ngắm đèn lồng.', cost: 120000, durationHours: 3, bestTime: '16:00', lat: 15.8794, lng: 108.3360, wikiSlug: 'Hoi_An_Ancient_Town' },
      { id: 'japanese-bridge', name: 'Chùa Cầu', category: 'landmark', description: 'Biểu tượng của Hội An, kiến trúc độc đáo.', cost: 0, durationHours: 1, bestTime: '17:00', lat: 15.8769, lng: 108.3339, wikiSlug: 'Japanese_Bridge,_Hoi_An' },
      { id: 'thanh-ha-pottery', name: 'Làng gốm Thanh Hà', category: 'culture', description: 'Tìm hiểu nghề gốm truyền thống, tự tay làm sản phẩm.', cost: 30000, durationHours: 2, bestTime: '09:00', lat: 15.8880, lng: 108.3190, wikiSlug: 'Thanh_Ha_Pottery_Village' },
    ],
    localTransport: [
      { label: 'Đi bộ/Xe đạp', price: 0, note: 'Tốt nhất để khám phá phố cổ.' },
      { label: 'Taxi/Grab', price: 100000, note: 'Phù hợp di chuyển ra ngoại ô.' },
    ],
  },
  'Hà Nội': {
    center: 'Trung tâm Hà Nội',
    startPoint: { name: 'Khách sạn trung tâm Hà Nội', lat: 21.0278, lng: 105.8342 },
    places: [
      { id: 'hoan-kiem-lake', name: 'Hồ Hoàn Kiếm', category: 'nature', description: 'Biểu tượng của Hà Nội, dạo bộ, ngắm cảnh.', cost: 0, durationHours: 1.5, bestTime: '06:00', lat: 21.0288, lng: 105.8522, wikiSlug: 'Hoan_Kiem_Lake' },
      { id: 'temple-of-literature', name: 'Văn Miếu - Quốc Tử Giám', category: 'culture', description: 'Trường đại học đầu tiên của Việt Nam.', cost: 30000, durationHours: 1.5, bestTime: '09:00', lat: 21.0288, lng: 105.8342, wikiSlug: 'Temple_of_Literature,_Hanoi' },
      { id: 'old-quarter', name: 'Phố cổ Hà Nội', category: 'culture', description: 'Khám phá kiến trúc cổ, ẩm thực đường phố.', cost: 0, durationHours: 2, bestTime: '18:00', lat: 21.0320, lng: 105.8520, wikiSlug: 'Hanoi_Old_Quarter' },
      { id: 'ho-chi-minh-mausoleum', name: 'Lăng Chủ tịch Hồ Chí Minh', category: 'landmark', description: 'Nơi an nghỉ của Bác Hồ.', cost: 0, durationHours: 1, bestTime: '07:30', lat: 21.0368, lng: 105.8340, wikiSlug: 'Ho_Chi_Minh_Mausoleum' },
    ],
    localTransport: [
      { label: 'Đi bộ/Xe đạp', price: 0, note: 'Tốt nhất để khám phá phố cổ và Hồ Gươm.' },
      { label: 'Taxi/Grab', price: 150000, note: 'Phù hợp di chuyển giữa các điểm xa.' },
      { label: 'Xe buýt', price: 7000, note: 'Tiết kiệm, phù hợp tuyến phổ biến.' },
    ],
  },
  'Hồ Chí Minh': {
    center: 'Trung tâm TP.HCM',
    startPoint: { name: 'Khách sạn trung tâm TP.HCM', lat: 10.7769, lng: 106.7009 },
    places: [
      { id: 'notre-dame-cathedral', name: 'Nhà thờ Đức Bà', category: 'landmark', description: 'Biểu tượng kiến trúc Pháp cổ.', cost: 0, durationHours: 1, bestTime: '08:00', lat: 10.7797, lng: 106.6990, wikiSlug: 'Notre-Dame_Cathedral_Basilica_of_Saigon' },
      { id: 'ben-thanh-market', name: 'Chợ Bến Thành', category: 'food', description: 'Chợ truyền thống, ẩm thực và mua sắm.', cost: 0, durationHours: 2, bestTime: '10:00', lat: 10.7729, lng: 106.6980, wikiSlug: 'Ben_Thanh_Market' },
      { id: 'reunification-palace', name: 'Dinh Độc Lập', category: 'culture', description: 'Di tích lịch sử quan trọng.', cost: 40000, durationHours: 1.5, bestTime: '09:00', lat: 10.7787, lng: 106.6953, wikiSlug: 'Independence_Palace' },
    ],
    localTransport: [
      { label: 'Taxi/Grab', price: 180000, note: 'Linh hoạt di chuyển trong thành phố.' },
      { label: 'Xe buýt', price: 6000, note: 'Tiết kiệm, phù hợp tuyến phổ biến.' },
    ],
  },
  'Nha Trang': {
    center: 'Trung tâm Nha Trang',
    startPoint: { name: 'Khách sạn trung tâm Nha Trang', lat: 12.2388, lng: 109.1967 },
    places: [
      { id: 'nha-trang-beach', name: 'Bãi biển Nha Trang', category: 'beach', description: 'Tắm biển, các hoạt động thể thao dưới nước.', cost: 0, durationHours: 3, bestTime: '06:00', lat: 12.2388, lng: 109.1967, wikiSlug: 'Nha_Trang_Beach' },
      { id: 'vinpearl-land', name: 'Vinpearl Land Nha Trang', category: 'landmark', description: 'Khu vui chơi giải trí tổng hợp.', cost: 880000, durationHours: 6, bestTime: '09:00', lat: 12.2100, lng: 109.2300, wikiSlug: 'Vinpearl_Land_Nha_Trang' },
      { id: 'po-nagar-cham-towers', name: 'Tháp Bà Ponagar', category: 'culture', description: 'Di tích kiến trúc Chăm cổ.', cost: 22000, durationHours: 1.5, bestTime: '14:00', lat: 12.2600, lng: 109.1960, wikiSlug: 'Po_Nagar_Cham_Towers' },
    ],
    localTransport: [
      { label: 'Taxi/Grab', price: 200000, note: 'Phù hợp di chuyển giữa các điểm.' },
      { label: 'Xe máy', price: 150000, note: 'Linh hoạt khám phá thành phố và ven biển.' },
    ],
  },
  'Đà Lạt': {
    center: 'Trung tâm Đà Lạt',
    startPoint: { name: 'Khách sạn trung tâm Đà Lạt', lat: 11.9404, lng: 108.4459 },
    places: [
      { id: 'xuan-huong-lake', name: 'Hồ Xuân Hương', category: 'nature', description: 'Hồ nước thơ mộng giữa lòng thành phố.', cost: 0, durationHours: 1.5, bestTime: '07:00', lat: 11.9404, lng: 108.4459, wikiSlug: 'Xuan_Huong_Lake' },
      { id: 'valley-of-love', name: 'Thung lũng Tình Yêu', category: 'landmark', description: 'Khu du lịch lãng mạn với nhiều cảnh đẹp.', cost: 100000, durationHours: 2, bestTime: '10:00', lat: 11.9700, lng: 108.4600, wikiSlug: 'Valley_of_Love,_Da_Lat' },
      { id: 'cu-lan-village', name: 'Làng Cù Lần', category: 'culture', description: 'Làng du lịch sinh thái với vẻ đẹp hoang sơ.', cost: 60000, durationHours: 3, bestTime: '09:00', lat: 12.0500, lng: 108.4000, wikiSlug: 'Cu_Lan_Village' },
    ],
    localTransport: [
      { label: 'Taxi/Grab', price: 180000, note: 'Phù hợp di chuyển giữa các điểm.' },
      { label: 'Xe máy', price: 120000, note: 'Linh hoạt khám phá các điểm du lịch.' },
    ],
  },
};

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  landmark: 'Điểm nổi tiếng',
  beach: 'Biển',
  food: 'Nhà hàng',
  culture: 'Văn hóa',
  nature: 'Thiên nhiên',
};

const CITY_TRANSPORT_OPTIONS: LocalTransportOption[] = [
  { id: 'walk', label: 'Đi bộ', price: 0, note: 'Phù hợp các điểm gần nhau, tiết kiệm chi phí.' },
  { id: 'motorbike', label: 'Xe máy', price: 0, note: 'Linh hoạt nhất cho lịch trình nội đô.' },
  { id: 'car4', label: 'Ô tô 4 chỗ', price: 0, note: 'Thoải mái cho nhóm nhỏ hoặc gia đình.' },
  { id: 'car7', label: 'Ô tô 7 chỗ', price: 0, note: 'Thoải mái cho nhóm lớn hơn hoặc gia đình.' },
  { id: 'bus', label: 'Xe buýt', price: 0, note: 'Tiết kiệm, phù hợp tuyến phổ biến trong thành phố.' },
];

const TRANSPORT_RATES = {
  'walk':      { min: 0,     max: 0,     label: 'Đi bộ' },
  'motorbike': { min: 10000, max: 15000, label: 'Xe máy' },
  'car4':      { min: 15000, max: 20000, label: 'Ô tô 4 chỗ' },
  'car7':      { min: 18000, max: 25000, label: 'Ô tô 7 chỗ' },
  'bus':       { min: 5000,  max: 10000, label: 'Xe buýt' },
};

const PLACE_DETAILS: Record<string, PlaceDetails> = {
  'my-khe': {
    desc: 'Một trong những bãi biển đẹp nhất châu Á với bờ cát trắng dài 30km. Nước biển trong, sóng vừa phải và có nhiều hàng quán ven biển.',
    tip: 'Đến trước 7h sáng để có không gian thoáng, tránh giờ cao điểm 9h-11h.',
    hours: 'Mở cửa cả ngày',
    activities: ['Lướt sóng buổi sáng sớm', 'Thuê dù nằm nghỉ', 'Xem hoàng hôn 17h-18h'],
    keywords: ['My Khe beach Vietnam', 'Da Nang beach', 'Vietnam beach sunset', 'beach waves Vietnam'],
    photoId: '1559592413-7cec4d0cae2b',
  },
  'dragon-bridge': {
    desc: 'Biểu tượng của Đà Nẵng, phun lửa và nước vào 21h thứ 7 và Chủ nhật hàng tuần. Khu vực hai bên bờ sông rất hợp để đi bộ buổi tối.',
    tip: 'Đến lúc 20h30 để có vị trí đẹp xem phun lửa, đứng phía cầu Trần Thị Lý.',
    hours: 'Cả ngày, phun lửa: 21:00 T7-CN',
    activities: ['Chụp ảnh đêm', 'Xem phun lửa cuối tuần', 'Đi bộ ven sông Hàn'],
    keywords: ['Dragon Bridge Danang', 'Da Nang night bridge', 'Han river Vietnam', 'Vietnam city bridge'],
    photoId: '1598970434795-0c54fe7c0648',
  },
  'ngu-hanh-son': {
    desc: 'Quần thể 5 ngọn núi đá cẩm thạch huyền bí với hệ thống hang động và chùa chiền. Đây là điểm kết hợp tốt giữa văn hóa, tâm linh và ngắm cảnh.',
    tip: 'Leo núi Thủy Sơn để có view đẹp nhất, mang giày đế bằng chắc chắn.',
    hours: '7:00 - 17:30',
    activities: ['Leo núi Thủy Sơn', 'Tham quan hang động', 'Ghé làng đá mỹ nghệ'],
    keywords: ['Marble Mountains Danang', 'Vietnam cave temple', 'Da Nang pagoda', 'Vietnam marble mountain'],
    photoId: '1596422846543-75c6fc197f07',
  },
  'son-tra': {
    desc: 'Bán đảo Sơn Trà có cung đường ven biển đẹp, nhiều điểm ngắm cảnh và hệ sinh thái rừng tự nhiên. Nếu may mắn có thể gặp voọc chà vá chân nâu.',
    tip: 'Kết hợp tham quan Chùa Linh Ứng cùng ngày, thuê xe máy sẽ tiện nhất.',
    hours: '6:00 - 18:00',
    activities: ['Chạy xe cung ven biển', 'Ngắm cảnh từ đỉnh Bàn Cờ', 'Tìm voọc chà vá'],
    keywords: ['Son Tra peninsula', 'Da Nang peninsula beach', 'Vietnam coastal road', 'Vietnam nature viewpoint'],
    photoId: '1559827260-dc66d52bef19',
  },
  'seafood': {
    desc: 'Các nhà hàng hải sản gần Mỹ Khê phục vụ món tươi sống, phù hợp cho bữa tối sau khi tắm biển. Nên hỏi giá trước khi gọi món theo kg.',
    tip: 'Chọn quán đông khách địa phương và kiểm tra giá hải sản trước khi chế biến.',
    hours: '10:00 - 23:00',
    activities: ['Ăn hải sản tươi', 'Gọi món theo kg', 'Dạo biển sau bữa tối'],
    keywords: ['Vietnam seafood restaurant', 'Da Nang seafood', 'fresh seafood Vietnam', 'beach restaurant Vietnam'],
    photoId: '1555396273-367ea4eb4db5',
  },
  'con-market': {
    desc: 'Chợ Cồn là điểm ăn vặt và mua đặc sản nổi tiếng ở trung tâm Đà Nẵng. Không gian đông vui, nhiều món địa phương giá dễ tiếp cận.',
    tip: 'Đi tầm 15h-17h để thử nhiều món ăn vặt và tránh quá đông buổi trưa.',
    hours: '7:00 - 19:30',
    activities: ['Ăn vặt địa phương', 'Mua đặc sản', 'Khám phá chợ truyền thống'],
    keywords: ['Vietnam market food', 'Da Nang market', 'Vietnam street food', 'local market Vietnam'],
    photoId: '1555396273-367ea4eb4db5',
  },
  'dai-noi': {
    desc: 'Đại Nội Huế là trung tâm di sản cung đình, phù hợp để tìm hiểu lịch sử triều Nguyễn. Khuôn viên rộng nên cần chuẩn bị thời gian tham quan thoải mái.',
    tip: 'Đi buổi sáng sớm, thuê thuyết minh hoặc audio guide để hiểu rõ các công trình.',
    hours: '7:00 - 17:30',
    activities: ['Tham quan cung điện', 'Nghe thuyết minh', 'Chụp ảnh cổ phục'],
    keywords: ['Hue Imperial City', 'Vietnam palace', 'Hue citadel', 'Vietnam heritage'],
    photoId: '1528127269322-539801943592',
  },
  'thien-mu': {
    desc: 'Chùa Thiên Mụ nằm bên sông Hương, nổi bật với tháp Phước Duyên và không gian yên tĩnh. Đây là điểm dừng đẹp vào buổi chiều.',
    tip: 'Kết hợp đi thuyền sông Hương để có trải nghiệm nhẹ nhàng hơn.',
    hours: '6:00 - 18:00',
    activities: ['Vãn cảnh chùa', 'Đi thuyền sông Hương', 'Ngắm hoàng hôn'],
    keywords: ['Thien Mu pagoda', 'Hue pagoda', 'Vietnam temple river', 'Perfume river Hue'],
    photoId: '1550159930-40066082a4fc',
  },
  'song-huong': {
    desc: 'Sông Hương là trục cảnh quan thơ mộng của Huế, hợp để dạo bộ hoặc đi thuyền nghe ca Huế. Buổi tối khu vực cầu Trường Tiền rất dễ chịu.',
    tip: 'Đi sau 18h để ngắm đèn cầu Trường Tiền và không khí mát hơn.',
    hours: 'Mở cửa cả ngày',
    activities: ['Dạo bộ ven sông', 'Đi thuyền rồng', 'Nghe ca Huế'],
    keywords: ['Perfume river Hue', 'Hue river night', 'Vietnam river boat', 'Truong Tien bridge'],
    photoId: '1528127269322-539801943592',
  },
  'bun-bo': {
    desc: 'Bún bò Huế là món đặc trưng nên thử ngay trong trung tâm thành phố. Hương vị đậm, cay nhẹ và thường ngon nhất vào buổi sáng.',
    tip: 'Chọn quán địa phương đông khách, gọi tô vừa nếu muốn thử thêm nhiều món khác.',
    hours: '6:00 - 21:00',
    activities: ['Ăn sáng địa phương', 'Thử món cay', 'Ghé quán lâu năm'],
    keywords: ['Bun bo Hue', 'Vietnam noodle soup', 'Hue food', 'Vietnam street food'],
    photoId: '1555396273-367ea4eb4db5',
  },
  'nhat-le': {
    desc: 'Biển Nhật Lệ có bãi cát thoáng và không khí nhẹ nhàng, hợp để dạo biển cuối ngày. Hải sản gần biển là lựa chọn tốt cho bữa tối.',
    tip: 'Đi chiều muộn để ngắm hoàng hôn và ăn hải sản sau khi tắm biển.',
    hours: 'Mở cửa cả ngày',
    activities: ['Tắm biển', 'Ăn hải sản', 'Ngắm hoàng hôn'],
    keywords: ['Nhat Le beach', 'Dong Hoi beach', 'Vietnam beach sunset', 'Quang Binh beach'],
    photoId: '1559592413-7cec4d0cae2b',
  },
  'phong-nha': {
    desc: 'Phong Nha - Kẻ Bàng là di sản thiên nhiên nổi tiếng với hệ thống hang động và sông ngầm. Đây là điểm nên dành nhiều thời gian nhất trong lịch trình Quảng Bình.',
    tip: 'Đặt tour trước nếu muốn đi hang sâu, mang dép hoặc giày chống trượt.',
    hours: '7:30 - 16:30',
    activities: ['Đi thuyền sông Son', 'Khám phá hang động', 'Trekking nhẹ'],
    keywords: ['Phong Nha cave', 'Vietnam cave', 'Quang Binh nature', 'Phong Nha boat'],
    photoId: '1500530855697-b586d89ba3ee',
  },
  'thien-duong': {
    desc: 'Động Thiên Đường nổi bật với hệ thống thạch nhũ lớn và lối đi tham quan thuận tiện. Không gian trong động mát mẻ quanh năm.',
    tip: 'Đi buổi sáng để tránh đoàn đông và có nhiều thời gian chụp ảnh.',
    hours: '7:30 - 16:30',
    activities: ['Ngắm thạch nhũ', 'Đi bộ trong hang', 'Chụp ảnh hang động'],
    keywords: ['Paradise cave Vietnam', 'Quang Binh cave', 'Vietnam stalactites', 'Phong Nha cave'],
    photoId: '1500530855697-b586d89ba3ee',
  },
  'quang-phu': {
    desc: 'Đồi cát Quang Phú có khung cảnh rộng và ánh sáng đẹp vào chiều muộn. Đây là điểm chụp ảnh nhanh, dễ kết hợp với lịch Đồng Hới.',
    tip: 'Mang kính râm và đi lúc 16h-17h để cát bớt nóng.',
    hours: 'Mở cửa cả ngày',
    activities: ['Trượt cát', 'Chụp ảnh', 'Ngắm hoàng hôn'],
    keywords: ['Quang Phu sand dunes', 'Vietnam sand dunes', 'Quang Binh dunes', 'sand dune sunset'],
    photoId: '1500530855697-b586d89ba3ee',
  },
  'dong-hoi-food': {
    desc: 'Hải sản Đồng Hới và cháo canh là lựa chọn hợp lý sau một ngày đi biển hoặc hang động. Các quán địa phương thường có khẩu vị đậm và giá mềm.',
    tip: 'Hỏi món trong ngày và chọn quán gần khu Nhật Lệ nếu muốn đi dạo sau bữa tối.',
    hours: '10:00 - 22:30',
    activities: ['Ăn hải sản', 'Thử cháo canh', 'Dạo biển Nhật Lệ'],
    keywords: ['Dong Hoi seafood', 'Vietnam seafood', 'Quang Binh food', 'Vietnam local restaurant'],
    photoId: '1555396273-367ea4eb4db5',
  },
};

function resolveCityGuide(destination: string): CityGuide {
  const key = Object.keys(CITY_GUIDES).find((city) =>
    destination.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(destination.toLowerCase())
  );

  if (key) return CITY_GUIDES[key]!;

  return {
    center: destination || 'Thành phố đã chọn',
    startPoint: { name: 'Điểm xuất phát trung tâm', lat: 16.0544, lng: 108.2022 },
    places: [
      { id: 'center', name: 'Trung tâm thành phố', category: 'landmark', description: 'Điểm bắt đầu thuận tiện cho lịch trình.', cost: 0, durationHours: 1, bestTime: '09:00', lat: 16.0544, lng: 108.2022 },
      { id: 'local-food', name: 'Nhà hàng địa phương', category: 'food', description: 'Bữa ăn đặc sản theo vùng.', cost: 180000, durationHours: 1.5, bestTime: '18:00', lat: 16.0620, lng: 108.2200 },
      { id: 'viewpoint', name: 'Điểm ngắm cảnh', category: 'nature', description: 'Điểm tham quan dễ kết hợp trong ngày.', cost: 100000, durationHours: 2, bestTime: '15:00', lat: 16.0750, lng: 108.2100 },
    ],
    localTransport: [
      { label: 'Taxi/Grab', price: 300000, note: 'Linh hoạt nhất khi chưa có lịch cố định.' },
      { label: 'Thuê xe máy', price: 170000, note: 'Tiết kiệm cho nhóm nhỏ.' },
      { label: 'Xe riêng theo ngày', price: 850000, note: 'Phù hợp gia đình hoặc nhiều hành lý.' },
    ],
  };
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRouteTime(value?: string): string {
  if (!value) return 'Đang cập nhật';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return value;
}

function getMapCenter(places: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (!places.length) return { lat: 16.0544, lng: 108.2022 };
  return {
    lat: places.reduce((total, place) => total + place.lat, 0) / places.length,
    lng: places.reduce((total, place) => total + place.lng, 0) / places.length,
  };
}

function getMapZoom(places: TravelPlace[]): number {
  if (places.length < 2) return 13;
  const latSpan = Math.max(...places.map((place) => place.lat)) - Math.min(...places.map((place) => place.lat));
  const lngSpan = Math.max(...places.map((place) => place.lng)) - Math.min(...places.map((place) => place.lng));
  const span = Math.max(latSpan, lngSpan);
  if (span > 0.35) return 10;
  if (span > 0.14) return 11;
  if (span > 0.07) return 12;
  return 13;
}

function getDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const latDelta = (to.lat - from.lat) * 111;
  const avgLat = ((from.lat + to.lat) / 2) * (Math.PI / 180);
  const lngDelta = (to.lng - from.lng) * 111 * Math.cos(avgLat);
  return Math.sqrt(latDelta * latDelta + lngDelta * lngDelta);
}

function toLngLat(points: Array<[number, number]>): Array<[number, number]> {
  return points.map(([lat, lng]) => [lng, lat]);
}

function getRouteStopProgresses(
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

function getSuggestedRoute(startPoint: StartPoint, places: TravelPlace[]): Array<StartPoint | TravelPlace> {
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

function getClosedSuggestedRoute(startPoint: StartPoint, places: TravelPlace[]): Array<StartPoint | TravelPlace> {
  const route = getSuggestedRoute(startPoint, places);
  if (places.length === 0) return route;
  return [...route, startPoint];
}

function getRouteDistance(route: Array<StartPoint | TravelPlace>): number {
  if (route.length < 2) return 0;

  return route.slice(1).reduce((total, stop, index) => {
    return total + getDistanceKm(route[index]!, stop);
  }, 0);
}

function createEmptyDayPlans(dayCount: number): DayPlan[] {
  return Array.from({ length: dayCount }, (_, index) => ({ day: index + 1, startTime: '08:00', placeIds: [] }));
}

function estimateTravelHours(distanceKm: number): number {
  return distanceKm / DEFAULT_CITY_SPEED_KMH;
}

function getDayVisitHours(places: TravelPlace[]): number {
  return places.reduce((total, place) => total + place.durationHours, 0);
}

function getDayTotalHours(startPoint: StartPoint, places: TravelPlace[]): number {
  const route = getClosedSuggestedRoute(startPoint, places);
  return getDayVisitHours(places) + estimateTravelHours(getRouteDistance(route));
}

function distributePlacesAcrossDays(places: TravelPlace[], startPoint: StartPoint, dayCount: number): DayPlan[] {
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

function fitDayPlansToCount(plans: DayPlan[], dayCount: number, selectedIds: string[], places: TravelPlace[], startPoint: StartPoint): DayPlan[] {
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

function movePlaceBetweenDayPlans(plans: DayPlan[], placeId: string, targetDayIndex: number, targetIndex?: number): DayPlan[] {
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

function toDeparturePoint(point: StartPoint): DeparturePoint {
  return {
    ...point,
    label: point.name,
  };
}

function getTransportProfile(option: TransportOption | null, localTransport: { label: string } | null): OSRMProfile {
  const label = (localTransport?.label || option?.label || '').toLowerCase();

  if (label.includes('đi bộ') || label.includes('walking')) return 'walking';
  if (label.includes('xe máy')) return 'driving';
  if (label.includes('ô tô') || label.includes('taxi') || label.includes('grab') || label.includes('xe riêng')) return 'driving';
  if (label.includes('xe buýt') || label.includes('buýt') || label.includes('bus') || label.includes('xe khách')) return 'driving';

  return 'driving';
}

function getPlaceImageUrl(place: TravelPlace, width = 320, height = 200): string {
  // This function is no longer needed as LandmarkImage component handles image fetching
  // It's kept as a fallback for non-LandmarkImage usage, but will return a placeholder
  return `https://placehold.co/${width}x${height}/${PLACEHOLDER_TONE}/${PLACEHOLDER_INK}?text=${encodeURIComponent(place.name)}`;
}

function getPlaceDetails(place: TravelPlace): PlaceDetails {
  return PLACE_DETAILS[place.id] ?? {
    desc: place.description + ' Đây là điểm dừng dễ kết hợp trong lịch trình, phù hợp để tham quan và chụp ảnh trong ngày.',
    tip: 'Đi vào buổi sáng hoặc chiều muộn để thời tiết dễ chịu hơn.',
    hours: 'Đang cập nhật',
    activities: getPlaceTags(place, place.name).map((tag) => tag.replace(/^[^\s]+ /, '')),
    keywords: [place.name + ' Vietnam', 'Vietnam travel', 'Vietnam landmark', 'Vietnam local culture'],
    photoId: '1528127269322-539801943592', // Fallback Unsplash ID
  };
}

function getPlaceGalleryUrls(place: TravelPlace): string[] {
  // This function is no longer needed as LandmarkImage component handles image fetching
  // It's kept as a fallback for non-LandmarkImage usage, but will return a placeholder
  return [`https://placehold.co/640x400/${PLACEHOLDER_TONE}/${PLACEHOLDER_INK}?text=${encodeURIComponent(place.name)}`];
}

function handlePlaceImageError(event: SyntheticEvent<HTMLImageElement>, place: TravelPlace) {
  event.currentTarget.src = `https://placehold.co/320x200/${PLACEHOLDER_TONE}/${PLACEHOLDER_INK}?text=${encodeURIComponent(place.name)}`;
  event.currentTarget.style.objectFit = 'cover';
}

function getPlaceDistrict(place: TravelPlace, cityName: string): string {
  const name = place.name.toLowerCase();

  if (name.includes('mỹ khê') || name.includes('son tra') || name.includes('sơn trà') || name.includes('linh ứng')) return 'Sơn Trà';
  if (name.includes('ngũ hành')) return 'Ngũ Hành Sơn';
  if (name.includes('cầu rồng') || name.includes('chợ cồn') || name.includes('hải sản')) return 'Hải Châu';
  if (name.includes('đại nội') || name.includes('thiên mụ') || name.includes('sông hương') || name.includes('bún bò')) return 'TP Huế';
  if (name.includes('nhật lệ') || name.includes('đồng hới') || name.includes('quang phú')) return 'Đồng Hới';
  if (name.includes('phong nha') || name.includes('thiên đường')) return 'Bố Trạch';

  return cityName.replace('Trung tâm ', '').replace(' - Quảng Bình', '');
}

function getPlaceRating(place: TravelPlace): string {
  const rating = 4.4 + ((place.id.length % 6) / 10);
  return Math.min(rating, 4.9).toFixed(1);
}

function getPlaceTags(place: TravelPlace, cityName: string): string[] {
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

function formatDirectionDistance(meters: number): string {
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

async function getOSRMRoute(waypoints: Array<{ lat: number; lng: number }>, profile: OSRMProfile = 'driving'): Promise<OSRMRouteResult> {
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

async function searchDeparture(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=vn`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'vi' },
  });

  if (!res.ok) return [];

  return await res.json() as NominatimResult[];
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'vi' },
  });

  if (!res.ok) return 'Vị trí hiện tại';

  const data = await res.json() as { display_name?: string };
  return data.display_name || 'Vị trí hiện tại';
}

function getRoutePrice(route: Route): number {
  return typeof route.price === 'string' ? Number(route.price) : route.price;
}

function getTransportOptions(routes: Route[]): TransportOption[] {
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

export interface TripPlannerProps {
  origin: string;
  destination: string;
  departureDate?: string | null;
  routes: Route[];
  controls?: ReactNode;
  className?: string;
}

const ANALYSIS_STEPS = [
  'Tối ưu thứ tự địa điểm…',
  'Tính toán chi phí di chuyển…',
  'Dự đoán chi phí tham quan…',
  'Hoàn thiện lộ trình…',
];

const SimulatedDayRoute = memo(function SimulatedDayRoute({
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

function MapViewportSync({
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

export function TripPlanner({ origin, destination, departureDate, routes, controls, className }: TripPlannerProps) {
  const guide = useMemo(() => resolveCityGuide(destination), [destination]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dayCount, setDayCount] = useState(1);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(() => createEmptyDayPlans(1));
  const [draggedPlaceId, setDraggedPlaceId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [compactMap, setCompactMap] = useState(false);
  const [selectedActivitiesByPlace, setSelectedActivitiesByPlace] = useState<Record<string, string[]>>({});
  const [selectedLocalTransportIndex, setSelectedLocalTransportIndex] = useState<number | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const [expandedStopIndexes, setExpandedStopIndexes] = useState<number[]>([]);
  const [departurePoint, setDeparturePoint] = useState<DeparturePoint>(() => toDeparturePoint(guide.startPoint));
  const [departureQuery, setDepartureQuery] = useState(guide.startPoint.name);
  const [departureSuggestions, setDepartureSuggestions] = useState<NominatimResult[]>([]);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [departureError, setDepartureError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [roadRoute, setRoadRoute] = useState<Array<[number, number]>>([]);
  const [routeDirections, setRouteDirections] = useState<RouteDirectionStep[][]>([]);
  const [directionsExpanded, setDirectionsExpanded] = useState(false);
  const [activeDirectionId, setActiveDirectionId] = useState<string | null>(null);
  const [routeSimulationStatus, setRouteSimulationStatus] = useState<RouteSimulationStatus>('idle');
  const [hasSimulationProgress, setHasSimulationProgress] = useState(false);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [activeSimulationPlaceIndex, setActiveSimulationPlaceIndex] = useState<number | null>(null);
  const [routeSimulationSpeed, setRouteSimulationSpeed] = useState<1 | 2>(1);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [mapFocusCenter, setMapFocusCenter] = useState(() => getMapCenter([guide.startPoint, ...guide.places]));
  const [mapColors, setMapColors] = useState<MapColors | null>(null);
  const routeSimulationProgressRef = useRef(0);
  const routeSimulationBarRef = useRef<HTMLSpanElement | null>(null);
  const routeSimulationListenersRef = useRef<Set<(progress: number) => void>>(new Set());
  const routeSimulationFrameRef = useRef<number | null>(null);
  const routeSimulationLastTickRef = useRef<number | null>(null);

  // State for validation errors
  const [landmarkError, setLandmarkError] = useState<string | null>(null);
  const [transportError, setTransportError] = useState<string | null>(null);
  const [departurePointError, setDeparturePointError] = useState<string | null>(null);

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
    setRouteSimulationStatus('idle');
    routeSimulationProgressRef.current = 0;
    if (routeSimulationBarRef.current) {
      routeSimulationBarRef.current.style.transform = 'scaleX(0)';
    }
    routeSimulationListenersRef.current.forEach((listener) => listener(0));
    setHasSimulationProgress(false);
    setIsSimulationComplete(false);
    setActiveSimulationPlaceIndex(null);
    setRouteSimulationSpeed(1);
    // Clear validation errors on guide change
    setLandmarkError(null);
    setTransportError(null);
    setDeparturePointError(null);
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
    setDayPlans((current) => fitDayPlansToCount(current, dayCount, selectedIds, guide.places, departurePoint));
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

  const selectedPlaces = useMemo(() => guide.places.filter((place) => selectedIds.includes(place.id)), [guide.places, selectedIds]);
  const placesById = useMemo(() => new Map(guide.places.map((place) => [place.id, place])), [guide.places]);
  const selectedPlacesByDay = useMemo(
    () => dayPlans.map((plan) => plan.placeIds.map((id) => placesById.get(id)).filter(Boolean) as TravelPlace[]),
    [dayPlans, placesById]
  );
  const activeDayPlaces = selectedPlacesByDay[activeDayIndex] ?? [];
  const localTransport = selectedLocalTransportIndex === null ? null : CITY_TRANSPORT_OPTIONS[selectedLocalTransportIndex] ?? null;
  const placeCost = selectedPlaces.reduce((total, place) => total + place.cost, 0);
  const totalCost = placeCost + (localTransport?.price ?? 0);
  
  // Updated canAnalyze logic
  const canAnalyze =
    Array.isArray(selectedPlaces) &&
    selectedPlaces.length >= 2 &&
    localTransport != null &&
    departurePoint != null &&
    analysisState !== 'loading';

  const suggestedRoute = useMemo(() => getClosedSuggestedRoute(departurePoint, activeDayPlaces), [activeDayPlaces, departurePoint]);
  const routeDistance = useMemo(() => getRouteDistance(suggestedRoute), [suggestedRoute]);
  const mapFocusZoom = useMemo(() => Math.max(10, getMapZoom(guide.places) - 1), [guide]);

  const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
  const roadRouteLngLat = useMemo(() => toLngLat(roadRoute), [roadRoute]);
  const activeDirectionStep = useMemo(() => routeDirections.flat().find((step) => step.id === activeDirectionId) ?? null, [activeDirectionId, routeDirections]);
  const activeDirectionLngLat = useMemo(() => toLngLat(activeDirectionStep?.points ?? []), [activeDirectionStep]);
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
    [dayPlans, departurePoint, selectedPlacesByDay]
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
  const canSimulateRoute = activeDayPlaces.length > 0 && roadRoute.length > 1 && !routeLoading;
  const routeSimulationStopProgresses = useMemo(
    () => getRouteStopProgresses(roadRoute, suggestedRoute),
    [roadRoute, suggestedRoute]
  );
  const computeActiveSimulationIndex = useCallback(
    (progress: number): number | null => {
      if (!canSimulateRoute || progress <= 0) return null;

      let activeIndex: number | null = null;
      routeSimulationStopProgresses.slice(1, activeDayPlaces.length + 1).forEach((stopProgress, index) => {
        if (progress >= stopProgress - 0.02) {
          activeIndex = index;
        }
      });

      return activeIndex;
    },
    [activeDayPlaces.length, canSimulateRoute, routeSimulationStopProgresses]
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
    [computeActiveSimulationIndex]
  );
  const subscribeSimulationProgress = useCallback((listener: (progress: number) => void) => {
    routeSimulationListenersRef.current.add(listener);
    return () => {
      routeSimulationListenersRef.current.delete(listener);
    };
  }, []);
  const getSimulationProgress = useCallback(() => routeSimulationProgressRef.current, []);
  const activeSimulationPlace = activeSimulationPlaceIndex === null ? null : activeDayPlaces[activeSimulationPlaceIndex] ?? null;

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

      const next = Math.min(1, routeSimulationProgressRef.current + (delta / durationMs) * routeSimulationSpeed);
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

  const toggleRouteSimulation = () => {
    if (!canSimulateRoute) return;

    if (routeSimulationStatus === 'playing') {
      setRouteSimulationStatus('paused');
      return;
    }

    if (routeSimulationProgressRef.current >= 1) {
      applySimulationProgress(0);
    }
    setRouteSimulationStatus('playing');
  };

  const resetRouteSimulation = () => {
    setRouteSimulationStatus('idle');
    applySimulationProgress(0);
  };

  const skipToNextSimulationStop = () => {
    if (!canSimulateRoute) return;

    const nextStopProgress = routeSimulationStopProgresses
      .slice(1)
      .find((stopProgress) => stopProgress > routeSimulationProgressRef.current + 0.03);

    applySimulationProgress(nextStopProgress ?? 1);
    setRouteSimulationStatus('paused');
  };

  const updateDayCount = (nextDayCount: number) => {
    const normalizedDayCount = Math.max(1, Math.min(MAX_TRIP_DAYS, nextDayCount));
    setDayCount(normalizedDayCount);
    resetAnalysis();
  };

  const autoDistributeSelectedPlaces = () => {
    setDayPlans(distributePlacesAcrossDays(selectedPlaces, departurePoint, dayCount));
    setActiveDayIndex(0);
    resetAnalysis();
  };

  const movePlaceToDay = (placeId: string, targetDayIndex: number, targetIndex?: number) => {
    setDayPlans((current) => movePlaceBetweenDayPlans(current, placeId, targetDayIndex, targetIndex));
    setActiveDayIndex(targetDayIndex);
    resetAnalysis();
  };

  const updateDayStartTime = (dayIndex: number, startTime: string) => {
    setDayPlans((current) =>
      current.map((plan, index) => (index === dayIndex ? { ...plan, startTime } : plan))
    );
    resetAnalysis();
  };

  const handlePlaceDragStart = (placeId: string) => {
    setDraggedPlaceId(placeId);
  };

  const handlePlaceDrop = (targetDayIndex: number, targetIndex?: number) => {
    if (!draggedPlaceId) return;
    movePlaceToDay(draggedPlaceId, targetDayIndex, targetIndex);
    setDraggedPlaceId(null);
  };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setAnalysisStepIndex(0);
    setRouteSimulationStatus('idle');
    applySimulationProgress(0);
  };

  const togglePlace = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        setDayPlans((plans) => plans.map((plan) => ({ ...plan, placeIds: plan.placeIds.filter((placeId) => placeId !== id) })));
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

      return {
        ...current,
        [placeId]: nextActivities,
      };
    });
  };

  const togglePlaceDetails = (id: string) => {
    setExpandedPlaceId((current) => current === id ? null : id);
  };

  const toggleStopDetails = (index: number) => {
    setExpandedStopIndexes((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  };

  const updateDepartureMarker = (lat: number, lon: number, label: string) => {
    const nextDeparture = { name: label, label, lat, lng: lon };
    setDeparturePoint(nextDeparture);
    setDepartureQuery(label);
    setDepartureSuggestions([]);
    setDepartureError(null);
    setMapFocusCenter({ lat, lng: lon });
    resetAnalysis();
  };

  const selectDeparture = (suggestion: NominatimResult) => {
    updateDepartureMarker(Number(suggestion.lat), Number(suggestion.lon), suggestion.display_name);
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
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startAnalysis = async () => {
    // Clear previous validation errors
    setLandmarkError(null);
    setTransportError(null);
    setDeparturePointError(null);

    if (!Array.isArray(selectedPlaces) || selectedPlaces.length < 2) {
      setLandmarkError('Vui lòng chọn ít nhất 2 địa điểm');
      return;
    }
    if (localTransport == null) {
      setTransportError('Vui lòng chọn phương tiện di chuyển');
      return;
    }
    if (departurePoint == null) {
      setDeparturePointError('Vui lòng nhập điểm xuất phát');
      return;
    }
    if (analysisState === 'loading') {
      return;
    }

    setAnalysisState('loading');
    setAnalysisStepIndex(0);
    setAnalysisResult(null); // Clear previous results

    const prompt = `
      Bạn là một trợ lý du lịch AI chuyên nghiệp, hãy tạo một lịch trình du lịch tối ưu và phân tích chi phí cho chuyến đi.
      Dựa trên điểm xuất phát, các địa điểm đã chọn và phương tiện di chuyển nội đô, hãy tạo một lộ trình tối ưu nhất.
      Sau đó, phân tích chi phí cho từng chặng di chuyển và từng địa điểm tham quan/dịch vụ.

      Điểm xuất phát: ${departurePoint.label} (${departurePoint.lat}, ${departurePoint.lng})
      Các địa điểm đã chọn: ${selectedPlaces.map((p) => p.name).join(', ')}
      Số ngày vui chơi: ${dayCount}
      Kế hoạch hiện tại theo ngày:
      ${dayRoutePreviews.map((day) => `Ngày ${day.day}, xuất phát ${day.startTime}: ${day.places.map((place) => `${place.name} (${place.durationHours} giờ)`).join(', ') || 'Chưa có địa điểm'}; tổng ước tính ${day.totalHours.toFixed(1)} giờ`).join('\n      ')}
      Phương tiện di chuyển nội đô: ${localTransport?.label}

      Yêu cầu đầu ra JSON chính xác như sau:
      ${JSON.stringify({
        days: [
          {
            day: 1,
            title: 'string',
            places: ['string'],
            totalHours: 0,
            totalDistanceKm: 0,
            note: 'string',
          },
        ],
        optimizedRoute: [],
        routeExplanation: 'string',
        totalSummary: {
          activityCostTotal: { min: 0, max: 0 },
          transportCostTotal: { min: 0, max: 0 },
          grandTotal: { min: 0, max: 0 },
        },
        stops: [
          {
            place: 'string',
            order: 0,
            activityCost: {
              entranceFee: { min: 0, max: 0 },
              servicesCost: { min: 0, max: 0 },
              note: 'string',
            },
            transportFromPrevious: {
              vehicle: 'string',
              distanceKm: 0,
              costPerKm: { min: 0, max: 0 }, // Updated to be a range
              totalCost: { min: 0, max: 0 },
              note: 'string',
            },
          },
        ],
        transportTips: 'string',
        totalDistanceKm: 0,
      }, null, 2)}

      Calculate transport costs using these rates:
      ${Object.entries(TRANSPORT_RATES).map(([key, value]) => `- ${value.label}: ${value.min}-${value.max}đ/km`).join('\n      ')}
      Use actual distance between GPS coordinates to calculate realistic costs.
      Chia lịch theo đúng ${dayCount} ngày. Mỗi ngày tối đa khoảng ${DAY_TIME_LIMIT_HOURS} giờ, bao gồm thời gian tham quan và thời gian di chuyển.
      Nếu có quá nhiều địa điểm, hãy ưu tiên phân bổ cân bằng và ghi chú ngày nào đang hơi dày.
      
      Đảm bảo rằng optimizedRoute là một mảng các đối tượng địa điểm (bao gồm cả điểm xuất phát) theo thứ tự tối ưu.
      Đảm bảo rằng stops là một mảng các đối tượng phân tích chi phí cho từng điểm dừng (không bao gồm điểm xuất phát).
      Mỗi stop trong mảng stops phải có chi phí hoạt động (activityCost) và chi phí di chuyển từ điểm trước đó (transportFromPrevious).
      Tổng chi phí (grandTotal) phải là tổng của activityCostTotal và transportCostTotal.
      Tất cả các chi phí phải được tính toán hợp lý và có khoảng min/max.
      routeExplanation phải là một đoạn văn giải thích ngắn gọn về lộ trình.
      transportTips phải là một đoạn văn cung cấp lời khuyên về di chuyển.
      totalDistanceKm là tổng quãng đường di chuyển.
    `;

    try {
      const res = await fetch('/api/analyze-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      console.log('AI response status:', res.status);
      const data = await res.json();
      console.log('AI response body:', JSON.stringify(data));

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi phân tích AI');
      }

      const result: AnalysisResult = data; // Use the already parsed data
      setAnalysisResult(result);
      setAnalysisState('complete');
    } catch (error: any) {
      console.error('Error during AI analysis:', error);
      setAnalysisState('idle'); // Or 'error' state
      // Display error message to the user
      setLandmarkError(error.message); // Using landmarkError as a general error display
    }
  };

  const selectedPlaceDetail = selectedPlace
    ? (() => {
        const details = getPlaceDetails(selectedPlace);
        const selected = selectedIds.includes(selectedPlace.id);
        const selectedActivities = selectedActivitiesByPlace[selectedPlace.id] ?? [];

        return (
          <div
            data-place-modal="true"
            role="dialog"
            aria-labelledby="travel-place-dialog-title"
            className="travel-place-modal"
          >
            <div className="travel-place-modal-media">
              <LandmarkImage
                name={selectedPlace.name}
                wikiSlug={selectedPlace.wikiSlug}
                imageUrl={selectedPlace.imageUrl}
              />
              <button
                type="button"
                onClick={() => setSelectedPlace(null)}
                className="travel-icon-button travel-place-modal-close"
                aria-label="Đóng thông tin địa điểm"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="travel-place-modal-body">
              <p className="travel-place-category">{CATEGORY_LABELS[selectedPlace.category]}</p>
              <h2 id="travel-place-dialog-title" className="travel-place-modal-title">{selectedPlace.name}</h2>
              <div className="travel-detail-metrics">
                <div className="travel-detail-metric">
                  <p>Đánh giá</p>
                  <strong>{getPlaceRating(selectedPlace)}/5</strong>
                </div>
                <div className="travel-detail-metric">
                  <p>Giờ đẹp</p>
                  <strong>{selectedPlace.bestTime}</strong>
                </div>
                <div className="travel-detail-metric">
                  <p>Chi phí</p>
                  <strong>{formatMoney(selectedPlace.cost)}</strong>
                </div>
              </div>
              <p className="travel-place-modal-desc">{details.desc}</p>

              <div className="travel-panel--inset">
                <div className="travel-activity-head">
                  <h3>Nên làm tại đây</h3>
                  <span>{selectedActivities.length}/{details.activities.length}</span>
                </div>
                <div className="travel-activity-list">
                  {details.activities.map((activity) => {
                    const activitySelected = selectedActivities.includes(activity);
                    return (
                      <button
                        key={activity}
                        type="button"
                        onClick={() => togglePlaceActivity(selectedPlace.id, activity)}
                        aria-pressed={activitySelected}
                        className={cn('travel-activity', activitySelected && 'is-selected')}
                      >
                        <span className="travel-activity-check" aria-hidden="true">
                          <Check size={14} />
                        </span>
                        {activity}
                      </button>
                    );
                  })}
                </div>
                {selectedActivities.length > 0 && (
                  <p className="travel-selected-note">Đã chọn: {selectedActivities.join(', ')}</p>
                )}
              </div>

              <p className="travel-note travel-note--warm">{details.tip}</p>

              <button
                type="button"
                onClick={() => addPlaceToTrip(selectedPlace.id)}
                className="travel-button travel-button--primary"
              >
                {selected ? 'Đã thêm vào chuyến đi' : 'Thêm vào chuyến đi'}
              </button>
            </div>
          </div>
        );
      })()
    : null;

  return (
    <section className={cn('travel-shell w-full! max-w-none! px-3! py-3! sm:px-4! lg:px-5!', className)}>
      <div className="travel-shell-inner w-full! max-w-none! mx-0!">
        {controls ? <header className="travel-hero mb-3! p-0!">{controls}</header> : null}

        <div className="travel-workspace grid! grid-cols-1! gap-4! items-stretch! lg:h-[calc(100dvh-176px)]! lg:min-h-[540px]! lg:grid-cols-[390px_minmax(0,1fr)]! xl:grid-cols-[410px_minmax(0,1fr)]!">
          <aside
            className="travel-rail lg:h-full! lg:min-h-0! lg:overflow-y-auto! lg:overscroll-contain! lg:pr-1!"
            aria-label="Bảng lập lịch trình"
          >
            <div className="travel-rail-inner space-y-3! gap-3!">
              <section
                className="travel-panel travel-panel--ledger bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
                aria-labelledby="travel-destination-title"
              >
                <div className="travel-panel-head">
                  <div>
                    <h2 id="travel-destination-title" className="travel-panel-title">{guide.center}</h2>
                    <p className="travel-panel-note">Chọn địa điểm trên bản đồ hoặc trong danh sách để thêm vào lịch trình.</p>
                  </div>
                  <p className="travel-count">
                    <strong>{selectedPlaces.length}</strong>
                    <span>/{guide.places.length} điểm</span>
                  </p>
                </div>

                <dl className="travel-ledger">
                  <div className="travel-ledger-row">
                    <dt>Chi phí điểm đến</dt>
                    <dd>{formatMoney(placeCost)}</dd>
                  </div>
                  <div className="travel-ledger-row">
                    <dt>Quãng đường ngày {activeDayIndex + 1}</dt>
                    <dd>{routeDistance.toFixed(1)} km</dd>
                  </div>
                </dl>
              </section>

              <section
                className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
                aria-labelledby="travel-departure-title"
              >
                <div className="travel-panel-head">
                  <div>
                    <h2 id="travel-departure-title" className="travel-panel-title">Điểm xuất phát</h2>
                    <p className="travel-panel-note">Tìm địa chỉ của bạn hoặc dùng vị trí hiện tại.</p>
                  </div>
                </div>

                <label className="travel-field">
                  <span className="travel-field-label">Địa chỉ xuất phát</span>
                  <input
                    type="text"
                    value={departureQuery}
                    onChange={(event) => {
                      setDepartureQuery(event.target.value);
                      setDepartureError(null);
                    }}
                    placeholder="Nhập điểm xuất phát của bạn…"
                    className="travel-input rounded-lg! border! border-input! bg-field! focus:border-primary!"
                  />
                </label>
                {departureLoading && (
                  <p className="travel-inline-status" role="status" aria-live="polite">Đang tìm địa chỉ…</p>
                )}
                {departureSuggestions.length > 0 && (
                  <div className="travel-suggestions rounded-lg! border! border-border! bg-card! shadow-sm">
                    {departureSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onClick={() => selectDeparture(suggestion)}
                        className="travel-suggestion"
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                  className="travel-button travel-button--quiet rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
                >
                  <LocateFixed size={17} aria-hidden="true" />
                  {isLocating ? 'Đang lấy vị trí…' : 'Dùng vị trí hiện tại'}
                </button>

                {departureError && <p className="travel-error" role="alert">{departureError}</p>}
                <p className="travel-current-point">Đang dùng: {departurePoint.label}</p>
              </section>

              <section
                className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
                aria-labelledby="travel-days-title"
              >
                <div className="travel-panel-head">
                  <div>
                    <h2 id="travel-days-title" className="travel-panel-title">Lịch trình theo ngày</h2>
                    <p className="travel-panel-note">{dayCount} ngày vui chơi · tối đa {DAY_TIME_LIMIT_HOURS} giờ mỗi ngày</p>
                  </div>
                  <div className="travel-stepper rounded-lg! border! border-input! bg-field!" role="group" aria-label="Số ngày">
                    <button
                      type="button"
                      onClick={() => updateDayCount(dayCount - 1)}
                      disabled={dayCount <= 1}
                      aria-label="Giảm số ngày"
                    >
                      <Minus size={16} aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{dayCount}</span>
                    <button
                      type="button"
                      onClick={() => updateDayCount(dayCount + 1)}
                      disabled={dayCount >= MAX_TRIP_DAYS}
                      aria-label="Tăng số ngày"
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="travel-day-tabs">
                  {dayRoutePreviews.map((day) => (
                    <button
                      key={day.day}
                      type="button"
                      onClick={() => setActiveDayIndex(day.day - 1)}
                      aria-pressed={activeDayIndex === day.day - 1}
                      className={cn(
                        'travel-day-tab rounded-lg! border! transition-colors',
                        activeDayIndex === day.day - 1
                          ? 'is-active border-primary! bg-accent! text-accent-foreground!'
                          : 'border-input! bg-card! hover:border-primary/50!'
                      )}
                    >
                      <span className="travel-day-tab-name">
                        <span className="travel-day-dot" style={{ backgroundColor: day.color }} aria-hidden="true" />
                        Ngày {day.day}
                      </span>
                      <span className={cn('travel-day-tab-meta', day.totalHours > DAY_TIME_LIMIT_HOURS && 'is-over')}>
                        {day.places.length} điểm · {day.totalHours.toFixed(1)}h
                      </span>
                    </button>
                  ))}
                </div>

                <div className="travel-day-actions">
                  <button
                    type="button"
                    onClick={autoDistributeSelectedPlaces}
                    disabled={selectedPlaces.length === 0}
                    className="travel-button travel-button--quiet rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
                  >
                    Chia đều theo ngày
                  </button>
                  <p>Tối đa {DAY_TIME_LIMIT_HOURS} giờ mỗi ngày, gồm tham quan và di chuyển.</p>
                </div>

                <div className="travel-day-list">
                  {dayRoutePreviews.map((day) => (
                    <div
                      key={`day-plan-${day.day}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handlePlaceDrop(day.day - 1)}
                      className={cn(
                        'travel-day-card rounded-lg! border! transition-colors',
                        activeDayIndex === day.day - 1
                          ? 'is-active border-primary/50! bg-accent/35!'
                          : 'border-border! bg-card!'
                      )}
                    >
                      <div className="travel-day-card-head">
                        <button
                          type="button"
                          onClick={() => setActiveDayIndex(day.day - 1)}
                          className="travel-day-select"
                        >
                          <span className="travel-day-name">
                            <span className="travel-day-dot" style={{ backgroundColor: day.color }} aria-hidden="true" />
                            Ngày {day.day}
                          </span>
                          <span className="travel-day-meta">
                            {day.distanceKm.toFixed(1)} km · {day.visitHours.toFixed(1)}h tham quan · {day.travelHours.toFixed(1)}h di chuyển
                          </span>
                        </button>
                        <span className={cn('travel-hours', day.totalHours > DAY_TIME_LIMIT_HOURS && 'is-over')}>
                          {day.totalHours.toFixed(1)}h
                        </span>
                      </div>

                      <label className="travel-time-row">
                        <span>Giờ xuất phát</span>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(event) => updateDayStartTime(day.day - 1, event.target.value)}
                          className="travel-time-input rounded-md! border! border-input! bg-field!"
                        />
                      </label>

                      <div className="travel-stop-list">
                        {day.places.length === 0 ? (
                          <p className="travel-empty-row">Kéo địa điểm vào ngày này</p>
                        ) : (
                          day.places.map((place, index) => (
                            <div
                              key={`${day.day}-${place.id}`}
                              draggable
                              onDragStart={() => handlePlaceDragStart(place.id)}
                              onDragEnd={() => setDraggedPlaceId(null)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.stopPropagation();
                                handlePlaceDrop(day.day - 1, index);
                              }}
                              className={cn('travel-stop', draggedPlaceId === place.id && 'is-dragging')}
                            >
                              <span className="travel-stop-number" style={{ backgroundColor: day.color }}>
                                {index + 1}
                              </span>
                              <div className="travel-stop-copy">
                                <p>{place.name}</p>
                                <p>{place.durationHours}h · {place.bestTime}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => togglePlace(place.id)}
                                className="travel-icon-button"
                                aria-label={`Bỏ ${place.name} khỏi lịch`}
                              >
                                <Minus size={16} aria-hidden="true" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="travel-day-summary">
                  <div>
                    <h3>{activeDayPlaces.length > 0 ? `Ngày ${activeDayIndex + 1}: ${activeDayPlaces.length} điểm` : 'Chưa có địa điểm nào'}</h3>
                    <p>Quãng đường ước tính {routeDistance.toFixed(1)} km</p>
                  </div>
                  <dl className="travel-metrics">
                    <div className="travel-metric">
                      <dt>Tham quan</dt>
                      <dd>{activeDayPreview?.visitHours.toFixed(1) ?? '0.0'}h</dd>
                    </div>
                    <div className="travel-metric">
                      <dt>Di chuyển</dt>
                      <dd>{activeDayPreview?.travelHours.toFixed(1) ?? '0.0'}h</dd>
                    </div>
                    <div className="travel-metric">
                      <dt>Tổng</dt>
                      <dd className={cn((activeDayPreview?.totalHours ?? 0) > DAY_TIME_LIMIT_HOURS && 'is-over')}>
                        {activeDayPreview?.totalHours.toFixed(1) ?? '0.0'}h
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section
                className="travel-places bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
                aria-labelledby="travel-places-title"
              >
                <div className="travel-places-head">
                  <h2 id="travel-places-title" className="travel-panel-title">Địa điểm đã chọn</h2>
                  <p>{selectedPlaces.length} điểm trong lịch trình</p>
                </div>

                {selectedPlaces.length === 0 ? (
                  <p className="travel-empty-state rounded-lg! border! border-dashed! border-border! bg-muted/40!">
                    Chưa có địa điểm nào trong lịch trình. Chọn một điểm trên bản đồ rồi thêm vào chuyến đi.
                  </p>
                ) : (
                  selectedPlaces.map((place) => {
                    const dayMeta = selectedPlaceDayMeta.get(place.id);
                    const dayColor = dayMeta?.color ?? DEFAULT_DAY_ROUTE_COLOR;
                    const tags = getPlaceTags(place, guide.center);
                    const details = getPlaceDetails(place);
                    const expanded = expandedPlaceId === place.id;
                    const categoryLabel = CATEGORY_LABELS[place.category];

                    return (
                      <article
                        key={place.id}
                        className={cn(
                          'travel-place rounded-lg! border! border-border! bg-card! shadow-xs',
                          expanded && 'is-expanded border-primary/40!'
                        )}
                        style={{ '--travel-day-color': dayColor } as CSSProperties}
                      >
                        <div className="travel-place-summary">
                          <button
                            type="button"
                            onClick={() => togglePlaceDetails(place.id)}
                            className="travel-place-toggle"
                            aria-expanded={expanded}
                          >
                            <span className="travel-place-image">
                              <LandmarkImage
                                name={place.name}
                                wikiSlug={place.wikiSlug || place.name}
                                imageUrl={place.imageUrl}
                              />
                            </span>
                            <span className="travel-place-copy">
                              <span className="travel-place-category">{categoryLabel} · Ngày {dayMeta?.day ?? activeDayIndex + 1}</span>
                              <span className="travel-place-name">{place.name}</span>
                              <span className="travel-place-desc">{place.description}</span>
                              <span className="travel-place-meta">
                                <span>{getPlaceRating(place)}/5 đánh giá</span>
                                <span>{place.bestTime}</span>
                                <span>{getPlaceDistrict(place, guide.center)}</span>
                                <span>{formatMoney(place.cost)}</span>
                              </span>
                              <span className="travel-tags">
                                {tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="travel-tag">{tag}</span>
                                ))}
                              </span>
                              <span className="travel-place-foot">
                                {place.durationHours}h trải nghiệm · Đã thêm vào ngày {dayMeta?.day ?? activeDayIndex + 1}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              togglePlace(place.id);
                            }}
                            className="travel-place-remove"
                            aria-label={`Bỏ chọn ${place.name}`}
                          >
                            <Check size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <div className={cn('travel-place-details', expanded && 'is-open')}>
                          <div className="travel-detail-image">
                            {place.wikiSlug ? (
                              <LandmarkImage
                                wikiSlug={place.wikiSlug}
                                name={`${place.name} 1`}
                                imageUrl={place.imageUrl}
                              />
                            ) : (
                              <img
                                src={getPlaceGalleryUrls(place)[0]}
                                alt={`${place.name} 1`}
                                loading="lazy"
                                crossOrigin="anonymous"
                                className="travel-image"
                                onError={(event) => handlePlaceImageError(event, place)}
                              />
                            )}
                          </div>

                          <div className="travel-detail-metrics">
                            <div className="travel-detail-metric">
                              <p>Khung giờ</p>
                              <strong>{place.bestTime}</strong>
                            </div>
                            <div className="travel-detail-metric">
                              <p>Thời lượng</p>
                              <strong>{place.durationHours}h</strong>
                            </div>
                            <div className="travel-detail-metric">
                              <p>Chi phí</p>
                              <strong>{formatMoney(place.cost)}</strong>
                            </div>
                          </div>

                          <div className="travel-detail-block">
                            <h4>Mô tả ngắn</h4>
                            <p>{details.desc}</p>
                          </div>

                          <div className="travel-detail-block">
                            <h4>Hoạt động nổi bật</h4>
                            <ul className="travel-list">
                              {details.activities.map((activity) => (
                                <li key={activity}>{activity}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="travel-note travel-note--warm">
                            <p><strong>Giờ mở cửa:</strong> {details.hours}</p>
                            <p><strong>Kinh nghiệm:</strong> {details.tip}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>

              <section
                className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
                aria-labelledby="travel-transport-title"
              >
                <div className="travel-panel-head">
                  <div>
                    <h2 id="travel-transport-title" className="travel-panel-title">Phương tiện trong thành phố</h2>
                    <p className="travel-panel-note">Chọn cách di chuyển giữa các điểm trong ngày.</p>
                  </div>
                </div>
                <div className="travel-transport-list">
                  {CITY_TRANSPORT_OPTIONS.map((item, index) => {
                    const selected = selectedLocalTransportIndex === index;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedLocalTransportIndex(index);
                          resetAnalysis();
                        }}
                        aria-pressed={selected}
                        className={cn(
                          'travel-transport rounded-lg! border! transition-colors',
                          selected
                            ? 'is-selected border-primary! bg-accent! text-accent-foreground! ring-1 ring-primary/20'
                            : 'border-input! bg-card! hover:border-primary/50! hover:bg-accent/40!'
                        )}
                      >
                        <span className="travel-transport-copy">
                          <span className="travel-transport-name">{item.label}</span>
                          <span className="travel-transport-note">{item.note}</span>
                        </span>
                        {selected && <Check className="travel-transport-check text-primary!" size={18} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                className="travel-panel bg-card! border! border-border! rounded-xl! p-3.5! shadow-xs"
                aria-labelledby="travel-analysis-title"
              >
                <div className="travel-panel-head">
                  <div>
                    <h2 id="travel-analysis-title" className="travel-panel-title">Phân tích lịch trình</h2>
                    <p className="travel-panel-note">Kiểm tra thứ tự điểm, thời gian và chi phí dự kiến trước khi đi.</p>
                  </div>
                </div>

                <ul className="travel-checklist">
                  <li className={localTransport ? 'is-done' : undefined}>
                    <Check size={16} aria-hidden="true" />
                    Phương tiện nội đô
                  </li>
                  {transportError && <li className="travel-checklist-error" role="alert">{transportError}</li>}
                  <li className={selectedPlaces.length >= 2 ? 'is-done' : undefined}>
                    <Check size={16} aria-hidden="true" />
                    {selectedPlaces.length} địa điểm đã chọn
                  </li>
                  {landmarkError && <li className="travel-checklist-error" role="alert">{landmarkError}</li>}
                  <li className={departurePoint ? 'is-done' : undefined}>
                    <Check size={16} aria-hidden="true" />
                    Điểm xuất phát
                  </li>
                  {departurePointError && <li className="travel-checklist-error" role="alert">{departurePointError}</li>}
                </ul>

                <button
                  type="button"
                  disabled={analysisState === 'loading'}
                  onClick={startAnalysis}
                  aria-busy={analysisState === 'loading'}
                  className="travel-button travel-button--primary rounded-lg!"
                >
                  {analysisState === 'loading' ? 'Đang phân tích…' : 'Phân tích lộ trình'}
                </button>
              </section>

              {analysisState === 'idle' ? (
                <p className="travel-empty-state rounded-xl! border! border-border! bg-card! p-4! shadow-xs">
                  Lịch trình gợi ý sẽ xuất hiện sau khi bạn chọn đủ phương tiện và địa điểm rồi bấm phân tích.
                </p>
              ) : analysisState === 'loading' ? (
                <div
                  className="travel-panel travel-analysis-loading bg-card! border! border-border! rounded-xl! p-4! shadow-xs"
                  role="status"
                  aria-live="polite"
                >
                  <h2 className="travel-panel-title">Đang phân tích lộ trình</h2>
                  <p className="travel-analysis-step">{ANALYSIS_STEPS[analysisStepIndex]}</p>
                  <div className="travel-progress travel-progress--stepped" aria-hidden="true">
                    <span style={{ transform: `scaleX(${(analysisStepIndex + 1) / ANALYSIS_STEPS.length})` }} />
                  </div>
                </div>
              ) : (
                <div className="travel-analysis">
                  <div className="travel-panel">
                    <h2 className="travel-panel-title">Lộ trình đề xuất</h2>
                    <dl className="travel-ledger">
                      <div className="travel-ledger-row">
                        <dt>Ngày đi</dt>
                        <dd>{departureDate || 'Đang cập nhật'}</dd>
                      </div>
                      <div className="travel-ledger-row">
                        <dt>Phương tiện nội đô</dt>
                        <dd>{localTransport ? localTransport.label : 'Chưa chọn'}</dd>
                      </div>
                    </dl>
                  </div>

                  {selectedPlaces.map((place, index) => (
                    <div key={place.id} className="travel-analysis-place">
                      <span className="travel-analysis-index">{index + 1}</span>
                      <div>
                        <div className="travel-analysis-place-head">
                          <h3 className="travel-analysis-place-name">{place.name}</h3>
                          <span className="travel-analysis-place-time">{place.bestTime}</span>
                        </div>
                        <p className="travel-analysis-place-desc">{place.description}</p>
                        <p className="travel-analysis-place-metrics">
                          <span>{place.durationHours} giờ</span>
                          <span>{formatMoney(place.cost)}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {analysisResult && (
                    <>
                      <div className="travel-panel">
                        <h2 className="travel-panel-title">Lộ trình đề xuất</h2>
                        <p className="travel-result-text">{analysisResult.routeExplanation}</p>
                      </div>

                      <div className="travel-panel">
                        <h2 className="travel-panel-title">Chi phí tham quan và dịch vụ</h2>
                        <div className="travel-stop-cost-list">
                          {analysisResult.stops.map((stop, index) => (
                            <div key={stop.place + index} className="travel-stop-cost">
                              <div className="travel-stop-cost-head">
                                <span className="travel-stop-cost-number">{stop.order}</span>
                                <p className="travel-stop-cost-name">{stop.place}</p>
                              </div>
                              <div className="travel-stop-cost-lines">
                                {stop.activityCost.entranceFee.min > 0 && (
                                  <p>
                                    Vào cửa
                                    <span className="travel-cost-value">{formatVND(stop.activityCost.entranceFee.min)} – {formatVND(stop.activityCost.entranceFee.max)}</span>
                                  </p>
                                )}
                                {stop.activityCost.servicesCost.min > 0 && (
                                  <p>
                                    Dịch vụ
                                    <span className="travel-cost-value">{formatVND(stop.activityCost.servicesCost.min)} – {formatVND(stop.activityCost.servicesCost.max)}</span>
                                  </p>
                                )}
                                {stop.activityCost.note && <p className="travel-cost-note">{stop.activityCost.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="travel-panel">
                        <h2 className="travel-panel-title">Chi phí di chuyển ({localTransport?.label || 'Chưa chọn'})</h2>
                        <div className="travel-stop-cost-list">
                          {analysisResult.stops.map((stop, index) => (
                            <div key={stop.place + '-transport-' + index} className="travel-stop-cost">
                              {stop.transportFromPrevious.totalCost.min > 0 && (
                                <>
                                  <p className="travel-stop-cost-name">
                                    {index === 0 ? departurePoint.name : analysisResult.stops[index - 1]?.place} → {stop.place}
                                  </p>
                                  <div className="travel-stop-cost-lines">
                                    <p>
                                      Quãng đường
                                      <span className="travel-cost-value">
                                        {stop.transportFromPrevious.distanceKm.toFixed(1)} km × {formatVND(stop.transportFromPrevious.costPerKm.min)} – {formatVND(stop.transportFromPrevious.costPerKm.max)}/km
                                      </span>
                                    </p>
                                    <p>
                                      Tổng chặng
                                      <span className="travel-cost-value">
                                        {formatVND(stop.transportFromPrevious.totalCost.min)} – {formatVND(stop.transportFromPrevious.totalCost.max)}
                                      </span>
                                    </p>
                                    {stop.transportFromPrevious.note && <p className="travel-cost-note">{stop.transportFromPrevious.note}</p>}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="travel-panel">
                        <h2 className="travel-panel-title">Dự toán chi phí</h2>
                        <dl className="travel-cost-list">
                          <div className="travel-cost-row">
                            <dt>Tham quan và dịch vụ</dt>
                            <dd>{formatVND(analysisResult.totalSummary.activityCostTotal.min)} – {formatVND(analysisResult.totalSummary.activityCostTotal.max)}</dd>
                          </div>
                          <div className="travel-cost-row">
                            <dt>Di chuyển</dt>
                            <dd>{formatVND(analysisResult.totalSummary.transportCostTotal.min)} – {formatVND(analysisResult.totalSummary.transportCostTotal.max)}</dd>
                          </div>
                          <div className="travel-cost-row travel-cost-total">
                            <dt>Tổng cộng mỗi người</dt>
                            <dd>{formatVND(analysisResult.totalSummary.grandTotal.min)} – {formatVND(analysisResult.totalSummary.grandTotal.max)}</dd>
                          </div>
                        </dl>
                      </div>
                    </>
                  )}

                  {routeDirections.length > 0 && (
                    <div className="travel-panel travel-directions">
                      <button
                        type="button"
                        onClick={() => setDirectionsExpanded((current) => !current)}
                        className="travel-directions-toggle"
                        aria-expanded={directionsExpanded}
                      >
                        <span className="travel-directions-title">Lộ trình gợi ý</span>
                        <span className="travel-directions-meta">
                          {activeDayPlaces.length} điểm
                          <ChevronDown
                            className={cn('travel-directions-chevron', directionsExpanded && 'is-open')}
                            size={18}
                            aria-hidden="true"
                          />
                        </span>
                      </button>

                      {directionsExpanded && (
                        <div className="travel-directions-body">
                          <div className="travel-direction-start">
                            <div className="travel-direction-rail">
                              <span className="travel-direction-marker">Đi</span>
                              {activeDayPlaces.length > 0 && <span className="travel-direction-line" aria-hidden="true" />}
                            </div>
                            <div className="travel-direction-copy">
                              <h4>Xuất phát</h4>
                              <p>{departurePoint.label}</p>
                            </div>
                          </div>

                          {activeDayPlaces.map((place, stopIndex) => {
                            const steps = routeDirections[stopIndex] ?? [];
                            const expanded = expandedStopIndexes.includes(stopIndex);
                            const legDistance = steps.reduce((total, step) => total + step.distance, 0);
                            const speedKmh = localTransport?.id === 'walk' ? 5 : localTransport?.id === 'bus' ? 20 : localTransport?.id === 'car' ? 28 : 24;
                            const minutes = Math.max(3, Math.round((legDistance / 1000 / speedKmh) * 60));

                            return (
                              <div key={place.id} className="travel-direction-item">
                                <button
                                  type="button"
                                  onClick={() => toggleStopDetails(stopIndex)}
                                  className="travel-direction-item-toggle"
                                  aria-expanded={expanded}
                                >
                                  <span className="travel-direction-rail">
                                    <span className="travel-direction-number">{stopIndex + 2}</span>
                                    {stopIndex < activeDayPlaces.length - 1 && <span className="travel-direction-line" aria-hidden="true" />}
                                  </span>
                                  <span className="travel-direction-main">
                                    <span className="travel-direction-head">
                                      <span className="travel-direction-name">{place.name}</span>
                                      <span className="travel-direction-minutes">~{minutes} phút</span>
                                    </span>
                                    <span className={cn('travel-direction-steps', expanded && 'is-open')}>
                                      {steps.slice(0, expanded ? 6 : 2).map((step) => (
                                        <span
                                          key={step.id}
                                          onMouseEnter={() => setActiveDirectionId(step.id)}
                                          onMouseLeave={() => setActiveDirectionId(null)}
                                          className="travel-direction-step"
                                        >
                                          {step.instruction} {step.streetName}
                                        </span>
                                      ))}
                                      {steps.length === 0 && <span className="travel-direction-step">Đang cập nhật hướng dẫn đường phố</span>}
                                    </span>
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          <div className="travel-map-column min-w-0! h-[560px]! lg:h-full! lg:min-h-0! flex! flex-col!">
            <div className="travel-map relative! flex-1! h-full! min-h-0! w-full! overflow-hidden! rounded-xl! border! border-border! shadow-xs">
              <MapView
                center={[mapFocusCenter.lng, mapFocusCenter.lat]}
                zoom={mapFocusZoom}
                attributionControl={{ compact: true }}
                className="travel-map-canvas h-full! w-full! min-h-0!"
              >
                <MapViewportSync
                  center={mapFocusCenter}
                  zoom={mapFocusZoom}
                  focusedPlace={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : null}
                />

                {mapColors && activeDirectionLngLat.length > 1 && (
                  <MapRoute
                    id="active-direction"
                    coordinates={activeDirectionLngLat}
                    color={mapColors.ink}
                    width={6}
                    opacity={0.85}
                    interactive={false}
                  />
                )}

                {mapColors && roadRouteLngLat.length > 1 && (
                  <SimulatedDayRoute
                    coordinates={roadRouteLngLat}
                    routeColor={mapColors.route}
                    progressColor={mapColors.progress}
                    canSimulateRoute={canSimulateRoute}
                    getProgress={getSimulationProgress}
                    subscribeProgress={subscribeSimulationProgress}
                  />
                )}

                <MapMarker longitude={departurePoint.lng} latitude={departurePoint.lat} anchor="center">
                  <MarkerContent className="travel-departure-marker">
                    <Navigation size={14} aria-hidden="true" />
                  </MarkerContent>
                  <MarkerLabel className="travel-departure-label">Xuất phát</MarkerLabel>
                </MapMarker>

                {guide.places.map((place) => {
                  const selected = selectedIds.includes(place.id);
                  const dayMeta = selectedPlaceDayMeta.get(place.id);
                  const markerColor = dayMeta?.color ?? DEFAULT_DAY_ROUTE_COLOR;
                  const simulationActive = activeSimulationPlace?.id === place.id;

                  return (
                    <MapMarker key={place.id} longitude={place.lng} latitude={place.lat} anchor="center">
                      <MarkerContent className="travel-marker-anchor">
                        <button
                          type="button"
                          onClick={() => setSelectedPlace(place)}
                          aria-label={`${place.name}${selected ? ' — đã thêm vào lịch' : ' — chưa thêm vào lịch'}`}
                          className={cn(
                            'travel-marker',
                            selected && 'is-selected',
                            simulationActive && 'is-current'
                          )}
                          style={{ '--travel-marker-color': markerColor } as CSSProperties}
                        >
                          <span className="travel-marker-dot" aria-hidden="true">
                            {dayMeta ? dayMeta.order : ''}
                          </span>
                          <span className="travel-marker-label">{place.name}</span>
                        </button>
                      </MarkerContent>
                    </MapMarker>
                  );
                })}

                <MapControls position="top-right" showZoom className="travel-map-controls" />

                {selectedPlace && !compactMap && (
                  <MapPopup
                    longitude={selectedPlace.lng}
                    latitude={selectedPlace.lat}
                    offset={18}
                    anchor="bottom"
                    closeOnClick={false}
                    onClose={() => setSelectedPlace(null)}
                    className="travel-place-popup"
                  >
                    {selectedPlaceDetail}
                  </MapPopup>
                )}
              </MapView>

              <div className="travel-map-card travel-map-info bg-card/95! border! border-border! rounded-xl! shadow-sm!">
                <p className="travel-map-route">{origin || 'Nơi ở'} → {destination || 'Thành phố'}</p>
                <p className="travel-map-hint">Kéo bản đồ để xem · Chọn điểm để thêm vào lịch</p>
              </div>

              <div className="travel-map-card travel-map-sim bg-card/95! border! border-border! rounded-xl! shadow-sm!">
                <div className="travel-sim-days">
                  {dayRoutePreviews.map((day) => (
                    <button
                      key={`simulation-day-${day.day}`}
                      type="button"
                      onClick={() => {
                        setActiveDayIndex(day.day - 1);
                        resetRouteSimulation();
                      }}
                      aria-pressed={activeDayIndex === day.day - 1}
                      className={cn(
                        'travel-sim-day rounded-lg! border! transition-colors',
                        activeDayIndex === day.day - 1
                          ? 'is-active border-primary! bg-accent! text-accent-foreground!'
                          : 'border-input! bg-card! text-foreground! hover:border-primary/50!'
                      )}
                    >
                      <span className="travel-day-dot" style={{ backgroundColor: day.color }} aria-hidden="true" />
                      Ngày {day.day}
                    </button>
                  ))}
                </div>
                <div className="travel-sim-controls">
                  <button
                    type="button"
                    onClick={toggleRouteSimulation}
                    disabled={!canSimulateRoute}
                    className="travel-button travel-button--primary travel-sim-play rounded-lg!"
                    aria-label={routeSimulationStatus === 'playing' ? 'Tạm dừng đi thử lộ trình' : 'Đi thử lộ trình'}
                  >
                    {routeSimulationStatus === 'playing' ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                    {routeLoading ? 'Đang tải đường' : 'Đi thử lộ trình'}
                  </button>
                  <button
                    type="button"
                    onClick={resetRouteSimulation}
                    disabled={!canSimulateRoute || !hasSimulationProgress}
                    className="travel-icon-button rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
                    aria-label="Chạy lại lộ trình"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={skipToNextSimulationStop}
                    disabled={!canSimulateRoute || isSimulationComplete}
                    className="travel-icon-button rounded-lg! border! border-input! bg-card! hover:border-primary/50! hover:bg-accent/50!"
                    aria-label="Tới điểm tiếp theo"
                  >
                    <SkipForward size={16} aria-hidden="true" />
                  </button>
                  <div className="travel-speed gap-1! border-0! bg-transparent! p-0!">
                    {[1, 2].map((speed) => {
                      const isActiveSpeed = routeSimulationSpeed === speed;
                      return (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => setRouteSimulationSpeed(speed as 1 | 2)}
                          aria-pressed={isActiveSpeed}
                          className={cn(
                            'rounded-md! border! px-2.5! py-1! text-xs! font-bold! transition-colors',
                            isActiveSpeed
                              ? 'is-active bg-primary! text-primary-foreground! border-primary! shadow-xs'
                              : 'bg-card! border-border! text-foreground! hover:border-primary/50! hover:text-primary!'
                          )}
                        >
                          {speed}x
                        </button>
                      );
                    })}
                  </div>
                </div>
                {activeSimulationPlace && hasSimulationProgress && (
                  <p className="travel-sim-current" role="status">
                    Đang tới: <strong>{activeSimulationPlace.name}</strong>
                  </p>
                )}
                <div className="travel-progress" aria-hidden="true">
                  <span ref={routeSimulationBarRef} />
                </div>
              </div>

              {(routeLoading || routeError) && activeDayPlaces.length > 0 && (
                <div className="travel-map-card travel-map-status" role="status">
                  {routeLoading ? 'OSRM đang dựng tuyến đường…' : routeError}
                </div>
              )}

              <div className="travel-map-card travel-map-note">
                {activeDayPlaces.length > 0
                  ? `Ngày ${activeDayIndex + 1}: ${activeDayPlaces.length} điểm, đi thử sẽ quay về điểm xuất phát`
                  : 'Chọn điểm để xem lộ trình xem trước'}
              </div>

              {compactMap && selectedPlaceDetail && (
                <div className="travel-place-sheet">{selectedPlaceDetail}</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
