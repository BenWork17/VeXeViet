# Nghiên Cứu & Đề Xuất Hệ Sinh Thái Tính Năng AI Cho Trang Báo Chí Du Lịch "Khám Phá Việt Nam" (`/explore`) — VeXeViet

> **Tài liệu nghiên cứu chuyên sâu của Team Nghiên Cứu (`research-ai`)**
> **Phạm vi**: Đánh giá hiện trạng AI trong codebase VeXeViet, benchmark 8 nền tảng khám phá du lịch AI hàng đầu thế giới, thiết kế ma trận 8+ tính năng AI đột phá cho chuyên trang báo chí **Khám Phá Việt Nam (`/explore`)**, và đặc tả kỹ thuật chi tiết cho 2 tính năng AI tương tác trực tiếp để Team Dev (`@dev-data`, `@dev-ui`, `@dev-page`) triển khai ngay.

---

## 1. Đánh Giá Hiện Trạng Năng Lực AI & Du Lịch Trên VeXeViet (Codebase Audit)

Qua khảo sát trực tiếp mã nguồn tại `apps/web/src/app/api/analyze-trip/route.ts`, `apps/web/src/components/features/travel-assistant/TripPlanner.tsx` và `apps/web/src/app/travel/page.tsx`, hệ thống VeXeViet hiện đã có nền tảng kỹ thuật rất tốt:

1. **LLM API Endpoint (`/api/analyze-trip/route.ts`)**:
   - Đã tích hợp **Google Gemini 2.5 Flash** (`gemini-2.5-flash:generateContent`) với cấu hình `responseMimeType: 'application/json'`.
   - Cho phép nhận prompt tiếng Việt tự nhiên và trả về cấu trúc JSON định sẵn (lộ trình theo ngày, phân tích chi phí từng điểm dừng, gợi ý phương tiện di chuyển).
2. **Bản Đồ Lập Lịch Trình Nội Đô (`TripPlanner.tsx` tại `/travel`)**:
   - Đã có dữ liệu `CITY_GUIDES` cho 8 thành phố lớn (Đà Nẵng, Quảng Bình, Huế, Hội An, Hà Nội, TP.HCM, Nha Trang, Đà Lạt), tích hợp bản đồ MapLibre, định tuyến đường bộ OSRM, geocoding Nominatim, và mô phỏng chuyển động trên tuyến (`SimulatedDayRoute`).
   - Hỗ trợ phân bổ điểm đến theo số ngày (`distributePlacesAcrossDays`), chọn hoạt động tại từng điểm (`selectedActivitiesByPlace`), và tính toán chi phí nội đô (`TRANSPORT_RATES`).
3. **Khoảng Trống Trải Nghiệm Cần Lấp Đầy Với Trang `/explore`**:
   - Trang `/travel` hiện tại đóng vai trò **công cụ lập lộ trình chiến thuật sau khi người dùng đã chọn xong tỉnh/thành phố**.
   - Người dùng còn thiếu một **Tầng Truyền Cảm Hứng & Khám Phá Báo Chí Thông Minh (`/explore` - "Khám Phá Việt Nam")**: nơi họ đọc những bài viết chuyên sâu kiểu tạp chí/báo chí về danh lam thắng cảnh & điểm vui chơi giải trí Bắc - Trung - Nam, được **AI cá nhân hóa ấn phẩm theo tâm trạng (Vibe)**, **ghim các điểm vui chơi yêu thích khi đang đọc báo**, và để **AI tự động tổng hợp thành lịch trình đa điểm + dự toán ngân sách + nối thẳng sang đặt vé xe khách (`/search`) hoặc bản đồ lộ trình (`/travel`)**.

---

## 2. Benchmark 8 Nền Tảng Khám Phá Du Lịch AI Hàng Đầu Thế Giới

| Nền tảng | Mô hình UX / AI cốt lõi | Điểm sáng học hỏi cho VeXeViet `/explore` |
| :--- | :--- | :--- |
| **1. Mindtrip.ai** | **Editorial-to-Itinerary AI**: Kết hợp bài viết tạp chí du lịch với trợ lý AI; mọi địa danh trong bài báo đều là thẻ tương tác có thể "Ghim" vào giỏ hành trình. | Cơ chế **Trip Clipping Bar ("Sổ Tay Hành Trình")** nổi ở góc màn hình khi đọc báo, biến các bài báo rời rạc thành một kế hoạch chuyến đi liền mạch. |
| **2. Layla (Roam Around)** | **Vibe & Persona Discovery**: Khám phá điểm đến bằng cảm xúc/tâm trạng ("Chữa lành", "Săn mây", "Ẩm thực đêm", "Phượt bụi") thay vì phải nhập tên thành phố cứng nhắc. | Thanh **AI Vibe & Persona Matcher** ngay đầu trang báo với các Quick Vibe Chips một chạm và ô nhập ngôn ngữ tự nhiên. |
| **3. Airbnb AI & Magazine** | **Experiential Checklists**: Trong mỗi bài viết điểm đến đều có danh sách hoạt động vui chơi cụ thể kèm thời lượng, khung giờ vàng (`Golden Hour`) và mẹo bản địa. | Mỗi bài báo trên `/explore` không chỉ có văn chương mà có **Checklist Điểm Vui Chơi & Trải Nghiệm (`highlights`)** để độc giả tích chọn trực tiếp. |
| **4. Wonderplan.ai** | **Budget-Aware Synthesizer**: Tự động bóc tách chi phí (vé xe di chuyển + chi phí lưu trú/ăn uống mỗi ngày + vé vui chơi) theo từng phân khúc ngân sách. | Bộ máy **AI Budget & Itinerary Synthesizer** cộng gộp giá vé xe khách VeXeViet (`busPriceFrom`) + ngân sách ngày (`estimatedBudgetPerDay`) + hoạt động vui chơi. |
| **5. Wanderlog AI** | **Multi-Stop Geographic Clustering**: Tự động sắp xếp thứ tự các điểm đã ghim theo vùng địa lý (Bắc -> Trung -> Nam) và tối ưu hóa thời gian di chuyển giữa các chặng. | Khi người dùng ghim nhiều danh lam thắng cảnh, AI tự động gợi ý thứ tự tuyến xe liên tỉnh hợp lý và ước tính tổng thời gian ngồi xe khách. |
| **6. GuideGeek** | **Hyper-Local Insider AI**: Cung cấp nhận xét thông minh (`aiInsight`) về mẹo tránh bẫy du lịch, món ăn vặt chuẩn vị bản địa và thời điểm đẹp nhất trong ngày. | Khối **"Góc Nhìn AI Bản Địa (`aiInsight`)"** đóng khung kiểu trích dẫn biên tập viên AI trong từng thẻ bài báo và modal đọc chi tiết. |
| **7. Google Travel AI** | **Cross-Modal Transit & Seasonality**: Kết hợp dữ liệu mùa đẹp nhất trong năm (`bestMonths`) với thời gian di chuyển thực tế bằng đường bộ. | Hiển thị trực quan **Mùa đẹp nhất (`bestMonths`)** kèm thông tin tuyến xe khách gợi ý (`suggestedOrigin`, `busDurationHours`, `busPriceFrom`). |
| **8. Kayak AI Predictor** | **Crowd & Seasonal Pulse**: Dự báo mức độ đông đúc (`Thấp` / `Vừa phải` / `Sôi động`) và chỉ số thời tiết/mùa vụ để người đọc chọn thời điểm khởi hành tối ưu. | Huy hiệu **AI Crowd & Seasonal Pulse** trên từng bài báo giúp du khách biết điểm đến đang yên bình hay sôi động. |

---

## 3. Ma Trận 8+ Tính Năng AI Đột Phá Cho Trang Báo Chí `/explore`

Chúng tôi phân loại hệ sinh thái AI của trang **Khám Phá Việt Nam (`/explore`)** thành **2 nhóm**:
- **Nhóm A (Immediate Interactive AI Features)**: 2 tính năng AI cốt lõi cộng thêm hệ thống huy hiệu thông minh được Team Dev xây dựng chạy trực tiếp, tương tác thời gian thực ngay trên `/explore`.
- **Nhóm B (Next-Gen AI Features — Showcase & Strategic Roadmap)**: 6 tính năng AI thế hệ tiếp theo được giới thiệu trực quan trong **AI Feature Showcase Drawer/Cards** trên trang và định hình lộ trình mở rộng kết nối sâu với hệ thống vé xe VeXeViet.

### Tổng Quan Ma Trận Tính Năng (Feature Matrix)

| Mã | Tên Tính Năng AI | Nhóm | Giá Trị Cho Độc Giả & Hành Khách VeXeViet | Tác Động Chuyển Đổi (Conversion) |
| :--- | :--- | :--- | :--- | :--- |
| **AI-01** | **AI Vibe & Persona Matcher** (*"Báo Chí Cá Nhân Hóa"*) | **Nhóm A (Build Now)** | Chọn tâm trạng/vibe, vùng miền, mức ngân sách hoặc nhập câu hỏi tự nhiên -> AI biên tập lại trang nhất tờ báo & chấm điểm độ hợp (`Match Score`). | Giảm 70% thời gian phân vân "Đi đâu cuối tuần này?", dẫn thẳng tới danh lam phù hợp. |
| **AI-02** | **AI Article-to-Trip Concierge** (*"Đọc Báo -> Chốt Lịch Trình & Vé Xe"*) | **Nhóm A (Build Now)** | Ghim danh lam & tích chọn hoạt động vui chơi khi đọc báo -> AI tự động lập lịch trình từng ngày, tính tổng chi phí và tạo nút đặt vé xe `/search` & mở bản đồ `/travel`. | Biến độc giả đọc báo thành khách đặt vé xe khách ngay trong 1 luồng trải nghiệm. |
| **AI-03** | **AI Seasonal, Weather & Crowd Pulse** (*"Nhịp Đập Mùa Vụ & Độ Đông"*) | **Nhóm A + B (Built-in Metadata & Live Pulse)** | Dự báo độ đông đúc (`Thấp` / `Vừa phải` / `Sôi động`), tháng đẹp nhất (`bestMonths`), mùa săn mây/mùa lúa chín/mùa biển lặng. | Thúc đẩy quyết định đặt vé sớm vào khung thời gian vàng. |
| **AI-04** | **AI Golden Hour & Sleeper-Bus Sync** (*"Đồng Bộ Giờ Xe Chạy & Khung Giờ Vàng"*) | **Nhóm A + B (Built-in Highlight Metadata)** | Khớp khung giờ vàng chụp ảnh/vui chơi (`goldenHour`) với chuyến xe giường nằm đêm để sáng sớm tới nơi là đón bình minh/săn mây ngay. | Tăng tỷ lệ đặt các tuyến xe đêm (Sleeper/Limousine) của VeXeViet. |
| **AI-05** | **AI Audio Magazine & On-Bus Narrator** (*"Tạp Chí Âm Thanh & Thuyết Minh Trên Xe"*) | **Nhóm B (Showcase & Roadmap)** | Chuyển bài báo thành bản tin âm thanh podcast / thuyết minh lịch sử danh lam để hành khách đeo tai nghe thưởng thức khi đang nằm trên xe khách VeXeViet. | Gia tăng giá trị trải nghiệm trong suốt hành trình di chuyển trên xe. |
| **AI-06** | **AI Visual Spot Finder** (*"Chụp Ảnh Nhận Diện Danh Lam — Snap & Ride"*) | **Nhóm B (Showcase & Roadmap)** | Tải lên 1 bức ảnh phong cảnh đẹp thấy trên mạng -> Gemini Vision nhận diện chính xác địa danh tại Việt Nam và gợi ý ngay tuyến xe khách VeXeViet đến đó. | Thu hút tệp khách trẻ Gen Z tìm kiếm điểm đến qua hình ảnh/TikTok/Instagram. |
| **AI-07** | **AI Smart Bus + Entertainment Combo Bundler** (*"Gói Combo Vé Xe + Vui Chơi Tối Ưu"*) | **Nhóm B (Showcase & Roadmap)** | Tự động đóng gói vé xe khách khứ hồi + vé cáp treo/tour đảo/ẩm thực địa phương sao cho không vượt quá trần ngân sách người dùng đặt ra. | Tăng giá trị đơn hàng trung bình (AOV) và khả năng bán chéo dịch vụ giải trí. |
| **AI-08** | **AI Companion & Micro-Budget Optimizer** (*"Tối Ưu Theo Nhóm Bạn / Gia Đình / Cặp Đôi"*) | **Nhóm B (Showcase & Deep Link `/api/analyze-trip`)** | Tự động điều chỉnh nhịp độ lịch trình (chill nghỉ dưỡng cho gia đình vs. trekking khám phá cho nhóm bạn) và chia sẻ chi phí phương tiện nội đô. | Cá nhân hóa sâu, kết nối mượt với engine Gemini 2.5 Flash tại `/api/analyze-trip`. |

---

## 4. Đặc Tả Kỹ Thuật Chi Tiết Cho 2 Tính Năng AI Tương Tác Trực Tiếp (Nhóm A — Build Now)

Phần này quy định rõ kiến trúc dữ liệu, thuật toán chấm điểm và giao diện tương tác để `@dev-data`, `@dev-ui`, và `@dev-page` phối hợp ăn khớp 100%.

### 4.1. Tính Năng 1: AI Vibe & Persona Matcher ("Báo Chí Cá Nhân Hóa — AI Editorial Curator")

#### A. Trải Nghiệm Người Dùng (UX Flow)
1. Ngay dưới Masthead của tờ báo `/explore`, người đọc thấy khu vực **Trợ Lý Biên Tập AI (`AiExploreConcierge.tsx`)** mang phong cách chuyên mục đặc biệt của tòa soạn (*"AI Travel Desk • Biên Tập Ấn Phẩm Theo Tâm Trạng Của Bạn"*).
2. Người dùng có thể tương tác theo 2 cách kết hợp:
   - **Chọn nhanh Quick Vibe Presets / Mood Chips**:
     - ☁️ *"Chữa lành & Săn mây"* (`['healing', 'nature', 'photography']`)
     - 🏮 *"Di sản & Ẩm thực cổ kính"* (`['culture', 'food', 'photography']`)
     - 🌊 *"Vui chơi biển đảo sôi động"* (`['beach', 'nightlife', 'family', 'adventure']`)
     - 🎒 *"Phượt bụi ngân sách tiết kiệm"* (`['adventure', 'budget', 'nature']`)
   - **Nhập câu hỏi/mong muốn tự nhiên (Natural Language Prompt)**: Ví dụ *"Mình muốn đi trốn phố thị 3 ngày 2 đêm ở nơi có sương mù, cà phê đẹp, chi phí dưới 1 triệu/ngày"* kết hợp bộ lọc Vùng miền (`Miền Bắc` | `Miền Trung` | `Miền Nam`) và Ngân sách (`Tiết kiệm` | `Cân bằng` | `Nghỉ dưỡng`).
3. **Phản hồi tức thì từ AI**:
   - AI trả về **Lời Dẫn Biên Tập Cá Nhân Hóa (`editorialSummary`)** giải thích vì sao các điểm đến này được chọn riêng cho tâm trạng hiện tại của độc giả.
   - Danh sách các bài báo điểm đến được chấm điểm phù hợp (`matchScore` từ 75% - 99%) kèm theo **Lý do AI gợi ý (`matchReasons`)** hiển thị ngay trên thẻ bài báo.

#### B. Đặc Tả Hàm Dữ Liệu Cho `@dev-data` (`src/lib/data/explore-destinations.ts`)
- Mỗi đối tượng `ExploreDestination` cần có đầy đủ các trường phục vụ AI:
  - `vibes`: mảng tag chuẩn hóa (`'healing' | 'nature' | 'photography' | 'adventure' | 'culture' | 'nightlife' | 'family' | 'budget' | 'beach' | 'food'`)
  - `bestMonths`: chuỗi/mảng tháng lý tưởng (VD: `'Tháng 9 – Tháng 11'`)
  - `crowdLevel`: `'Thấp' | 'Vừa phải' | 'Sôi động'`
  - `estimatedBudgetPerDay`: số tiền VNĐ ước tính mỗi ngày (VD: `850000`)
  - `suggestedOrigin`: tỉnh/thành xuất phát phổ biến khớp chuẩn `provinces.ts` (VD: `'Hà Nội'`, `'TP. Hồ Chí Minh'`, `'Đà Nẵng'`)
  - `busDurationHours`: thời gian di chuyển bằng xe khách (VD: `5.5`)
  - `busPriceFrom`: giá vé xe khách tham khảo từ (VD: `250000`)
  - `aiInsight`: nhận xét chiến lược của AI về điểm đến (khung giờ vàng, mẹo săn mây/tránh đông, gợi ý chuyến xe đêm).
- Hàm `matchDestinationsByAiPromptOrVibe(query, selectedVibes, region?, budgetLevel?)`:
  - Phân tích từ khóa tiếng Việt trong `query` (ví dụ: *"biển"*, *"mây"*, *"cổ kính"*, *"ẩm thực"*, *"rẻ"*, *"gia đình"*, *"miền bắc"*, tên tỉnh/thành, tên hoạt động vui chơi) kết hợp với `selectedVibes`, `region` và `budgetLevel`.
  - Tính điểm trọng số cho từng `ExploreDestination` dựa trên: độ khớp `vibes` (+25đ/vibe), độ khớp từ khóa trong `title`, `subtitle`, `province`, `highlights` (+20đ), độ khớp `region` (+15đ) và `estimatedBudgetPerDay` (+15đ).
  - Trả về danh sách điểm đến đã sắp xếp kèm `editorialSummary` (lời bình kiểu biên tập viên AI) và lý do khớp cho từng điểm đến.

---

### 4.2. Tính Năng 2: AI Article-to-Trip Concierge ("Đọc Báo -> Chốt Lịch Trình Vui Chơi & Vé Xe")

#### A. Trải Nghiệm Người Dùng (UX Flow)
1. **Khi đang lướt trang báo hoặc đọc bài viết chi tiết (`EditorialArticleCard.tsx` & `DestinationArticleModal.tsx`)**:
   - Độc giả thấy danh sách **"Top Điểm Vui Chơi & Trải Nghiệm Đặc Sắc" (`highlights`)** bên trong mỗi danh lam thắng cảnh (kèm thời lượng `durationHours`, chi phí ước tính `estimatedCost`, và khung giờ đẹp nhất `goldenHour`).
   - Độc giả có thể bấm **"Ghim vào hành trình"** cho cả địa danh hoặc tích chọn từng hoạt động vui chơi giải trí cụ thể mà họ thích.
2. **Thanh/Ngăn Kéo Sổ Tay Hành Trình (`TripClippingBar.tsx`)**:
   - Luôn hiển thị nổi (floating bar/drawer) dưới dạng **"Sổ Tay Hành Trình Đã Ghim (My Bucket List)"** với số lượng điểm đến & hoạt động đã chọn.
   - Khi mở chế độ **"AI Tự Động Lập Lịch Trình Vui Chơi"**, AI tức tốc tổng hợp các điểm đã ghim thành:
     - **Lịch trình theo ngày (`Day 1`, `Day 2`, `Day 3`...)**: Phân bổ các hoạt động vui chơi theo trình tự thời gian hợp lý trong ngày (Sáng / Chiều / Tối dựa theo `goldenHour`) và gợi ý chặng xe khách nối tiếp giữa các tỉnh/thành.
     - **Bảng Dự Toán Ngân Sách Thông Minh**:
       - Chi phí vé xe khách VeXeViet ước tính (`busPriceFrom` của các chặng).
       - Chi phí vui chơi & vé tham quan (tổng `estimatedCost` của các `highlights` được chọn).
       - Chi phí ăn uống & lưu trú ước tính (`estimatedBudgetPerDay` × số ngày).
     - **Cầu Nối Chuyển Đổi Trực Tiếp (1-Click Conversion CTAs)**:
       - Nút **"Tìm Vé Xe Khách Đến Điểm Này"** -> điều hướng thẳng tới `/search?origin=<suggestedOrigin>&destination=<province>` để đặt vé ngay.
       - Nút **"Mở Trên Bản Đồ Lịch Trình AI"** -> điều hướng thẳng tới `/travel?origin=<suggestedOrigin>&destination=<province>` để xem bản đồ lộ trình chi tiết.

#### B. Đặc Tả Hàm Dữ Liệu Cho `@dev-data` (`src/lib/data/explore-destinations.ts`)
- Hàm `generateAiTripPlanFromSelection(selectedIds: string[], selectedHighlightIds?: string[])`:
  - Nhận danh sách ID các điểm đến đã ghim (và tùy chọn các hoạt động vui chơi con đã tích).
  - Sắp xếp trình tự hành trình hợp lý (ưu tiên gom theo vùng miền Bắc -> Trung -> Nam hoặc theo vĩ độ giảm dần để tạo tuyến xuyên Việt/liên tỉnh mạch lạc).
  - Tạo mảng lịch trình theo ngày (`days`), mỗi ngày gắn với tỉnh/thành, tiêu đề ngày kiểu báo chí, danh sách hoạt động vui chơi theo khung giờ vàng, mẹo di chuyển bằng xe khách của AI, cùng tổng chi phí ước tính (`totalEstimatedCost`, `totalBusCost`, `totalActivityCost`) và đường dẫn `searchUrl` / `travelUrl` chuẩn xác.

---

## 5. Đặc Tả Chi Tiết 6 Tính Năng AI Thế Hệ Mới (Nhóm B — Showcase & Roadmap)

Để người dùng trên `/explore` cảm nhận rõ tầm nhìn công nghệ của VeXeViet, `@dev-ui` sẽ hiển thị một khu vực/tab **"Khám Phá Hệ Sinh Thái AI Du Lịch VeXeViet"** trong `AiExploreConcierge.tsx` giới thiệu trực quan các tính năng này kèm bản xem trước (interactive preview badges):

1. **AI Audio Magazine & On-Bus Tour Narrator ("Tạp Chí Âm Thanh Trên Chuyến Xe")**:
   - **Ý tưởng**: Khi hành khách đọc một bài báo trên `/explore` hoặc đang ngồi trên xe giường nằm VeXeViet tiến vào địa phận Hà Giang, Đà Lạt hay Huế, AI chuyển đổi bài viết báo chí (`storyParagraphs` + `pullQuote`) thành giọng đọc truyền cảm 90 giây kết hợp nhạc nền bản địa nhẹ nhàng.
   - **Hiển thị ngay trên `/explore`**: Trong `DestinationArticleModal.tsx` hoặc `AiExploreConcierge.tsx`, cung cấp bản tóm tắt nhanh kiểu *"AI Audio Brief (60s)"* tóm gọn tinh hoa của điểm đến cho người bận rộn.
2. **AI Visual Spot Finder ("Nhận Diện Danh Lam Qua Ảnh — Snap & Ride")**:
   - **Ý tưởng**: Người dùng tải lên bức ảnh một khúc cua đèo hùng vĩ, một con hẻm đèn lồng hay một bãi biển hoang sơ. Mô hình Gemini 2.5 Flash Multimodal phân tích đặc trưng thị giác, xác định tọa độ danh lam tại Việt Nam, mở bài báo chuyên sâu tương ứng trên `/explore` và tra cứu ngay chuyến xe khách gần nhất trên VeXeViet.
3. **AI Seasonal, Weather & Crowd Pulse ("Dự Báo Mùa Vụ & Độ Đông Đúc Thời Gian Thực")**:
   - **Ý tưởng**: Kết hợp dữ liệu lịch sử đặt vé xe khách trên VeXeViet với lịch mùa vụ du lịch Việt Nam (mùa lúa chín Tây Bắc tháng 9-10, mùa săn mây Đà Lạt/Sa Pa tháng 11-2, mùa biển êm Phú Quốc/Nha Trang tháng 3-8) để cảnh báo sớm độ đông đúc (`crowdLevel`) và gợi ý đi lệch giờ cao điểm.
4. **AI Smart Bus + Entertainment Combo Bundler ("Tối Ưu Hóa Ngân Sách Vé Xe + Vé Vui Chơi")**:
   - **Ý tưởng**: Người dùng nhập ngân sách tổng (VD: *"2.000.000đ cho cuối tuần"*). AI tự động đề xuất đi **xe giường nằm chuyến 22:30 tối thứ Sáu** của VeXeViet để tiết kiệm 1 đêm khách sạn, dành ngân sách dư ra cho vé cáp treo, tour chèo thuyền kayak hoặc thưởng thức ẩm thực đêm.
5. **AI Golden Hour & Photo Essay Director ("Đạo Diễn Khung Giờ Vàng")**:
   - **Ý tưởng**: Mỗi điểm vui chơi (`highlights`) trong bài báo đều được AI gắn nhãn `goldenHour` (ví dụ `05:30 - 07:00` để săn mây Đồi Chè Cầu Đất, hoặc `16:30 - 18:00` để ngắm hoàng hôn Hòn Thơm / Phố cổ Hội An), giúp du khách chọn đúng giờ khởi hành chuyến xe để không lỡ khoảnh khắc đẹp nhất.
6. **AI Multi-Destination Loop & Companion Optimizer ("Tối Ưu Cung Đường Liên Tỉnh")**:
   - **Ý tưởng**: Khi độc giả ghim nhiều điểm đến cùng miền (ví dụ: *Huế -> Đà Nẵng -> Hội An* hoặc *Hà Nội -> Ninh Bình -> Hạ Long*), AI tự động nhận diện đây là một **Cung Đường Liên Tỉnh (Regional Loop)**, tính toán chặng xe khách nối tuyến tối ưu và kết nối trực tiếp với API `/api/analyze-trip` để phân tích sâu từng điểm dừng.

---

## 6. Hướng Dẫn Phối Hợp Triển Khai Cho Team Dev (`@dev-data`, `@dev-ui`, `@dev-page`)

1. **Với `@dev-data` (`src/lib/data/explore-destinations.ts`)**:
   - Đảm bảo 12 điểm đến trải đều 3 miền Bắc - Trung - Nam có đầy đủ metadata AI: `vibes`, `bestMonths`, `crowdLevel`, `estimatedBudgetPerDay`, `suggestedOrigin`, `busDurationHours`, `busPriceFrom`, `coordinates`, `aiInsight`, và danh sách `highlights` (mỗi highlight có `id`, `title`, `description`, `durationHours`, `estimatedCost`, `goldenHour`, `category`).
   - Tên `province` và `suggestedOrigin` phải khớp chính xác 100% với danh mục trong `src/lib/data/provinces.ts` (`Hà Nội`, `Quảng Ninh`, `Lào Cai`, `Hà Giang`, `Ninh Bình`, `Huế`, `Đà Nẵng`, `Quảng Nam`, `Lâm Đồng`, `Khánh Hòa`, `Kiên Giang`, `Cần Thơ`, `TP. Hồ Chí Minh`, `Bình Thuận`...) để khi chuyển hướng sang `/search` và `/travel` hoạt động trơn tru.
   - Export hai hàm AI core: `matchDestinationsByAiPromptOrVibe` và `generateAiTripPlanFromSelection`.
2. **Với `@dev-ui` (`src/components/features/explore/*`)**:
   - Trong `AiExploreConcierge.tsx`: Xây dựng giao diện **AI Vibe & Persona Matcher** với các Quick Vibe Chips, ô nhập prompt tiếng Việt tự nhiên, bộ lọc nhanh, hiển thị lời bình biên tập của AI (`editorialSummary`) cùng các thẻ **AI Feature Showcase** giới thiệu Seasonal Pulse, Audio Summary, Visual Spot Finder & Smart Bus Bundler.
   - Trong `EditorialArticleCard.tsx` và `DestinationArticleModal.tsx`: Hiển thị huy hiệu `aiInsight`, `crowdLevel`, `bestMonths`, danh sách checklist hoạt động vui chơi `highlights` có kèm `goldenHour` và chi phí, cùng nút ghim vào hành trình và CTA đặt vé xe khách.
   - Trong `TripClippingBar.tsx`: Xây dựng khay **"Sổ Tay Hành Trình"** kèm chế độ **"AI Tự Động Lập Lịch Trình Vui Chơi"** gọi hàm `generateAiTripPlanFromSelection`, hiển thị kế hoạch từng ngày, tổng ngân sách (vé xe + vui chơi + sinh hoạt) và các nút liên kết trực tiếp tới `/search` & `/travel`.
3. **Với `@dev-page` (`src/app/explore/page.tsx`)**:
   - Kết nối trạng thái giữa bộ lọc vùng miền/chuyên mục trên `EditorialMasthead`, kết quả gợi ý cá nhân hóa từ `AiExploreConcierge`, danh sách bài báo, modal đọc báo chi tiết và giỏ hành trình AI trong `TripClippingBar`.
