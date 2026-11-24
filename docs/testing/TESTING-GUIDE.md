# Hướng dẫn chạy và test ứng dụng

## 0. Cài đặt dependencies (lần đầu tiên)

```bash
# Từ thư mục root
pnpm install

# Build packages/ui (bắt buộc trước khi chạy web app)
cd packages/ui
pnpm install
cd ../..
```

## 1. Khởi động dev server

```bash
cd apps/web
pnpm run dev
```

Server sẽ chạy tại `http://localhost:3000` (hoặc port khác nếu 3000 bị chiếm)

## 2. Kiểm tra trang chủ

Mở trình duyệt và truy cập `http://localhost:3000`

**Bạn sẽ thấy:**
- Header "VeXeViet - Book Bus Tickets in Vietnam"
- Card màu trắng với tiêu đề "Find Your Journey"
- **SearchForm** với các trường:
  - Origin (Input text)
  - Destination (Input text)  
  - Departure Date (Date picker với calendar popup)
  - Return Date (Optional date picker)
  - Passengers (Number input, mặc định = 1)
  - Nút "Clear" và "Search Routes"
- Danh sách "Popular Routes" bên dưới

## 3. Nếu KHÔNG thấy SearchForm

### Kiểm tra Console Log (F12):
1. Mở DevTools (F12)
2. Xem tab Console
3. Tìm lỗi màu đỏ

### Lỗi thường gặp và cách fix:

**Lỗi: "Cannot find module '@vexeviet/ui'" hoặc Button không hoạt động**
```bash
# Fix: Build packages/ui và install @radix-ui/react-slot
cd packages/ui
pnpm install
pnpm add @radix-ui/react-slot
cd ../../apps/web
pnpm install
pnpm run dev
```

**Lỗi: "react-day-picker styles not found"**
```bash
# Fix: Install dependencies
cd apps/web
pnpm install
pnpm run dev
```

**Lỗi: Build fails hoặc page trắng**
```bash
# Fix: Clean và rebuild
cd apps/web
rm -rf .next
pnpm run dev
```

## 4. Test SearchForm

### Test cơ bản:
1. Nhập Origin: "Hanoi"
2. Nhập Destination: "Sapa"  
3. Click vào "Departure Date" → Chọn ngày trong tương lai
4. Click "Search Routes"
5. **Mong đợi**: Chuyển hướng sang `/search?origin=Hanoi&destination=Sapa&departureDate=2026-02-15&passengers=1`

### Test Calendar Popup:
1. Click vào trường "Departure Date"
2. **Mong đợi**: Popup calendar hiện ra
3. Click vào một ngày
4. **Mong đợi**: Ngày được chọn, popup đóng, trường input hiện ngày đã chọn

### Test Validation:
1. Bỏ trống Origin và click "Search Routes"
2. **Mong đợi**: Hiện lỗi màu đỏ "Origin is required"

### Test Swap Button:
1. Nhập Origin: "Hanoi", Destination: "HCM"
2. Click nút "⇄" (swap button bên phải Destination)
3. **Mong đợi**: Origin = "HCM", Destination = "Hanoi"

## 5. Test Search Page

Sau khi submit form từ homepage:

1. URL: `/search?origin=Hanoi&destination=Sapa&departureDate=2026-02-15&passengers=1`
2. **Mong đợi sau 1 giây**:
   - Skeleton loaders biến mất
   - Hiện danh sách 5 routes
   - Sidebar bên trái hiện FilterPanel (desktop)
   - Thanh Sort Controls phía trên danh sách

## 6. Test Filtering

### Price Range:
1. Kéo slider Price Range
2. **Mong đợi**: Routes lọc ngay lập tức (không cần reload)

### Bus Type:
1. Click checkbox "LIMOUSINE"
2. **Mong đợi**: Chỉ hiện routes có busType = LIMOUSINE

### Clear Filters:
1. Click "Clear all"
2. **Mong đợi**: Tất cả filters reset

## 7. Test Sorting

1. Click nút "Price"
2. **Mong đợi**: Routes sắp xếp theo giá, nút hiện mũi tên ↑
3. Click lại "Price"
4. **Mong đợi**: Đảo ngược thứ tự, mũi tên ↓

## 8. Test Mobile (Resize browser < 1024px)

1. FilterPanel sidebar biến mất
2. Nút "Filters" xuất hiện ở thanh Sort
3. Click "Filters" → Drawer mở từ bên phải
4. Chọn filter → Drawer tự động đóng

## Troubleshooting

### Page trắng hoàn toàn:
```bash
# Kiểm tra logs
cd apps/web  
pnpm run dev
# Xem output có lỗi gì không
```

### SearchForm không hiện:
```bash
# Kiểm tra file có tồn tại không
ls apps/web/src/components/features/search/SearchForm/SearchForm.tsx

# Nếu không có, nghĩa là file bị mất → Cần tạo lại
```

### Redux errors:
```bash
# Kiểm tra StoreProvider
cat apps/web/src/app/layout.tsx | grep StoreProvider

# Phải thấy <StoreProvider> wrap children
```

## Liên hệ nếu cần hỗ trợ

Nếu vẫn không thấy SearchForm sau khi làm theo các bước trên, hãy:
1. Chụp màn hình Console errors (F12)
2. Copy toàn bộ output của `pnpm run dev`
3. Báo lại để được hỗ trợ cụ thể
