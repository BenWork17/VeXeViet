'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, ReactNode, SyntheticEvent, WheelEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Building2,
  Bus,
  Car,
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  LocateFixed,
  MapPin,
  Minus,
  Move,
  Navigation,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Sparkles,
  Star,
  Utensils,
  Waves,
  WalletCards,
} from 'lucide-react';
import { Button, cn } from '@vexeviet/ui';
import type { Route } from '@vexeviet/types';

const DEFAULT_ZOOM_OFFSET = 4;

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

  const placeholder = (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
      }}
    >
      🏙️
    </div>
  );

  if (loading)
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            border: '2px solid #0EA5E9',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );

  if (!src) return placeholder;

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={(e) => {
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

type MapPoint = {
  x: number;
  y: number;
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
  icon: string;
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

const CATEGORY_ICONS = {
  landmark: Building2,
  beach: Waves,
  food: Utensils,
  culture: Building2,
  nature: MapPin,
};

const MAP_MARKER_OFFSETS: Record<string, { x: number; y: number }> = {
  'son-tra': { x: -150, y: 34 },
  'linh-ung-pagoda': { x: -96, y: 38 },
};

const CITY_TRANSPORT_OPTIONS: LocalTransportOption[] = [
  { id: 'walk', label: 'Đi bộ', icon: '🚶', price: 0, note: 'Phù hợp các điểm gần nhau, tiết kiệm chi phí.' },
  { id: 'motorbike', label: 'Xe máy', icon: '🛵', price: 0, note: 'Linh hoạt nhất cho lịch trình nội đô.' },
  { id: 'car4', label: 'Ô tô 4 chỗ', icon: '🚗', price: 0, note: 'Thoải mái cho nhóm nhỏ hoặc gia đình.' },
  { id: 'car7', label: 'Ô tô 7 chỗ', icon: '🚐', price: 0, note: 'Thoải mái cho nhóm lớn hơn hoặc gia đình.' },
  { id: 'bus', label: 'Xe buýt', icon: '🚌', price: 0, note: 'Tiết kiệm, phù hợp tuyến phổ biến trong thành phố.' },
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

function lngToTileX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * Math.pow(2, zoom);
}

function latToTileY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom);
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

function getScreenPoint(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  zoom: number,
  pan: { x: number; y: number }
): MapPoint {
  return {
    x: (lngToTileX(point.lng, zoom) - lngToTileX(center.lng, zoom)) * 256 + pan.x,
    y: (latToTileY(point.lat, zoom) - latToTileY(center.lat, zoom)) * 256 + pan.y,
  };
}

function getPathDistance(points: MapPoint[]): number {
  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index]!;
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
}

function getRouteSimulationFrame(points: MapPoint[], progress: number): { points: MapPoint[]; head: MapPoint | null } {
  if (points.length === 0) return { points: [], head: null };
  if (points.length === 1) return { points, head: points[0]! };

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalDistance = getPathDistance(points);
  if (totalDistance <= 0) return { points: [points[0]!], head: points[0]! };

  const targetDistance = totalDistance * clampedProgress;
  const animatedPoints: MapPoint[] = [points[0]!];
  let traveled = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    const segmentDistance = Math.hypot(current.x - previous.x, current.y - previous.y);

    if (traveled + segmentDistance >= targetDistance) {
      const segmentProgress = segmentDistance === 0 ? 0 : (targetDistance - traveled) / segmentDistance;
      const head = {
        x: previous.x + (current.x - previous.x) * segmentProgress,
        y: previous.y + (current.y - previous.y) * segmentProgress,
      };
      animatedPoints.push(head);
      return { points: animatedPoints, head };
    }

    animatedPoints.push(current);
    traveled += segmentDistance;
  }

  return { points, head: points[points.length - 1]! };
}

function getStopProgresses(points: MapPoint[]): number[] {
  if (points.length < 2) return points.map(() => 0);

  const totalDistance = getPathDistance(points);
  if (totalDistance <= 0) return points.map(() => 0);

  let traveled = 0;
  return points.map((point, index) => {
    if (index === 0) return 0;
    const previous = points[index - 1]!;
    traveled += Math.hypot(point.x - previous.x, point.y - previous.y);
    return Math.max(0, Math.min(1, traveled / totalDistance));
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

function getRouteDistance(route: Array<StartPoint | TravelPlace>): number {
  if (route.length < 2) return 0;

  return route.slice(1).reduce((total, stop, index) => {
    return total + getDistanceKm(route[index]!, stop);
  }, 0);
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
  return `https://placehold.co/${width}x${height}/e0f2fe/0EA5E9?text=${encodeURIComponent(place.name)}`;
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
  return [`https://placehold.co/640x400/e0f2fe/0EA5E9?text=${encodeURIComponent(place.name)}`];
}

function handlePlaceImageError(event: SyntheticEvent<HTMLImageElement>, place: TravelPlace) {
  event.currentTarget.src = `https://placehold.co/320x200/e0f2fe/0EA5E9?text=${encodeURIComponent(place.name)}`;
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
    ['mỹ khê', ['🏄 Lướt sóng', '🏖️ Tắm biển', '🌅 Hoàng hôn']],
    ['bà nà', ['🚡 Cáp treo', '🎢 Công viên', '☁️ Săn mây']],
    ['cầu rồng', ['📸 Check-in', '🎆 Phun lửa T7-CN', '🌉 Đi bộ']],
    ['ngũ hành', ['🧗 Leo núi', '🕌 Chùa chiền', '🗿 Điêu khắc']],
    ['bảo tàng chăm', ['🏛️ Lịch sử', '📚 Văn hóa', '📸 Triển lãm']],
    ['linh ứng', ['🙏 Tâm linh', '🌊 View biển', '📸 Check-in']],
    ['sơn trà', ['🦌 Động vật', '🌿 Thiên nhiên', '🏍️ Phượt']],
    ['đại nội', ['🏛️ Cung đình', '📚 Lịch sử', '📸 Check-in']],
    ['thiên mụ', ['🙏 Tâm linh', '🚤 Sông Hương', '🌅 Hoàng hôn']],
    ['sông hương', ['🚤 Du thuyền', '🌉 Cầu Trường Tiền', '🎶 Ca Huế']],
    ['bún bò', ['🍜 Ẩm thực', '🔥 Đặc sản', '☕ Buổi sáng']],
    ['nhật lệ', ['🏖️ Tắm biển', '🦑 Hải sản', '🌅 Hoàng hôn']],
    ['phong nha', ['🛶 Sông Son', '🕳️ Hang động', '🌿 Di sản']],
    ['thiên đường', ['🕳️ Hang động', '📸 Thạch nhũ', '🚶 Trek nhẹ']],
    ['quang phú', ['🏜️ Trượt cát', '📸 Check-in', '🌅 Hoàng hôn']],
    ['hà nội', ['🏛️ Phố cổ', '🍜 Ẩm thực', '🚶 Dạo phố']],
    ['hồ chí minh', ['🏙️ Đô thị', '☕ Cà phê', '🛍️ Mua sắm']],
    ['hội an', ['🏮 Phố cổ', '🚲 Đạp xe', '📸 Check-in']],
    ['nha trang', ['🤿 Lặn biển', '🏖️ Tắm biển', '🛥️ Tour đảo']],
    ['đà lạt', ['🌲 Thiên nhiên', '☕ Cà phê', '🌸 Vườn hoa']],
  ];

  const matched = tagMap.find(([keyword]) => name.includes(keyword) || cityName.toLowerCase().includes(keyword));
  if (matched) return matched[1];

  if (place.category === 'food') return ['🍜 Ẩm thực', '🥢 Địa phương', '🧾 Đặc sản'];
  if (place.category === 'beach') return ['🏖️ Tắm biển', '📸 Check-in', '🌅 Hoàng hôn'];
  if (place.category === 'culture') return ['🏛️ Lịch sử', '📚 Văn hóa', '📸 Tham quan'];
  if (place.category === 'nature') return ['🌿 Thiên nhiên', '🚶 Dạo chơi', '📸 Check-in'];
  return ['📸 Check-in', '🚶 Tham quan', '⭐ Nổi bật'];
}

function formatDirectionDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getManeuverIcon(type?: string, modifier?: string): string {
  if (type === 'arrive') return '📍';
  if (type === 'depart') return '🚀';
  if (modifier?.includes('left')) return modifier.includes('slight') ? '↖️' : '↩️';
  if (modifier?.includes('right')) return modifier.includes('slight') ? '↗️' : '↪️';
  if (type === 'continue' || type === 'straight' || modifier === 'straight') return '↑';
  return '↗️';
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
  '🤖 Tối ưu hóa thứ tự địa điểm...',
  '📍 Tính toán chi phí di chuyển...',
  '💰 Dự đoán chi phí tham quan...',
  '✨ Hoàn thiện lộ trình...',
];

export function TripPlanner({ origin, destination, departureDate, routes, controls, className }: TripPlannerProps) {
  const guide = useMemo(() => resolveCityGuide(destination), [destination]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [selectedActivitiesByPlace, setSelectedActivitiesByPlace] = useState<Record<string, string[]>>({});
  const [selectedLocalTransportIndex, setSelectedLocalTransportIndex] = useState<number | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const [expandedStopIndexes, setExpandedStopIndexes] = useState<number[]>([]);
  const [zoomOffset, setZoomOffset] = useState(DEFAULT_ZOOM_OFFSET);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [loadedTileSources, setLoadedTileSources] = useState<Set<string>>(() => new Set());
  const [isPanning, setIsPanning] = useState(false);
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
  const [routeSimulationProgress, setRouteSimulationProgress] = useState(0);
  const [routeSimulationSpeed, setRouteSimulationSpeed] = useState<1 | 2>(1);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [mapFocusCenter, setMapFocusCenter] = useState(() => getMapCenter([guide.startPoint, ...guide.places]));
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef({
    invalidateSize: (_options?: { animate?: boolean }) => {
      mapContainerRef.current?.getBoundingClientRect();
    },
  });
  const departureMarkerRef = useRef<DeparturePoint | null>(toDeparturePoint(guide.startPoint));
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number; frame: number | null } | null>(null);
  const routeSimulationFrameRef = useRef<number | null>(null);
  const routeSimulationLastTickRef = useRef<number | null>(null);

  // State for validation errors
  const [landmarkError, setLandmarkError] = useState<string | null>(null);
  const [transportError, setTransportError] = useState<string | null>(null);
  const [departurePointError, setDeparturePointError] = useState<string | null>(null);

  useEffect(() => {
    const nextDeparturePoint = toDeparturePoint(guide.startPoint);
    setSelectedIds([]);
    setSelectedLocalTransportIndex(null);
    setExpandedPlaceId(null);
    setExpandedStopIndexes([]);
    setAnalysisState('idle');
    setAnalysisStepIndex(0);
    setAnalysisResult(null);
    setZoomOffset(DEFAULT_ZOOM_OFFSET);
    setMapPan({ x: 0, y: 0 });
    setIsPanning(false);
    setDeparturePoint(nextDeparturePoint);
    setDepartureQuery(nextDeparturePoint.label);
    setDepartureSuggestions([]);
    setDepartureError(null);
    setMapFocusCenter(getMapCenter([nextDeparturePoint, ...guide.places]));
    departureMarkerRef.current = nextDeparturePoint;
    setRoadRoute([]);
    setRouteDirections([]);
    setRouteError(null);
    setRouteSimulationStatus('idle');
    setRouteSimulationProgress(0);
    setRouteSimulationSpeed(1);
    // Clear validation errors on guide change
    setLandmarkError(null);
    setTransportError(null);
    setDeparturePointError(null);
  }, [guide]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      mapRef.current.invalidateSize();
    }, 100);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const invalidate = () => {
      window.setTimeout(() => mapRef.current.invalidateSize({ animate: false }), 200);
    };

    window.addEventListener('resize', invalidate, { passive: true });

    return () => window.removeEventListener('resize', invalidate);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => mapRef.current.invalidateSize({ animate: false }), 200);
    return () => window.clearTimeout(timeout);
  }, [directionsExpanded, selectedIds.length]);

  useEffect(() => {
    if (analysisState !== 'loading') return;

    const interval = window.setInterval(() => {
      setAnalysisStepIndex((current) => (current + 1) % ANALYSIS_STEPS.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [analysisState]);

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

  const suggestedRoute = useMemo(() => analysisResult?.optimizedRoute || getSuggestedRoute(departurePoint, selectedPlaces), [analysisResult, departurePoint, selectedPlaces]);
  const routeDistance = useMemo(() => analysisResult?.totalDistanceKm || getRouteDistance(suggestedRoute), [analysisResult, suggestedRoute]);
  const mapCenter = mapFocusCenter;
  const mapBaseZoom = useMemo(() => getMapZoom(guide.places), [guide]);

  const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
  const mapZoom = Math.max(3, Math.min(19, mapBaseZoom + zoomOffset));
  const routeLinePoints = useMemo(() => suggestedRoute.map((stop) => getScreenPoint(stop, mapCenter, mapZoom, mapPan)), [suggestedRoute, mapCenter, mapZoom, mapPan]);
  const roadRoutePoints = useMemo(() => roadRoute.map(([lat, lng]) => getScreenPoint({ lat, lng }, mapCenter, mapZoom, mapPan)), [roadRoute, mapCenter, mapZoom, mapPan]);
  const activeDirectionStep = useMemo(() => routeDirections.flat().find((step) => step.id === activeDirectionId) ?? null, [activeDirectionId, routeDirections]);
  const activeDirectionPoints = useMemo(() => activeDirectionStep?.points.map(([lat, lng]) => getScreenPoint({ lat, lng }, mapCenter, mapZoom, mapPan)) ?? [], [activeDirectionStep, mapCenter, mapPan, mapZoom]);
  const roadRoutePolyline = useMemo(() => roadRoutePoints.map((point) => `${768 + point.x},${768 + point.y}`).join(' '), [roadRoutePoints]);
  const activeDirectionPolyline = useMemo(() => activeDirectionPoints.map((point) => `${768 + point.x},${768 + point.y}`).join(' '), [activeDirectionPoints]);
  const fallbackRoutePolyline = useMemo(() => routeLinePoints.map((point) => `${768 + point.x},${768 + point.y}`).join(' '), [routeLinePoints]);
  const departureScreenPoint = useMemo(() => getScreenPoint(departurePoint, mapCenter, mapZoom, mapPan), [departurePoint, mapCenter, mapPan, mapZoom]);
  const routeSimulationPathPoints = roadRoutePoints.length > 1 ? roadRoutePoints : routeLinePoints;
  const canSimulateRoute = selectedPlaces.length > 0 && routeSimulationPathPoints.length > 1 && !routeLoading;
  const routeSimulationFrame = useMemo(
    () => getRouteSimulationFrame(routeSimulationPathPoints, routeSimulationProgress),
    [routeSimulationPathPoints, routeSimulationProgress]
  );
  const routeSimulationPolyline = useMemo(
    () => routeSimulationFrame.points.map((point) => `${768 + point.x},${768 + point.y}`).join(' '),
    [routeSimulationFrame.points]
  );
  const routeSimulationStopProgresses = useMemo(() => getStopProgresses(routeLinePoints), [routeLinePoints]);
  const activeSimulationPlaceIndex = useMemo(() => {
    if (!canSimulateRoute || routeSimulationProgress <= 0) return null;

    let activeIndex: number | null = null;
    routeSimulationStopProgresses.slice(1).forEach((stopProgress, index) => {
      if (routeSimulationProgress >= stopProgress - 0.02) {
        activeIndex = index;
      }
    });

    return activeIndex;
  }, [canSimulateRoute, routeSimulationProgress, routeSimulationStopProgresses]);
  const activeSimulationStop = activeSimulationPlaceIndex === null ? null : suggestedRoute[activeSimulationPlaceIndex + 1] ?? null;
  const activeSimulationPlace = activeSimulationStop && 'id' in activeSimulationStop ? activeSimulationStop : null;

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
    setRouteSimulationProgress(0);
    routeSimulationLastTickRef.current = null;
    if (routeSimulationFrameRef.current !== null) {
      cancelAnimationFrame(routeSimulationFrameRef.current);
      routeSimulationFrameRef.current = null;
    }
  }, [canSimulateRoute]);

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
      const delta = timestamp - previousTimestamp;

      setRouteSimulationProgress((current) => {
        const next = Math.min(1, current + (delta / durationMs) * routeSimulationSpeed);
        if (next >= 1) {
          setRouteSimulationStatus('idle');
        }
        return next;
      });

      routeSimulationFrameRef.current = requestAnimationFrame(tick);
    };

    routeSimulationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (routeSimulationFrameRef.current !== null) {
        cancelAnimationFrame(routeSimulationFrameRef.current);
        routeSimulationFrameRef.current = null;
      }
    };
  }, [canSimulateRoute, routeSimulationSpeed, routeSimulationStatus]);

  const mapTiles = useMemo(() => {
    const centerX = lngToTileX(mapCenter.lng, mapZoom);
    const centerY = latToTileY(mapCenter.lat, mapZoom);
    const keepBuffer = 8;
    const tileGridSize = keepBuffer * 2 + 1;
    const startX = Math.floor(centerX) - keepBuffer;
    const startY = Math.floor(centerY) - keepBuffer;
    const subdomains = ['a', 'b', 'c'];
    const maxTile = Math.pow(2, mapZoom);

    return Array.from({ length: tileGridSize * tileGridSize }, (_, index) => {
      const rawTileX = startX + (index % tileGridSize);
      const tileY = startY + Math.floor(index / tileGridSize);
      const tileX = ((rawTileX % maxTile) + maxTile) % maxTile;
      const subdomain = subdomains[Math.abs(tileX + tileY + mapZoom) % subdomains.length] ?? 'a';
      const src = `https://${subdomain}.tile.openstreetmap.org/${mapZoom}/${tileX}/${tileY}.png`;
      return {
        key: mapZoom + '-' + tileX + '-' + tileY,
        src,
        fallbackSrc: `https://tile.openstreetmap.org/${mapZoom}/${tileX}/${tileY}.png`,
        loaded: loadedTileSources.has(src),
        left: (rawTileX - centerX) * 256 + 768 + mapPan.x,
        top: (tileY - centerY) * 256 + 768 + mapPan.y,
      };
    });
  }, [loadedTileSources, mapCenter, mapPan, mapZoom]);

  const handleMapPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    event.preventDefault();
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: mapPan.x,
      panY: mapPan.y,
      frame: null,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMapPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;

    const drag = dragState.current;
    const nextPan = {
      x: drag.panX + event.clientX - drag.startX,
      y: drag.panY + event.clientY - drag.startY,
    };

    if (drag.frame !== null) cancelAnimationFrame(drag.frame);
    drag.frame = requestAnimationFrame(() => {
      setMapPan(nextPan);
      if (dragState.current) dragState.current.frame = null;
    });
  };

  const handleMapPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (drag?.frame !== null && drag?.frame !== undefined) {
      cancelAnimationFrame(drag.frame);
    }
    dragState.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleMapWheel = (event: WheelEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (selectedPlace && target.closest('[data-place-modal="true"]')) return;

    event.preventDefault();
    if (selectedPlace) return;

    setZoomOffset((current) => Math.max(3 - mapBaseZoom, Math.min(19 - mapBaseZoom, current + (event.deltaY < 0 ? 1 : -1))));
  };

  const resetMapView = () => {
    setZoomOffset(DEFAULT_ZOOM_OFFSET);
    setMapFocusCenter(getMapCenter([departurePoint, ...guide.places]));
    setMapPan({ x: 0, y: 0 });
    setIsPanning(false);
    window.setTimeout(() => mapRef.current.invalidateSize({ animate: false }), 200);
  };

  const toggleRouteSimulation = () => {
    if (!canSimulateRoute) return;

    setRouteSimulationStatus((current) => {
      if (current === 'playing') return 'paused';
      if (routeSimulationProgress >= 1) {
        setRouteSimulationProgress(0);
      }
      return 'playing';
    });
  };

  const resetRouteSimulation = () => {
    setRouteSimulationStatus('idle');
    setRouteSimulationProgress(0);
  };

  const skipToNextSimulationStop = () => {
    if (!canSimulateRoute) return;

    const nextStopProgress = routeSimulationStopProgresses
      .slice(1)
      .find((stopProgress) => stopProgress > routeSimulationProgress + 0.03);

    setRouteSimulationProgress(nextStopProgress ?? 1);
    setRouteSimulationStatus('paused');
  };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setAnalysisStepIndex(0);
    setRouteSimulationStatus('idle');
    setRouteSimulationProgress(0);
  };

  const togglePlace = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    resetAnalysis();
  };

  const addPlaceToTrip = (id: string) => {
    if (!selectedIds.includes(id)) {
      setSelectedIds((current) => [...current, id]);
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
    departureMarkerRef.current = null;
    departureMarkerRef.current = nextDeparture;
    setDeparturePoint(nextDeparture);
    setDepartureQuery(label);
    setDepartureSuggestions([]);
    setDepartureError(null);
    setMapFocusCenter({ lat, lng: lon });
    setMapPan({ x: 0, y: 0 });
    window.setTimeout(() => mapRef.current.invalidateSize({ animate: false }), 200);
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
      Phương tiện di chuyển nội đô: ${localTransport?.label}

      Yêu cầu đầu ra JSON chính xác như sau:
      ${JSON.stringify({
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

  const retryTileOnce = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.dataset.fallbackSrc && image.dataset.fallbackTried !== 'true') {
      image.dataset.fallbackTried = 'true';
      image.src = image.dataset.fallbackSrc;
      return;
    }

    if (image.dataset.retried === 'true') return;

    image.dataset.retried = 'true';
    window.setTimeout(() => {
      image.src = image.src.split('?')[0] + '?retry=' + Date.now();
    }, 800);
  };

  const markTileLoaded = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    image.classList.remove('leaflet-tile-loading');
    setLoadedTileSources((current) => {
      if (current.has(image.src)) return current;
      const next = new Set(current);
      next.add(image.src);
      return next;
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'grid min-h-screen bg-[#F8FAFC] text-[#0F172A] lg:h-screen lg:grid-cols-[minmax(380px,40%)_minmax(0,60%)] lg:overflow-hidden',
        className
      )}
    >
      <style jsx global>{`
        .ai-processing-dots::after {
          content: '.';
          animation: dots 1.2s infinite;
        }

        .ai-progress-bar {
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #0EA5E9, #F97316);
          animation: aiProgress 3s ease-out forwards;
        }

        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }

        @keyframes aiProgress {
          0% { width: 0%; }
          30% { width: 45%; }
          60% { width: 72%; }
          85% { width: 90%; }
          100% { width: 90%; }
        }

        @keyframes markerPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.65); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .leaflet-tile {
          background: #dbeafe;
          image-rendering: auto;
          opacity: 1;
          transition: opacity 0.18s ease-out;
        }

        .leaflet-tile-loading {
          opacity: 0.78;
        }
      `}</style>
      <aside className="order-2 z-20 max-h-none overflow-visible rounded-t-2xl border-t border-slate-200 bg-white px-4 py-5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:order-1 lg:h-screen lg:overflow-y-auto lg:rounded-none lg:border-r lg:border-t-0 lg:px-6 lg:py-6 lg:shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-[620px] space-y-5 pb-4">
          {controls}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Bản đồ điểm đến</p>
                <h2 className="travel-font-display mt-1 text-2xl font-black text-[#0F172A]">{guide.center}</h2>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">Chọn sticker trên bản đồ hoặc danh sách để dựng route preview.</p>
              </div>
              <div className="rounded-xl bg-sky-50 px-3 py-2 text-right">
                <p className="text-[11px] font-bold uppercase text-[#0EA5E9]">Đã chọn</p>
                <p className="text-lg font-black text-[#0F172A]">{selectedPlaces.length}/{guide.places.length}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-[11px] font-bold uppercase text-[#64748B]">Chi phí điểm</p>
                <p className="mt-1 text-sm font-black text-[#0F172A]">{formatMoney(placeCost)}</p>
              </div>
              <div className="rounded-xl bg-orange-50 px-3 py-3">
                <p className="text-[11px] font-bold uppercase text-orange-700">Lộ trình</p>
                <p className="mt-1 text-sm font-black text-[#0F172A]">{routeDistance.toFixed(1)} km</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0F172A]">
              <Navigation className="h-4 w-4 text-[#22C55E]" />
              Điểm xuất phát
            </div>
            <div className="relative">
              <input
                type="text"
                value={departureQuery}
                onChange={(event) => {
                  setDepartureQuery(event.target.value);
                  setDepartureError(null);
                }}
                placeholder="Nhập điểm xuất phát của bạn..."
                className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100"
              />
              {departureLoading && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-[#0EA5E9]" />}
              {departureSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
                  {departureSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => selectDeparture(suggestion)}
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-semibold leading-5 text-[#0F172A] transition-colors last:border-b-0 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                    >
                      <span className="line-clamp-2">{suggestion.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={useCurrentLocation}
              disabled={isLocating}
              className="mt-3 h-11 w-full rounded-xl border border-green-200 bg-green-50 font-black text-green-700 shadow-none hover:bg-green-100"
            >
              {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
              📍 Dùng vị trí hiện tại
            </Button>
            {departureError && <p className="mt-2 text-xs font-semibold text-red-600">{departureError}</p>}
            <p className="mt-2 line-clamp-2 text-xs font-semibold text-[#64748B]">Đang dùng: {departurePoint.label}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Route preview</p>
                <p className="mt-1 text-lg font-black text-[#0F172A]">{selectedPlaces.length > 0 ? `${suggestedRoute.length - 1} điểm theo thứ tự gợi ý` : 'Chưa có địa điểm nào'}</p>
              </div>
              <div className="rounded-full bg-[#F97316] px-3 py-1 text-xs font-black text-white">{routeDistance.toFixed(1)} km</div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {selectedPlaces.length === 0 ? (
                <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-[#64748B]">Chọn địa điểm để FE dựng route preview</div>
              ) : (
                suggestedRoute.map((stop, index) => (
                  <div key={stop.name + index} className={cn('inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-bold', index === 0 ? 'bg-green-100 text-green-950' : 'bg-sky-50 text-sky-900')}>
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white', index === 0 ? '📍' : index)}>
                      {index === 0 ? '📍' : index}
                    </span>
                    <span className="truncate">{stop.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            {guide.places.map((place) => {
              const Icon = CATEGORY_ICONS[place.category];
              const selected = selectedIds.includes(place.id);
              const tags = getPlaceTags(place, guide.center);
              const details = getPlaceDetails(place);
              const expanded = expandedPlaceId === place.id;
              const categoryLabel = CATEGORY_LABELS[place.category];
              return (
                <div
                  key={place.id}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)]',
                    selected || expanded ? 'border-sky-400 bg-sky-50/60 ring-2 ring-sky-100 text-[#0F172A]' : 'border-slate-200 hover:border-sky-200'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => togglePlaceDetails(place.id)}
                    className="relative flex w-full gap-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                    aria-expanded={expanded}
                  >
                      <div className="relative h-24 w-[132px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <LandmarkImage
                          name={place.name}
                          wikiSlug={place.wikiSlug || place.name}
                          imageUrl={place.imageUrl}
                        />
                        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-[#0F172A] shadow-sm">
                          <Icon className="h-3 w-3 text-[#0EA5E9]" />
                          {categoryLabel}
                        </div>
                      </div>
                    <div className="min-w-0 flex-1 pr-9">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-base font-black text-[#0F172A]">{place.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#64748B]">
                            {place.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-bold text-[#475569]">
                        <span className="rounded-lg bg-white/80 px-2 py-1">⭐ {getPlaceRating(place)}</span>
                        <span className="rounded-lg bg-white/80 px-2 py-1">🕒 {place.bestTime}</span>
                        <span className="rounded-lg bg-white/80 px-2 py-1">📍 {getPlaceDistrict(place, guide.center)}</span>
                        <span className="rounded-lg bg-white/80 px-2 py-1">💰 {formatMoney(place.cost)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs font-black text-[#0F172A]">{place.durationHours}h trải nghiệm · {selected ? 'Đã thêm vào lịch' : 'Chạm để xem chi tiết'}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePlace(place.id);
                    }}
                    className={cn('absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]', selected ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white' : 'border-slate-300 bg-white text-transparent hover:border-sky-300 hover:text-sky-500')}
                    aria-label={selected ? `Bỏ chọn ${place.name}` : `Chọn ${place.name}`}
                    aria-pressed={selected}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <div className={cn('overflow-hidden bg-[#F8FAFC] transition-[max-height] duration-300 ease-in-out', expanded ? 'max-h-[760px]' : 'max-h-0')}>
                    <div className="space-y-4 border-t border-sky-100 px-4 py-4">
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#64748B]">Ảnh đại diện</p>
                        <div className="h-36 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
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
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => handlePlaceImageError(e, place)}
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                          <p className="text-[10px] font-black uppercase text-[#94A3B8]">Khung giờ</p>
                          <p className="mt-1 text-sm font-black text-[#0F172A]">{place.bestTime}</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                          <p className="text-[10px] font-black uppercase text-[#94A3B8]">Thời lượng</p>
                          <p className="mt-1 text-sm font-black text-[#0F172A]">{place.durationHours}h</p>
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                          <p className="text-[10px] font-black uppercase text-[#94A3B8]">Chi phí</p>
                          <p className="mt-1 text-sm font-black text-[#0F172A]">{formatMoney(place.cost)}</p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-sm leading-6 text-[#64748B] shadow-sm">
                        <p className="font-black text-[#0F172A]">Mô tả ngắn</p>
                        <p className="mt-1">{details.desc}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <p className="text-sm font-black text-[#0F172A]">Hoạt động nổi bật</p>
                        <ul className="mt-2 grid gap-2 text-sm text-[#64748B]">
                          {details.activities.map((activity) => (
                            <li key={activity} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm font-semibold leading-6 text-orange-950">
                        <p className="font-black">Giờ mở cửa: {details.hours}</p>
                        <p className="mt-1">Tip: {details.tip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0F172A]">
              <Car className="h-4 w-4 text-[#F97316]" />
              Phương tiện di chuyển trong thành phố
            </div>
            <div className="space-y-2">
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
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]',
                      selected ? 'border-[#F97316] bg-orange-50 shadow-sm' : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[#0F172A]">{item.icon} {item.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B]">{item.note}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0F172A]">
              <Bot className="h-4 w-4 text-[#0EA5E9]" />
              AI lịch trình
            </div>
            <div className="space-y-2 text-sm">
              <div className={cn('flex items-center gap-2', localTransport ? 'text-orange-700' : 'text-[#64748B]')}><Check className="h-4 w-4" /> Phương tiện nội đô</div>
              {transportError && <p className="mt-1 text-xs font-semibold text-red-600">{transportError}</p>}
              <div className={cn('flex items-center gap-2', selectedPlaces.length >= 2 ? 'text-sky-700' : 'text-[#64748B]')}><Check className="h-4 w-4" /> {selectedPlaces.length} địa điểm đã chọn</div>
              {landmarkError && <p className="mt-1 text-xs font-semibold text-red-600">{landmarkError}</p>}
              <div className={cn('flex items-center gap-2', departurePoint ? 'text-green-700' : 'text-[#64748B]')}><Check className="h-4 w-4" /> Điểm xuất phát</div>
              {departurePointError && <p className="mt-1 text-xs font-semibold text-red-600">{departurePointError}</p>}
            </div>
            <Button
              type="button"
              disabled={analysisState === 'loading'} // Only disable if loading, validation handled by messages
              onClick={startAnalysis}
              className={cn(
                'mt-4 h-12 w-full rounded-xl bg-[#0EA5E9] font-black text-white shadow-lg shadow-sky-200 hover:bg-sky-500',
                analysisState === 'loading' && 'animate-pulse cursor-not-allowed'
              )}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {analysisState === 'loading' ? 'AI đang xử lý...' : 'Phân tích lộ trình bằng AI'}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {analysisState === 'idle' ? (
              <motion.div key="waiting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                AI sẽ chỉ tạo lịch trình sau khi bạn chọn đủ phương tiện và địa điểm rồi bấm phân tích.
              </motion.div>
            ) : analysisState === 'loading' ? (
              <motion.div key="ai-loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="overflow-hidden rounded-2xl border border-sky-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 text-sm font-black text-[#0F172A]">
                  <Bot className="h-4 w-4 animate-pulse text-[#0EA5E9]" />
                  <span>AI đang phân tích lộ trình</span>
                  <span className="ai-processing-dots" />
                </div>
                <div className="mt-4 h-[3px] overflow-hidden rounded bg-slate-100">
                  <div className="ai-progress-bar" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={analysisStepIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 text-sm font-semibold text-[#64748B]"
                  >
                    {ANALYSIS_STEPS[analysisStepIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div key="analysis" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <div className="h-[3px] overflow-hidden rounded bg-slate-100">
                  <div className="h-full w-full rounded bg-[linear-gradient(90deg,#0EA5E9,#F97316)] shadow-[0_0_18px_rgba(249,115,22,0.55)]" />
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0F172A]">
                    <Star className="h-4 w-4 text-[#F97316]" />
                    Lộ trình AI đề xuất
                  </div>
                  <div className="space-y-2 text-sm text-[#64748B]">
                    <div><span className="font-bold text-[#0F172A]">Ngày đi:</span> {departureDate || 'Đang cập nhật'}</div>
                    <div><span className="font-bold text-[#0F172A]">Nội đô:</span> {localTransport ? `${localTransport.icon} ${localTransport.label}` : 'N/A'}</div>
                  </div>
                </motion.div>

                {selectedPlaces.map((place, index) => (
                  <motion.div key={place.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-xs font-black text-white">{index + 1}</span>
                        <h4 className="truncate font-black text-[#0F172A]">{place.name}</h4>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-[#64748B]">{place.bestTime}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#64748B]">{place.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#64748B]">
                      <div className="rounded-xl bg-slate-50 p-2"><Clock3 className="mb-1 h-3.5 w-3.5" />{place.durationHours} giờ</div>
                      <div className="rounded-xl bg-slate-50 p-2"><WalletCards className="mb-1 h-3.5 w-3.5" />{formatMoney(place.cost)}</div>
                    </div>
                  </motion.div>
                ))}

                {analysisResult && (
                  <>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + selectedPlaces.length * 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#0F172A]">
                        <Star className="h-4 w-4 text-[#F97316]" />
                        Lộ trình AI đề xuất
                      </div>
                      <p className="text-sm text-[#64748B]">{analysisResult.routeExplanation}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + selectedPlaces.length * 0.1 + 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                      <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase text-[#0F172A]">🎯 CHI PHÍ THAM QUAN & DỊCH VỤ</h3>
                      {analysisResult.stops.map((stop, index) => (
                        <div key={stop.place + index} className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-xs font-black text-white">{stop.order}</span>
                            <p className="font-bold text-[#0F172A]">{stop.place}</p>
                          </div>
                          <div className="ml-8 mt-1 text-sm text-[#64748B]">
                            {stop.activityCost.entranceFee.min > 0 && (
                              <p>🎫 Vào cửa: <span className="font-semibold text-[#0EA5E9]">{formatVND(stop.activityCost.entranceFee.min)} - {formatVND(stop.activityCost.entranceFee.max)}</span></p>
                            )}
                            {stop.activityCost.servicesCost.min > 0 && (
                              <p>🎪 Dịch vụ: <span className="font-semibold text-[#0EA5E9]">{formatVND(stop.activityCost.servicesCost.min)} - {formatVND(stop.activityCost.servicesCost.max)}</span></p>
                            )}
                            {stop.activityCost.note && <p className="mt-1 text-xs italic text-[#64748B]">📝 {stop.activityCost.note}</p>}
                          </div>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + selectedPlaces.length * 0.1 + 0.2 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                      <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase text-[#0F172A]">🚗 CHI PHÍ DI CHUYỂN ({localTransport?.label || 'N/A'})</h3>
                      {analysisResult.stops.map((stop, index) => (
                        <div key={stop.place + '-transport-' + index} className="py-2">
                          {stop.transportFromPrevious.totalCost.min > 0 && (
                            <>
                              <p className="font-bold text-[#0F172A]">{index === 0 ? departurePoint.name : analysisResult.stops[index - 1]?.place} → {stop.place}</p>
                              <div className="ml-0 mt-1 text-sm text-[#64748B]">
                                <p>📍 {stop.transportFromPrevious.distanceKm.toFixed(1)} km × {formatVND(stop.transportFromPrevious.costPerKm.min)} - {formatVND(stop.transportFromPrevious.costPerKm.max)}/km</p>
                                <p>💰 <span className="font-semibold text-[#0EA5E9]">{formatVND(stop.transportFromPrevious.totalCost.min)} - {formatVND(stop.transportFromPrevious.totalCost.max)}</span></p>
                                {stop.transportFromPrevious.note && <p className="mt-1 text-xs italic text-[#64748B]">📝 {stop.transportFromPrevious.note}</p>}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + selectedPlaces.length * 0.1 + 0.3 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 text-sm font-black text-[#0F172A]">Dự toán chi phí</div>
                      <div className="space-y-2 text-sm text-[#64748B]">
                        <div className="flex justify-between gap-3"><span>🎯 Tham quan & dịch vụ</span><span className="font-bold text-[#0EA5E9]">{formatVND(analysisResult.totalSummary.activityCostTotal.min)} - {formatVND(analysisResult.totalSummary.activityCostTotal.max)}</span></div>
                        <div className="flex justify-between gap-3"><span>🚗 Di chuyển</span><span className="font-bold text-[#0EA5E9]">{formatVND(analysisResult.totalSummary.transportCostTotal.min)} - {formatVND(analysisResult.totalSummary.transportCostTotal.max)}</span></div>
                        <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 text-base font-black text-[#0F172A]"><span>💰 Tổng cộng (mỗi người)</span><span className="font-bold text-[#0EA5E9]">{formatVND(analysisResult.totalSummary.grandTotal.min)} - {formatVND(analysisResult.totalSummary.grandTotal.max)}</span></div>
                      </div>
                    </motion.div>
                  </>
                )}

                {routeDirections.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + selectedPlaces.length * 0.1 }} className="overflow-hidden rounded-2xl bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => setDirectionsExpanded((current) => !current)}
                      className="flex w-full items-center justify-between gap-3 bg-[linear-gradient(135deg,#0EA5E9,#0284C7)] px-4 py-4 text-left text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                    >
                      <span className="text-sm font-black uppercase tracking-wide">🗺️ Lộ trình gợi ý</span>
                      <span className="flex items-center gap-2 text-xs font-black">
                        {selectedPlaces.length} điểm
                        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', directionsExpanded && 'rotate-180')} />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {directionsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-slate-100"
                        >
                          <div className="max-h-[520px] overflow-y-auto px-4 py-4">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative pb-4">
                              <div className="flex gap-3">
                                <div className="flex w-8 shrink-0 flex-col items-center">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E] text-sm font-black text-white">📍</div>
                                  {selectedPlaces.length > 0 && <div className="mt-2 h-full min-h-8 border-l-2 border-dashed border-[#CBD5E1]" />}
                                </div>
                                <div className="min-w-0 flex-1 pb-2">
                                  <h4 className="text-base font-bold text-[#0F172A]">Xuất phát</h4>
                                  <p className="mt-1 text-[13px] font-semibold text-[#64748B]">📍 {departurePoint.label}</p>
                                </div>
                              </div>
                            </motion.div>

                            {selectedPlaces.map((place, stopIndex) => {
                              const steps = routeDirections[stopIndex] ?? [];
                              const expanded = expandedStopIndexes.includes(stopIndex);
                              const legDistance = steps.reduce((total, step) => total + step.distance, 0);
                              const speedKmh = localTransport?.id === 'walk' ? 5 : localTransport?.id === 'bus' ? 20 : localTransport?.id === 'car' ? 28 : 24;
                              const minutes = Math.max(3, Math.round((legDistance / 1000 / speedKmh) * 60));

                              return (
                                <motion.div
                                  key={place.id}
                                  initial={{ opacity: 0, y: 14 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: (stopIndex + 1) * 0.15 }}
                                  className="relative"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleStopDetails(stopIndex)}
                                    className="flex w-full gap-3 rounded-xl py-2 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]"
                                    aria-expanded={expanded}
                                  >
                                    <div className="flex w-8 shrink-0 flex-col items-center">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0EA5E9] text-sm font-black text-white">{stopIndex + 2}</div>
                                      {stopIndex < selectedPlaces.length - 1 && <div className="mt-2 h-full min-h-10 border-l-2 border-dashed border-[#CBD5E1]" />}
                                    </div>
                                    <div className="min-w-0 flex-1 pb-4">
                                      <div className="flex min-w-0 items-center justify-between gap-2">
                                        <h4 className="truncate text-base font-bold text-[#0F172A]">{place.name}</h4>
                                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
                                          ~{minutes} phút {localTransport?.icon ?? '🛵'}
                                        </span>
                                      </div>
                                      <div className={cn('overflow-hidden transition-[max-height] duration-300 ease-in-out', expanded ? 'max-h-56' : 'max-h-[42px]')}>
                                        <div className="mt-2 space-y-1 pl-0 text-[13px] font-semibold text-[#64748B]">
                                          {steps.slice(0, expanded ? 6 : 2).map((step) => (
                                            <div
                                              key={step.id}
                                              onMouseEnter={() => setActiveDirectionId(step.id)}
                                              onMouseLeave={() => setActiveDirectionId(null)}
                                              className="truncate rounded-lg py-1 transition-colors hover:bg-gray-50"
                                            >
                                              {step.instruction} {step.streetName}
                                            </div>
                                          ))}
                                          {steps.length === 0 && <div>Đang cập nhật hướng dẫn đường phố</div>}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      <div className="order-1 min-h-[62vh] bg-[#E0F2FE] lg:order-2 lg:h-screen lg:overflow-hidden">
        <div
          ref={mapContainerRef}
          className={cn(
            'relative h-[62vh] min-h-[440px] touch-none overflow-hidden bg-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] select-none lg:h-screen lg:min-h-0',
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          )}
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={handleMapPointerUp}
          onPointerCancel={handleMapPointerUp}
          onWheel={handleMapWheel}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[1536px] w-[1536px] -translate-x-1/2 -translate-y-1/2">
            {mapTiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                className={cn('leaflet-tile pointer-events-none absolute h-64 w-64 select-none [-webkit-user-drag:none]', !tile.loaded && 'leaflet-tile-loading')}
                style={{ left: tile.left, top: tile.top }}
                decoding="async"
                draggable={false}
                data-fallback-src={tile.fallbackSrc}
                onLoad={markTileLoaded}
                onError={retryTileOnce}
                onDragStart={(event) => event.preventDefault()}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,.02),rgba(14,165,233,.10))]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/50" />

          {roadRoutePoints.length > 1 ? (
            <svg className="pointer-events-none absolute left-1/2 top-1/2 h-[1536px] w-[1536px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1536 1536" fill="none">
              <polyline points={roadRoutePolyline} stroke="rgba(15, 23, 42, 0.16)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={roadRoutePolyline} stroke="#F97316" strokeWidth="5" strokeOpacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : routeLinePoints.length > 1 && !routeLoading ? (
            <svg className="pointer-events-none absolute left-1/2 top-1/2 h-[1536px] w-[1536px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1536 1536" fill="none">
              <polyline points={fallbackRoutePolyline} stroke="rgba(15, 23, 42, 0.16)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={fallbackRoutePolyline} stroke="#F97316" strokeWidth="5" strokeOpacity="0.45" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}

          {canSimulateRoute && routeSimulationFrame.points.length > 1 && (
            <svg className="pointer-events-none absolute left-1/2 top-1/2 h-[1536px] w-[1536px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1536 1536" fill="none">
              <polyline points={routeSimulationPolyline} stroke="rgba(14, 165, 233, 0.20)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={routeSimulationPolyline} stroke="#0EA5E9" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={routeSimulationPolyline} stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}

          {canSimulateRoute && routeSimulationFrame.head && routeSimulationProgress > 0 && (
            <div
              className="pointer-events-none absolute z-40 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#0EA5E9] text-white shadow-[0_8px_24px_rgba(14,165,233,0.38)]"
              style={{
                left: 'calc(50% + ' + routeSimulationFrame.head.x + 'px)',
                top: 'calc(50% + ' + routeSimulationFrame.head.y + 'px)',
              }}
            >
              <Navigation className="h-4 w-4" />
            </div>
          )}

          {canSimulateRoute && activeSimulationPlace && routeSimulationFrame.head && routeSimulationProgress > 0 && (
            <div
              className="pointer-events-none absolute z-40 max-w-[220px] -translate-x-1/2 rounded-full border border-sky-200 bg-white/95 px-3 py-1.5 text-xs font-black text-[#0F172A] shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
              style={{
                left: 'calc(50% + ' + routeSimulationFrame.head.x + 'px)',
                top: 'calc(50% + ' + (routeSimulationFrame.head.y - 48) + 'px)',
              }}
            >
              <span className="block truncate">{activeSimulationPlace.name}</span>
            </div>
          )}

          {activeDirectionPoints.length > 1 && (
            <svg className="pointer-events-none absolute left-1/2 top-1/2 h-[1536px] w-[1536px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 1536 1536" fill="none">
              <polyline points={activeDirectionPolyline} stroke="#FBBF24" strokeWidth="8" strokeOpacity="0.95" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}

          <div className="absolute left-4 top-4 z-30 max-w-[calc(100%-96px)] rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#0EA5E9]"><Move className="h-3.5 w-3.5" /> Bản đồ tương tác</div>
            <div className="mt-1 truncate text-sm font-black text-[#0F172A]">{origin || 'Nơi ở'} → {destination || 'Thành phố'}</div>
            <div className="mt-1 text-[11px] font-semibold text-[#64748B]">Kéo để di chuyển · Cuộn để zoom · Chọn sticker</div>
          </div>

          <div className="absolute right-4 top-4 z-30 flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
            <button type="button" onClick={() => setZoomOffset((current) => Math.min(19 - mapBaseZoom, current + 1))} className="flex h-11 w-11 items-center justify-center border-b border-slate-100 text-[#0F172A] transition-colors hover:bg-sky-50 hover:text-[#0EA5E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]" aria-label="Phóng to bản đồ"><Plus className="h-4 w-4" /></button>
            <button type="button" onClick={() => setZoomOffset((current) => Math.max(3 - mapBaseZoom, current - 1))} className="flex h-11 w-11 items-center justify-center border-b border-slate-100 text-[#0F172A] transition-colors hover:bg-sky-50 hover:text-[#0EA5E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]" aria-label="Thu nhỏ bản đồ"><Minus className="h-4 w-4" /></button>
            <button type="button" onClick={resetMapView} className="flex h-11 w-11 items-center justify-center text-[#0F172A] transition-colors hover:bg-sky-50 hover:text-[#0EA5E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]" aria-label="Đặt lại bản đồ"><RotateCcw className="h-4 w-4" /></button>
          </div>

          <div className="absolute left-4 top-28 z-30 max-w-[calc(100%-96px)] rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleRouteSimulation}
                disabled={!canSimulateRoute}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-black text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]',
                  canSimulateRoute ? 'bg-[#0EA5E9] hover:bg-sky-500' : 'cursor-not-allowed bg-slate-300'
                )}
                aria-label={routeSimulationStatus === 'playing' ? 'Tạm dừng đi thử lộ trình' : 'Đi thử lộ trình'}
              >
                {routeSimulationStatus === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                Đi thử lộ trình
              </button>
              <button
                type="button"
                onClick={resetRouteSimulation}
                disabled={!canSimulateRoute || routeSimulationProgress === 0}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0F172A] transition-colors hover:bg-sky-50 hover:text-[#0EA5E9] disabled:cursor-not-allowed disabled:text-slate-300"
                aria-label="Chạy lại lộ trình"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={skipToNextSimulationStop}
                disabled={!canSimulateRoute || routeSimulationProgress >= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0F172A] transition-colors hover:bg-sky-50 hover:text-[#0EA5E9] disabled:cursor-not-allowed disabled:text-slate-300"
                aria-label="Tới điểm tiếp theo"
              >
                <SkipForward className="h-4 w-4" />
              </button>
              <div className="flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {[1, 2].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setRouteSimulationSpeed(speed as 1 | 2)}
                    className={cn(
                      'w-11 text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]',
                      routeSimulationSpeed === speed ? 'bg-[#0EA5E9] text-white' : 'text-[#64748B] hover:bg-sky-50 hover:text-[#0EA5E9]'
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#0EA5E9,#FBBF24)] transition-[width] duration-150" style={{ width: `${Math.round(routeSimulationProgress * 100)}%` }} />
            </div>
          </div>

          {(routeLoading || routeError) && selectedPlaces.length > 0 && (
            <div className="absolute left-4 top-52 z-30 max-w-[calc(100%-96px)] rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-[#64748B] shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
              {routeLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F97316]" />
                  OSRM đang dựng tuyến đường...
                </span>
              ) : routeError}
            </div>
          )}

          <div className="absolute bottom-3 left-4 z-30 max-w-[calc(100%-130px)] rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#64748B] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <span className="line-clamp-2">{selectedPlaces.length > 0 ? `Lộ trình gợi ý: ${suggestedRoute.map((stop) => stop.name).join(' -> ')}` : 'Chọn điểm để xem route preview'}</span>
          </div>
          <div className="absolute bottom-3 right-3 z-30 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-[#64748B] shadow-sm">© OpenStreetMap contributors</div>

          <div
            className="absolute z-[1000] flex max-w-[220px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-green-200 bg-green-50/95 px-3 py-2 text-xs font-black text-green-950 shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
            style={{
              left: 'calc(50% + ' + departureScreenPoint.x + 'px)',
              top: 'calc(50% + ' + departureScreenPoint.y + 'px)',
            }}
            title={`📍 Xuất phát: ${departurePoint.label}`}
          >
            <Navigation className="h-4 w-4 shrink-0 text-[#22C55E]" />
            <span className="truncate">📍 Xuất phát: {departurePoint.label}</span>
          </div>

          {analysisState === 'complete'
            ? routeLinePoints.slice(1).map((point, index) => (
              <div
                key={`numbered-route-step-${index}`}
                className="pointer-events-none absolute z-30 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#0EA5E9] text-sm font-bold text-white opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                style={{
                  left: 'calc(50% + ' + point.x + 'px)',
                  top: 'calc(50% + ' + point.y + 'px)',
                  animation: 'markerPop 0.28s ease-out forwards',
                  animationDelay: `${index * 200}ms`,
                }}
              >
                {index + 1}
              </div>
            ))
            : routeLinePoints.map((point, index) => (
              <div
                key={`route-step-${index}`}
                className={cn('pointer-events-none absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[11px] font-black text-white shadow-lg', index === 0 ? 'bg-[#22C55E]' : 'bg-[#0EA5E9]')}
                style={{ left: 'calc(50% + ' + point.x + 'px)', top: 'calc(50% + ' + point.y + 'px)' }}
              >
                {index === 0 ? '📍' : index}
              </div>
            ))}

          {guide.places.map((place) => {
            const Icon = CATEGORY_ICONS[place.category];
            const selected = selectedIds.includes(place.id);
            const simulationActive = activeSimulationPlace?.id === place.id;
            const markerOffset = MAP_MARKER_OFFSETS[place.id] ?? { x: 0, y: 0 };
            const placeX = (lngToTileX(place.lng, mapZoom) - lngToTileX(mapCenter.lng, mapZoom)) * 256 + mapPan.x;
            const placeY = (latToTileY(place.lat, mapZoom) - latToTileY(mapCenter.lat, mapZoom)) * 256 + mapPan.y;

            return (
              <button
                key={place.id}
                type="button"
                onClick={() => setSelectedPlace(place)}
                className={cn(
                  'absolute z-20 flex max-w-[220px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-[transform,box-shadow,background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2',
                  simulationActive
                    ? 'scale-125 border-[#FBBF24] bg-[#FBBF24] text-slate-950 ring-4 ring-amber-200/80'
                    : selected
                      ? 'scale-110 border-[#0EA5E9] bg-[#0EA5E9] text-white ring-4 ring-sky-200/80'
                      : 'border-white bg-white/95 text-[#0F172A] hover:scale-105 hover:border-sky-300 hover:text-[#0EA5E9]'
                )}
                style={{ left: 'calc(50% + ' + (placeX + markerOffset.x) + 'px)', top: 'calc(50% + ' + (placeY + markerOffset.y) + 'px)' }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{place.name}</span>
              </button>
            );
          })}

          <AnimatePresence>
            {selectedPlace && (() => {
              const details = getPlaceDetails(selectedPlace);
              const Icon = CATEGORY_ICONS[selectedPlace.category];
              const selected = selectedIds.includes(selectedPlace.id);
              const selectedActivities = selectedActivitiesByPlace[selectedPlace.id] ?? [];

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  data-place-modal="true"
                  className="absolute left-1/2 top-1/2 z-[100] flex max-h-[calc(100%-32px)] w-[min(390px,calc(100%-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                  style={{ x: '-50%', y: '-50%' }}
                >
                  <div className="relative h-44 shrink-0 overflow-hidden">
                    <LandmarkImage name={selectedPlace.name} wikiSlug={selectedPlace.wikiSlug} imageUrl={selectedPlace.imageUrl} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-4 pt-12 text-white">
                      <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-black backdrop-blur">
                        <Icon className="h-3 w-3" />
                        {CATEGORY_LABELS[selectedPlace.category]}
                      </div>
                      <h3 className="mt-2 text-xl font-black leading-tight">{selectedPlace.name}</h3>
                    </div>
                    <button type="button" onClick={() => setSelectedPlace(null)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#0F172A] shadow-sm hover:bg-white">
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto p-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-sky-50 px-3 py-2">
                        <p className="text-[10px] font-black uppercase text-sky-700">Rating</p>
                        <p className="mt-1 text-sm font-black text-[#0F172A]">{getPlaceRating(selectedPlace)}</p>
                      </div>
                      <div className="rounded-xl bg-orange-50 px-3 py-2">
                        <p className="text-[10px] font-black uppercase text-orange-700">Giờ đẹp</p>
                        <p className="mt-1 text-sm font-black text-[#0F172A]">{selectedPlace.bestTime}</p>
                      </div>
                      <div className="rounded-xl bg-green-50 px-3 py-2">
                        <p className="text-[10px] font-black uppercase text-green-700">Chi phí</p>
                        <p className="mt-1 text-sm font-black text-[#0F172A]">{formatMoney(selectedPlace.cost)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#64748B]">{details.desc}</p>
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[#0F172A]">Nên làm tại đây</p>
                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-[#0EA5E9] shadow-sm">
                          {selectedActivities.length}/{details.activities.length}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2">
                        {details.activities.map((activity) => {
                          const activitySelected = selectedActivities.includes(activity);

                          return (
                            <button
                              key={activity}
                              type="button"
                              onClick={() => togglePlaceActivity(selectedPlace.id, activity)}
                              className={cn(
                                'flex min-h-10 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]',
                                activitySelected
                                  ? 'border-sky-300 bg-white text-[#0F172A] shadow-sm'
                                  : 'border-transparent bg-white/70 text-[#475569] hover:border-sky-200 hover:bg-white'
                              )}
                              aria-pressed={activitySelected}
                            >
                              <span
                                className={cn(
                                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                  activitySelected ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white' : 'border-slate-300 bg-white text-transparent'
                                )}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0 flex-1">{activity}</span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedActivities.length > 0 && (
                        <p className="mt-2 line-clamp-2 text-xs font-semibold text-[#64748B]">
                          Đã chọn: {selectedActivities.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm font-semibold leading-6 text-orange-950">
                      {details.tip}
                    </div>
                    <Button
                      type="button"
                      onClick={() => addPlaceToTrip(selectedPlace.id)}
                      className={cn('mt-4 h-11 w-full rounded-xl font-black text-white', selected ? 'bg-[#22C55E] hover:bg-green-500' : 'bg-[#0EA5E9] hover:bg-sky-500')}
                    >
                      {selected ? 'Đã thêm vào chuyến đi' : 'Thêm vào chuyến đi'}
                    </Button>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
