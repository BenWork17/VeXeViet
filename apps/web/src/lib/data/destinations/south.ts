import type { ExploreDestination } from './types';

export const SOUTH_DESTINATIONS: ExploreDestination[] = [
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
