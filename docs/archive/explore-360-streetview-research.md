# Nghiên Cứu & Kiến Trúc Trải Nghiệm "Google Street View 360° & GeoGuessr Look-Around" cho VeXeViet (`/explore`)

**Tài liệu nghiên cứu kỹ thuật & UX/UI chuyên sâu**  
**Đơn vị thực hiện:** `research-editorial` (TEAM NGHIÊN CỨU)  
**Phạm vi áp dụng:** `apps/web/src/components/features/explore/Destination3DCameraModal.tsx`, `apps/web/src/lib/data/explore-destinations.ts`

---

## 1. Mục Tiêu & Vấn Đề Cần Giải Quyết

Người dùng mong muốn nâng cấp tính năng **"Góc Cam 3D"** trên chuyên trang báo chí du lịch **"Khám Phá Việt Nam" (`/explore`)** từ góc nhìn vệ tinh/tilt cơ bản lên một trải nghiệm **nhìn xung quanh 360° thực thụ giống Google Street View và tựa game GeoGuessr**:
- **Kéo chuột / chạm tự do 360°** để xoay quanh toàn bộ không gian danh lam thắng cảnh Việt Nam (`yaw: 0°–360°`, `pitch: -85° → +85°`).
- **Phóng to / thu nhỏ (FOV Zoom)** và **di chuyển từng bước giữa các điểm ngắm (Street-level walking & teleport)**.
- **Giao diện HUD đặc trưng của GeoGuessr**: Thanh la bàn tuyến tính trên đỉnh màn hình (`N / NE / E / SE / S / SW / W / NW`), bản đồ radar thu gọn ở góc dưới phải (hover/click để mở rộng), nút quay về điểm xuất phát (`Return to Start`), và các điểm tương tác POI để ghim thẳng vào *Sổ Tay Hành Trình*.

---

## 2. Benchmark Các Repo Mã Nguồn Mở & Nền Tảng Street View 360° Hàng Đầu

### 2.1. Nhóm Game & Ứng Dụng Kiểu GeoGuessr (Street View Embed & Spatial UX)

| Dự án / Repo | Công nghệ lõi | Điểm mạnh UX/UI & Kiến trúc nổi bật | Khả năng ứng dụng cho VeXeViet |
| :--- | :--- | :--- | :--- |
| **GeoGuessr (Chuẩn mực ngành)** | Google Maps JS SDK (`StreetViewPanorama`) + Custom HUD | Tiêu chuẩn vàng về trải nghiệm nhìn xung quanh: Thanh la bàn trượt ngang ở mép trên, bản đồ nhỏ góc dưới-phải tự mở rộng khi rê chuột, nút *"Return to start"* (`R`), nút `+/-` Zoom, mũi tên 3D trên mặt đường để bước tới. | **Áp dụng 100% hệ thống HUD & ngôn ngữ tương tác** (La bàn ngang, Mini-map radar thu gọn, nút Reset góc nhìn, chuyển điểm mượt). |
| **WorldGuessr (`codergautam/worldguessr`)** | Google Street View Interactive Embed (`output=svembed`) qua `<iframe>` | Chi phí $0 API, tải cực nhanh, giữ nguyên toàn bộ tương tác gốc của Google Street View (kéo 360°, phóng to, bấm mũi tên đi dọc phố thực tế) mà không cần khóa Google Maps JS trả phí. | **Áp dụng làm Chế độ 1 (Mặc định): Street View 360° Thực Tế**. |
| **OpenGuessr** | Google Street View Embed (`cbll`, `cbp`, `output=svembed`) + Leaflet/MapLibre Mini-Map | Kết hợp khéo léo Street View thật ở khung chính với bản đồ mã nguồn mở (MapLibre/Leaflet) làm mini-map radar, đồng thời hỗ trợ chuyển đổi vị trí tức thì theo tọa độ. | **Áp dụng mô hình Hybrid**: Iframe Google Street View cho khung chính + `maplibre-gl` (đã có sẵn trong dự án) cho Mini-Map Radar góc dưới phải. |
| **GeoHub (`benlikescode/geohub`)** | Next.js + Google Street View / Embed + Custom Controls | Kiến trúc React/Next.js hiện đại, tách biệt rõ trạng thái tọa độ điểm ngắm (`vantagePoint`) với lớp điều khiển nổi (`HUD Overlay`) và xử lý mượt lỗi thiếu dữ liệu Street View. | **Áp dụng kiến trúc tách lớp HUD & cơ chế Fallback tức thì** sang Chế độ 2 nếu địa điểm vùng sâu (VD: đèo cao, đảo nhỏ) có vùng phủ Street View hạn chế. |

### 2.2. Nhóm Thư Viện 360° Equirectangular / WebGL Panorama Mã Nguồn Mở

| Thư viện | Engine | Dung lượng (gzip) | Ưu điểm nổi bật | Hạn chế & Ghi chú tích hợp |
| :--- | :--- | :--- | :--- | :--- |
| **Pannellum** | Custom WebGL + CSS3 | ~21 KB | Siêu nhẹ, không phụ thuộc thư viện ngoài, hỗ trợ tốt `yaw/pitch/hfov`, hotspot 3D và đa độ phân giải. | Giao diện mặc định hơi cứng, cần viết CSS đè nếu muốn HUD kiểu GeoGuessr. |
| **Photo Sphere Viewer (PSV)** | Three.js (WebGL) | Trung bình – Nặng | Hệ sinh thái plugin cực mạnh (Markers, Compass, Virtual Tour Arrows, Gyroscope). | Phụ thuộc Three.js làm tăng bundle size cho trang Next.js nếu chỉ dùng cho 1 modal. |
| **MapillaryJS** | Custom Geospatial WebGL | Nặng | Chuyên trị chuỗi ảnh đường phố có GPS & chuyển cảnh mượt giữa các node đường đi. | Yêu cầu Access Token Mapillary và độ phủ ảnh đường phố tại Việt Nam kém hơn Google Street View. |
| **Zero-Dep 360° Cylindrical/Spherical Drag Viewer (Custom React/Pointer Events)** | CSS3 Perspective + Pointer Events / WebGL Canvas | **0 KB thêm mới** | Tải tức thì, không tăng bundle size, toàn quyền kiểm soát **GeoGuessr Linear Compass**, **Ground Navigation Chevrons**, **3D POI Hotspots theo góc `yaw`**, và tích hợp trực tiếp state `selectedHighlightIds` của VeXeViet. | Dùng ảnh toàn cảnh rộng / equirectangular (`panorama360Url`) làm nguồn hiển thị khi người dùng muốn xem toàn cảnh nghệ thuật hoặc làm phương án dự phòng không bao giờ chết (zero-failure fallback). |

---

## 3. Đặc Tả Kỹ Thuật 3 Chế Độ Trải Nghiệm Street View 360° (Hybrid Architecture)

Để đạt trải nghiệm giống **GeoGuessr / Google Street View** tốt nhất mà vẫn **miễn phí API, không lỗi trắng màn hình, và gắn kết chặt với luồng ghim điểm vui chơi của VeXeViet**, hệ thống `Destination3DCameraModal` cần triển khai kiến trúc **3 chế độ chuyển đổi liền mạch**:

### 3.1. Chế độ 1 (Mặc định): **Street View 360° Thực Tế** *(Kiểu OpenGuessr / WorldGuessr)*
- **Cơ chế URL Embed chuẩn không cần khóa trả phí:**
  ```ts
  // buildGoogleStreetViewEmbedUrl(vantage)
  https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,${heading},0,0,${pitch}&hl=vi&output=svembed
  ```
  - `layer=c`: Kích hoạt lớp Google Street View / Photo Sphere.
  - `cbll=${lat},${lng}`: Tọa độ đường phố / danh lam đã kiểm chứng có phủ sóng Street View tại Việt Nam (`streetViewLatLng`).
  - `cbp=11,${heading},0,0,${pitch}`: Góc hướng nhìn ban đầu (`heading`: 0°–360°) và độ ngẩng/cúi (`pitch`).
  - `hl=vi`: Ngôn ngữ hiển thị tiếng Việt.
  - `output=svembed`: Trả về trình phát tương tác 360° toàn khung (kéo xoay 360°, phóng to/thu nhỏ, bấm mũi tên đi bộ dọc đường phố).
  - *(Tùy chọn mở rộng)*: Nếu môi trường có `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, có thể ưu tiên endpoint Google Maps Embed API v1 (`https://www.google.com/maps/embed/v1/streetview?key=...&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}`).
- **Nút mở toàn màn hình ngoài (`buildGoogleStreetViewExternalUrl`):**
  ```ts
  https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=${heading}&pitch=${pitch}
  ```
- **Lưu ý quan trọng về UX dự phòng (Coverage Fallback):**
  - Một số địa điểm thiên nhiên hẻo lánh (đỉnh núi, vịnh đảo ngoài khơi) có thể tải chậm hoặc không có ảnh đường phố tại đúng điểm chấm. Do đó, cần có một **thanh gợi ý tinh tế (non-intrusive fallback pill)** ngay góc dưới trái: *"Nếu vùng này chưa có ảnh đường phố, chuyển sang **Toàn cảnh 360° Tương tác** chỉ với 1 chạm"*.

### 3.2. Chế độ 2: **Toàn Cảnh 360° Tương Tác** *(Kiểu GeoGuessr / Pannellum — Zero-Dependency)*
- **Cơ chế tương tác kéo-nhìn 360° thực thụ:**
  - Theo dõi trạng thái camera: `yaw` (`0°` đến `360°`, tự động wrap vòng tròn `((yaw % 360) + 360) % 360` để xoay liên tục không bị khựng biên), `pitch` (`-35°` đến `+35°`), và `fov` / `zoom` (`1.0x` đến `2.4x`).
  - Hỗ trợ cả **Pointer Drag** (chuột + cảm ứng mobile mượt với quán tính nhẹ), **cuộn chuột (Wheel Zoom)**, phím tắt mũi tên (`← → ↑ ↓`), và nút `+/-` Zoom.
- **Các thành phần GeoGuessr đặc trưng tích hợp trực tiếp trong khung nhìn:**
  1. **GeoGuessr Linear Top Compass Bar:**
     - Thanh thước la bàn ngang đặt ở đỉnh giữa màn hình (`top-3 left-1/2 -translate-x-1/2`), hiển thị vạch chia độ và các hướng chính: `N • NE • E • SE • S • SW • W • NW`.
     - Khi người dùng kéo sang trái/phải, dải vạch la bàn **trượt ngang đồng bộ theo thời gian thực với góc `yaw`**, kèm kim chỉ thị màu cam thương hiệu (`--primary`) và số độ chính xác (VD: `142° SE`).
  2. **On-Ground 3D Navigation Chevrons (`↑ Đi tới điểm kế tiếp`):**
     - Mô phỏng mũi tên trắng trên mặt đường của Google Street View / GeoGuessr (đặt nghiêng phối cảnh 3D `rotateX(58deg)` ở phần dưới khung hình).
     - Khi bấm vào mũi tên, camera dịch chuyển mượt (zoom-pulse transition) sang góc ngắm (`Camera3DVantagePoint`) kế tiếp của danh lam đó (VD: từ *Nhà thờ Đá Sa Pa* → *Đỉnh Fansipan* → *Bản Cát Cát*).
  3. **Interactive 3D POI Hotspots gắn theo góc `yaw`:**
     - Mỗi hoạt động vui chơi giải trí (`highlights`) của điểm đến được phân bổ tại một góc phương vị (`anchorYaw`).
     - Khi người dùng xoay 360° nhìn về phía đó, thẻ ghim nổi (Hotspot Pill) xuất hiện đúng vị trí trong tầm mắt; bấm vào để xem nhanh khung giờ vàng, chi phí và **ghim trực tiếp vào Sổ Tay Hành Trình** (`onToggleHighlight`).

### 3.3. Chế độ 3: **Flycam 3D Vệ Tinh** *(MapLibre 3D Orbit)*
- Giữ nguyên toàn bộ sức mạnh bản đồ vệ tinh 3D `maplibre-gl` (Esri World Imagery + 3D terrain/pitch `62°–72°`, tự động xoay quỹ đạo 360°, thanh trượt Gimbal Pitch/Bearing) để độc giả có góc nhìn toàn cảnh từ trên cao bổ trợ cho góc nhìn mặt đất ở Chế độ 1 & 2.

---

## 4. Đặc Tả Hệ Thống Giao Diện GeoGuessr HUD (`@dev-ui`)

Để đảm bảo giao diện vừa mang bản sắc **GeoGuessr chuyên nghiệp**, vừa đồng bộ với hệ màu ấm (`--background`, `--primary: #f97316`, `--card`) của VeXeViet:

1. **Top Control Bar & Spot Switcher (Thanh chuyển điểm ngắm):**
   - Nằm ở mép trên: Bộ chuyển 3 chế độ (`Street View 360°` | `Toàn cảnh 360°` | `Flycam 3D`) + danh sách 2–3 điểm ngắm thực tế của địa danh (bấm để dịch chuyển tức thì).
2. **Collapsible Bottom-Right Mini-Map Radar (Bản đồ thu gọn kiểu GeoGuessr):**
   - **Trạng thái mặc định:** Ô nhỏ gọn ở góc dưới-phải (`w-[180px] h-[128px]`, độ mờ nhẹ `opacity-85`), hiển thị bản đồ `maplibre-gl` với các chấm cam đánh dấu các điểm Street View của danh lam.
   - **Trạng thái mở rộng (Hover / Click Pin):** Bung rộng mượt mà (`w-[320px] h-[220px] sm:w-[360px] sm:h-[250px]`, `transition-all duration-300`), cho phép người dùng bấm trực tiếp vào bất kỳ ghim nào trên bản đồ để **dịch chuyển camera Street View tới đúng vị trí đó** (kèm nút ghim cố định / thu gọn trên mobile).
3. **Bottom-Left GeoGuessr Action Cluster (Cụm phím chức năng chuẩn game):**
   - Nút **Quay về điểm xuất phát** (`RotateCcw` — Reset `heading/yaw`, `pitch`, `zoom` hoặc tải lại điểm gốc Street View).
   - Nút **Phóng to / Thu nhỏ** (`+` / `-`) cho chế độ 360° & Flycam.
   - Nút **Toàn màn hình** (`Maximize2` / `Minimize2`) và liên kết **Mở trên Google Street View** (`ExternalLink`).
4. **Cập nhật nhãn CTA trên toàn trang `/explore`:**
   - Đồng bộ nhãn nút kích hoạt tại `LeadStoryHero.tsx`, `EditorialArticleCard.tsx` và `DestinationArticleModal.tsx` thành **"Street View 360°"** / **"Cam 360°"** để người dùng nhận diện ngay đây là trải nghiệm nhìn xung quanh 360° giống Google Street View.

---

## 5. Checklist Kiểm Định Chất Lượng (UX & Technical Verification)

- [x] **Chi phí vận hành $0:** Chế độ 1 chạy trực tiếp qua Google Street View Interactive Embed (`output=svembed`) không cần key trả phí; Chế độ 2 chạy 100% client-side không thêm thư viện npm; Chế độ 3 dùng `maplibre-gl` sẵn có.
- [x] **Tọa độ thực tế tại Việt Nam:** Mọi danh lam Bắc – Trung – Nam đều có `streetViewLatLng` nằm trên trục đường/quảng trường có độ phủ Street View cao (như Bãi Cháy, Đèo Mã Pí Lèng, Nhà thờ Đá Sa Pa, Tràng An, Ngọ Môn Huế, Cầu Rồng Đà Nẵng, Chùa Cầu Hội An, Hồ Xuân Hương Đà Lạt, Quảng trường 2/4 Nha Trang, Đồi Cát Bay Mũi Né, Sunset Town Phú Quốc, Bến Ninh Kiều Cần Thơ).
- [x] **Khả năng tương tác đa thiết bị:** Hỗ trợ kéo chuột (Desktop), vuốt chạm (Mobile Touch), phím mũi tên và nút điều khiển rõ ràng, đảm bảo `aria-label` và khả năng đóng modal bằng `Esc`.
