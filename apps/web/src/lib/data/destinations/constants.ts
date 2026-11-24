import type {
  AiFeatureShowcaseItem,
  AiQuickPromptPreset,
  ExploreCategory,
  ExploreRegion,
  ExploreVibeOption,
} from './types';

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
