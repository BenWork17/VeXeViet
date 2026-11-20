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

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  'Di sản & Văn hóa',
  'Thiên nhiên kỳ vĩ',
  'Vui chơi & Giải trí',
  'Ẩm thực & Đêm',
  'Chữa lành & Nghỉ dưỡng',
];

export const EXPLORE_REGIONS: ExploreRegion[] = [
  'Miền Bắc',
  'Miền Trung',
  'Miền Nam',
];

export const EXPLORE_VIBES: ExploreVibeOption[] = [
  {
    id: 'healing',
    label: 'Chữa lành & Săn mây',
    shortLabel: 'Chữa lành',
    description: 'Không gian tĩnh lặng, sương sớm, rừng thông và khoáng nóng tái tạo năng lượng.',
    samplePrompt: 'Tìm nơi se lạnh, săn mây buổi sớm và nghỉ dưỡng yên tĩnh 3 ngày 2 đêm',
  },
  {
    id: 'nature',
    label: 'Thiên nhiên Kỳ vĩ',
    shortLabel: 'Thiên nhiên',
    description: 'Vịnh đảo đá vôi, hẻm vực hùng vĩ, đồi cát bay và những cung đường ngoạn mục.',
    samplePrompt: 'Khám phá kỳ quan thiên nhiên hùng vĩ, đi thuyền ngắm cảnh núi non sông nước',
  },
  {
    id: 'culture',
    label: 'Di sản & Văn hóa',
    shortLabel: 'Di sản',
    description: 'Kinh thành cổ, phố đèn lồng, kiến trúc trăm năm và chiều sâu lịch sử Việt.',
    samplePrompt: 'Hành trình tìm về cố đô, di sản UNESCO và văn hóa bản địa đặc sắc',
  },
  {
    id: 'photography',
    label: 'Săn ảnh Nghệ thuật',
    shortLabel: 'Nhiếp ảnh',
    description: 'Những tọa độ có khung giờ vàng rực rỡ nhất cho tín đồ xê dịch và nhiếp ảnh.',
    samplePrompt: 'Gợi ý những điểm có bình minh và hoàng hôn đẹp nhất để chụp ảnh',
  },
  {
    id: 'adventure',
    label: 'Phiêu lưu & Khám phá',
    shortLabel: 'Phiêu lưu',
    description: 'Đổ đèo vùng cao, chèo kayak, lặn ngắm san hô và chinh phục đỉnh cao.',
    samplePrompt: 'Tôi muốn đi phượt cung đường đèo hùng vĩ và trải nghiệm thể thao ngoài trời',
  },
  {
    id: 'nightlife',
    label: 'Ẩm thực & Phố đêm',
    shortLabel: 'Ẩm thực & Đêm',
    description: 'Chợ đêm bản địa, ẩm thực đường phố trứ danh và trình diễn nghệ thuật thực cảnh.',
    samplePrompt: 'Thưởng thức ẩm thực đêm đặc sắc, dạo phố cổ và xem show thực cảnh',
  },
  {
    id: 'family',
    label: 'Gia đình & Giải trí',
    shortLabel: 'Gia đình',
    description: 'Tổ hợp vui chơi giải trí, cáp treo kỷ lục, công viên chủ đề cho mọi lứa tuổi.',
    samplePrompt: 'Chuyến đi cuối tuần cho gia đình có cáp treo, khu vui chơi và biển đẹp',
  },
  {
    id: 'budget',
    label: 'Du lịch Tiết kiệm',
    shortLabel: 'Tiết kiệm',
    description: 'Di chuyển xe giường nằm tối ưu chi phí, ăn ngon chuẩn vị dân bản địa.',
    samplePrompt: 'Phượt tiết kiệm dưới 1 triệu/ngày bằng xe khách giường nằm chất lượng cao',
  },
  {
    id: 'beach',
    label: 'Biển đảo & Vịnh xanh',
    shortLabel: 'Biển đảo',
    description: 'Những vịnh biển ngọc bích, đảo san hô và bờ cát trắng nắng vàng rực rỡ.',
    samplePrompt: 'Tìm điểm đi biển đảo nước trong xanh, lặn ngắm san hô và nghỉ dưỡng',
  },
  {
    id: 'food',
    label: 'Tinh hoa Ẩm thực',
    shortLabel: 'Ẩm thực',
    description: 'Foodtour đặc sản bản địa, chợ nổi sông nước và ẩm thực đường phố.',
    samplePrompt: 'Hành trình khám phá ẩm thực địa phương đặc sắc từ cố đô đến miền Tây',
  },
];

export const AI_QUICK_PROMPTS: AiQuickPromptPreset[] = [
  {
    id: 'cloud-healing',
    label: 'Chữa lành săn mây 3N2Đ',
    prompt: 'Chữa lành săn mây giữa sương mù, đồi thông và khí hậu se lạnh 3 ngày 2 đêm',
    vibes: ['healing', 'photography', 'nature'],
    badge: 'Top Xu Hướng Mùa Thu - Đông',
  },
  {
    id: 'central-heritage',
    label: 'Di sản & Ẩm thực miền Trung',
    prompt: 'Khám phá di sản văn hóa, phố cổ đèn lồng và ẩm thực cung đình miền Trung',
    vibes: ['culture', 'nightlife', 'photography'],
    region: 'Miền Trung',
    badge: 'Cung Đường Di Sản UNESCO',
  },
  {
    id: 'island-entertainment',
    label: 'Vui chơi biển đảo sôi động',
    prompt: 'Vui chơi giải trí biển đảo, lặn ngắm san hô, cáp treo vượt biển và chợ đêm',
    vibes: ['family', 'adventure', 'nightlife'],
    badge: 'Thiên Đường Giải Trí Biển',
  },
  {
    id: 'budget-weekend',
    label: 'Phượt tiết kiệm cuối tuần',
    prompt: 'Lịch trình đi xe khách giường nằm cuối tuần tiết kiệm chi phí nhưng cảnh đẹp kỳ vĩ',
    vibes: ['budget', 'nature', 'adventure'],
    budgetLevel: 'Tiết kiệm',
    badge: 'Tối Ưu Ngân Sách < 950k/ngày',
  },
];

export const AI_NEXT_GEN_FEATURES: AiFeatureShowcaseItem[] = [
  {
    id: 'seasonal-pulse',
    title: 'AI Seasonal & Weather Pulse',
    subtitle: 'Nhịp đập mùa vụ & Thời điểm vàng',
    badge: 'Dữ liệu Thời gian thực',
    description:
      'Phân tích độ phủ mây, mùa lúa chín, mùa hoa tam giác mạch và mực nước vịnh để gợi ý khung giờ khởi hành xe khách lý tưởng nhất.',
    liveMetric: 'Đà Lạt & Sa Pa: Tỷ lệ săn mây thành công 88% tuần này',
  },
  {
    id: 'crowd-forecast',
    title: 'AI Crowd & Fare Predictor',
    subtitle: 'Dự báo mật độ khách & Giá vé thông minh',
    badge: 'Tối ưu Chi phí',
    description:
      'Dự đoán mật độ du khách tại danh thắng và đề xuất chuyến xe đêm giúp bạn có mặt lúc bình minh trước khi đám đông đổ về.',
    liveMetric: 'Tiết kiệm tới 24% khi đi chuyến Limousine khởi hành 22:00',
  },
  {
    id: 'audio-narrator',
    title: 'AI Audio Magazine Narrator',
    subtitle: 'Báo nói du lịch trên hành trình xe khách',
    badge: 'Trải nghiệm Trên xe',
    description:
      'Biên tập bài viết chuyên sâu thành bản tin âm thanh kể chuyện lịch sử & văn hóa địa phương khi xe chuẩn bị tiến vào tỉnh điểm đến.',
    liveMetric: '12 chuyên mục kể chuyện di sản Bắc - Trung - Nam',
  },
  {
    id: 'visual-spot-finder',
    title: 'AI Visual Spot Finder',
    subtitle: 'Nhận diện danh lam qua ảnh chụp',
    badge: 'Thị giác Máy tính',
    description:
      'Tải lên một bức ảnh phong cảnh bất kỳ tại Việt Nam — AI tự động định danh tọa độ, mùa chụp đẹp nhất và gợi ý tuyến xe khách đến đó.',
    liveMetric: 'Độ chính xác nhận diện 96.4% trên 63 tỉnh thành',
  },
  {
    id: 'smart-bundler',
    title: 'AI Bus + Play Combo Bundler',
    subtitle: 'Gợi ý trọn gói Vé xe & Điểm vui chơi',
    badge: 'Lập Lịch trình 1-Chạm',
    description:
      'Tự động ghép nối giờ xe khách cập bến với lịch mở cửa của các điểm vui chơi giải trí để không lãng phí bất kỳ giờ nghỉ nào.',
    liveMetric: 'Đồng bộ trực tiếp với Bản đồ Lộ trình (/travel) & Đặt vé (/search)',
  },
];

export const EDITORIAL_TICKER_ITEMS: string[] = [
  'ẤN PHẨM ĐẶC BIỆT: Hành trình xuyên Việt qua 12 tuyệt tác danh lam thắng cảnh & tọa độ giải trí',
  'MÙA SĂN MÂY: Sa Pa (Lào Cai) & Đà Lạt (Lâm Đồng) bước vào khung cảnh sương sớm đẹp nhất năm',
  'TUYẾN XE ĐÊM VIP: Hà Nội → Hà Giang & TP. Hồ Chí Minh → Đà Lạt tăng cường dòng Cabin Cung Điện Đôi',
  'CUNG ĐƯỜNG DI SẢN: Huế → Đà Nẵng → Hội An kết nối liền mạch bằng Limousine chỉ từ 140.000đ',
];

export const EXPLORE_DESTINATIONS: ExploreDestination[] = [
  // ==========================================
  // 1. VỊNH HẠ LONG - QUẢNG NINH (LEAD STORY)
  // ==========================================
  {
    id: 'vinh-ha-long-quang-ninh',
    slug: 'vinh-ha-long-ban-giao-huong-da-voi-va-ngoc-luc-bao',
    title: 'Vịnh Hạ Long: Bản Giao Hưởng Của 1.969 Đảo Đá Vôi Trên Mặt Nước Ngọc Lục Bảo',
    subtitle:
      'Từ những chuyến thủy phi cơ ngắm toàn cảnh kỳ quan thiên nhiên thế giới đến đêm hải trình tĩnh lặng giữa lòng vịnh Bái Tử Long – Lan Hạ.',
    standfirst:
      'Từ những chuyến thủy phi cơ ngắm toàn cảnh kỳ quan thiên nhiên thế giới đến đêm hải trình tĩnh lặng giữa lòng vịnh Bái Tử Long – Lan Hạ.',
    category: 'Thiên nhiên kỳ vĩ',
    region: 'Miền Bắc',
    province: 'Quảng Ninh',
    destinationProvince: 'Quảng Ninh',
    displayLocation: 'Vịnh Hạ Long • Quảng Ninh',
    readTimeMinutes: 6,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Minh Triết',
      role: 'Chủ biên Du lịch & Di sản',
    },
    isLeadStory: true,
    editionNumber: 'Vol. 24 • Trang Nhất Đặc Biệt',
    columnSpan: 'lead',
    heroImage:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85',
    heroImageCaption:
      'Ánh bình minh nhuộm vàng những dãy núi đá vôi hàng triệu năm tuổi trên vùng vịnh di sản Quảng Ninh.',
    gallery: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Không nơi nào trên thế giới mà đá và nước lại đối thoại với nhau bằng một ngôn ngữ trầm mặc, kỳ vĩ như buổi sớm sương tan trên Vịnh Hạ Long.”',
    storyParagraphs: [
      'Khi những tia nắng đầu tiên xuyên qua lớp sương mỏng trên mặt vịnh, gần hai ngàn hòn đảo đá vôi lớn nhỏ hiện lên như một bức tranh thủy mặc khổng lồ sống động. Chỉ cách Hà Nội hơn hai giờ di chuyển bằng dòng xe Limousine cao tốc, Hạ Long hôm nay không chỉ có những chuyến tàu tham quan truyền thống mà đã vươn mình thành thủ phủ giải trí – nghỉ dưỡng biển đẳng cấp châu Á.',
      'Đi sâu vào vùng lõi di sản, du khách có thể tự tay chèo thuyền kayak luồn qua Hang Luồn tĩnh lặng, nơi vách đá dựng đứng soi bóng xuống làn nước xanh màu ngọc bích. Buổi chiều, cáp treo Nữ Hoàng đưa tầm mắt bay qua cầu Bãi Cháy để đón hoàng hôn rực đỏ trên đỉnh đồi Mặt Trời.',
      'Khi màn đêm buông xuống, phố biển Bãi Cháy và Hòn Gai bừng sáng với những đại nhạc hội ngoài trời, chợ đêm hải sản tươi rói và những du thuyền 5 sao neo đậu giữa vịnh tĩnh mịch – nơi bạn có thể vừa thưởng thức chả mực giã tay vừa lắng nghe tiếng sóng vỗ mạn tàu.',
    ],
    highlights: [
      {
        id: 'hl-kayak-hang-luon',
        title: 'Chèo Kayak xuyên Hang Luồn & Đảo Ti Tốp',
        category: 'Trải nghiệm',
        description:
          'Tự tay chèo kayak qua vòm đá tự nhiên vào hồ nước kín giữa bốn bề núi đá vôi và leo 400 bậc đá lên đỉnh Ti Tốp ngắm toàn cảnh vịnh.',
        duration: '3.5 giờ',
        durationHours: 3.5,
        estimatedCost: '450.000đ',
        estimatedCostVnd: 450000,
        goldenHour: '07:30 – 10:30',
        tip: 'Chọn tuyến tàu số 2 buổi sáng sớm để mặt nước phẳng lặng như gương và ít tàu du lịch.',
      },
      {
        id: 'hl-sunworld-cap-treo',
        title: 'Cáp treo Nữ Hoàng & Tổ hợp Sun World Hạ Long',
        category: 'Vui chơi',
        description:
          'Trải nghiệm cabin cáp treo 2 tầng vượt biển ngắm toàn cảnh vịnh Cửa Lục, vòng quay Mặt Trời và khu vườn Nhật Zen Garden trên đỉnh Ba Đèo.',
        duration: '4 giờ',
        durationHours: 4,
        estimatedCost: '350.000đ',
        estimatedCostVnd: 350000,
        goldenHour: '16:30 – 18:30',
        tip: 'Đi cáp treo lúc 17:00 để bắt trọn khoảnh khắc hoàng hôn buông xuống cầu Bãi Cháy.',
      },
      {
        id: 'hl-bao-tang-quang-ninh',
        title: 'Check-in Bảo tàng Quảng Ninh & Cung Cá Heo',
        category: 'Tham quan',
        description:
          'Kiến trúc kính đen khổng lồ được ví như “viên ngọc đen” bên bờ vịnh cùng cung đường bao biển Trần Quốc Nghiễn tuyệt đẹp.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '40.000đ',
        estimatedCostVnd: 40000,
        goldenHour: '08:30 – 10:30',
      },
      {
        id: 'hl-am-thuc-hon-gai',
        title: 'Foodtour Chả mực Hạ Long & Hải sản phố cổ Hòn Gai',
        category: 'Ẩm thực',
        description:
          'Thưởng thức bánh cuốn chả mực giã tay nóng hổi, bề bề rang muối, hà biển và sữa chua trân châu Hạ Long chính gốc.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '300.000đ',
        estimatedCostVnd: 300000,
        goldenHour: '18:30 – 21:00',
      },
    ],
    vibes: ['nature', 'photography', 'family', 'healing'],
    vibeTags: ['Di sản UNESCO', 'Du thuyền & Kayak', 'Giải trí biển', 'Nhiếp ảnh'],
    bestMonths: 'Tháng 9 – Tháng 11 & Tháng 3 – Tháng 5',
    seasonalPulse: 'Trời thu trong xanh, nắng dịu nhẹ và mặt vịnh êm sóng lý tưởng để chèo kayak',
    crowdLevel: 'Vừa phải',
    weatherSummary: '22°C – 27°C • Nắng nhẹ, gió biển mát lành',
    estimatedBudgetPerDay: 1350000,
    estimatedBudgetFormatted: '1.350.000đ / ngày',
    budgetLevel: 'Cân bằng',
    suggestedOrigin: 'Hà Nội',
    originSuggestion: 'Hà Nội',
    busDurationHours: 2.5,
    busDurationLabel: '2.5 giờ cao tốc',
    busPriceFrom: 220000,
    busPriceFormatted: '220.000đ',
    recommendedBusType: 'Limousine VIP 9 chỗ ghế Massage',
    coordinates: [20.9505, 107.0734],
    aiInsight:
      'Khởi hành từ Hà Nội bằng chuyến Limousine 06:00 sáng giúp bạn có mặt tại Cảng tàu Quốc tế Tuần Châu đúng 08:30 – kịp chuyến hải trình đẹp nhất trong ngày và tiết kiệm 1 đêm khách sạn.',
    aiAudioSummary:
      'Vịnh Hạ Long thuộc tỉnh Quảng Ninh, di sản thiên nhiên thế giới hai lần được UNESCO vinh danh với gần 2.000 đảo đá vôi kỳ vĩ và hệ sinh thái hang động độc nhất vô nhị.',
    localSpecialties: ['Bánh cuốn chả mực giã tay', 'Sá sùng Quảng Ninh', 'Sữa chua trân châu Hạ Long', 'Sam biển Hòn Gai'],
    camera3DAngles: [
      {
        id: 'halong-cam-titop',
        label: 'Flycam Đỉnh Đảo Ti Tốp & Vịnh Lõi',
        coordinates: [20.8594, 107.0811],
        pitch: 68,
        bearing: 135,
        zoom: 14.8,
        altitudeMeters: 260,
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn 360° từ độ cao 260m trên đỉnh đảo Ti Tốp bao trọn hàng trăm đảo đá vôi giữa làn nước ngọc lục bảo.',
        bestTime: 'Bình minh 05:45 – 07:15',
        streetViewLatLng: [20.9502, 107.0439], // Đường bao biển Bãi Cháy - Hạ Long
        streetViewHeading: 145,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'halong-cam-sunworld',
        label: 'Góc Cam 3D Cáp Treo Nữ Hoàng & Cầu Bãi Cháy',
        coordinates: [20.9571, 107.0631],
        pitch: 64,
        bearing: -42,
        zoom: 15.2,
        altitudeMeters: 215,
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc máy lơ lửng ngang trụ cáp treo cao nhất thế giới hướng thẳng về cầu dây văng Bãi Cháy và vòng quay Mặt Trời.',
        bestTime: 'Hoàng hôn 16:45 – 18:15',
        streetViewLatLng: [20.9537, 107.0568], // Quảng trường Sun World Bãi Cháy
        streetViewHeading: 52,
        streetViewPitch: 10,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'halong-cam-hang-luon',
        label: 'Góc Cam Thấp Cảng Tuần Châu & Vịnh Hạ Long',
        coordinates: [20.8442, 107.0905],
        pitch: 72,
        bearing: 65,
        zoom: 15.8,
        altitudeMeters: 110,
        imageUrl: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc flycam lướt sát mặt nước qua vòm đá tự nhiên Hang Luồn và khu vực Cảng tàu Quốc tế Tuần Châu.',
        bestTime: 'Buổi sáng 08:00 – 10:00',
        streetViewLatLng: [20.9222, 106.9896], // Cảng tàu Quốc tế Tuần Châu
        streetViewHeading: 120,
        streetViewPitch: 4,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 2. HÀ GIANG LOOP & ĐỒNG VĂN - HÀ GIANG
  // ==========================================
  {
    id: 'ha-giang-dong-van-nho-que',
    slug: 'ha-giang-ban-anh-hung-ca-tren-cao-nguyen-da-dong-van',
    title: 'Hà Giang: Bản Anh Hùng Ca Trên Cao Nguyên Đá Xám & Dòng Nho Quế Xanh Ngọc',
    subtitle:
      'Chinh phục đèo Mã Pí Lèng huyền thoại, du thuyền xuyên hẻm vực Tu Sản sâu nhất Đông Nam Á và chạm tay vào cột cờ Lũng Cú nơi địa đầu Tổ quốc.',
    standfirst:
      'Chinh phục đèo Mã Pí Lèng huyền thoại, du thuyền xuyên hẻm vực Tu Sản sâu nhất Đông Nam Á và chạm tay vào cột cờ Lũng Cú nơi địa đầu Tổ quốc.',
    category: 'Thiên nhiên kỳ vĩ',
    region: 'Miền Bắc',
    province: 'Hà Giang',
    destinationProvince: 'Hà Giang',
    displayLocation: 'Cao nguyên đá Đồng Văn • Hà Giang',
    readTimeMinutes: 7,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Hoàng Bách',
      role: 'Phóng viên Cung đường & Bản địa',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Chuyên đề Miền Đá Nở Hoa',
    columnSpan: 'wide',
    heroImage:
      'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Dòng sông Nho Quế xanh biếc uốn lượn dưới chân đèo Mã Pí Lèng và hẻm vực Tu Sản hùng vĩ.',
    gallery: [
      'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Ở Hà Giang, sự sống nảy mầm từ đá tai mèo sắc lạnh, và mỗi khúc cua trên Mã Pí Lèng đều khiến trái tim người lữ khách lỡ một nhịp vì choáng ngợp.”',
    storyParagraphs: [
      'Hành trình bắt đầu từ chuyến xe Cabin Cung Điện đêm khởi hành tại Hà Nội. Khi mở mắt lúc 4 giờ sáng tại thành phố Hà Giang (Km0), không khí vùng cao trong trẻo như đánh thức mọi giác quan trước khi bước vào cung đường Hạnh Phúc dài gần 200km xuyên qua Quản Bạ, Yên Minh, Đồng Văn và Mèo Vạc.',
      'Đứng trên đỉnh đèo Mã Pí Lèng – một trong “Tứ đại đỉnh đèo” của miền Bắc, nhìn xuống vực sâu gần một cây số nơi dòng sông Nho Quế trôi êm đềm như dải lụa ngọc bích, mọi mỏi mệt phố thị dường như tan biến.',
      'Tại phố cổ Đồng Văn và làng văn hóa Lô Lô Chải dưới chân cột cờ Lũng Cú, những ngôi nhà trình tường đất vàng mái ngói âm dương hàng trăm năm tuổi mời gọi du khách ngồi bên bếp lửa hồng, nhấp chén rượu ngô men lá và thưởng thức nồi thắng cố, lẩu gà đen nóng hổi.',
    ],
    highlights: [
      {
        id: 'hg-hem-tu-san-nho-que',
        title: 'Đi thuyền & Chèo SUP xuyên Hẻm vực Tu Sản – Sông Nho Quế',
        category: 'Trải nghiệm',
        description:
          'Ngồi thuyền máy hoặc chèo SUP đi giữa hai vách đá dựng đứng cao tới 700–800m của hẻm vực địa chất sâu nhất Đông Nam Á.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '09:00 – 11:30',
        tip: 'Khi nắng lên cao qua đỉnh vách đá lúc 10h sáng, màu nước sông Nho Quế chuyển sang sắc xanh ngọc lục bảo rực rỡ nhất.',
      },
      {
        id: 'hg-deo-ma-pi-leng',
        title: 'Săn mây & Thưởng trà trên Đỉnh đèo Mã Pí Lèng',
        category: 'Săn ảnh',
        description:
          'Dừng chân tại Panorama Mã Pí Lèng và vách đá trắng, ngắm toàn cảnh cung đường đèo hiểm trở vắt ngang lưng trời.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '80.000đ',
        estimatedCostVnd: 80000,
        goldenHour: '15:00 – 17:00',
      },
      {
        id: 'hg-lung-cu-lo-lo-chai',
        title: 'Chinh phục Cột cờ Lũng Cú & Làng cổ Lô Lô Chải',
        category: 'Tham quan',
        description:
          'Chạm tay vào điểm cực Bắc thiêng liêng và tản bộ qua bản làng của người Lô Lô với quán cà phê Cực Bắc nổi tiếng.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '100.000đ',
        estimatedCostVnd: 100000,
        goldenHour: '14:00 – 16:30',
      },
      {
        id: 'hg-pho-co-dong-van',
        title: 'Đêm Phố cổ Đồng Văn & Ẩm thực vùng cao',
        category: 'Ẩm thực',
        description:
          'Thưởng thức bánh cuốn trứng nóng, cháo ấu tẩu, lẩu gà đen và giao lưu khèn Mông tại quảng trường phố cổ.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '220.000đ',
        estimatedCostVnd: 220000,
        goldenHour: '19:00 – 22:00',
      },
    ],
    vibes: ['adventure', 'nature', 'photography', 'budget'],
    vibeTags: ['Công viên Địa chất UNESCO', 'Phượt Đèo Hùng Vĩ', 'Săn ảnh', 'Văn hóa Bản địa'],
    bestMonths: 'Tháng 9 – Tháng 12 (Mùa tam giác mạch) & Tháng 2 – Tháng 4 (Mùa hoa đào, hoa lê)',
    seasonalPulse: 'Mùa hoa tam giác mạch đang phủ hồng các thung lũng Sủng Là và Lũng Cẩm',
    crowdLevel: 'Vừa phải',
    weatherSummary: '14°C – 22°C • Se lạnh vùng cao, nắng vàng trong vắt',
    estimatedBudgetPerDay: 850000,
    estimatedBudgetFormatted: '850.000đ / ngày',
    budgetLevel: 'Tiết kiệm',
    suggestedOrigin: 'Hà Nội',
    originSuggestion: 'Hà Nội',
    busDurationHours: 6,
    busDurationLabel: '6 giờ xe Cabin đêm',
    busPriceFrom: 300000,
    busPriceFormatted: '300.000đ',
    recommendedBusType: 'Xe Giường Nằm Cabin Cung Điện VIP',
    coordinates: [23.2789, 105.3619],
    aiInsight:
      'Đặt chuyến xe giường nằm Cabin lúc 21:30 từ Hà Nội, bạn sẽ ngủ thẳng giấc và tới bến xe Hà Giang lúc 03:30 sáng. Các nhà xe đều hỗ trợ phòng nghỉ miễn phí tới 07:00 sáng trước khi nhận xe máy hoặc xe ghép lên cao nguyên đá.',
    aiAudioSummary:
      'Cao nguyên đá Đồng Văn tại Hà Giang là công viên địa chất toàn cầu UNESCO, nổi tiếng với đèo Mã Pí Lèng, sông Nho Quế và bản sắc văn hóa độc đáo của 19 dân tộc anh em.',
    localSpecialties: ['Thắng cố & Lẩu gà đen', 'Cháo ấu tẩu', 'Bánh cuốn trứng Đồng Văn', 'Bánh tam giác mạch nướng'],
    camera3DAngles: [
      {
        id: 'hagiang-cam-tu-san',
        label: 'Flycam Hẻm Vực Tu Sản & Đèo Mã Pí Lèng',
        coordinates: [23.2261, 105.4119],
        pitch: 72,
        bearing: -28,
        zoom: 14.9,
        altitudeMeters: 480,
        imageUrl: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn thẳng xuống khe vực địa chất sâu gần 800m nơi dòng sông Nho Quế xanh ngọc bích uốn lượn.',
        bestTime: 'Nắng lên 09:30 – 11:30',
        streetViewLatLng: [23.2414, 105.4021], // Điểm dừng chân Đèo Mã Pí Lèng (QL4C)
        streetViewHeading: 115,
        streetViewPitch: 2,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'hagiang-cam-ma-pi-leng',
        label: 'Góc Cam 3D Phố Cổ Đồng Văn',
        coordinates: [23.2389, 105.4028],
        pitch: 66,
        bearing: 115,
        zoom: 15.1,
        altitudeMeters: 620,
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
        description: 'Toàn cảnh phố cổ Đồng Văn và con đường Hạnh Phúc vắt ngang vách đá tai mèo dựng đứng trên cao nguyên đá.',
        bestTime: 'Chiều tà 15:30 – 17:15',
        streetViewLatLng: [23.2775, 105.3627], // Phố cổ Đồng Văn, Hà Giang
        streetViewHeading: 240,
        streetViewPitch: 5,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'hagiang-cam-lung-cu',
        label: 'Flycam Cột Cờ Lũng Cú & Bản Lô Lô Chải',
        coordinates: [23.3636, 105.3164],
        pitch: 62,
        bearing: 18,
        zoom: 15.5,
        altitudeMeters: 350,
        imageUrl: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc máy xoay quanh đỉnh núi Rồng nơi lá cờ 54m² tung bay trên hai hồ nước mắt Rồng và mái nhà trình tường Lô Lô Chải.',
        bestTime: 'Buổi chiều 14:30 – 16:30',
        streetViewLatLng: [23.3631, 105.3169], // Cột cờ Lũng Cú
        streetViewHeading: 18,
        streetViewPitch: 12,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 3. SA PA & FANSIPAN - LÀO CAI
  // ==========================================
  {
    id: 'sapa-fansipan-lao-cai',
    slug: 'sa-pa-ban-tinh-ca-suong-mu-va-dinh-thieng-fansipan',
    title: 'Sa Pa: Chạm Tay Vào Biển Mây Trên Đỉnh Thiêng Fansipan 3.143m',
    subtitle:
      'Đi tàu hỏa leo núi Mường Hoa xuyên qua biển sương mù, tản bộ giữa thung lũng ruộng bậc thang bản Cát Cát và ngâm mình trong lá thuốc Dao đỏ.',
    standfirst:
      'Đi tàu hỏa leo núi Mường Hoa xuyên qua biển sương mù, tản bộ giữa thung lũng ruộng bậc thang bản Cát Cát và ngâm mình trong lá thuốc Dao đỏ.',
    category: 'Chữa lành & Nghỉ dưỡng',
    region: 'Miền Bắc',
    province: 'Lào Cai',
    destinationProvince: 'Lào Cai',
    displayLocation: 'Sa Pa • Lào Cai',
    readTimeMinutes: 5,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Lan Khuê',
      role: 'Biên tập viên Phong cách sống & Nghỉ dưỡng',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Chuyên mục Chữa Lành',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Những thửa ruộng bậc thang uốn lượn trong sương sớm tại thung lũng Mường Hoa, Sa Pa, Lào Cai.',
    gallery: [
      'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Trên độ cao 3.143m của Nóc nhà Đông Dương, biển mây cuồn cuộn dưới chân khiến con người thấy mình thật nhỏ bé nhưng tâm hồn lại rộng mở vô cùng.”',
    storyParagraphs: [
      'Nằm ở độ cao hơn 1.600m so với mực nước biển tại tỉnh Lào Cai, thị xã trong sương Sa Pa luôn mang một sức quyến rũ kỳ lạ với kiến trúc Pháp cổ điển ẩn hiện sau những rặng thông già và sương mù bảng lảng.',
      'Chuyến tàu hỏa leo núi đỏ rực từ Sun Plaza đưa du khách băng qua thung lũng Mường Hoa để nối tiếp lên cáp treo ba dây hiện đại bậc nhất thế giới. Chỉ trong 15 phút lơ lửng giữa tầng không, bạn đã bước lên quần thể tâm linh kỳ vĩ trên đỉnh Fansipan lộng gió.',
      'Trở về thị trấn khi chiều buông, không gì tuyệt vời hơn việc thư giãn trong bồn gỗ Pơ-mu ngâm lá thuốc thơm nồng của người Dao đỏ ở Tả Phìn, trước khi thưởng thức nồi lẩu cá tầm, cá hồi vân tươi rói bên bếp than hồng.',
    ],
    highlights: [
      {
        id: 'sp-fansipan-muong-hoa',
        title: 'Tàu hỏa leo núi Mường Hoa & Cáp treo Đỉnh Fansipan',
        category: 'Vui chơi',
        description:
          'Trải nghiệm tàu hỏa leo núi cổ điển và cáp treo chinh phục Nóc nhà Đông Dương 3.143m giữa biển mây.',
        duration: '4.5 giờ',
        durationHours: 4.5,
        estimatedCost: '850.000đ',
        estimatedCostVnd: 850000,
        goldenHour: '08:00 – 11:00',
        tip: 'Kiểm tra camera trực tiếp đỉnh Fansipan tại ga đi trước khi mua vé để chọn đúng khung giờ biển mây quang đãng.',
      },
      {
        id: 'sp-ban-cat-cat-ta-van',
        title: 'Trekking Bản Cát Cát & Thung lũng Tả Van',
        category: 'Tham quan',
        description:
          'Dạo bước bên thác Tiên Sa, cối xay nước khổng lồ và những ngôi nhà gỗ yên bình của người H’Mông, Giáy.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '14:30 – 17:00',
      },
      {
        id: 'sp-tam-la-dao-do',
        title: 'Tắm lá thuốc người Dao đỏ & Thưởng trà ngắm mây',
        category: 'Trải nghiệm',
        description:
          'Ngâm mình trong hơn 12 vị thảo dược rừng già giúp hồi phục cơ thể sau hành trình leo núi.',
        duration: '1.5 giờ',
        durationHours: 1.5,
        estimatedCost: '250.000đ',
        estimatedCostVnd: 250000,
        goldenHour: '17:30 – 19:00',
      },
    ],
    vibes: ['healing', 'nature', 'photography', 'family'],
    vibeTags: ['Săn mây 3.143m', 'Khí hậu ôn đới', 'Nghỉ dưỡng núi', 'Văn hóa Tây Bắc'],
    bestMonths: 'Tháng 9 – Tháng 11 (Mùa lúa & săn mây) & Tháng 12 – Tháng 3 (Săn băng tuyết, hoa anh đào)',
    seasonalPulse: 'Đỉnh Fansipan đang có biển mây dày vào khung giờ 07:30 – 10:00 sáng',
    crowdLevel: 'Sôi động',
    weatherSummary: '12°C – 19°C • Sương mù buổi sớm, trưa nắng ấm',
    estimatedBudgetPerDay: 1400000,
    estimatedBudgetFormatted: '1.400.000đ / ngày',
    budgetLevel: 'Cân bằng',
    suggestedOrigin: 'Hà Nội',
    originSuggestion: 'Hà Nội',
    busDurationHours: 5.5,
    busDurationLabel: '5.5 giờ cao tốc Nội Bài – Lào Cai',
    busPriceFrom: 350000,
    busPriceFormatted: '350.000đ',
    recommendedBusType: 'Cabin Đôi Cung Điện Di Động VIP',
    coordinates: [22.3364, 103.8438],
    aiInsight:
      'Tuyến Hà Nội → Lào Cai (Sa Pa) có cả chuyến sáng 07:00 và chuyến đêm 22:15. Đi chuyến đêm 22:15 giúp bạn đón bình minh ngay tại hồ Sa Pa mà không tốn thời gian ban ngày.',
    aiAudioSummary:
      'Sa Pa thuộc tỉnh Lào Cai là thị trấn nghỉ dưỡng vùng cao nổi tiếng với đỉnh Fansipan cao 3.143m, thung lũng Mường Hoa và văn hóa đặc sắc của đồng bào Tây Bắc.',
    localSpecialties: ['Lẩu cá tầm & Gỏi cá hồi Sa Pa', 'Thắng cố ngựa Bắc Hà', 'Lợn cắp nách nướng mắc khén', 'Cơm lam nướng ống tre'],
    camera3DAngles: [
      {
        id: 'sapa-cam-fansipan',
        label: 'Flycam Chóp Đỉnh Thiêng Fansipan 3.143m',
        coordinates: [22.3033, 103.775],
        pitch: 70,
        bearing: -65,
        zoom: 15.2,
        altitudeMeters: 3143,
        imageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc cam vượt trên tầng mây tại Nóc nhà Đông Dương, ôm trọn Đại tượng Phật A Di Đà và biển mây Hoàng Liên Sơn.',
        bestTime: 'Biển mây sớm 07:30 – 09:30',
        streetViewLatLng: [22.3033, 103.7751], // Chóp đỉnh Fansipan (Photo Sphere phủ dày)
        streetViewHeading: 295,
        streetViewPitch: 8,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'sapa-cam-muong-hoa',
        label: 'Góc Cam 3D Nhà Thờ Đá Sa Pa & Sun Plaza',
        coordinates: [22.3239, 103.8294],
        pitch: 64,
        bearing: 140,
        zoom: 14.8,
        altitudeMeters: 1620,
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc nhìn 360° ngay quảng trường Nhà thờ Đá Sa Pa, ga tàu hỏa leo núi Sun Plaza hướng ra thung lũng Mường Hoa.',
        bestTime: 'Buổi chiều 15:00 – 17:00',
        streetViewLatLng: [22.3356, 103.8419], // Quảng trường Nhà thờ Đá Sa Pa & Sun Plaza
        streetViewHeading: 210,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 4. TRÀNG AN & HOA LƯ - NINH BÌNH
  // ==========================================
  {
    id: 'trang-an-hoa-lu-ninh-binh',
    slug: 'trang-an-ninh-binh-mien-co-tich-giua-vach-da-va-dong-ngo-dong',
    title: 'Tràng An – Ninh Bình: Khúc Ca Thủy Mặc Giữa Vách Đá Vôi & Kinh Đô Cổ Hoa Lư',
    subtitle:
      'Ngồi thuyền nan lướt nhẹ qua 9 hang động xuyên thủy kỳ bí, chinh phục 500 bậc đá đỉnh Ngọa Long – Hang Múa và dạo phố cổ Hoa Lư rực sáng về đêm.',
    standfirst:
      'Ngồi thuyền nan lướt nhẹ qua 9 hang động xuyên thủy kỳ bí, chinh phục 500 bậc đá đỉnh Ngọa Long – Hang Múa và dạo phố cổ Hoa Lư rực sáng về đêm.',
    category: 'Di sản & Văn hóa',
    region: 'Miền Bắc',
    province: 'Ninh Bình',
    destinationProvince: 'Ninh Bình',
    displayLocation: 'Tràng An • Ninh Bình',
    readTimeMinutes: 5,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Minh Triết',
      role: 'Chủ biên Du lịch & Di sản',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Di Sản Kép UNESCO',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Những chiếc thuyền nan chở du khách xuôi dòng nước trong vắt giữa núi đá vôi trùng điệp tại Ninh Bình.',
    gallery: [
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Tiếng mái chèo khua nước chậm rãi giữa thung lũng Tràng An đưa ta trở về một miền ký ức ngàn năm của kinh đô Hoa Lư xưa.”',
    storyParagraphs: [
      'Chỉ mất hơn 1 giờ 15 phút đi xe Limousine từ trung tâm Hà Nội, Ninh Bình mở ra một thế giới hoàn toàn khác biệt – nơi những dãy núi đá vôi Tràng An sừng sững bao bọc lấy dòng sông Sào Khê và hệ thống đền đài cổ kính từ thời Đinh – Tiền Lê.',
      'Là di sản thế giới kép đầu tiên và duy nhất tại Đông Nam Á (kết hợp cả giá trị Văn hóa và Thiên nhiên), Tràng An chinh phục lữ khách bằng làn nước trong vắt nhìn thấu tận đáy rong rêu và những hang động xuyên thủy mát lạnh.',
      'Buổi chiều, leo lên đỉnh núi Ngọa Long tại Hang Múa để ngắm nhìn dòng sông Ngô Đồng uốn lượn bên cánh đồng Tam Cốc, rồi khép lại ngày dài bằng buổi tối lung linh đèn lồng bên tháp Tứ Ân hồ Kỳ Lân tại Phố cổ Hoa Lư.',
    ],
    highlights: [
      {
        id: 'nb-thuyen-trang-an',
        title: 'Du thuyền nan Tuyến 3 Tràng An – Hành cung Vũ Lâm',
        category: 'Trải nghiệm',
        description:
          'Ngồi thuyền đò chèo tay xuyên qua hang Mây dài hơn 1km, viếng đền Suối Tiên và khám phá Hành cung Vũ Lâm cổ kính.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '250.000đ',
        estimatedCostVnd: 250000,
        goldenHour: '07:30 – 10:30',
        tip: 'Tuyến số 3 có hang động dài nhất và đi qua Hành cung Vũ Lâm có góc chụp ảnh cổ trang đẹp nhất.',
      },
      {
        id: 'nb-hang-mua-ngoa-long',
        title: 'Săn hoàng hôn trên Đỉnh Ngọa Long – Hang Múa',
        category: 'Săn ảnh',
        description:
          'Chinh phục gần 500 bậc đá chạm khắc rồng phượng để thu trọn toàn cảnh Tam Cốc và đầm sen dưới chân núi.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '100.000đ',
        estimatedCostVnd: 100000,
        goldenHour: '16:00 – 17:45',
      },
      {
        id: 'nb-pho-co-hoa-lu',
        title: 'Dạo thuyền đêm Hồ Kỳ Lân & Phố cổ Hoa Lư',
        category: 'Vui chơi',
        description:
          'Thả hoa đăng, ngắm hai tòa bảo tháp phát sáng giữa lòng hồ và thưởng thức ẩm thực truyền thống Ninh Bình.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '19:00 – 21:30',
      },
    ],
    vibes: ['culture', 'nature', 'photography', 'healing', 'budget'],
    vibeTags: ['Di sản Kép UNESCO', 'Đò chèo xuyên hang', 'Cố đô ngàn năm', 'Gần Hà Nội'],
    bestMonths: 'Quanh năm (Đẹp nhất Tháng 5 – Tháng 6 mùa lúa chín & Tháng 9 – Tháng 3 tiết trời mát)',
    seasonalPulse: 'Nước sông Tràng An đang trong vắt, tiết trời mát dịu rất hợp leo đỉnh Hang Múa',
    crowdLevel: 'Vừa phải',
    weatherSummary: '21°C – 26°C • Mát mẻ, gió nhẹ qua thung lũng',
    estimatedBudgetPerDay: 900000,
    estimatedBudgetFormatted: '900.000đ / ngày',
    budgetLevel: 'Tiết kiệm',
    suggestedOrigin: 'Hà Nội',
    originSuggestion: 'Hà Nội',
    busDurationHours: 1.5,
    busDurationLabel: '1.5 giờ Limousine cao tốc',
    busPriceFrom: 150000,
    busPriceFormatted: '150.000đ',
    recommendedBusType: 'Limousine VIP trả tận bến Tràng An / Tam Cốc',
    coordinates: [20.2506, 105.9745],
    aiInsight:
      'Các chuyến Limousine Hà Nội → Ninh Bình xuất phát mỗi 30 phút từ 05:30 sáng và hỗ trợ trả khách tận cổng Bến thuyền Tràng An hoặc khu vực Tam Cốc mà không cần bắt thêm taxi.',
    aiAudioSummary:
      'Quần thể danh thắng Tràng An tại Ninh Bình là Di sản Thế giới kép được UNESCO công nhận, hội tụ cảnh quan karst ngập nước tuyệt mỹ và dấu ấn lịch sử cố đô Hoa Lư thế kỷ X.',
    localSpecialties: ['Thịt dê núi Ninh Bình tái chanh', 'Cơm cháy sốt dê', 'Gỏi cá nhệch Kim Sơn', 'Miến lươn Ninh Bình'],
    camera3DAngles: [
      {
        id: 'ninhbinh-cam-hang-mua',
        label: 'Flycam Đỉnh Rồng Ngọa Long – Hang Múa',
        coordinates: [20.2308, 105.9369],
        pitch: 68,
        bearing: -110,
        zoom: 15.4,
        altitudeMeters: 240,
        imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn kinh điển từ lưng tượng Rồng đá đỉnh núi Ngọa Long nhìn thẳng xuống dòng sông Ngô Đồng và cánh đồng Tam Cốc.',
        bestTime: 'Hoàng hôn 16:00 – 17:45',
        streetViewLatLng: [20.2314, 105.9364], // Đỉnh Hang Múa (Photo Sphere 360°)
        streetViewHeading: 250,
        streetViewPitch: 0,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'ninhbinh-cam-trang-an',
        label: 'Góc Cam 3D Thủy Đình & Bến Thuyền Tràng An',
        coordinates: [20.2506, 105.9745],
        pitch: 64,
        bearing: 45,
        zoom: 15.1,
        altitudeMeters: 180,
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc flycam lơ lửng trên Bến thuyền Tràng An và Hành cung Vũ Lâm giữa lòng thung lũng nước.',
        bestTime: 'Buổi sáng 07:30 – 09:45',
        streetViewLatLng: [20.2509, 105.9377], // Bến thuyền Khu du lịch sinh thái Tràng An
        streetViewHeading: 310,
        streetViewPitch: 5,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 5. CỐ ĐÔ HUẾ - THỪA THIÊN HUẾ
  // ==========================================
  {
    id: 'co-do-hue-thua-thien-hue',
    slug: 'co-do-hue-nhip-cham-tram-mac-ben-dong-huong-giang',
    title: 'Cố Đô Huế: Nhịp Chậm Trầm Mặc Của Hoàng Thành & Nhã Nhạc Bên Dòng Hương Giang',
    subtitle:
      'Dạo bước dưới bóng ngọ môn rêu phong, ngắm hoàng hôn tím trên đầm Phá Tam Giang và thưởng thức tinh hoa ẩm thực cung đình.',
    standfirst:
      'Dạo bước dưới bóng ngọ môn rêu phong, ngắm hoàng hôn tím trên đầm Phá Tam Giang và thưởng thức tinh hoa ẩm thực cung đình.',
    category: 'Di sản & Văn hóa',
    region: 'Miền Trung',
    province: 'Thừa Thiên Huế',
    destinationProvince: 'Huế',
    displayLocation: 'Cố đô Huế • Thừa Thiên Huế',
    readTimeMinutes: 6,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Tôn Nữ Đoan Trang',
      role: 'Cây bút Văn hóa & Di sản Miền Trung',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Hành Trình Di Sản',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Vẻ đẹp uy nghiêm và cổ kính của Đại Nội Huế cùng kiến trúc cung đình triều Nguyễn.',
    gallery: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Huế không dành cho những bước chân vội vã; Huế đẹp nhất khi ta ngồi bên bờ sông Hương nghe một câu Nam Ai, Nam Bình ngân lên giữa sương chiều.”',
    storyParagraphs: [
      'Giữa nhịp sống hiện đại hối hả, Huế vẫn giữ cho mình một khoảng lặng đầy chất thơ. Bước qua cổng Ngọ Môn tiến vào Hoàng Thành và Điện Kiến Trung vừa được phục dựng lộng lẫy, du khách như được chạm tay vào những trang sử vàng son của triều đại phong kiến cuối cùng tại Việt Nam.',
      'Rời kinh thành về phía tây nam dọc theo đôi bờ sông Hương rợp bóng thông xanh là hệ thống lăng tẩm tuyệt mỹ: Lăng Tự Đức thơ mộng như một công viên thu nhỏ, Lăng Minh Mạng uy nghiêm đối xứng chuẩn mực, và Lăng Khải Định độc đáo với nghệ thuật khảm sành sứ tinh xảo.',
      'Chiều xuống, hãy xuôi về đầm Chuồn thuộc hệ đầm phá Tam Giang lớn nhất Đông Nam Á để chèo thuyền săn hoàng hôn tím biếc, trước khi trở lại trung tâm thưởng thức bún bò Huế, bánh bèo nậm lọc và chè cung đình 36 món.',
    ],
    highlights: [
      {
        id: 'hue-dai-noi-kien-trung',
        title: 'Khám phá Đại Nội Huế & Điện Kiến Trung phục dựng',
        category: 'Tham quan',
        description:
          'Chiêm ngưỡng Ngọ Môn, Điện Thái Hòa và kiệt tác kiến trúc giao thoa Á – Âu tại Điện Kiến Trung trong Tử Cấm Thành.',
        duration: '3.5 giờ',
        durationHours: 3.5,
        estimatedCost: '200.000đ',
        estimatedCostVnd: 200000,
        goldenHour: '07:30 – 10:30',
        tip: 'Thuê cổ phục Nhật Bình ngay cổng Hiển Nhơn để có bộ ảnh hoàng cung sống động nhất.',
      },
      {
        id: 'hue-lang-tu-duc-khai-dinh',
        title: 'Hành trình Lăng Khải Định – Lăng Tự Đức – Đồi Vọng Cảnh',
        category: 'Săn ảnh',
        description:
          'Tham quan kiến trúc lăng tẩm độc nhất vô nhị và ngắm khúc uốn mềm mại của sông Hương từ đỉnh đồi thông Vọng Cảnh.',
        duration: '3.5 giờ',
        durationHours: 3.5,
        estimatedCost: '300.000đ',
        estimatedCostVnd: 300000,
        goldenHour: '14:30 – 17:30',
      },
      {
        id: 'hue-ca-hue-song-huong',
        title: 'Thưởng thức Ca Huế trên thuyền Rồng sông Hương & Cầu Trường Tiền',
        category: 'Trải nghiệm',
        description:
          'Lắng nghe Nhã nhạc cung đình – Di sản văn hóa phi vật thể nhân loại và thả hoa đăng cầu bình an trên dòng Hương Giang.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '19:30 – 21:30',
      },
    ],
    vibes: ['culture', 'healing', 'photography', 'budget'],
    vibeTags: ['Kinh đô Cổ', 'Ẩm thực Cung đình', 'Nhịp sống Chậm', 'Di sản UNESCO'],
    bestMonths: 'Tháng 1 – Tháng 8 (Mùa khô, mùa lễ hội Festival Huế)',
    seasonalPulse: 'Cung đường đèo Hải Vân nối Huế – Đà Nẵng đang có tầm nhìn biển đẹp tuyệt vời',
    crowdLevel: 'Thấp',
    weatherSummary: '23°C – 29°C • Dịu mát, nắng vàng cổ kính',
    estimatedBudgetPerDay: 850000,
    estimatedBudgetFormatted: '850.000đ / ngày',
    budgetLevel: 'Tiết kiệm',
    suggestedOrigin: 'Đà Nẵng',
    originSuggestion: 'Đà Nẵng',
    busDurationHours: 2,
    busDurationLabel: '2 giờ Limousine Đà Nẵng ↔ Huế',
    busPriceFrom: 140000,
    busPriceFormatted: '140.000đ',
    recommendedBusType: 'Limousine VIP Đà Nẵng – Huế (hoặc Cabin đêm từ Hà Nội)',
    coordinates: [16.4637, 107.5909],
    aiInsight:
      'Huế cực kỳ lý tưởng để ghép cặp cùng Đà Nẵng và Hội An. Các chuyến xe Limousine Huế ↔ Đà Nẵng chạy liên tục mỗi giờ chỉ mất 140.000đ, rất thuận tiện lập lộ trình liên tuyến trên Bản đồ /travel.',
    aiAudioSummary:
      'Cố đô Huế thuộc tỉnh Thừa Thiên Huế sở hữu Quần thể di tích Cố đô và Nhã nhạc cung đình được UNESCO vinh danh, cùng nền ẩm thực tinh tế bậc nhất Việt Nam.',
    localSpecialties: ['Bún bò Huế gia truyền', 'Cơm hến Cồn Hến', 'Bánh bèo - Nậm - Lọc bà Đỏ', 'Chè Hẻm Cung Đình'],
    camera3DAngles: [
      {
        id: 'hue-cam-dai-noi',
        label: 'Flycam Trục Thần Đạo Ngọ Môn – Đại Nội Huế',
        coordinates: [16.4698, 107.5784],
        pitch: 65,
        bearing: -35,
        zoom: 15.6,
        altitudeMeters: 190,
        imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn 3D đối xứng hoàn hảo từ Kỳ Đài qua cổng Ngọ Môn, cầu Trung Đạo, Điện Thái Hòa đến Điện Kiến Trung.',
        bestTime: 'Nắng sớm 07:00 – 09:00',
        streetViewLatLng: [16.4675, 107.5795], // Quảng trường Ngọ Môn – Đại Nội Huế
        streetViewHeading: 325,
        streetViewPitch: 8,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'hue-cam-vong-canh',
        label: 'Góc Cam 3D Cầu Trường Tiền & Sông Hương',
        coordinates: [16.4285, 107.5612],
        pitch: 68,
        bearing: 75,
        zoom: 14.9,
        altitudeMeters: 220,
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80',
        description: 'Toàn cảnh dòng Hương Giang thơ mộng cùng cầu Trường Tiền 6 nhịp 12 vài và lối dạo bộ gỗ lim ven sông.',
        bestTime: 'Hoàng hôn 16:30 – 17:45',
        streetViewLatLng: [16.4689, 107.5886], // Cầu Trường Tiền bắc qua Sông Hương
        streetViewHeading: 215,
        streetViewPitch: 4,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 6. ĐÀ NẴNG - BÀ NÀ & BÁN ĐẢO SƠN TRÀ
  // ==========================================
  {
    id: 'da-nang-ba-na-son-tra',
    slug: 'da-nang-thanh-pho-cua-nhung-cay-cau-va-dinh-ba-na-trong-may',
    title: 'Đà Nẵng: Từ Đỉnh Bà Nà Bốn Mùa Trong Một Ngày Đến Rừng Già Bán Đảo Sơn Trà',
    subtitle:
      'Dạo bước trên Cầu Vàng giữa lưng chừng mây, lướt qua cung đường biển Hoàng Sa – Sơn Trà và xem Cầu Rồng phun lửa bên sông Hàn rực rỡ.',
    standfirst:
      'Dạo bước trên Cầu Vàng giữa lưng chừng mây, lướt qua cung đường biển Hoàng Sa – Sơn Trà và xem Cầu Rồng phun lửa bên sông Hàn rực rỡ.',
    category: 'Vui chơi & Giải trí',
    region: 'Miền Trung',
    province: 'Đà Nẵng',
    destinationProvince: 'Đà Nẵng',
    displayLocation: 'Bà Nà & Sơn Trà • Đà Nẵng',
    readTimeMinutes: 6,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Quốc Khánh',
      role: 'Biên tập viên Đô thị & Giải trí',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Thành Phố Đáng Sống',
    columnSpan: 'wide',
    heroImage:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Cầu Vàng – biểu tượng kiến trúc ấn tượng nâng đỡ bởi đôi bàn tay rêu phong khổng lồ trên đỉnh Bà Nà Hills, Đà Nẵng.',
    gallery: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Đà Nẵng là giao điểm hiếm hoi nơi buổi sáng bạn có thể chạm vào mây lạnh đỉnh núi Chúa, buổi chiều đắm mình dưới biển Mỹ Khê và tối ngắm pháo hoa bên sông Hàn.”',
    storyParagraphs: [
      'Được mệnh danh là trung tâm kết nối của dải đất miền Trung, Đà Nẵng sở hữu hạ tầng du lịch và giải trí hoàn chỉnh bậc nhất cả nước. Chỉ cách trung tâm thành phố 30 phút di chuyển, đỉnh núi Chúa – Sun World Ba Na Hills đón chào du khách bằng khí hậu bốn mùa luân chuyển trong một ngày cùng biểu tượng Cầu Vàng từng làm say đắm truyền thông quốc tế.',
      'Trở về bờ biển Mỹ Khê quyến rũ, cung đường ven biển dẫn thẳng lên Bán đảo Sơn Trà – “lá phổi xanh” nguyên sinh ôm trọn vịnh Đà Nẵng. Từ chùa Linh Ứng Bãi Bụt đến đỉnh Bàn Cờ, toàn bộ đường chân trời thành phố và biển Đông hiện ra khoáng đạt trong tầm mắt.',
      'Khi đêm xuống, Đà Nẵng khoác lên mình tấm áo ánh sáng sôi động: du thuyền dạo sông Hàn đi dưới những cây cầu biểu tượng, chợ đêm Sơn Trà tấp nập hải sản và màn trình diễn Cầu Rồng phun lửa – phun nước mỗi tối cuối tuần.',
    ],
    highlights: [
      {
        id: 'dn-cau-vang-ba-na',
        title: 'Cầu Vàng, Làng Pháp & Công viên Fantasy Park tại Bà Nà Hills',
        category: 'Vui chơi',
        description:
          'Đi tuyến cáp treo đạt nhiều kỷ lục thế giới lên đỉnh núi Chúa cao 1.487m, check-in Cầu Vàng và vui chơi hơn 100 trò chơi trong nhà.',
        duration: '6 giờ',
        durationHours: 6,
        estimatedCost: '900.000đ',
        estimatedCostVnd: 900000,
        goldenHour: '07:30 – 09:30',
        tip: 'Lên chuyến cáp treo đầu tiên lúc 07:30 sáng để chụp ảnh Cầu Vàng trong sương sớm khi chưa đông khách.',
      },
      {
        id: 'dn-ban-dao-son-tra',
        title: 'Vi vu Bán đảo Sơn Trà – Chùa Linh Ứng & Đỉnh Bàn Cờ',
        category: 'Tham quan',
        description:
          'Chiêm bái tượng Phật Quan Âm cao 67m hướng ra biển Đông và săn hoàng hôn từ đỉnh Bàn Cờ.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '100.000đ',
        estimatedCostVnd: 100000,
        goldenHour: '15:30 – 17:45',
      },
      {
        id: 'dn-du-thuyen-song-han',
        title: 'Du thuyền Sông Hàn & Xem Cầu Rồng phun lửa',
        category: 'Trải nghiệm',
        description:
          'Ngắm 4 cây cầu rực rỡ ánh sáng (Cầu Rồng, Cầu Sông Hàn, Cầu Trần Thị Lý, Cầu Thuận Phước) từ boong tàu đêm.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '200.000đ',
        estimatedCostVnd: 200000,
        goldenHour: '20:00 – 21:30',
      },
    ],
    vibes: ['family', 'nightlife', 'photography', 'nature'],
    vibeTags: ['Thủ phủ Giải trí', 'Biển Mỹ Khê', 'Cầu Vàng Bà Nà', 'Sôi động về đêm'],
    bestMonths: 'Tháng 2 – Tháng 8 (Nắng đẹp, biển êm trong xanh)',
    seasonalPulse: 'Cầu Rồng biểu diễn phun lửa & phun nước vào 21:00 Thứ Sáu, Thứ Bảy và Chủ Nhật',
    crowdLevel: 'Sôi động',
    weatherSummary: '24°C – 30°C • Nắng biển đẹp, gió mát từ sông Hàn',
    estimatedBudgetPerDay: 1300000,
    estimatedBudgetFormatted: '1.300.000đ / ngày',
    budgetLevel: 'Cân bằng',
    suggestedOrigin: 'Huế',
    originSuggestion: 'Huế',
    busDurationHours: 2,
    busDurationLabel: '2 giờ từ Huế / 14 giờ từ Hà Nội',
    busPriceFrom: 140000,
    busPriceFormatted: '140.000đ',
    recommendedBusType: 'Limousine VIP (từ Huế/Quảng Bình) hoặc Giường nằm Cabin',
    coordinates: [16.0544, 108.2022],
    aiInsight:
      'Đà Nẵng là trạm trung chuyển hoàn hảo cho hành trình miền Trung. Bạn có thể đặt vé xe khách đến Đà Nẵng, dành 1 ngày đi Bà Nà – Sơn Trà rồi dễ dàng nối chuyến xuống Hội An (Quảng Nam) chỉ mất 40 phút.',
    aiAudioSummary:
      'Thành phố Đà Nẵng nằm ở trung độ cả nước, nổi tiếng với bãi biển Mỹ Khê, bán đảo Sơn Trà, khu du lịch Bà Nà Hills và những cây cầu hiện đại bắc qua sông Hàn.',
    localSpecialties: ['Mì Quảng ếch bếp Trang', 'Bánh tráng cuốn thịt heo hai đầu da', 'Hải sản tươi sống Mỹ Khê', 'Gỏi cá Nam Ô'],
    camera3DAngles: [
      {
        id: 'danang-cam-cau-vang',
        label: 'Flycam Cầu Vàng & Đỉnh Bà Nà Hills',
        coordinates: [15.9951, 107.9964],
        pitch: 70,
        bearing: 55,
        zoom: 15.8,
        altitudeMeters: 1414,
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc cam 3D lơ lửng trước đôi bàn tay đá khổng lồ nâng đỡ dải lụa Cầu Vàng giữa biển mây đỉnh núi Chúa.',
        bestTime: 'Bình minh 07:30 – 08:45',
        streetViewLatLng: [15.9951, 107.9963], // Cầu Vàng – Bà Nà Hills (Photo Sphere 360°)
        streetViewHeading: 65,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'danang-cam-cau-rong',
        label: 'Góc Cam 3D Cầu Rồng & Sông Hàn Về Đêm',
        coordinates: [16.0611, 108.2275],
        pitch: 64,
        bearing: -80,
        zoom: 15.4,
        altitudeMeters: 165,
        imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc nhìn dọc đôi bờ sông Hàn rực sáng nối liền Cầu Rồng, Cầu Sông Hàn hướng thẳng ra bãi biển Mỹ Khê.',
        bestTime: 'Buổi tối 20:00 – 21:30',
        streetViewLatLng: [16.0611, 108.2273], // Mặt cầu Rồng – Sông Hàn, Đà Nẵng
        streetViewHeading: 90,
        streetViewPitch: 5,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'danang-cam-son-tra',
        label: 'Flycam Bán Đảo Sơn Trà & Chùa Linh Ứng',
        coordinates: [16.1003, 108.2778],
        pitch: 66,
        bearing: -145,
        zoom: 14.7,
        altitudeMeters: 310,
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc máy từ sườn núi Sơn Trà nhìn qua tượng Phật Quan Âm cao 67m ôm trọn đường cong quyến rũ của vịnh Đà Nẵng.',
        bestTime: 'Chiều nắng 15:30 – 17:30',
        streetViewLatLng: [16.0998, 108.2776], // Sân Chùa Linh Ứng – Bán đảo Sơn Trà
        streetViewHeading: 225,
        streetViewPitch: 8,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 7. PHỐ CỔ HỘI AN - QUẢNG NAM
  // ==========================================
  {
    id: 'pho-co-hoi-an-quang-nam',
    slug: 'hoi-an-dem-den-long-ruc-sang-tren-dong-hoai-giang',
    title: 'Phố Cổ Hội An: Đêm Đèn Lồng Huyền Ảo & Ký Ức Thương Cảng Trăm Năm Bên Sông Hoài',
    subtitle:
      'Thả đèn hoa đăng trên dòng sông Hoài, xoay thúng rừng dừa Bảy Mẫu và choáng ngợp trước đại tiệc nghệ thuật thực cảnh Ký Ức Hội An.',
    standfirst:
      'Thả đèn hoa đăng trên dòng sông Hoài, xoay thúng rừng dừa Bảy Mẫu và choáng ngợp trước đại tiệc nghệ thuật thực cảnh Ký Ức Hội An.',
    category: 'Ẩm thực & Đêm',
    region: 'Miền Trung',
    province: 'Quảng Nam',
    destinationProvince: 'Quảng Nam',
    displayLocation: 'Phố cổ Hội An • Quảng Nam',
    readTimeMinutes: 5,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Tôn Nữ Đoan Trang',
      role: 'Cây bút Văn hóa & Di sản Miền Trung',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Di Sản Thương Cảng',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1350&q=85',
    heroImageCaption:
      'Hàng ngàn chiếc đèn lồng thủ công thắp sáng những dãy nhà tường vàng cổ kính bên dòng sông Hoài, Hội An.',
    gallery: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Khi ánh hoàng hôn vừa tắt sau mái ngói âm dương Chùa Cầu, Hội An hóa thành một giấc mơ lụa là của ánh đèn lồng và mùi trầm hương thoang thoảng.”',
    storyParagraphs: [
      'Từng là thương cảng quốc tế sầm uất bậc nhất Đông Nam Á thế kỷ XVII – XVIII tại tỉnh Quảng Nam, phố cổ Hội An ngày nay được bảo tồn gần như nguyên vẹn với hơn 1.000 di tích kiến trúc từ nhà cổ tường vàng, hội quán người Hoa đến biểu tượng Chùa Cầu trầm mặc.',
      'Ban ngày, hãy thuê một chiếc xe đạp thong dong qua những giàn hoa giấy rực rỡ trên đường Trần Phú, ghé quán cà phê sân thượng ngắm toàn cảnh mái ngói rêu phong, rồi xuôi về rừng dừa Bảy Mẫu Cẩm Thanh để trải nghiệm ngồi thuyền thúng lắc lư giữa rặng dừa nước xanh mát.',
      'Đêm xuống là lúc Hội An quyến rũ nhất: dòng sông Hoài lấp lánh hàng ngàn ngọn hoa đăng, tiếng hô Bài Chòi vang vọng đầu phố, và trên Đảo Ký Ức, hơn 500 diễn viên tái hiện 400 năm thăng trầm của thương cảng Faifo trong show diễn thực cảnh quy mô bậc nhất Việt Nam.',
    ],
    highlights: [
      {
        id: 'ha-thuyen-hoa-dang-song-hoai',
        title: 'Đi thuyền thả Hoa đăng Sông Hoài & Dạo phố đèn lồng',
        category: 'Trải nghiệm',
        description:
          'Ngồi thuyền gỗ chèo tay trên sông Hoài, tự tay thả đèn hoa đăng và nghe hát Bài Chòi dân gian bên Chùa Cầu.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '18:00 – 20:30',
        tip: 'Khung giờ 17:45 – 18:15 khi trời chuyển sang sắc xanh thẫm (Blue Hour) là lúc chụp ảnh đèn lồng đẹp nhất.',
      },
      {
        id: 'ha-show-ky-uc-hoi-an',
        title: 'Thưởng thức Show thực cảnh “Ký Ức Hội An”',
        category: 'Vui chơi',
        description:
          'Show diễn nghệ thuật ngoài trời trên sân khấu rộng 25.000m² bên sông Thu Bồn với hiệu ứng ánh sáng và âm nhạc mãn nhãn.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '600.000đ',
        estimatedCostVnd: 600000,
        goldenHour: '19:30 – 21:00',
      },
      {
        id: 'ha-rung-dua-bay-mau',
        title: 'Chèo thuyền thúng Rừng dừa Bảy Mẫu Cẩm Thanh',
        category: 'Vui chơi',
        description:
          'Trải nghiệm thuyền thúng len lỏi trong rừng dừa nước, xem múa thúng điêu luyện và quăng chài bắt cá.',
        duration: '2 giờ',
        durationHours: 2,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '08:30 – 10:30',
      },
    ],
    vibes: ['culture', 'nightlife', 'photography', 'family'],
    vibeTags: ['Phố cổ UNESCO', 'Đêm đèn lồng', 'Ẩm thực đường phố', 'Show thực cảnh'],
    bestMonths: 'Tháng 2 – Tháng 8 (Trời nắng ấm, ít mưa, hoa giấy nở rộ)',
    seasonalPulse: 'Đêm rằm âm lịch hàng tháng Phố cổ tắt đèn điện, chỉ thắp đèn lồng truyền thống',
    crowdLevel: 'Sôi động',
    weatherSummary: '24°C – 29°C • Gió sông Thu Bồn mát dịu về chiều tối',
    estimatedBudgetPerDay: 1100000,
    estimatedBudgetFormatted: '1.100.000đ / ngày',
    budgetLevel: 'Cân bằng',
    suggestedOrigin: 'Đà Nẵng',
    originSuggestion: 'Đà Nẵng',
    busDurationHours: 1,
    busDurationLabel: '45 – 60 phút từ Đà Nẵng / 3 giờ từ Huế',
    busPriceFrom: 120000,
    busPriceFormatted: '120.000đ',
    recommendedBusType: 'Limousine Trung chuyển Đà Nẵng – Hội An (Quảng Nam)',
    coordinates: [15.8801, 108.338],
    aiInsight:
      'Hội An thuộc tỉnh Quảng Nam. Khi tìm vé trên VeXeViet (/search) hoặc lập lộ trình (/travel), hệ thống tự động khớp tỉnh “Quảng Nam” (Hội An - Quảng Nam) kết nối thuận tiện từ Đà Nẵng, Huế hoặc Nha Trang.',
    aiAudioSummary:
      'Đô thị cổ Hội An thuộc tỉnh Quảng Nam là Di sản Văn hóa Thế giới UNESCO, nổi tiếng với kiến trúc thương cảng cổ, phố đèn lồng bên sông Hoài và ẩm thực Cao lầu trứ danh.',
    localSpecialties: ['Cao lầu Hội An', 'Cơm gà Bà Buội', 'Bánh mì Phượng & Madam Khánh', 'Nước Mót thảo mộc'],
    camera3DAngles: [
      {
        id: 'hoian-cam-song-hoai',
        label: 'Flycam Đêm Hoa Đăng Sông Hoài & Chùa Cầu',
        coordinates: [15.8771, 108.326],
        pitch: 66,
        bearing: 110,
        zoom: 16.1,
        altitudeMeters: 120,
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn từ trên cao xuống hai bờ sông Hoài rực sáng đèn lồng và hàng trăm chiếc thuyền gỗ thả hoa đăng.',
        bestTime: 'Giờ xanh 17:45 – 20:00',
        streetViewLatLng: [15.8771, 108.3261], // Chùa Cầu – Phố cổ Hội An (đường Nguyễn Thị Minh Khai)
        streetViewHeading: 95,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'hoian-cam-dao-ky-uc',
        label: 'Góc Cam 3D Đường Bạch Đằng & Đảo Ký Ức Hội An',
        coordinates: [15.8732, 108.3395],
        pitch: 62,
        bearing: -60,
        zoom: 15.3,
        altitudeMeters: 195,
        imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=80',
        description: 'Toàn cảnh phố đi bộ ven sông Bạch Đằng và sân khấu thực cảnh Đảo Ký Ức Hội An trên sông Thu Bồn.',
        bestTime: 'Buổi tối 19:30 – 21:00',
        streetViewLatLng: [15.8768, 108.3283], // Đường Bạch Đằng ven Sông Hoài, Hội An
        streetViewHeading: 255,
        streetViewPitch: 4,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 8. ĐÀ LẠT SĂN MÂY - LÂM ĐỒNG
  // ==========================================
  {
    id: 'da-lat-san-may-lam-dong',
    slug: 'da-lat-ban-giao-huong-suong-mu-va-rung-thong-cao-nguyen',
    title: 'Đà Lạt: Bình Minh Trên Thảm Mây Đồi Chè Cầu Đất & Những Quán Nhạc Giữa Rừng Thông',
    subtitle:
      'Săn biển mây bồng bềnh lúc 5 giờ sáng, trượt máng thác Datanla xuyên rừng thông và lắng nghe đêm nhạc Acoustic ấm áp trong cái lạnh 15 độ C.',
    standfirst:
      'Săn biển mây bồng bềnh lúc 5 giờ sáng, trượt máng thác Datanla xuyên rừng thông và lắng nghe đêm nhạc Acoustic ấm áp trong cái lạnh 15 độ C.',
    category: 'Chữa lành & Nghỉ dưỡng',
    region: 'Miền Trung',
    province: 'Lâm Đồng',
    destinationProvince: 'Lâm Đồng',
    displayLocation: 'Đà Lạt • Lâm Đồng',
    readTimeMinutes: 6,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Lan Khuê',
      role: 'Biên tập viên Phong cách sống & Nghỉ dưỡng',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Điểm Đến Quốc Dân',
    columnSpan: 'wide',
    heroImage:
      'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Biển mây trắng xóa ôm lấy những đồi thông và tuabin điện gió tại Cầu Đất, Đà Lạt, Lâm Đồng.',
    gallery: [
      'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Người ta lên Đà Lạt không chỉ để đi du lịch, mà để tìm lại một nhịp thở chậm rãi giữa mùi nhựa thông non và hơi sương se lạnh bên hồ Xuân Hương.”',
    storyParagraphs: [
      'Tuyến xe khách giường nằm đêm TP. Hồ Chí Minh → Đà Lạt (Lâm Đồng) từ lâu đã trở thành “chuyến xe thanh xuân” của hàng triệu tín đồ xê dịch. Bước xuống bến xe liên tỉnh Đà Lạt lúc 4 giờ 30 sáng, hơi lạnh 15°C phả vào mặt cùng làn khói tỏa ra từ ly sữa đậu nành nóng mở đầu cho một hành trình chữa lành trọn vẹn.',
      'Từ trung tâm thành phố, con đường đèo dẫn về đồi chè Cầu Đất đưa bạn lên độ cao 1.650m – nơi những cánh quạt điện gió khổng lồ quay chậm rãi trên thảm mây trắng muốt. Khi nắng lên, hãy ghé thác Datanla để trải nghiệm hệ thống xe trượt thác xuyên rừng thông dài nhất Đông Nam Á hoặc chèo SUP trên mặt hồ Tuyền Lâm tĩnh lặng.',
      'Buổi chiều tại Đà Lạt là đặc quyền của những quán cà phê gỗ nằm chênh vênh bên sườn đồi nhìn xuống thung lũng đèn và những buổi live concert Acoustic ngoài trời dưới ánh hoàng hôn cam hồng.',
    ],
    highlights: [
      {
        id: 'dl-san-may-cau-dat',
        title: 'Săn mây Bình minh & Đồi chè Điện gió Cầu Đất',
        category: 'Săn ảnh',
        description:
          'Đón bình minh trên sàn gỗ săn mây Cầu Đất, ngắm biển mây phủ kín thung lũng và dạo bước giữa đồi chè xanh mướt.',
        duration: '3.5 giờ',
        durationHours: 3.5,
        estimatedCost: '150.000đ',
        estimatedCostVnd: 150000,
        goldenHour: '05:15 – 07:30',
        tip: 'Xe giường nằm từ TP.HCM cập bến lúc 04:30 sáng là khung giờ vàng để đi thẳng xuống Cầu Đất đón bình minh.',
      },
      {
        id: 'dl-datanla-alpine-coaster',
        title: 'Xe trượt thác Alpine Coaster & Zipline Rừng thông Datanla',
        category: 'Vui chơi',
        description:
          'Tự điều khiển xe trượt dài 2.400m uốn lượn qua rừng thông và thác nước Datanla hùng vĩ.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '250.000đ',
        estimatedCostVnd: 250000,
        goldenHour: '09:00 – 11:30',
      },
      {
        id: 'dl-acoustic-hoang-hon',
        title: 'Thưởng nhạc Acoustic Hoàng hôn & Lẩu gà lá é phố núi',
        category: 'Trải nghiệm',
        description:
          'Nghe nhạc sống giữa sườn đồi thông lúc chiều tà và quây quần bên nồi lẩu gà lá é, bò nướng ngói nóng hổi.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '350.000đ',
        estimatedCostVnd: 350000,
        goldenHour: '16:30 – 20:00',
      },
    ],
    vibes: ['healing', 'photography', 'nature', 'nightlife', 'budget'],
    vibeTags: ['Thiên đường Săn mây', 'Cà phê Rừng thông', 'Se lạnh 15°C', 'Xe đêm từ Sài Gòn'],
    bestMonths: 'Tháng 10 – Tháng 4 (Mùa khô, mùa hoa dã quỳ, cỏ hồng và mai anh đào)',
    seasonalPulse: 'Đồi chè Cầu Đất và Đồi Đa Phú đang vào mùa mây luồn dày nhất trong năm',
    crowdLevel: 'Sôi động',
    weatherSummary: '14°C – 23°C • Sáng sớm sương mù, ngày nắng hanh vàng',
    estimatedBudgetPerDay: 950000,
    estimatedBudgetFormatted: '950.000đ / ngày',
    budgetLevel: 'Tiết kiệm',
    suggestedOrigin: 'Hồ Chí Minh',
    originSuggestion: 'Hồ Chí Minh',
    busDurationHours: 6.5,
    busDurationLabel: '6.5 giờ xe phòng nằm đêm',
    busPriceFrom: 320000,
    busPriceFormatted: '320.000đ',
    recommendedBusType: 'Xe Phòng Nằm Limousine 22/34 phòng riêng',
    coordinates: [11.9404, 108.4583],
    aiInsight:
      'Tuyến TP. Hồ Chí Minh → Lâm Đồng (Đà Lạt) là tuyến xe khách sôi động nhất trên VeXeViet. Đặt chuyến khởi hành 22:00 – 22:30 để ngủ trên xe và bắt đầu hành trình săn mây lúc 05:00 sáng hôm sau.',
    aiAudioSummary:
      'Thành phố Đà Lạt thuộc tỉnh Lâm Đồng nằm trên cao nguyên Lâm Viên cao 1.500m, nổi tiếng với rừng thông, hồ Tuyền Lâm, đồi chè Cầu Đất và khí hậu ôn hòa quanh năm.',
    localSpecialties: ['Lẩu gà lá é Tao Ngộ', 'Bánh căn nhà Chung', 'Bánh ướt lòng gà Trang', 'Sữa đậu nành nóng & Bánh sừng trâu'],
    camera3DAngles: [
      {
        id: 'dalat-cam-cau-dat',
        label: 'Flycam Biển Mây Đồi Chè Điện Gió Cầu Đất',
        coordinates: [11.8831, 108.5586],
        pitch: 70,
        bearing: 85,
        zoom: 14.9,
        altitudeMeters: 1650,
        imageUrl: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc cam 3D lơ lửng ngang cánh tuabin điện gió Cầu Đất nhìn xuống thảm mây trắng xóa ôm trọn đồi chè cổ thụ.',
        bestTime: 'Bình minh 05:15 – 06:45',
        streetViewLatLng: [11.8819, 108.5568], // Đồi chè Cầu Đất Farm, Đà Lạt
        streetViewHeading: 85,
        streetViewPitch: 5,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'dalat-cam-ho-xuan-huong',
        label: 'Góc Cam 3D Quảng Trường Lâm Viên & Hồ Xuân Hương',
        coordinates: [11.9428, 108.4452],
        pitch: 64,
        bearing: -45,
        zoom: 15.2,
        altitudeMeters: 1520,
        imageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1400&q=80',
        description: 'Toàn cảnh trái tim thành phố Đà Lạt với mặt hồ Xuân Hương phẳng lặng, quảng trường Lâm Viên và nụ hoa Atiso kính xanh.',
        bestTime: 'Hoàng hôn 16:45 – 18:00',
        streetViewLatLng: [11.9403, 108.4449], // Quảng trường Lâm Viên – Hồ Xuân Hương, Đà Lạt
        streetViewHeading: 320,
        streetViewPitch: 8,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 9. VỊNH SAN HÔ NHA TRANG - KHÁNH HÒA
  // ==========================================
  {
    id: 'nha-trang-vinh-san-ho-khanh-hoa',
    slug: 'nha-trang-vinh-bien-ngoc-bich-va-thien-duong-giai-tri-hon-tre',
    title: 'Vịnh Nha Trang: Cáp Treo Vượt Biển Tới Đảo Hòn Tre & Vũ Điệu San Hô Hòn Mun',
    subtitle:
      'Từ chuyến tàu cao tốc lặn biển ngắm rạn san hô đa sắc tại Hòn Mun đến đại tiệc ánh sáng Tata Show tại VinWonders và tắm bùn khoáng nóng.',
    standfirst:
      'Từ chuyến tàu cao tốc lặn biển ngắm rạn san hô đa sắc tại Hòn Mun đến đại tiệc ánh sáng Tata Show tại VinWonders và tắm bùn khoáng nóng.',
    category: 'Vui chơi & Giải trí',
    region: 'Miền Trung',
    province: 'Khánh Hòa',
    destinationProvince: 'Khánh Hòa',
    displayLocation: 'Vịnh Nha Trang • Khánh Hòa',
    readTimeMinutes: 5,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Quốc Khánh',
      role: 'Biên tập viên Đô thị & Giải trí',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Vịnh Đẹp Thế Giới',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Làn nước biển xanh trong vắt của vịnh Nha Trang nhìn từ cung đường Trần Phú và đảo Hòn Tre.',
    gallery: [
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Nha Trang sở hữu sắc xanh đại dương đặc trưng mà chỉ cần bước xuống khỏi chuyến xe đêm, gió biển đường Trần Phú đã khiến mọi mệt nhọc tan biến.”',
    storyParagraphs: [
      'Là thành viên Câu lạc bộ các vịnh biển đẹp nhất thế giới, Nha Trang (Khánh Hòa) nay càng gần TP. Hồ Chí Minh hơn bao giờ hết nhờ tuyến cao tốc liên hoàn rút ngắn thời gian xe Limousine giường phòng xuống chỉ còn khoảng 6,5 – 7 giờ.',
      'Buổi sáng, cano cao tốc đưa du khách ra khơi khám phá tour 3 đảo: lặn biển ngắm hệ sinh thái san hô phong phú tại Hòn Mun, thưởng thức hải sản bè nổi Làng Chài và thư giãn bên bãi tắm đôi Hòn Tằm.',
      'Chiều và tối là thời điểm của đảo Hòn Tre với tuyến cáp treo vượt biển rực sáng, công viên giải trí VinWonders, khu phố thương mại Vinpearl Harbour nhộn nhịp và di tích Tháp Bà Ponagar linh thiêng bên dòng sông Cái.',
    ],
    highlights: [
      {
        id: 'nt-vinwonders-hon-tre',
        title: 'Cáp treo vượt biển VinWonders & Phố cảng Vinpearl Harbour',
        category: 'Vui chơi',
        description:
          'Vui chơi công viên nước trên đảo, tàu lượn siêu tốc, vườn quý vương và xem Tata Show 3D Mapping hoành tráng.',
        duration: '6 giờ',
        durationHours: 6,
        estimatedCost: '950.000đ',
        estimatedCostVnd: 950000,
        goldenHour: '15:00 – 20:30',
        tip: 'Đi cáp treo sang đảo lúc 15:00 để không bị nắng gắt, vừa kịp ngắm hoàng hôn trên vịnh vừa xem trọn Tata Show lúc 19:30.',
      },
      {
        id: 'nt-tour-3-dao-lan-bien',
        title: 'Tour Cano 3 Đảo: Lặn ngắm San hô Hòn Mun – Hòn Tằm',
        category: 'Trải nghiệm',
        description:
          'Lặn bình khí (Scuba Diving) hoặc đi bộ dưới đáy biển khám phá rạn san hô tự nhiên và tắm bùn khoáng trên đảo Hòn Tằm.',
        duration: '5 giờ',
        durationHours: 5,
        estimatedCost: '650.000đ',
        estimatedCostVnd: 650000,
        goldenHour: '08:00 – 13:00',
      },
      {
        id: 'nt-thap-ba-ponagar',
        title: 'Chiêm bái Tháp Bà Ponagar & Tắm bùn khoáng nóng I-Resort',
        category: 'Tham quan',
        description:
          'Khám phá quần thể kiến trúc Chăm Pa cổ từ thế kỷ VIII và thư giãn trong suối khoáng nóng tự nhiên.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '350.000đ',
        estimatedCostVnd: 350000,
        goldenHour: '14:30 – 17:30',
      },
    ],
    vibes: ['family', 'adventure', 'nightlife', 'healing'],
    vibeTags: ['Vịnh biển Đẹp nhất', 'Lặn ngắm San hô', 'VinWonders Hòn Tre', 'Tắm bùn Khoáng'],
    bestMonths: 'Tháng 1 – Tháng 9 (Nắng vàng rực rỡ, nước biển trong xanh)',
    seasonalPulse: 'Tuyến cao tốc TP.HCM – Nha Trang giúp xe giường phòng chạy êm và nhanh hơn 2 giờ so với trước đây',
    crowdLevel: 'Sôi động',
    weatherSummary: '25°C – 31°C • Nắng biển ấm áp, tầm nhìn dưới nước > 15m',
    estimatedBudgetPerDay: 1350000,
    estimatedBudgetFormatted: '1.350.000đ / ngày',
    budgetLevel: 'Cân bằng',
    suggestedOrigin: 'Hồ Chí Minh',
    originSuggestion: 'Hồ Chí Minh',
    busDurationHours: 7,
    busDurationLabel: '7 giờ cao tốc xuyên suốt',
    busPriceFrom: 360000,
    busPriceFormatted: '360.000đ',
    recommendedBusType: 'Limousine Giường Phòng Massage 22 Cabin',
    coordinates: [12.2388, 109.1967],
    aiInsight:
      'Bạn có thể kết hợp lộ trình đôi “Biển & Hoa”: Đi xe đêm TP.HCM → Khánh Hòa (Nha Trang) chơi biển 2 ngày, sau đó bắt xe Limousine Nha Trang → Lâm Đồng (Đà Lạt) qua đèo Khánh Lê tuyệt đẹp chỉ mất 3 giờ.',
    aiAudioSummary:
      'Nha Trang thuộc tỉnh Khánh Hòa là một trong những vịnh biển đẹp nhất thế giới, hội tụ các hòn đảo san hô kỳ thú, tháp Chăm Ponagar cổ kính và tổ hợp giải trí biển hiện đại.',
    localSpecialties: ['Nem nướng Ninh Hòa', 'Bún sứa & Bánh canh chả cá Nha Trang', 'Hải sản làng chài Bờ Kè', 'Bánh xèo mực'],
    camera3DAngles: [
      {
        id: 'nhatrang-cam-hon-tre',
        label: 'Flycam Quảng Trường 2/4 & Vịnh Biển Trần Phú',
        coordinates: [12.2156, 109.2414],
        pitch: 66,
        bearing: -115,
        zoom: 14.6,
        altitudeMeters: 280,
        imageUrl: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn 360° từ Quảng trường 2/4 – Tháp Trầm Hương đường Trần Phú hướng thẳng ra vịnh Nha Trang và đảo Hòn Tre.',
        bestTime: 'Chiều nắng 15:30 – 17:45',
        streetViewLatLng: [12.2389, 109.1968], // Quảng trường 2/4 – Tháp Trầm Hương, Đường Trần Phú
        streetViewHeading: 105,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'nhatrang-cam-ponagar',
        label: 'Góc Cam 3D Tháp Bà Ponagar & Cửa Sông Cái',
        coordinates: [12.2654, 109.1955],
        pitch: 64,
        bearing: 125,
        zoom: 15.7,
        altitudeMeters: 160,
        imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80',
        description: 'Góc máy xoay quanh đồi Cù Lao nơi quần thể tháp Chăm cổ kính soi bóng xuống cửa sông Cái đầy thuyền đánh cá.',
        bestTime: 'Buổi sáng 07:30 – 09:30',
        streetViewLatLng: [12.2654, 109.1954], // Khu di tích Tháp Bà Ponagar, Nha Trang
        streetViewHeading: 125,
        streetViewPitch: 10,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 10. MŨI NÉ - BÌNH THUẬN
  // ==========================================
  {
    id: 'mui-ne-phan-thiet-binh-thuan',
    slug: 'mui-ne-binh-thuan-tieu-sa-mac-cat-bay-va-cung-duong-bien-bau-trang',
    title: 'Mũi Né – Bình Thuận: Khúc Biến Tấu Của Tiểu Sa Mạc Cát Bay & Cung Đường Biển Bàu Trắng',
    subtitle:
      'Cưỡi xe Jeep băng qua đồi cát trắng ôm lấy hồ sen xanh ngát, lội suối Tiên đỏ cam kỳ ảo và đón bình minh tại làng chài Mũi Né.',
    standfirst:
      'Cưỡi xe Jeep băng qua đồi cát trắng ôm lấy hồ sen xanh ngát, lội suối Tiên đỏ cam kỳ ảo và đón bình minh tại làng chài Mũi Né.',
    category: 'Thiên nhiên kỳ vĩ',
    region: 'Miền Trung',
    province: 'Bình Thuận',
    destinationProvince: 'Bình Thuận',
    displayLocation: 'Mũi Né • Bình Thuận',
    readTimeMinutes: 5,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Hoàng Bách',
      role: 'Phóng viên Cung đường & Bản địa',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Cung Đường Cao Tốc Mới',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Bình minh rực rỡ trên bờ biển và những đồi cát trải dài tại Mũi Né – Phan Thiết, Bình Thuận.',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Cung đường đôi Bàu Trắng như một thước phim điện ảnh nơi một bên là cồn cát trắng tinh khôi, một bên là đại dương xanh thẳm trải dài vô tận.”',
    storyParagraphs: [
      'Kể từ khi cao tốc Dầu Giây – Phan Thiết thông xe, Mũi Né (Bình Thuận) đã trở thành thiên đường nghỉ dưỡng cuối tuần gần TP. Hồ Chí Minh nhất khi chỉ mất vỏn vẹn 2,5 đến 3 giờ ngồi xe Limousine.',
      'Điểm nhấn độc bản của Mũi Né nằm ở sự tương phản kỳ diệu của thiên nhiên: những triền cát trắng Bàu Trắng và đồi cát đỏ Hồngỡ thay đổi hình dáng theo từng cơn gió biển, bao quanh đầm sen nước ngọt mát lành giữa vùng đất đầy nắng.',
      'Hãy thức dậy từ 4 giờ 30 sáng để lên chiếc xe Jeep mui trần sắc màu, đón bình minh trên đỉnh đồi cát, ghé làng chài Mũi Né khi hàng trăm thuyền thúng đầy ắp tôm cá vừa cập bờ, rồi lội chân trần dọc dòng Suối Tiên mát lạnh.',
    ],
    highlights: [
      {
        id: 'mn-jeep-bau-trang',
        title: 'Tour Xe Jeep Bình minh Đồi Cát Trắng Bàu Trắng & Cung đường biển',
        category: 'Săn ảnh',
        description:
          'Đi xe Jeep mui trần săn bình minh trên “tiểu sa mạc Sahara”, chạy mô tô địa hình ATV trên đỉnh đồi cát và chụp ảnh với xe nước vàng.',
        duration: '4 giờ',
        durationHours: 4,
        estimatedCost: '300.000đ',
        estimatedCostVnd: 300000,
        goldenHour: '05:00 – 08:30',
        tip: 'Khung giờ 05:30 – 06:30 sáng cát còn mát và có những đường vân gió nguyên vẹn chưa in dấu chân.',
      },
      {
        id: 'mn-lang-chai-suoi-tien',
        title: 'Khám phá Làng Chài Mũi Né & Lội dòng Suối Tiên nhũ cát đỏ',
        category: 'Trải nghiệm',
        description:
          'Ngắm hàng trăm chiếc thuyền thúng tròn đầy màu sắc tại làng chài buổi sớm và đi bộ dưới khe suối nhũ cát tự nhiên.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '100.000đ',
        estimatedCostVnd: 100000,
        goldenHour: '07:00 – 09:30',
      },
      {
        id: 'mn-sunset-beach-club',
        title: 'Ngắm hoàng hôn & Chèo ván diều tại các Beach Club Mũi Né',
        category: 'Vui chơi',
        description:
          'Thưởng thức cocktail nhiệt đới dưới bóng dừa Hàm Tiến và xem các vận động viên lướt ván diều (Kitesurfing) trên sóng.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '250.000đ',
        estimatedCostVnd: 250000,
        goldenHour: '16:30 – 18:30',
      },
    ],
    vibes: ['adventure', 'photography', 'nature', 'budget'],
    vibeTags: ['Cao tốc 2.5 giờ', 'Xe Jeep Đồi cát', 'Biển & Nắng vàng', 'Cuối tuần từ Sài Gòn'],
    bestMonths: 'Quanh năm (Ít mưa bậc nhất Việt Nam, đẹp nhất Tháng 11 – Tháng 5)',
    seasonalPulse: 'Cao tốc Dầu Giây – Phan Thiết giúp đi về trong ngày hoặc 2N1Đ cuối tuần cực kỳ thảnh thơi',
    crowdLevel: 'Vừa phải',
    weatherSummary: '26°C – 32°C • Nắng rực rỡ, gió biển lộng',
    estimatedBudgetPerDay: 900000,
    estimatedBudgetFormatted: '900.000đ / ngày',
    budgetLevel: 'Tiết kiệm',
    suggestedOrigin: 'Hồ Chí Minh',
    originSuggestion: 'Hồ Chí Minh',
    busDurationHours: 2.8,
    busDurationLabel: '2.5 – 3 giờ cao tốc Dầu Giây – Phan Thiết',
    busPriceFrom: 200000,
    busPriceFormatted: '200.000đ',
    recommendedBusType: 'Limousine 9 chỗ hoặc Giường nằm Cao tốc trả tận Resort Hàm Tiến',
    coordinates: [10.9333, 108.2833],
    aiInsight:
      'Chỉ với 200.000đ và chưa đầy 3 giờ ngồi xe từ TP. Hồ Chí Minh đến Bình Thuận, Mũi Né là lựa chọn số 1 cho chuyến đổi gió cuối tuần ngân sách thấp mà vẫn có bộ ảnh thiên nhiên ấn tượng.',
    aiAudioSummary:
      'Mũi Né – Phan Thiết thuộc tỉnh Bình Thuận nổi tiếng với đồi cát bay Bàu Trắng, Suối Tiên, làng chài truyền thống và cung đường biển đẹp bậc nhất miền Nam Trung Bộ.',
    localSpecialties: ['Lẩu thả Phan Thiết', 'Gỏi cá mai cuốn bánh tráng', 'Bánh căn hải sản & Bánh quai vạc', 'Răng mực nướng muối ớt'],
    camera3DAngles: [
      {
        id: 'muine-cam-bau-trang',
        label: 'Flycam Tiểu Sa Mạc Đồi Cát Bay & Bàu Trắng',
        coordinates: [11.0667, 108.4278],
        pitch: 68,
        bearing: 40,
        zoom: 14.9,
        altitudeMeters: 230,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn 3D ấn tượng nơi những triền cát bay khổng lồ ôm trọn đầm sen nước ngọt Bàu Trắng và cung đường đôi ven biển.',
        bestTime: 'Bình minh 05:30 – 07:00',
        streetViewLatLng: [10.9504, 108.2966], // Đồi Cát Bay Mũi Né (Đường Võ Nguyên Giáp / Hòn Rơm)
        streetViewHeading: 45,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'muine-cam-lang-chai',
        label: 'Góc Cam 3D Làng Chài Mũi Né & Vịnh Thuyền Thúng',
        coordinates: [10.9469, 108.2856],
        pitch: 64,
        bearing: -135,
        zoom: 15.5,
        altitudeMeters: 140,
        imageUrl: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1400&q=80',
        description: 'Hàng trăm chiếc thuyền thúng tròn rực rỡ sắc màu neo đậu trên mặt vịnh Mũi Né buổi bình minh.',
        bestTime: 'Sáng sớm 06:00 – 08:00',
        streetViewLatLng: [10.9472, 108.2848], // Đường Huỳnh Thúc Kháng – Làng Chài Mũi Né
        streetViewHeading: 225,
        streetViewPitch: 4,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 11. NAM ĐẢO PHÚ QUỐC - KIÊN GIANG
  // ==========================================
  {
    id: 'phu-quoc-nam-dao-kien-giang',
    slug: 'phu-quoc-kien-giang-hoang-hon-dia-trung-hai-va-hanh-trinh-vuot-bien-hon-thom',
    title: 'Nam Đảo Phú Quốc: Hoàng Hôn Thị Trấn Địa Trung Hải & Cáp Treo Vượt Biển Hòn Thơm',
    subtitle:
      'Bay trên tuyến cáp treo 3 dây vượt biển dài nhất thế giới, ngắm hoàng hôn tại Cầu Hôn (Kiss Bridge) và thưởng thức pháo hoa nghệ thuật mỗi đêm.',
    standfirst:
      'Bay trên tuyến cáp treo 3 dây vượt biển dài nhất thế giới, ngắm hoàng hôn tại Cầu Hôn (Kiss Bridge) và thưởng thức pháo hoa nghệ thuật mỗi đêm.',
    category: 'Vui chơi & Giải trí',
    region: 'Miền Nam',
    province: 'Kiên Giang',
    destinationProvince: 'Kiên Giang',
    displayLocation: 'Nam Đảo Phú Quốc • Kiên Giang',
    readTimeMinutes: 6,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Lan Khuê',
      role: 'Biên tập viên Phong cách sống & Nghỉ dưỡng',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Đảo Ngọc Phương Nam',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85',
    heroImageCaption:
      'Ánh hoàng hôn vàng rực buông xuống mặt biển êm đềm tại đảo ngọc Phú Quốc, tỉnh Kiên Giang.',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Hoàng hôn Phú Quốc là một vở nhạc kịch của thiên nhiên, nơi mặt trời đỏ rực từ từ chạm vào khoảng cách 30cm giữa hai nhịp Cầu Hôn.”',
    storyParagraphs: [
      'Thuộc tỉnh Kiên Giang, đảo ngọc Phú Quốc từ lâu đã được các tạp chí du lịch hàng đầu thế giới bình chọn vào top những hòn đảo quyến rũ nhất hành tinh. Hành trình kết hợp xe giường nằm VIP từ TP. Hồ Chí Minh đi Rạch Giá hoặc Hà Tiên (Kiên Giang) nối chuyến tàu cao tốc ra đảo đang trở thành trào lưu du lịch trải nghiệm vừa tiết kiệm vừa thú vị.',
      'Tại Nam Đảo, tuyến cáp treo Hòn Thơm dài gần 8km đưa du khách lướt qua những cụm đảo xanh ngọc bích và những đoàn thuyền đánh cá của ngư dân An Thới để đến với công viên nước Aquatopia và mũi Kỳ Lân.',
      'Chiều tà, Thị trấn Hoàng Hôn (Sunset Town) hiện lên với những dãy phố sắc màu Địa Trung Hải, cây Cầu Hôn vươn ra biển lớn, chợ đêm bên biển VUI-Fest Bazaar và màn trình diễn đa phương tiện Kiss of the Sea kết hợp pháo hoa rực sáng bầu trời đêm.',
    ],
    highlights: [
      {
        id: 'pq-cap-treo-hon-thom',
        title: 'Cáp treo 3 dây vượt biển Hòn Thơm & Cano 3 đảo An Thới',
        category: 'Vui chơi',
        description:
          'Ngắm toàn cảnh quần đảo An Thới từ trên cao, vui chơi công viên nước Aquatopia và lặn ngắm san hô tại Hòn Móng Tay – Hòn Mây Rút.',
        duration: '6 giờ',
        durationHours: 6,
        estimatedCost: '850.000đ',
        estimatedCostVnd: 850000,
        goldenHour: '08:30 – 14:30',
        tip: 'Ngồi phía bên phải cabin cáp treo chiều đi để chụp trọn cảng An Thới và làn nước biển chuyển 3 tầng màu.',
      },
      {
        id: 'pq-sunset-town-cau-hon',
        title: 'Săn hoàng hôn trên Cầu Hôn (Kiss Bridge) & Thị trấn Hoàng Hôn',
        category: 'Săn ảnh',
        description:
          'Dạo bước trên kiệt tác cầu đi bộ trên biển và chụp ảnh giữa những con dốc mang kiến trúc Amalfi nước Ý.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '100.000đ',
        estimatedCostVnd: 100000,
        goldenHour: '16:45 – 18:15',
      },
      {
        id: 'pq-vuifest-phao-hoa',
        title: 'Chợ đêm biển VUI-Fest Bazaar & Xem pháo hoa nghệ thuật',
        category: 'Ẩm thực',
        description:
          'Thưởng thức hải sản nướng, xem biểu diễn nghệ thuật đường phố Loảng Xoảng Show và ngắm pháo hoa lúc 21:30.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '400.000đ',
        estimatedCostVnd: 400000,
        goldenHour: '19:30 – 22:00',
      },
    ],
    vibes: ['family', 'nightlife', 'photography', 'healing'],
    vibeTags: ['Đảo Ngọc Kiên Giang', 'Hoàng hôn Đẹp nhất', 'Cáp treo Hòn Thơm', 'Pháo hoa Đêm'],
    bestMonths: 'Tháng 10 – Tháng 4 (Mùa khô, biển lặng như hồ, nắng ấm áp)',
    seasonalPulse: 'Nam Đảo đang vào mùa biển êm nhất năm, hoàng hôn không gợn mây tại Cầu Hôn',
    crowdLevel: 'Vừa phải',
    weatherSummary: '26°C – 31°C • Nắng ấm nhiệt đới, gió biển êm',
    estimatedBudgetPerDay: 1650000,
    estimatedBudgetFormatted: '1.650.000đ / ngày',
    budgetLevel: 'Cao cấp',
    suggestedOrigin: 'Hồ Chí Minh',
    originSuggestion: 'Hồ Chí Minh',
    busDurationHours: 6,
    busDurationLabel: '6 giờ xe giường nằm tới Kiên Giang + Tàu cao tốc',
    busPriceFrom: 260000,
    busPriceFormatted: '260.000đ',
    recommendedBusType: 'Xe Giường Phòng VIP đi Rạch Giá / Hà Tiên (Kiên Giang)',
    coordinates: [10.2289, 103.9572],
    aiInsight:
      'Mẹo tiết kiệm 60% chi phí di chuyển ra Phú Quốc: Thay vì vé máy bay đắt đỏ dịp cuối tuần, hãy đặt xe giường nằm đêm từ TP.HCM đi Kiên Giang (260.000đ), sáng hôm sau lên tàu cao tốc ngắm biển Vịnh Thái Lan chỉ 1,5 giờ là cập đảo.',
    aiAudioSummary:
      'Đảo Phú Quốc cùng quần đảo Nam Du và Hà Tiên thuộc tỉnh Kiên Giang là trung tâm du lịch biển đảo lớn nhất miền Tây Nam Bộ với thiên nhiên hoang sơ và tổ hợp giải trí hiện đại.',
    localSpecialties: ['Bún quậy Kiến Xây', 'Gỏi cá trích Phú Quốc', 'Ghẹ Hàm Ninh hấp tươi', 'Bún kèn & Nước mắm nhĩ truyền thống'],
    camera3DAngles: [
      {
        id: 'phuquoc-cam-cau-hon',
        label: 'Flycam Cầu Hôn (Kiss Bridge) & Thị Trấn Hoàng Hôn',
        coordinates: [10.0308, 104.0061],
        pitch: 68,
        bearing: -95,
        zoom: 15.6,
        altitudeMeters: 175,
        imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc cam 3D hướng thẳng ra hai nhánh Cầu Hôn vươn mình trên biển lớn với dãy phố kiến trúc Địa Trung Hải rực rỡ.',
        bestTime: 'Hoàng hôn 17:00 – 18:15',
        streetViewLatLng: [10.0309, 104.0068], // Thị trấn Hoàng Hôn Sunset Town – An Thới, Phú Quốc
        streetViewHeading: 265,
        streetViewPitch: 6,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'phuquoc-cam-hon-thom',
        label: 'Góc Cam 3D Ga Ánh Dương & Cáp Treo Hòn Thơm',
        coordinates: [9.9722, 104.0169],
        pitch: 65,
        bearing: 160,
        zoom: 14.5,
        altitudeMeters: 310,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
        description: 'Tầm nhìn từ Ga Ánh Dương – tuyến cáp treo 3 dây vượt biển dài nhất thế giới bao quát quần đảo An Thới.',
        bestTime: 'Nắng sáng 09:00 – 11:30',
        streetViewLatLng: [10.0258, 104.0085], // Ga đi Cáp treo Hòn Thơm (Ga Ánh Dương)
        streetViewHeading: 175,
        streetViewPitch: 8,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },

  // ==========================================
  // 12. CHỢ NỔI CÁI RĂNG & TÂY ĐÔ - CẦN THƠ
  // ==========================================
  {
    id: 'cho-noi-cai-rang-can-tho',
    slug: 'can-tho-binh-minh-tren-cho-noi-cai-rang-va-net-duyen-miet-vuon-tay-do',
    title: 'Cần Thơ: Bình Minh Bồng Bềnh Trên Chợ Nổi Cái Răng & Hồn Quê Miệt Vườn Tây Đô',
    subtitle:
      'Thưởng thức tô hủ tiếu nóng hổi ngay trên ghe thuyền lúc 5 giờ 30 sáng, thăm nhà cổ Bình Thủy trăm năm và nghe đờn ca tài tử bên bến Ninh Kiều.',
    standfirst:
      'Thưởng thức tô hủ tiếu nóng hổi ngay trên ghe thuyền lúc 5 giờ 30 sáng, thăm nhà cổ Bình Thủy trăm năm và nghe đờn ca tài tử bên bến Ninh Kiều.',
    category: 'Ẩm thực & Đêm',
    region: 'Miền Nam',
    province: 'Cần Thơ',
    destinationProvince: 'Cần Thơ',
    displayLocation: 'Chợ nổi Cái Răng • Cần Thơ',
    readTimeMinutes: 5,
    publishedAt: 'Ấn phẩm Mùa Thu - Đông • Số 24',
    author: {
      name: 'Minh Triết',
      role: 'Chủ biên Du lịch & Di sản',
    },
    isLeadStory: false,
    editionNumber: 'Vol. 24 • Văn Hóa Sông Nước',
    columnSpan: 'standard',
    heroImage:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1350&q=85',
    heroImageCaption:
      'Nhịp sống thương hồ tấp nập buổi bình minh trên vùng sông nước miền Tây Nam Bộ tại Cần Thơ.',
    gallery: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80',
    ],
    pullQuote:
      '“Chỉ khi ngồi trên chiếc ghe nhỏ bồng bềnh giữa dòng sông Cần Thơ, bưng tô bún riêu nghi ngút khói và nghe tiếng rao hàng ngọt lịm, ta mới thấu hết cái tình hào sảng của miền Tây.”',
    storyParagraphs: [
      'Cần Thơ – thủ phủ Tây Đô của vùng Đồng bằng sông Cửu Long chỉ cách TP. Hồ Chí Minh hơn 3 giờ di chuyển bằng xe khách qua cao tốc Trung Lương – Mỹ Thuận – Cần Thơ. Đây là điểm chạm hoàn hảo để cảm nhận trọn vẹn văn hóa sông nước Nam Bộ.',
      'Từ 5 giờ sáng tại bến Ninh Kiều, những chiếc thuyền máy đưa du khách xuôi về Chợ nổi Cái Răng – di sản văn hóa phi vật thể quốc gia. Hàng trăm ghe bầu chở đầy khóm, dưa hấu, bí đỏ từ khắp các tỉnh miền Tây tụ hội, treo sản vật lên cây “bẹo” độc đáo giữa tiếng máy nổ giòn giã và những quán cà phê, hủ tiếu nổi ngay trên mặt sông.',
      'Rời chợ nổi, hành trình tiếp nối qua những con rạch nhỏ rợp bóng dừa nước để vào miệt vườn Cồn Sơn xem cá lóc bay, tự tay làm bánh dân gian Nam Bộ và ghé thăm ngôi nhà cổ Bình Thủy mang kiến trúc Đông – Tây giao hòa từ năm 1870.',
    ],
    highlights: [
      {
        id: 'ct-cho-noi-cai-rang',
        title: 'Đi ghe Bình minh Chợ nổi Cái Răng & Ăn sáng trên sông',
        category: 'Trải nghiệm',
        description:
          'Trải nghiệm văn hóa thương hồ miền Tây, thưởng thức hủ tiếu ghe, cà phê kho và thăm lò hủ tiếu truyền thống.',
        duration: '3 giờ',
        durationHours: 3,
        estimatedCost: '200.000đ',
        estimatedCostVnd: 200000,
        goldenHour: '05:15 – 07:45',
        tip: 'Chợ nổi họp đông vui nhất từ 05:30 đến 07:00 sáng; đi trễ hơn các ghe thương lái lớn đã tỏa đi các nhánh sông.',
      },
      {
        id: 'ct-miet-vuon-con-son',
        title: 'Khám phá Miệt vườn Cồn Sơn & Nhà cổ Bình Thủy',
        category: 'Tham quan',
        description:
          'Thưởng thức trái cây tại vườn, xem tuyệt kỹ cá lóc bay, trải nghiệm làm bánh kẹp cuốn và thăm ngôi nhà cổ 5 gian 2 chái.',
        duration: '4 giờ',
        durationHours: 4,
        estimatedCost: '250.000đ',
        estimatedCostVnd: 250000,
        goldenHour: '08:30 – 12:30',
      },
      {
        id: 'ct-ben-ninh-kieu-du-thuyen',
        title: 'Du thuyền Bến Ninh Kiều, Cầu Tình Yêu & Đờn ca tài tử',
        category: 'Ẩm thực',
        description:
          'Dạo cầu đi bộ Ninh Kiều rực sáng ánh đèn, ăn tối trên du thuyền sông Hậu và nghe đờn ca tài tử Nam Bộ.',
        duration: '2.5 giờ',
        durationHours: 2.5,
        estimatedCost: '300.000đ',
        estimatedCostVnd: 300000,
        goldenHour: '19:00 – 21:30',
      },
    ],
    vibes: ['culture', 'nightlife', 'family', 'budget'],
    vibeTags: ['Văn hóa Sông nước', 'Chợ nổi Cái Răng', 'Miệt vườn Trái cây', 'Gần Sài Gòn 3 giờ'],
    bestMonths: 'Quanh năm (Tháng 5 – Tháng 8 mùa trái cây chín rộ, Tháng 9 – Tháng 11 mùa nước nổi)',
    seasonalPulse: 'Cao tốc Mỹ Thuận – Cần Thơ đã thông toàn tuyến, rút ngắn hành trình từ TP.HCM xuống chỉ còn 3 giờ',
    crowdLevel: 'Thấp',
    weatherSummary: '25°C – 31°C • Gió sông Hậu mát rượi, nắng ấm',
    estimatedBudgetPerDay: 800000,
    estimatedBudgetFormatted: '800.000đ / ngày',
    budgetLevel: 'Tiết kiệm',
    suggestedOrigin: 'Hồ Chí Minh',
    originSuggestion: 'Hồ Chí Minh',
    busDurationHours: 3.2,
    busDurationLabel: '3 – 3.5 giờ cao tốc Mỹ Thuận – Cần Thơ',
    busPriceFrom: 165000,
    busPriceFormatted: '165.000đ',
    recommendedBusType: 'Xe Giường Nằm Cao Tốc hoặc Limousine 9 chỗ',
    coordinates: [10.0452, 105.7469],
    aiInsight:
      'Các chuyến xe khách từ TP. Hồ Chí Minh đi Cần Thơ hoạt động 24/24 cứ 15–30 phút/chuyến với giá chỉ từ 165.000đ. Bạn có thể đi chuyến 01:30 đêm để tới bến Ninh Kiều đúng 05:00 sáng xuống thuyền đi chợ nổi Cái Răng.',
    aiAudioSummary:
      'Thành phố Cần Thơ bên bờ sông Hậu là trung tâm của miền Tây Nam Bộ, nổi tiếng với Chợ nổi Cái Răng, bến Ninh Kiều, nhà cổ Bình Thủy và những miệt vườn cây trái trĩu quả.',
    localSpecialties: ['Lẩu mắm Dạ Lý', 'Bánh cống Cần Thơ', 'Vịt nấu chao hẻm 1 Lý Tự Trọng', 'Cá lóc nướng trui cuốn lá sen non'],
    camera3DAngles: [
      {
        id: 'cantho-cam-cai-rang',
        label: 'Flycam Bình Minh Chợ Nổi Cái Răng Trên Sông',
        coordinates: [10.0044, 105.7442],
        pitch: 66,
        bearing: 50,
        zoom: 15.8,
        altitudeMeters: 135,
        imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=85',
        description: 'Góc nhìn 3D sống động ngay trên mặt sông Cần Thơ nơi hàng trăm ghe thương hồ tụ họp trao đổi nông sản miền Tây.',
        bestTime: 'Bình minh 05:30 – 07:15',
        streetViewLatLng: [10.0036, 105.7458], // Cầu Cái Răng – Sông Cần Thơ nhìn xuống Chợ Nổi
        streetViewHeading: 310,
        streetViewPitch: 2,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85',
      },
      {
        id: 'cantho-cam-ninh-kieu',
        label: 'Góc Cam 3D Bến Ninh Kiều & Cầu Đi Bộ Sông Hậu',
        coordinates: [10.0339, 105.7881],
        pitch: 64,
        bearing: -70,
        zoom: 15.4,
        altitudeMeters: 160,
        imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1400&q=80',
        description: 'Toàn cảnh Bến Ninh Kiều, cầu đi bộ hoa sen phát sáng và dòng sông Hậu mênh mông lúc lên đèn.',
        bestTime: 'Buổi tối 19:00 – 21:00',
        streetViewLatLng: [10.0338, 105.7878], // Công viên Bến Ninh Kiều – Đường Hai Bà Trưng, Cần Thơ
        streetViewHeading: 110,
        streetViewPitch: 5,
        streetViewFov: 90,
        panorama360Url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=2400&q=85',
      },
    ],
  },
];

/** Alias tương thích cho các component dùng EXPLORE_ARTICLES */
export const EXPLORE_ARTICLES: ExploreArticle[] = EXPLORE_DESTINATIONS;

// ========================================================
// HELPER FUNCTIONS
// ========================================================

export function formatVndCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

export function getLeadDestination(): ExploreDestination {
  return EXPLORE_DESTINATIONS.find((item) => item.isLeadStory) ?? EXPLORE_DESTINATIONS[0]!;
}

export function getDestinationByIdOrSlug(idOrSlug: string): ExploreDestination | undefined {
  return EXPLORE_DESTINATIONS.find(
    (item) => item.id === idOrSlug || item.slug === idOrSlug,
  );
}

export function getDestination3DCameraAngles(
  destination: ExploreDestination,
): Camera3DVantagePoint[] {
  if (destination.camera3DAngles && destination.camera3DAngles.length > 0) {
    return destination.camera3DAngles;
  }
  if (destination.camera3D && destination.camera3D.length > 0) {
    return destination.camera3D;
  }
  return [
    {
      id: `${destination.id}-cam-default`,
      label: `Flycam Toàn Cảnh ${destination.displayLocation}`,
      coordinates: destination.coordinates,
      pitch: 66,
      bearing: 45,
      zoom: 15.2,
      altitudeMeters: 250,
      imageUrl: destination.heroImage,
      description: destination.heroImageCaption,
      bestTime: destination.highlights[0]?.goldenHour || '06:00 – 08:30',
      streetViewLatLng: destination.coordinates,
      streetViewHeading: 45,
      streetViewPitch: 5,
      streetViewFov: 90,
      panorama360Url: destination.heroImage,
    },
  ];
}

/**
 * Tạo URL nhúng Google Street View 360° tương tác (kiểu OpenGuessr / WorldGuessr)
 * Hỗ trợ kéo xoay 360°, phóng to/thu nhỏ và di chuyển từng bước dọc tuyến đường thực tế không cần API key trả phí.
 */
export function buildGoogleStreetViewEmbedUrl(vantage: Camera3DVantagePoint): string {
  const [lat, lng] = vantage.streetViewLatLng ?? vantage.coordinates;
  const heading = Math.round(((vantage.streetViewHeading ?? vantage.bearing ?? 0) % 360 + 360) % 360);
  const pitch = Math.round(vantage.streetViewPitch ?? 5);
  return `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,${heading},0,0,${pitch}&hl=vi&output=svembed`;
}

/**
 * Tạo URL mở toàn màn hình trực tiếp trên Google Maps Street View 360°
 */
export function buildGoogleStreetViewExternalUrl(vantage: Camera3DVantagePoint): string {
  const [lat, lng] = vantage.streetViewLatLng ?? vantage.coordinates;
  const heading = Math.round(((vantage.streetViewHeading ?? vantage.bearing ?? 0) % 360 + 360) % 360);
  const pitch = Math.round(vantage.streetViewPitch ?? 5);
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=${heading}&pitch=${pitch}`;
}

export function buildSearchRouteUrl(
  destination: ExploreDestination,
  customOrigin?: string,
  departureDate?: string,
): string {
  const origin = customOrigin || destination.suggestedOrigin;
  const params = new URLSearchParams({
    origin,
    destination: destination.province,
    passengers: '1',
  });
  if (departureDate) {
    params.set('departureDate', departureDate);
  }
  return `/search?${params.toString()}`;
}

export function buildTravelPlannerUrl(
  destination: ExploreDestination,
  customOrigin?: string,
): string {
  const origin = customOrigin || destination.suggestedOrigin;
  const params = new URLSearchParams({
    origin,
    destination: destination.province,
  });
  return `/travel?${params.toString()}`;
}

function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

const VIBE_KEYWORDS_MAP: Record<ExploreVibeId, string[]> = {
  healing: ['chua lanh', 'san may', 'suong mu', 'yen tinh', 'nghi duong', 'thong', 'se lanh', 'thu gian', 'khoang nong', 'cham'],
  nature: ['thien nhien', 'vinh', 'dao', 'nui', 'deo', 'song', 'thac', 'cat', 'bien', 'hang dong', 'ky quan'],
  photography: ['chup anh', 'san anh', 'binh minh', 'hoang hon', 'check in', 'checkin', 'song ao', 'goc dep', 'anh'],
  adventure: ['phuot', 'deo', 'kayak', 'lan bien', 'san ho', 'trekking', 'leo nui', 'xe jeep', 'truot thac', 'sup', 'mao hiem'],
  culture: ['di san', 'van hoa', 'co do', 'lich su', 'pho co', 'chua', 'den', 'unesco', 'cung dinh', 'lang tam', 'cho noi'],
  nightlife: ['am thuc', 'dem', 'cho dem', 'pho dem', 'show', 'phao hoa', 'den long', 'an ngon', 'dac san', 'nhon nhip'],
  family: ['gia dinh', 'vui choi', 'giai tri', 'cap treo', 'cong vien', 'vinwonders', 'ba na', 'tre em', 'resort'],
  budget: ['tiet kiem', 'gia re', 'binh dan', 'sinh vien', 'cuoi tuan', 'ngan sach thap', 'duoi 1 trieu'],
  beach: ['bien', 'dao', 'vinh', 'lan bien', 'san ho', 'bai tam', 'cat trang', 'hon'],
  food: ['am thuc', 'an ngon', 'dac san', 'foodtour', 'cho noi', 'hai san', 'bun', 'lau', 'che'],
};

/**
 * Engine AI gợi ý & chấm điểm điểm đến theo câu hỏi tự nhiên (Prompt), Vibe, Vùng miền và Ngân sách
 */
export function matchDestinationsByAiPromptOrVibe(
  query: string = '',
  selectedVibes: string[] = [],
  region?: string,
  budgetLevel?: string,
): AiMatchResult {
  const normalizedQuery = normalizeVietnameseText(query);
  const validSelectedVibes = selectedVibes.filter((v): v is ExploreVibeId =>
    EXPLORE_VIBES.some((opt) => opt.id === v),
  );

  // Phát hiện thêm vibes từ câu prompt tự nhiên
  const detectedFromQuery: ExploreVibeId[] = [];
  if (normalizedQuery) {
    (Object.keys(VIBE_KEYWORDS_MAP) as ExploreVibeId[]).forEach((vibeId) => {
      const keywords = VIBE_KEYWORDS_MAP[vibeId];
      if (keywords.some((kw) => normalizedQuery.includes(kw))) {
        detectedFromQuery.push(vibeId);
      }
    });
  }

  const combinedVibes = Array.from(new Set([...validSelectedVibes, ...detectedFromQuery]));

  // Phát hiện vùng miền từ prompt nếu chưa truyền
  let effectiveRegion = region && region !== 'Tất cả' ? region : undefined;
  if (!effectiveRegion && normalizedQuery) {
    if (normalizedQuery.includes('mien bac') || normalizedQuery.includes('tay bac') || normalizedQuery.includes('동 bac')) {
      effectiveRegion = 'Miền Bắc';
    } else if (normalizedQuery.includes('mien trung') || normalizedQuery.includes('tay nguyen')) {
      effectiveRegion = 'Miền Trung';
    } else if (normalizedQuery.includes('mien nam') || normalizedQuery.includes('mien tay')) {
      effectiveRegion = 'Miền Nam';
    }
  }

  // Phát hiện ngân sách từ prompt
  let effectiveBudget = budgetLevel && budgetLevel !== 'Tất cả' ? budgetLevel : undefined;
  if (!effectiveBudget && normalizedQuery) {
    if (normalizedQuery.includes('tiet kiem') || normalizedQuery.includes('gia re') || normalizedQuery.includes('duoi 1 trieu')) {
      effectiveBudget = 'Tiết kiệm';
    } else if (normalizedQuery.includes('cao cap') || normalizedQuery.includes('5 sao') || normalizedQuery.includes('resort')) {
      effectiveBudget = 'Cao cấp';
    }
  }

  const scored: ScoredExploreDestination[] = EXPLORE_DESTINATIONS.map((dest) => {
    let score = 55; // Base editorial relevance score
    const reasons: string[] = [];

    // 1. Khớp vùng miền
    if (effectiveRegion) {
      if (dest.region === effectiveRegion) {
        score += 18;
        reasons.push(`Thuộc ${dest.region} đúng khu vực bạn ưu tiên`);
      } else {
        score -= 25;
      }
    }

    // 2. Khớp ngân sách
    if (effectiveBudget) {
      if (dest.budgetLevel === effectiveBudget) {
        score += 15;
        reasons.push(`Mức ngân sách ${dest.budgetLevel.toLowerCase()} (${dest.estimatedBudgetFormatted})`);
      } else if (effectiveBudget === 'Tiết kiệm' && dest.estimatedBudgetPerDay <= 1000000) {
        score += 10;
        reasons.push(`Chi phí tối ưu chỉ khoảng ${dest.estimatedBudgetFormatted}`);
      } else {
        score -= 10;
      }
    }

    // 3. Khớp Vibes
    if (combinedVibes.length > 0) {
      const matchedVibes = dest.vibes.filter((v) => combinedVibes.includes(v));
      if (matchedVibes.length > 0) {
        score += matchedVibes.length * 14;
        const matchedLabels = matchedVibes
          .map((vId) => EXPLORE_VIBES.find((opt) => opt.id === vId)?.shortLabel)
          .filter(Boolean)
          .join(', ');
        reasons.push(`Hội tụ trọn vẹn trải nghiệm: ${matchedLabels}`);
      } else {
        score -= 12;
      }
    }

    // 4. Khớp từ khóa trực tiếp trong tên địa danh, tỉnh, nội dung, highlights
    if (normalizedQuery) {
      const searchableCorpus = normalizeVietnameseText(
        [
          dest.title,
          dest.subtitle,
          dest.province,
          dest.displayLocation,
          dest.category,
          dest.vibeTags.join(' '),
          dest.localSpecialties.join(' '),
          dest.highlights.map((h) => `${h.title} ${h.description}`).join(' '),
        ].join(' '),
      );

      const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length >= 2);
      const matchedTokens = queryTokens.filter((token) => searchableCorpus.includes(token));

      if (normalizeVietnameseText(dest.province).includes(normalizedQuery) || normalizeVietnameseText(dest.displayLocation).includes(normalizedQuery)) {
        score += 30;
        reasons.push(`Khớp trực tiếp địa danh ${dest.displayLocation}`);
      } else if (matchedTokens.length > 0) {
        const ratio = matchedTokens.length / Math.max(queryTokens.length, 1);
        score += Math.round(ratio * 24);
      }
    }

    // Đảm bảo luôn có ít nhất 2 lý do biên tập sắc sảo
    if (reasons.length === 0) {
      reasons.push(`Thời điểm lý tưởng: ${dest.seasonalPulse}`);
    }
    if (reasons.length === 1) {
      reasons.push(
        `Tuyến xe khách từ ${dest.suggestedOrigin} chỉ ${dest.busPriceFormatted} (${dest.busDurationLabel})`,
      );
    }

    const clampedScore = Math.max(40, Math.min(99, score));
    const recommendedHighlightIds = dest.highlights.slice(0, 2).map((h) => h.id);

    return {
      ...dest,
      destination: dest,
      matchScore: clampedScore,
      matchPercentage: clampedScore,
      matchReasons: reasons.slice(0, 3),
      recommendedHighlightIds,
    };
  });

  // Lọc và sắp xếp theo điểm số cao nhất
  const sorted = scored
    .filter((item) => {
      if (effectiveRegion && item.region !== effectiveRegion) return false;
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const finalMatches = sorted.length > 0 ? sorted : scored.sort((a, b) => b.matchScore - a.matchScore);
  const topThree = finalMatches.slice(0, 3);
  const topNames = topThree.map((d) => d.displayLocation).join(', ');
  const avgDailyBudget =
    topThree.reduce((sum, d) => sum + d.estimatedBudgetPerDay, 0) / Math.max(topThree.length, 1);

  const vibeLabels = combinedVibes
    .map((id) => EXPLORE_VIBES.find((v) => v.id === id)?.label)
    .filter(Boolean);

  const editorialSummary =
    combinedVibes.length > 0 || normalizedQuery || effectiveRegion || effectiveBudget
      ? `Ấn phẩm AI Cá Nhân Hóa đã tuyển chọn ${finalMatches.length} tọa độ nổi bật dẫn đầu bởi ${topNames}. Các điểm đến này đạt độ tương thích tới ${topThree[0]?.matchPercentage ?? 95}% với gu "${vibeLabels.join(' • ') || query || effectiveRegion || 'Khám phá Việt Nam'}".`
      : `Trang nhất Khám Phá Việt Nam giới thiệu ${finalMatches.length} tuyệt tác danh lam thắng cảnh & điểm vui chơi giải trí Bắc – Trung – Nam đang vào mùa đẹp nhất năm.`;

  const explanation =
    topThree[0]
      ? `Gợi ý hàng đầu: ${topThree[0].displayLocation} (${topThree[0].matchPercentage}% phù hợp) — ${topThree[0].aiInsight}`
      : 'Chọn phong cách du lịch hoặc nhập mong muốn của bạn để AI biên tập trang báo riêng.';

  return {
    matches: finalMatches,
    destinations: finalMatches,
    editorialSummary,
    explanation,
    detectedVibes: combinedVibes,
    suggestedDurationDays: Math.min(Math.max(topThree.length, 2), 4),
    estimatedTotalBudget: Math.round(avgDailyBudget * 3),
    appliedRegion: effectiveRegion,
    appliedBudgetLevel: effectiveBudget,
  };
}

/**
 * Engine AI tự động tổng hợp lịch trình vui chơi & di chuyển xe khách nhiều ngày từ các điểm đến người đọc đã ghim trên trang báo
 */
export function generateAiTripPlanFromSelection(
  selectedIds: string[],
  selectedHighlightIds: string[] = [],
): AiGeneratedTripPlan {
  const rawDestinations = selectedIds
    .map((id) => EXPLORE_DESTINATIONS.find((d) => d.id === id || d.slug === id))
    .filter((d): d is ExploreDestination => Boolean(d));

  // Nếu chưa chọn điểm nào, dùng điểm Lead Story làm mặc định để xem trước
  const activeDestinations =
    rawDestinations.length > 0 ? rawDestinations : [getLeadDestination()];

  // Sắp xếp theo vĩ độ từ Bắc xuống Nam để tạo chuỗi hành trình xe khách hợp lý
  const orderedDestinations = [...activeDestinations].sort(
    (a, b) => b.coordinates[0] - a.coordinates[0],
  );

  const days: AiTripPlanDay[] = [];
  let totalBusCost = 0;
  let totalActivityCost = 0;
  let totalLivingCost = 0;

  orderedDestinations.forEach((dest, index) => {
    const prevDest = index > 0 ? orderedDestinations[index - 1] : undefined;
    const legOrigin =
      prevDest && prevDest.region === dest.region
        ? prevDest.province
        : dest.suggestedOrigin;

    // Ưu tiên những hoạt động người dùng đã tick chọn, nếu không lấy toàn bộ highlights của điểm đến
    const customHighlights = dest.highlights.filter((h) =>
      selectedHighlightIds.includes(h.id),
    );
    const chosenHighlights =
      customHighlights.length > 0 ? customHighlights : dest.highlights.slice(0, 3);

    const morningHighlight = chosenHighlights[0] ?? dest.highlights[0]!;
    const afternoonHighlight = chosenHighlights[1] ?? dest.highlights[1] ?? morningHighlight;
    const eveningHighlight = chosenHighlights[2] ?? dest.highlights[2];

    const slots: AiTripPlanSlot[] = [
      {
        timeOfDay: 'Buổi sáng',
        timeRange: morningHighlight.goldenHour || '07:30 – 11:00',
        activityTitle: morningHighlight.title,
        description: morningHighlight.description,
        estimatedCostVnd: morningHighlight.estimatedCostVnd,
        goldenHourNote: morningHighlight.tip,
      },
      {
        timeOfDay: 'Buổi chiều',
        timeRange: afternoonHighlight.goldenHour || '14:30 – 17:30',
        activityTitle: afternoonHighlight.title,
        description: afternoonHighlight.description,
        estimatedCostVnd:
          afternoonHighlight.id !== morningHighlight.id
            ? afternoonHighlight.estimatedCostVnd
            : 150000,
      },
      {
        timeOfDay: 'Buổi tối',
        timeRange: eveningHighlight?.goldenHour || '19:00 – 21:30',
        activityTitle:
          eveningHighlight && eveningHighlight.id !== afternoonHighlight.id
            ? eveningHighlight.title
            : `Thưởng thức đặc sản ${dest.localSpecialties.slice(0, 2).join(' & ')}`,
        description:
          eveningHighlight && eveningHighlight.id !== afternoonHighlight.id
            ? eveningHighlight.description
            : `Khám phá nhịp sống đêm tại ${dest.displayLocation} và thưởng thức ẩm thực bản địa trứ danh.`,
        estimatedCostVnd:
          eveningHighlight && eveningHighlight.id !== afternoonHighlight.id
            ? eveningHighlight.estimatedCostVnd
            : 250000,
      },
    ];

    const dayActivityCost = slots.reduce((sum, s) => sum + s.estimatedCostVnd, 0);
    const dayLivingCost = Math.max(dest.estimatedBudgetPerDay - dayActivityCost, 450000);
    const dayBusCost = dest.busPriceFrom;
    const dailyBudgetVnd = dayBusCost + dayActivityCost + dayLivingCost;

    totalBusCost += dayBusCost;
    totalActivityCost += dayActivityCost;
    totalLivingCost += dayLivingCost;

    days.push({
      dayNumber: index + 1,
      title: `Ngày ${index + 1}: Khám phá ${dest.displayLocation}`,
      destinationId: dest.id,
      destinationName: dest.displayLocation,
      province: dest.province,
      suggestedOrigin: legOrigin,
      busRouteLabel: `${legOrigin} → ${dest.province}`,
      busType: dest.recommendedBusType,
      busDurationHours: dest.busDurationHours,
      busPriceVnd: dayBusCost,
      dailyBudgetVnd,
      aiTip: dest.aiInsight,
      slots,
      searchUrl: buildSearchRouteUrl(dest, legOrigin),
      travelUrl: buildTravelPlannerUrl(dest, legOrigin),
    });
  });

  const totalEstimatedCost = totalBusCost + totalActivityCost + totalLivingCost;
  const firstDest = orderedDestinations[0]!;
  const lastDest = orderedDestinations[orderedDestinations.length - 1]!;
  const primaryOrigin = firstDest.suggestedOrigin;
  const primaryDestination =
    orderedDestinations.length > 1 && firstDest.province === primaryOrigin
      ? lastDest.province
      : firstDest.province;

  const routeSequence = [
    primaryOrigin,
    ...orderedDestinations.map((d) => d.province),
  ].filter((prov, idx, arr) => prov !== arr[idx - 1]);

  const routeSummaryLabel = routeSequence.join(' → ');

  const searchQueryParams = {
    origin: primaryOrigin,
    destination: primaryDestination,
    passengers: '1',
  };

  const travelQueryParams = {
    origin: primaryOrigin,
    destination: lastDest.province,
    stops: orderedDestinations.map((d) => d.province).join(','),
  };

  const searchUrl = `/search?${new URLSearchParams(searchQueryParams).toString()}`;
  const travelUrl = `/travel?${new URLSearchParams({
    origin: primaryOrigin,
    destination: primaryDestination,
  }).toString()}`;

  return {
    selectedDestinations: orderedDestinations,
    totalDays: days.length,
    totalEstimatedCost,
    totalEstimatedCostFormatted: formatVndCurrency(totalEstimatedCost),
    totalBusCost,
    totalActivityCost,
    totalLivingCost,
    routeSequence,
    routeSummaryLabel,
    editorialTitle:
      orderedDestinations.length === 1
        ? `Hành trình Chuyên sâu: ${firstDest.displayLocation} (${days.length} Ngày)`
        : `Hành trình Liên tuyến ${days.length} Ngày: ${orderedDestinations.map((d) => d.province).join(' • ')}`,
    editorialOverview: `AI Concierge đã tối ưu lộ trình theo trục địa lý (${routeSummaryLabel}), kết hợp các chuyến xe ${firstDest.recommendedBusType} cùng khung giờ vàng tại ${orderedDestinations.reduce((acc, d) => acc + d.highlights.length, 0)} tọa độ vui chơi giải trí.`,
    aiPackingAndTimingTip:
      orderedDestinations.length > 1
        ? `Mẹo nối tuyến thông minh: Đặt vé chặng đầu ${primaryOrigin} → ${firstDest.province} bằng chuyến xe đêm để tiết kiệm thời gian và mở bản đồ /travel để xem chi tiết điểm dừng từng chặng.`
        : firstDest.aiInsight,
    days,
    primaryOrigin,
    primaryDestination,
    searchQueryParams,
    travelQueryParams,
    searchUrl,
    travelUrl,
  };
}
