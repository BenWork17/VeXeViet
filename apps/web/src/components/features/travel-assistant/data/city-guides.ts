import type { CityGuide, LocalTransportOption, PlaceCategory, PlaceDetails } from '../types';

export const CITY_GUIDES: Record<string, CityGuide> = {
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

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  landmark: 'Điểm nổi tiếng',
  beach: 'Biển',
  food: 'Nhà hàng',
  culture: 'Văn hóa',
  nature: 'Thiên nhiên',
};

export const CITY_TRANSPORT_OPTIONS: LocalTransportOption[] = [
  { id: 'walk', label: 'Đi bộ', price: 0, note: 'Phù hợp các điểm gần nhau, tiết kiệm chi phí.' },
  { id: 'motorbike', label: 'Xe máy', price: 0, note: 'Linh hoạt nhất cho lịch trình nội đô.' },
  { id: 'car4', label: 'Ô tô 4 chỗ', price: 0, note: 'Thoải mái cho nhóm nhỏ hoặc gia đình.' },
  { id: 'car7', label: 'Ô tô 7 chỗ', price: 0, note: 'Thoải mái cho nhóm lớn hơn hoặc gia đình.' },
  { id: 'bus', label: 'Xe buýt', price: 0, note: 'Tiết kiệm, phù hợp tuyến phổ biến trong thành phố.' },
];

export const TRANSPORT_RATES = {
  'walk':      { min: 0,     max: 0,     label: 'Đi bộ' },
  'motorbike': { min: 10000, max: 15000, label: 'Xe máy' },
  'car4':      { min: 15000, max: 20000, label: 'Ô tô 4 chỗ' },
  'car7':      { min: 18000, max: 25000, label: 'Ô tô 7 chỗ' },
  'bus':       { min: 5000,  max: 10000, label: 'Xe buýt' },
};

export const PLACE_DETAILS: Record<string, PlaceDetails> = {
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

export function resolveCityGuide(destination: string): CityGuide {
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
