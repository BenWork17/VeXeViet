import type {
  AiGeneratedTripPlan,
  AiMatchResult,
  AiTripPlanDay,
  AiTripPlanSlot,
  Camera3DVantagePoint,
  ExploreDestination,
  ExploreVibeId,
  ScoredExploreDestination,
} from './types';
import { EXPLORE_VIBES } from './constants';
import { EXPLORE_DESTINATIONS } from './data';

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
