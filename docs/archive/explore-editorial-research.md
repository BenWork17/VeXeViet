# Nghiên Cứu & Thiết Kế Hệ Thống Báo Chí / Tạp Chí Du Lịch "Khám Phá Việt Nam" (`/explore`) — VeXeViet

**Tài liệu kiến trúc UX/UI & Editorial Design System**  
**Đơn vị thực hiện:** `research-editorial` (TEAM NGHIÊN CỨU)  
**Phạm vi áp dụng:** `apps/web/src/app/explore/*`, `apps/web/src/components/features/explore/*`

---

## 1. Phân Tích Hệ Thống Thiết Kế Hiện Tại Của VeXeViet (Design Token Audit)

Qua khảo sát `apps/web/src/app/globals.css`, `apps/web/src/app/page.tsx` và `apps/web/src/app/travel/page.tsx`, hệ thống thiết kế của VeXeViet đã sở hữu nền tảng **Warm Editorial Canvas** rất thuận lợi để nâng cấp lên giao diện báo chí / tạp chí du lịch cao cấp:

### 1.1. Bảng màu (Color Palette & Dark Mode Parity)
- **Nền giấy báo ấm (Warm Newsprint Canvas):**
  - Light mode: `--background: #faf9f7` (giấy kem ấm tự nhiên), `--surface-soft: #f5f3f0` (nền phụ phân tách chuyên mục), `--card: #ffffff` (thẻ bài báo nổi bật).
  - Dark mode: `--background: #141210` (mực đêm ấm), `--card: #1f1b18`, `--muted: #29231f`.
- **Mực in & Độ tương phản chữ (Editorial Ink Hierarchy):**
  - Tiêu đề chính: `--ink-deep: #0f172a` (Light) / `#fffaf5` (Dark).
  - Đoạn văn bài báo: `--charcoal: #334155` / `--foreground: #1e293b`.
  - Chú thích ảnh, byline, dateline: `--muted-foreground: #64748b` (Light) / `#d6ccc2` (Dark).
- **Đường kẻ chia cột báo (Newspaper Hairlines & Rules):**
  - Đường kẻ đơn chuẩn: `--border: #e2e0dc` (`border-border`).
  - Đường kẻ đậm phân chia chuyên mục / masthead: `--border-strong: #cbc6be` (`border-border-strong`).
- **Điểm nhấn thương hiệu (Editorial Accent & Stamp):**
  - `--primary: #f97316` (Cam VeXeViet), `--primary-deep: #ea580c`, `--accent: #fff7ed`, `--accent-foreground: #c2410c`.

### 1.2. Hệ thống Typography sẵn có trong `@theme`
- `--font-display: "Alike", "Lora", ui-serif, Georgia, serif` -> Đã được gán mặc định cho toàn bộ `h1..h6` với `letter-spacing: -0.02em`. Đây là lợi thế lớn để tạo phong cách **Editorial Broadsheet / Magazine Headline** giống *Kinfolk*, *Condé Nast Traveler* và *The New York Times Travel*.
- `--font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif` -> Phù hợp cho văn bản thân bài, checklist điểm vui chơi giải trí, nút bấm tương tác và thanh filter.
- `--font-mono: "Source Code Pro", ui-monospace, monospace` -> Phù hợp cho **Metadata báo chí**: Số ấn phẩm (`VOL. 04 • ISSUE 11`), tọa độ GPS (`22.3364° N, 103.8438° E`), thời lượng đọc (`06 PHÚT ĐỌC`), giá vé tham khảo (`TỪ 250.000Đ`).

### 1.3. Khung Layout & Liên kết luồng sản phẩm
- Khung rộng chuẩn widescreen: `mx-auto w-full max-w-[1520px] px-5 sm:px-8 lg:px-10 xl:px-12` (đồng bộ với `page.tsx`).
- Liên kết luồng đặt vé (`/search?origin=...&destination=...&departureDate=...&passengers=1`) và luồng bản đồ lịch trình (`/travel?origin=...&destination=...`).

---

## 2. Benchmark 7 Tạp Chí & Nền Tảng Khám Phá Du Lịch Hàng Đầu Thế Giới

| Nền tảng / Tạp chí | Điểm mạnh cốt lõi (Core Editorial DNA) | UX/UI Pattern trích xuất cho VeXeViet `/explore` |
| :--- | :--- | :--- |
| **1. Condé Nast Traveler** | Sự giao thoa giữa nhiếp ảnh toàn cảnh cảm xúc cao, tiêu đề Serif sắc sảo, và danh sách *"Where to Go / Things to Do"* có tính thực tiễn cao. | **Lead Cover Story Hero + Pull-Quote Block:** Ảnh đại diện tỷ lệ điện ảnh kèm badge chuyên mục, câu trích dẫn lớn in nghiêng (`pullQuote`) và danh sách "Điểm vui chơi không thể bỏ lỡ" ngay dưới bài dẫn. |
| **2. Kinfolk Magazine** | Khoảng trắng tinh tế (generous negative space), lưới cột bất đối xứng (asymmetric editorial grid), đường kẻ mảnh `1px` phân tách bài viết, nhịp đọc chậm rãi. | **Hairline Column Grid & Drop-Cap:** Dùng đường kẻ mảnh `border-border` và `border-double` giữa các cột bài viết; chữ cái đầu tiên phóng đại (**Drop-Cap** `first-letter:text-5xl first-letter:font-serif`) trong modal đọc bài chuyên sâu. |
| **3. Monocle Travel Guides** | Phong cách nhật báo quốc tế hiện đại: Masthead có số thứ tự ấn phẩm, bản tin thời tiết / mùa du lịch, danh mục địa điểm được đánh số thứ tự rõ ràng kèm chỉ dẫn di chuyển. | **Newspaper Masthead & Seasonal Ticker:** Thanh tiêu đề kiểu tờ nhật báo `"VEXÉVIET DISCOVERY • ẤN PHẨM ĐẶC BIỆT"`, thanh ticker báo mùa đẹp nhất (ví dụ: *Mùa săn mây Tây Bắc • Mùa biển lặng Nam Trung Bộ*) và thông số chuyến xe khách kết nối. |
| **4. National Geographic Travel** | Kể chuyện qua ảnh (Photo Essay), bản đồ tọa độ địa lý, hộp thông tin nhanh (*Field Notes / Fast Facts*) đặt cạnh bài viết dài. | **Field Notes Sidebar Card:** Trong mỗi bài viết danh lam thắng cảnh đều có hộp *"Sổ tay lữ hành"* gồm: Tọa độ, Thời điểm vàng trong ngày, Độ đông đúc, Ngân sách/ngày, Tuyến xe khách VeXeViet đề xuất. |
| **5. Airbnb Experiences / Magazine** | Chuyển hóa nội dung cảm hứng thành hành động đặt dịch vụ thông qua các thẻ hoạt động cụ thể (thời lượng, chi phí, khung giờ) có thể chọn trực tiếp. | **Interactive Entertainment Checklist:** Bên trong mỗi danh lam thắng cảnh Bắc - Trung - Nam, liệt kê 3–5 **hoạt động vui chơi giải trí cụ thể** để độc giả tích chọn (check/clip) thẳng vào hành trình cá nhân. |
| **6. Lonely Planet** | Phân cấp rõ ràng theo Vùng miền (*Miền Bắc / Miền Trung / Miền Nam*) và Chủ đề trải nghiệm (*Di sản, Thiên nhiên, Vui chơi giải trí, Ẩm thực đêm, Chữa lành*). | **Edition Filter Bar:** Bộ lọc kiểu mục lục báo chí (Section Index Tabs) kết hợp tìm kiếm từ khóa tức thì mà không làm mất bố cục trang báo. |
| **7. Japan Travel by NAVITIME** | Kết nối trực tiếp bài báo giới thiệu điểm đến với lộ trình phương tiện công cộng / xe đường dài (thời gian di chuyển, giá vé khởi điểm, nút tra cứu chuyến). | **Transit-to-Story Bridge ("Đọc Báo -> Chốt Vé"):** Mỗi thẻ bài báo và khay "Sổ tay hành trình" đều hiển thị rõ *Tuyến xe gợi ý (VD: Hà Nội → Hà Giang • 6.5 giờ • Từ 280.000đ)* kèm CTA nhảy thẳng sang `/search` hoặc `/travel`. |

---

## 3. Đặc Tả Kiến Trúc & Giao Diện Báo Chí cho `/explore` (Visual & Component Specs)

### 3.1. Newspaper Masthead & Issue Header (`EditorialMasthead.tsx`)
Thiết kế phần đầu trang như trang nhất của một tờ nhật báo / tạp chí du lịch cuối tuần:
1. **Top Edition Metadata Bar:**
   - Đường viền kép phía trên và đường kẻ mảnh phía dưới (`border-y-2 border-double border-border-strong`).
   - Trái: ` ẤN PHẨM KHÁM PHÁ VIỆT NAM • SỐ ĐẶC BIỆT BẮC - TRUNG - NAM` (font mono/sans uppercase, tracking rộng `tracking-[0.18em]`, cỡ `text-xs`).
   - Giữa: Ticker nhịp đập mùa du lịch (Seasonal & Weather Pulse — ví dụ: *"Thời điểm vàng: Săn mây Tây Bắc & Biển đảo miền Trung"*).
   - Phải: Ngày phát hành động + tổng số danh lam thắng cảnh & điểm giải trí đang mở.
2. **Main Broadsheet Title:**
   - Tiêu đề tờ báo lớn: **"Khám Phá Việt Nam"** hoặc **"NHẬT BÁO LỮ HÀNH VEXÉVIET"** sử dụng font serif (`font-display`), cỡ chữ lớn `text-4xl sm:text-6xl lg:text-7xl`, căn giữa hoặc căn trái cân đối với phụ đề báo chí (*Sub-masthead*).
3. **Section Index & Filter Bar (Mục lục chuyên mục):**
   - Tabs Vùng miền: `Tất cả ấn phẩm` | `Miền Bắc` | `Miền Trung` | `Miền Nam`.
   - Pills Chuyên mục: `Di sản & Văn hóa`, `Thiên nhiên kỳ vĩ`, `Vui chơi & Giải trí`, `Ẩm thực & Đêm`, `Chữa lành & Nghỉ dưỡng`.
   - Ô tìm kiếm nhanh theo tên danh lam, tỉnh thành hoặc hoạt động vui chơi.

### 3.2. Trang Nhất — Cover Story / Lead Feature (`LeadStoryHero.tsx`)
- Bố cục **Asymmetric Magazine Spread** (Tỷ lệ `7 cột ảnh : 5 cột bài dẫn` trên màn hình `lg+`):
  - **Cột trái (Visual Lead):** Ảnh toàn cảnh chất lượng cao của điểm đến tiêu điểm (Lead Story), bo góc tinh tế (`rounded-2xl`), có lớp phủ gradient nhẹ ở đáy kèm chú thích ảnh kiểu báo chí (`figcaption` font mono/italic, tọa độ, tỉnh thành) và badge `"TRANG NHẤT • TIÊU ĐIỂM"`.
  - **Cột phải (Editorial Lead Copy):**
    - Metadata: Vùng miền • Tỉnh/Thành • Thời gian đọc (`05 phút đọc`) • Tác giả/Biên tập viên.
    - Headline lớn (`h2` serif `text-3xl sm:text-4xl lg:text-5xl leading-[1.08]`).
    - Standfirst / Sapo (`text-base sm:text-lg text-muted-foreground leading-relaxed`).
    - **Pull-Quote Box:** Khối trích dẫn có đường viền trái `border-l-4 border-primary bg-accent/60 pl-4 py-2 italic font-serif`.
    - **Preview Điểm Vui Chơi Giải Trí Nổi Bật:** Hiển thị nhanh 3 hoạt động tiêu biểu tại điểm đến kèm thời lượng & chi phí.
    - **Cặp nút CTA Báo Chí + Hành Trình:**
      1. `Đọc bài viết chuyên sâu` (Mở `DestinationArticleModal`).
      2. `Ghim vào hành trình` (Toggle thêm/bớt địa điểm vào `TripClippingBar` với phản hồi trạng thái rõ ràng: *"Đã ghim vào Sổ tay"*).

### 3.3. Lưới Bài Viết Đa Cột & Checklist Điểm Vui Chơi (`EditorialNewspaperGrid.tsx`)
- **Bố cục lưới báo chí (Multi-Column Broadsheet Grid):**
  - Trên Desktop (`lg:grid-cols-12`): Kết hợp thẻ bài **Feature (6 cột)** và các thẻ bài **Standard Column (4 cột)** được ngăn cách bởi đường kẻ mảnh hoặc khung viền sắc nét (`border-border bg-card`).
- **Cấu trúc mỗi Thẻ Bài Báo Điểm Đến:**
  1. **Header thẻ:** Chuyên mục + Vùng miền + Nút bookmark nhanh (`Ghim điểm đến`).
  2. **Ảnh & Badge Tuyến Xe:** Hiển thị ảnh danh lam thắng cảnh kèm nhãn thông tin di chuyển: `Từ [Tỉnh xuất phát gợi ý] • ~[X] giờ xe • Từ [Giá vé]đ`.
  3. **Tiêu đề & Sapo báo chí:** Tiêu đề Serif giàu hình ảnh + đoạn dẫn ngắn gọn + câu trích dẫn hoặc nhận định AI (`aiInsight`).
  4. **Interactive "Top Điểm Vui Chơi & Giải Trí" Checklist (Điểm khác biệt cốt lõi):**
     - Ngay trên thẻ bài báo (và trong modal đọc chi tiết), hiển thị danh sách các hoạt động vui chơi giải trí tại danh lam đó (ví dụ tại Hạ Long: *Chèo kayak hang Luồn*, *Ngắm hoàng hôn trên boong tàu*, *Khám phá chợ đêm Bãi Cháy*).
     - Người dùng có thể **tích chọn từng hoạt động vui chơi** mình thích hoặc bấm **"Ghim điểm đến"**. Khi tích chọn một hoạt động, địa điểm đó tự động được thêm vào Sổ tay hành trình cùng với các hoạt động đã chọn.
  5. **Footer thẻ:** Nút `Đọc bài báo` + Nút `Tìm vé xe đi [Tỉnh]` (`/search?origin=...&destination=...`).

### 3.4. Trình Đọc Bài Báo Chuyên Sâu (`DestinationArticleModal.tsx`)
Khi người dùng nhấn *"Đọc bài viết chuyên sâu"*, mở một Modal/Sheet chuẩn tạp chí:
- **Header Ấn Phẩm:** Tên chuyên mục, ngày xuất bản, thời lượng đọc, thông tin tác giả biên tập.
- **Drop-Cap Editorial Body:** Đoạn văn đầu tiên của `storyParagraphs` áp dụng kiểu chữ cái đầu phóng đại (**Drop-Cap**: `first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:font-serif`).
- **Pull-Quote & Photo Gallery:** Xen kẽ câu trích dẫn đóng khung và bộ sưu tập ảnh phụ (`gallery`).
- **Bảng Chọn Hoạt Động Vui Chơi Giải Trí Tại Điểm Đến:** Cho phép tích chọn/bỏ chọn từng hoạt động vui chơi kèm thông tin: *Thời lượng*, *Chi phí ước tính*, *Khung giờ vàng (Best Time)*.
- **Hộp "Góc Nhìn AI & Cẩm Nang Vé Xe VeXeViet" (Field Notes Box):**
  - Hiển thị lời khuyên thông minh (`aiInsight`), mùa đẹp nhất (`bestMonths`), mức độ đông đúc (`crowdLevel`), ngân sách dự kiến/ngày.
  - **2 CTA chuyển đổi trực tiếp:**
    - `Tìm chuyến xe đi [Tỉnh]` -> Điều hướng tới `/search?origin=[suggestedOrigin]&destination=[province]&departureDate=[YYYY-MM-DD]&passengers=1`.
    - `Mở trên Bản đồ lịch trình` -> Điều hướng tới `/travel?origin=[suggestedOrigin]&destination=[province]`.

### 3.5. Cơ Chế "Ghim Vào Hành Trình / Sổ Tay Lữ Hành" (`TripClippingBar.tsx`)
Đây là cầu nối biến trải nghiệm **"Đọc báo khám phá"** thành **"Lên kế hoạch & Đặt vé xe khách"**:
- **Floating Newspaper Clipping Bar (Thanh nổi dưới đáy màn hình):**
  - Xuất hiện mượt mà khi độc giả ghim từ 1 địa điểm hoặc chọn bất kỳ hoạt động vui chơi nào.
  - Hiển thị: Số lượng danh lam đã ghim, tổng số hoạt động vui chơi đã chọn, tổng ngân sách vui chơi + vé xe ước tính, cùng các chip địa điểm có thể xóa nhanh.
- **Chế độ mở rộng "Sổ Tay Hành Trình & AI Tổng Hợp Lịch Trình":**
  - Khi bấm mở rộng khay (hoặc bấm *"Xem lịch trình AI tổng hợp"*), hiển thị kế hoạch ngày-qua-ngày (Day-by-Day Itinerary) được tổng hợp từ các danh lam và hoạt động vui chơi mà người dùng vừa đọc trên trang báo.
  - Phân tích chi phí minh bạch: Chi phí vé xe khứ hồi/chặng + Chi phí vui chơi ăn uống mỗi ngày.
  - **Luồng chuyển đổi 1-Click sang hệ sinh thái VeXeViet:**
    1. **Đặt vé xe cho hành trình này:** Chuyển sang `/search` với `origin` và `destination` của điểm đến đầu tiên/đang chọn.
    2. **Dựng lộ trình trên Bản đồ tương tác:** Chuyển sang `/travel` để xem bản đồ và tối ưu điểm dừng.

---

## 4. Hướng Dẫn Kỹ Thuật Cho TEAM DEV (`@dev-ui` & `@dev-page`)

1. **Tuân thủ Design Tokens & Accessibility:**
   - Sử dụng các biến ngữ nghĩa `bg-background`, `bg-card`, `bg-surface-soft`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-border-strong`, `text-primary`, `bg-accent` để giao diện báo chí hiển thị hoàn hảo ở cả **Light Mode** (giấy báo kem ấm) và **Dark Mode** (tạp chí đêm sang trọng).
   - Các nút toggle *"Ghim vào hành trình"* cần có `aria-pressed={isSelected}` và trạng thái visual rõ ràng (viền cam `border-primary`, nền `bg-primary text-primary-foreground` khi đã ghim).
2. **Tương thích dữ liệu với `explore-destinations.ts` (`@dev-data`):**
   - Sử dụng trực tiếp các trường `title`, `subtitle`, `category`, `region`, `province`, `suggestedOrigin`, `readTimeMinutes`, `author`, `pullQuote`, `storyParagraphs`, `highlights` (điểm vui chơi giải trí), `busDurationHours`, `busPriceFrom`, `aiInsight`.
3. **Liên kết điều hướng chuẩn xác:**
   - Link tìm vé: `/search?origin=${encodeURIComponent(dest.suggestedOrigin)}&destination=${encodeURIComponent(dest.province)}&departureDate=${today}&passengers=1`
   - Link bản đồ du lịch: `/travel?origin=${encodeURIComponent(dest.suggestedOrigin)}&destination=${encodeURIComponent(dest.province)}`
