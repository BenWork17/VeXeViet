/**
 * Dữ liệu biên tập báo chí & Engine gợi ý AI cho chuyên trang "Khám Phá Việt Nam" (/explore)
 * Tên tỉnh/thành phố đồng bộ 100% với VIETNAM_PROVINCES trong provinces.ts để liên kết trực tiếp tới /search và /travel.
 */

export type ExploreCategory =
  | 'Di sản & Văn hóa'
  | 'Thiên nhiên kỳ vĩ'
  | 'Vui chơi & Giải trí'
  | 'Ẩm thực & Đêm'
  | 'Chữa lành & Nghỉ dưỡng';

export type ExploreRegion = 'Miền Bắc' | 'Miền Trung' | 'Miền Nam';

export type CrowdLevel = 'Thấp' | 'Vừa phải' | 'Sôi động';

export type BudgetLevel = 'Tiết kiệm' | 'Cân bằng' | 'Cao cấp';

export type ExploreVibeId =
  | 'healing'
  | 'nature'
  | 'photography'
  | 'adventure'
  | 'culture'
  | 'nightlife'
  | 'family'
  | 'budget'
  | 'beach'
  | 'food';

export interface ExploreAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export interface ExploreHighlight {
  id: string;
  title: string;
  category: 'Tham quan' | 'Vui chơi' | 'Ẩm thực' | 'Trải nghiệm' | 'Săn ảnh';
  description: string;
  duration: string;
  durationHours: number;
  estimatedCost: string;
  estimatedCostVnd: number;
  goldenHour: string;
  tip?: string;
}

/**
 * Tọa độ góc đặt Camera 3D / Flycam thực tế tại điểm đến
 * Lưu ý: `coordinates` theo chuẩn `[lat, lng]` đồng bộ với `ExploreDestination.coordinates`
 * (Khi truyền vào MapLibre GL dùng `[coordinates[1], coordinates[0]]` tức `[lng, lat]`)
 */
export interface Camera3DVantagePoint {
  id: string;
  label: string;
  coordinates: [number, number]; // [lat, lng]
  pitch: number; // 60 - 74 degrees for 3D perspective
  bearing: number; // -180 to 180 degrees heading
  zoom: number; // 14.2 - 16.8
  altitudeMeters: number;
  imageUrl: string;
  description: string;
  bestTime: string;
  /** Thông số Google Street View 360° & Toàn cảnh Sphere (kiểu GeoGuessr) */
  streetViewHeading?: number; // 0 - 360 compass heading
  streetViewPitch?: number; // -30 to 30 vertical tilt (0 = eye level)
  streetViewFov?: number; // default 90
  /** Tọa độ đường phố / quảng trường / danh thắng đã xác thực có phủ sóng Google Street View / Photo Sphere */
  streetViewLatLng?: [number, number];
  /** Ảnh toàn cảnh góc rộng cho chế độ 360° Sphere tương tác */
  panorama360Url?: string;
}

export type Camera3DPreset = Camera3DVantagePoint;
export type DestinationCamera3D = Camera3DVantagePoint[];

export interface ExploreDestination {
  // Newspaper editorial metadata
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  standfirst: string;
  category: ExploreCategory;
  region: ExploreRegion;
  /** Tên tỉnh chuẩn khớp với VIETNAM_PROVINCES (provinces.ts) */
  province: string;
  /** Tên điểm đến gợi ý cho ô tìm kiếm vé xe (/search & /travel) */
  destinationProvince: string;
  /** Nhãn hiển thị địa danh kèm tỉnh (VD: "Vịnh Hạ Long • Quảng Ninh") */
  displayLocation: string;
  readTimeMinutes: number;
  publishedAt: string;
  author: ExploreAuthor;
  isLeadStory: boolean;
  editionNumber: string;
  columnSpan?: 'lead' | 'wide' | 'standard' | 'compact';

  // Visuals & Content
  heroImage: string;
  heroImageCaption: string;
  gallery: string[];
  pullQuote: string;
  storyParagraphs: string[];
  highlights: ExploreHighlight[];

  // Practical & AI Metadata
  vibes: ExploreVibeId[];
  vibeTags: string[];
  bestMonths: string;
  seasonalPulse: string;
  crowdLevel: CrowdLevel;
  weatherSummary: string;
  estimatedBudgetPerDay: number;
  estimatedBudgetFormatted: string;
  budgetLevel: BudgetLevel;
  suggestedOrigin: string;
  originSuggestion: string;
  busDurationHours: number;
  busDurationLabel: string;
  busPriceFrom: number;
  busPriceFormatted: string;
  recommendedBusType: string;
  coordinates: [number, number];
  aiInsight: string;
  aiAudioSummary: string;
  localSpecialties: string[];
  /** Danh sách góc đặt Camera 3D / Flycam tương tác tại địa danh */
  camera3DAngles: Camera3DVantagePoint[];
  camera3D?: Camera3DVantagePoint[];
}

/** Alias tương thích cho các component dùng tên ExploreArticle */
export type ExploreArticle = ExploreDestination;

export interface ExploreVibeOption {
  id: ExploreVibeId;
  label: string;
  shortLabel: string;
  description: string;
  samplePrompt: string;
}

export interface AiQuickPromptPreset {
  id: string;
  label: string;
  prompt: string;
  vibes: ExploreVibeId[];
  region?: ExploreRegion;
  budgetLevel?: BudgetLevel;
  badge: string;
}

export interface AiFeatureShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  liveMetric: string;
}

export interface ScoredExploreDestination extends ExploreDestination {
  destination: ExploreDestination;
  matchScore: number;
  matchPercentage: number;
  matchReasons: string[];
  recommendedHighlightIds: string[];
}

export interface AiMatchResult {
  matches: ScoredExploreDestination[];
  destinations: ScoredExploreDestination[];
  editorialSummary: string;
  explanation: string;
  detectedVibes: ExploreVibeId[];
  suggestedDurationDays: number;
  estimatedTotalBudget: number;
  appliedRegion?: string;
  appliedBudgetLevel?: string;
}

export interface AiTripPlanSlot {
  timeOfDay: 'Buổi sáng' | 'Buổi chiều' | 'Buổi tối';
  timeRange: string;
  activityTitle: string;
  description: string;
  estimatedCostVnd: number;
  goldenHourNote?: string;
}

export interface AiTripPlanDay {
  dayNumber: number;
  title: string;
  destinationId: string;
  destinationName: string;
  province: string;
  suggestedOrigin: string;
  busRouteLabel: string;
  busType: string;
  busDurationHours: number;
  busPriceVnd: number;
  dailyBudgetVnd: number;
  aiTip: string;
  slots: AiTripPlanSlot[];
  searchUrl: string;
  travelUrl: string;
}

export interface AiGeneratedTripPlan {
  selectedDestinations: ExploreDestination[];
  totalDays: number;
  totalEstimatedCost: number;
  totalEstimatedCostFormatted: string;
  totalBusCost: number;
  totalActivityCost: number;
  totalLivingCost: number;
  routeSequence: string[];
  routeSummaryLabel: string;
  editorialTitle: string;
  editorialOverview: string;
  aiPackingAndTimingTip: string;
  days: AiTripPlanDay[];
  primaryOrigin: string;
  primaryDestination: string;
  searchQueryParams: {
    origin: string;
    destination: string;
    passengers: string;
  };
  travelQueryParams: {
    origin: string;
    destination: string;
    stops: string;
  };
  searchUrl: string;
  travelUrl: string;
}
