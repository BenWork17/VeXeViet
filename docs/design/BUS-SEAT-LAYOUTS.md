# 🚌 Bus Seat Layout System Documentation

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
3. [Luồng người dùng (User Flow)](#luồng-người-dùng-user-flow)
4. [Danh sách Bus Templates](#danh-sách-bus-templates)
5. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
6. [Hướng dẫn thêm Layout mới](#hướng-dẫn-thêm-layout-mới)
7. [API Response Format](#api-response-format)
8. [Shared Components](#shared-components)
9. [Customization Guide](#customization-guide)

---

## Tổng quan

Hệ thống Bus Seat Layout được thiết kế để hiển thị sơ đồ ghế/giường cho các loại xe khác nhau. Mỗi loại xe có layout riêng biệt, không ảnh hưởng đến nhau.

### Đặc điểm chính:
- ✅ **Modular**: Mỗi loại xe có component riêng
- ✅ **Auto-detection**: Tự động chọn layout phù hợp dựa trên `busTemplate`
- ✅ **Fallback**: Có cơ chế dự phòng khi API không trả về `busTemplate`
- ✅ **Reusable**: Các component dùng chung (SeatButton, Aisle, FloorLabel, BusFrame)
- ✅ **Responsive**: Hiển thị tốt trên mobile và desktop
- ✅ **Preview**: Hiển thị preview loại xe ở trang chi tiết chuyến

---

## Luồng người dùng (User Flow)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   USER FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────┐
  │   Search    │ ───► │  Search Results │ ───► │  Route Detail   │ ───► │   Booking   │
  │   /search   │      │    /search      │      │  /routes/[id]   │      │ /booking/[id]│
  └─────────────┘      └─────────────────┘      └─────────────────┘      └─────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ BusTypePreview  │
                                              │  - Loại xe      │
                                              │  - Sơ đồ mini   │
                                              │  - Tiện nghi    │
                                              │  - Số chỗ       │
                                              └─────────────────┘

```

### Chi tiết từng trang:

#### 1. Trang Tìm kiếm (`/search`)
- Người dùng nhập điểm đi, điểm đến, ngày đi
- Chọn các filter (loại xe, giá, giờ khởi hành)

#### 2. Trang Kết quả tìm kiếm 
- Hiển thị danh sách các chuyến xe
- Mỗi chuyến hiển thị: giá, giờ đi/đến, loại xe, nhà xe

#### 3. Trang Chi tiết chuyến xe (`/routes/[id]`) ⭐ QUAN TRỌNG
**File:** `apps/web/src/app/(main)/routes/[id]/page.tsx`

Đây là trang hiển thị thông tin chi tiết trước khi chọn ghế:
- **Header**: Điểm đi/đến, thời gian, nhà xe
- **Quick Stats**: Ghế trống, tiện nghi, điểm đón, đánh giá
- **🆕 BusTypePreview**: Preview loại xe và sơ đồ ghế
- **Tiện nghi**: Wifi, USB, điều hòa, v.v.
- **Điểm đón/trả**: Danh sách các điểm
- **Chính sách**: Hành lý, hủy vé

**Components sử dụng:**
- `RouteDetailHeader` - Header với thông tin chuyến
- `RouteDetailTabs` - Tabs chứa các section
- `BusTypePreview` - Preview loại xe (NEW!)

#### 4. Trang Chọn ghế (`/booking/[id]`)
**File:** `apps/web/src/app/(main)/booking/[id]/page.tsx`

- Hiển thị sơ đồ ghế chi tiết
- Cho phép chọn ghế
- Tổng tiền và nút tiếp tục

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        Booking Page                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API: getSeatAvailability(routeId, date)                │    │
│  │  ↓                                                       │    │
│  │  Bus Type Detection (SLEEPER/LIMOUSINE/VIP/STANDARD)    │    │
│  │  ↓                                                       │    │
│  │  Auto Template Generator (nếu API không có busTemplate) │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              BusSeatLayout Component                     │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  getLayoutType(busTemplate)                      │    │    │
│  │  │  → Xác định loại layout cần render               │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Individual Layout Components                │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │Sleeper42 │ │Sleeper34 │ │ Cabin20  │ │Limou22   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │    │
│  │  │Limou34   │ │  VIP29   │ │Standard45│                │    │
│  │  └──────────┘ └──────────┘ └──────────┘                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Shared Components                           │    │
│  │  SeatButton │ Aisle │ FloorLabel │ BusFrame             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Danh sách Bus Templates

### 1. Xe Giường Nằm 42 Chỗ (`SLEEPER_42`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `f5b56646-b973-4b34-81a1-d647a92db1b1` |
| **Bus Type** | `SLEEPER` |
| **Total Seats** | 42 |
| **Floors** | 2 |
| **Rows per Floor** | 7 |
| **Columns** | `A, _, B, _, C` |
| **Layout File** | `SleeperLayout42.tsx` |
| **Mô tả** | 2 tầng, mỗi tầng 21 giường. Dãy A và C sát cửa sổ, dãy B ở giữa |

### 2. Xe Giường Nằm 34 Chỗ VIP (`SLEEPER_34`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `cf75f98a-ff11-43c9-8ab1-be74c7e8f74a` |
| **Bus Type** | `SLEEPER` |
| **Total Seats** | 34 |
| **Floors** | 2 |
| **Rows per Floor** | 6 |
| **Columns** | `A, _, B, _, C` |
| **Layout File** | `SleeperLayout34.tsx` |
| **Mô tả** | Tầng dưới 18 giường VIP, tầng trên 16 giường. Giường rộng hơn 20% |

### 3. Cabin Đôi Luxury 20 Chỗ (`LIMOUSINE_20`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `ad8a26d6-372a-43b9-80ab-6ed531bb6ed9` |
| **Bus Type** | `LIMOUSINE` |
| **Total Seats** | 20 |
| **Floors** | 2 |
| **Rows per Floor** | 5 |
| **Columns** | `A, _, B` |
| **Layout File** | `CabinLayout20.tsx` |
| **Mô tả** | 20 cabin riêng tư, có rèm che, đèn đọc sách, ổ cắm điện |

### 4. Limousine 22 Chỗ VIP (`LIMOUSINE_22`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `c10125b3-bc80-423a-a479-9b1ecd99af60` |
| **Bus Type** | `LIMOUSINE` |
| **Total Seats** | 22 |
| **Floors** | 1 |
| **Rows per Floor** | 11 |
| **Columns** | `A, _, B` |
| **Layout File** | `LimousineLayout22.tsx` |
| **Mô tả** | 22 ghế massage cao cấp, màn hình riêng, wifi, nước uống |

### 5. Limousine 34 Chỗ (`LIMOUSINE_34`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `c29901c7-c6d1-46d1-90fa-d4daaf355316` |
| **Bus Type** | `LIMOUSINE` |
| **Total Seats** | 34 |
| **Floors** | 1 |
| **Rows per Floor** | 17 |
| **Columns** | `A, _, B` |
| **Layout File** | `LimousineLayout34.tsx` |
| **Mô tả** | 34 ghế da cao cấp, ngả 160 độ, Wifi, USB sạc |

### 6. Ghế Ngồi VIP 29 Chỗ (`VIP_29`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `54509cbe-69e1-4d6c-a2b3-516acb6224bc` |
| **Bus Type** | `VIP` |
| **Total Seats** | 29 |
| **Floors** | 1 |
| **Rows per Floor** | 8 |
| **Columns** | `A, B, _, C, D` |
| **Layout File** | `VIPLayout29.tsx` |
| **Mô tả** | 2 hàng đầu VIP, ghế rộng, có thể ngả |

### 7. Xe Ghế Ngồi 45 Chỗ (`STANDARD_45`)
| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | `07cf68c1-94df-4edf-a73a-708659723936` |
| **Bus Type** | `STANDARD` |
| **Total Seats** | 45 |
| **Floors** | 1 |
| **Rows per Floor** | 12 |
| **Columns** | `A, B, _, C, D` |
| **Layout File** | `StandardLayout45.tsx` |
| **Mô tả** | Xe ghế ngồi thường, giá phải chăng, điều hòa, wifi |

---

## Cấu trúc thư mục

```
apps/web/src/components/features/booking/
├── BusTypePreview.tsx              # 🆕 Preview loại xe (dùng ở trang route detail)
└── SeatMap/
    ├── layouts/
    │   ├── index.ts                 # Export tất cả components
    │   ├── types.ts                 # TypeScript types & config
    │   ├── BusSeatLayout.tsx        # Main component (auto-select layout)
    │   ├── SeatButton.tsx           # Shared seat button component
    │   ├── SleeperLayout42.tsx      # Xe giường nằm 42 chỗ
    │   ├── SleeperLayout34.tsx      # Xe giường nằm 34 chỗ VIP
    │   ├── CabinLayout20.tsx        # Cabin đôi 20 chỗ
    │   ├── LimousineLayout22.tsx    # Limousine 22 chỗ VIP
    │   ├── LimousineLayout34.tsx    # Limousine 34 chỗ
    │   ├── VIPLayout29.tsx          # Ghế ngồi VIP 29 chỗ
    │   └── StandardLayout45.tsx     # Xe ghế ngồi 45 chỗ
    ├── Seat.tsx                     # Legacy seat component
    ├── SeatMap.tsx                  # Legacy seat map (fallback)
    └── SleeperSeatMap.tsx           # Legacy sleeper map

apps/web/src/components/features/route-detail/
└── RouteDetailComponents.tsx        # Components trang chi tiết (có BusTypePreview)

apps/web/src/app/(main)/
├── routes/[id]/page.tsx             # Trang chi tiết chuyến xe
└── booking/[id]/page.tsx            # Trang chọn ghế
```

---

## Hướng dẫn thêm Layout mới

### Bước 1: Thêm config vào `types.ts`

```typescript
// Thêm vào BUS_LAYOUT_CONFIG
export const BUS_LAYOUT_CONFIG = {
  // ... existing configs
  
  // Thêm layout mới
  'SLEEPER_46': {
    floors: 2,
    rowsPerFloor: 8,
    columns: ['A', '_', 'B', '_', 'C'],
    seatsPerFloor: 23,
  },
} as const;
```

### Bước 2: Cập nhật `getLayoutType()` trong `types.ts`

```typescript
export function getLayoutType(busTemplate: BusTemplate): BusLayoutType | null {
  const { busType, totalSeats, floors } = busTemplate;
  
  if (busType === 'SLEEPER') {
    if (totalSeats === 46) return 'SLEEPER_46';  // Thêm dòng này
    if (totalSeats === 42 || totalSeats === 40) return 'SLEEPER_42';
    if (totalSeats === 34 || totalSeats === 36) return 'SLEEPER_34';
  }
  
  // ... rest of function
}
```

### Bước 3: Tạo file layout mới

Tạo file `SleeperLayout46.tsx`:

```tsx
'use client';

/**
 * Xe Giường Nằm 46 Chỗ - New Sleeper Layout
 * 2 tầng, mỗi tầng 23 giường (8 hàng × 3 dãy, hàng cuối 2 giường)
 * Layout columns: A, _, B, _, C
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LayoutProps } from './types';
import { SeatButton, Aisle, FloorLabel, BusFrame } from './SeatButton';

export function SleeperLayout46({
  busTemplate,
  seats,
  selectedSeats,
  onSeatSelect,
}: LayoutProps) {
  const floors = busTemplate.floors || 2;
  const rowsPerFloor = busTemplate.rowsPerFloor || 8;
  const columns = busTemplate.columns || ['A', '_', 'B', '_', 'C'];

  const getSeatAtPosition = (floor: number, row: number, column: string) => {
    return seats.find(
      (s) => s.floor === floor && s.row === row && s.column === column
    );
  };

  const getFloorSeats = (floorNumber: number) => {
    return seats.filter((s) => s.floor === floorNumber);
  };

  const renderFloor = (floorNumber: number) => {
    const floorSeats = getFloorSeats(floorNumber);
    const floorLabel = floorNumber === 1 ? 'Tầng dưới' : 'Tầng trên';
    const avgPrice = floorSeats.length
      ? Math.round(
          floorSeats.reduce((sum, s) => sum + s.finalPrice, 0) / floorSeats.length
        )
      : 0;

    return (
      <div key={floorNumber} className="mb-6">
        <FloorLabel
          floorNumber={floorNumber}
          label={floorLabel}
          avgPrice={avgPrice}
        />

        <BusFrame showDriver={floorNumber === 1} showEntrance={floorNumber === 1}>
          <div className="space-y-3">
            {Array.from({ length: rowsPerFloor }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex items-center justify-between gap-1">
                {columns.map((col, colIndex) => {
                  if (col === '_') {
                    return <Aisle key={`aisle-${colIndex}`} height="h-20" />;
                  }

                  const seat = getSeatAtPosition(floorNumber, row, col);
                  const isSelected = seat ? selectedSeats.includes(seat.id) : false;

                  return (
                    <div key={`${floorNumber}-${row}-${col}`}>
                      <SeatButton
                        seat={seat}
                        isSelected={isSelected}
                        onSelect={onSeatSelect}
                        variant="sleeper"
                        size="md"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </BusFrame>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {busTemplate.name}
        </h2>
        <p className="text-sm text-slate-600">
          {busTemplate.totalSeats} giường · {floors} tầng
        </p>
      </div>

      {/* Floors */}
      {Array.from({ length: floors }, (_, i) => i + 1).map((floor) =>
        renderFloor(floor)
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        {/* ... legend items */}
      </div>
    </div>
  );
}
```

### Bước 4: Export component trong `index.ts`

```typescript
// Thêm vào index.ts
export { SleeperLayout46 } from './SleeperLayout46';
```

### Bước 5: Đăng ký trong `BusSeatLayout.tsx`

```typescript
import { SleeperLayout46 } from './SleeperLayout46';

const LAYOUT_COMPONENTS: Record<string, React.ComponentType<LayoutProps>> = {
  // ... existing
  'SLEEPER_46': SleeperLayout46,
};
```

### Bước 6: (Tùy chọn) Cập nhật fallback trong booking page

Nếu API không trả về `busTemplate`, cập nhật logic auto-generate trong `booking/[id]/page.tsx`:

```typescript
if (detectedBusType === 'SLEEPER') {
  if (seatCount >= 44) return 'SLEEPER_46';
  if (seatCount >= 38) return 'SLEEPER_42';
  return 'SLEEPER_34';
}
```

---

## API Response Format

### BusTemplate Interface

```typescript
interface BusTemplate {
  id: string;
  name: string;
  busType: 'STANDARD' | 'LIMOUSINE' | 'SLEEPER' | 'VIP';
  totalSeats: number;
  floors: number;
  rowsPerFloor: number;
  columns: string[];  // e.g., ["A", "_", "B", "_", "C"] where "_" = aisle
  layoutImage: string | null;
}
```

### SeatDetail Interface

```typescript
interface SeatDetail {
  id: string;
  seatNumber: string;
  seatLabel: string;
  row: number;
  column: string;
  floor: number;
  seatType: 'STANDARD' | 'VIP' | 'SLEEPER';
  position: 'WINDOW' | 'AISLE' | 'MIDDLE';
  basePrice: number;
  priceModifier: number;
  finalPrice: number;
  status: 'AVAILABLE' | 'BOOKED' | 'SOLD' | 'HELD' | 'BLOCKED';
  isSelectable: boolean;
  metadata: Record<string, any> | null;
}
```

### Example API Response

```json
{
  "routeId": "xxx",
  "departureDate": "2024-01-15",
  "busTemplate": {
    "id": "f5b56646-b973-4b34-81a1-d647a92db1b1",
    "name": "Xe Giường Nằm 42 Chỗ",
    "busType": "SLEEPER",
    "totalSeats": 42,
    "floors": 2,
    "rowsPerFloor": 7,
    "columns": ["A", "_", "B", "_", "C"],
    "layoutImage": null
  },
  "seats": [
    {
      "id": "seat-1",
      "seatNumber": "A1-L",
      "seatLabel": "A1-L",
      "row": 1,
      "column": "A",
      "floor": 1,
      "seatType": "SLEEPER",
      "position": "WINDOW",
      "basePrice": 400000,
      "priceModifier": 0,
      "finalPrice": 400000,
      "status": "AVAILABLE",
      "isSelectable": true,
      "metadata": null
    }
    // ... more seats
  ],
  "summary": {
    "totalSeats": 42,
    "availableSeats": 35,
    "bookedSeats": 5,
    "heldSeats": 2,
    "blockedSeats": 0
  }
}
```

---

## Shared Components

### SeatButton

Component hiển thị một ghế/giường với các trạng thái khác nhau.

```tsx
interface SeatButtonProps {
  seat: SeatDetail | undefined;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
  variant?: 'sleeper' | 'cabin' | 'seat' | 'vip';
  size?: 'sm' | 'md' | 'lg';
  showPrice?: boolean;
}

// Usage
<SeatButton
  seat={seat}
  isSelected={selectedSeats.includes(seat.id)}
  onSelect={handleSeatSelect}
  variant="sleeper"
  size="md"
  showPrice={true}
/>
```

### Aisle

Component hiển thị lối đi giữa các dãy ghế.

```tsx
<Aisle height="h-20" />
```

### FloorLabel

Component hiển thị label cho mỗi tầng xe.

```tsx
<FloorLabel
  floorNumber={1}
  label="Tầng dưới"
  avgPrice={400000}
/>
```

### BusFrame

Component wrapper tạo khung xe với driver area và lối vào.

```tsx
<BusFrame showDriver={true} showEntrance={true}>
  {/* Seat rows */}
</BusFrame>
```

---

## Customization Guide

### Thay đổi màu sắc

Mỗi layout có theme màu riêng. Để thay đổi:

```tsx
// SleeperLayout - Blue theme
const statusClasses = {
  available: 'bg-white border-slate-200 text-slate-700 hover:border-blue-400',
  selected: 'bg-blue-600 border-blue-700 text-white',
  // ...
};

// CabinLayout - Purple theme
const statusClasses = {
  available: 'bg-gradient-to-b from-purple-50 to-indigo-50 border-purple-200',
  selected: 'bg-gradient-to-b from-purple-600 to-indigo-600',
  // ...
};
```

### Thêm icon cho loại xe mới

```tsx
import { Bed, Armchair, Sofa, Crown } from 'lucide-react';

// Chọn icon phù hợp
const Icon = variant === 'sleeper' ? Bed 
           : variant === 'cabin' ? Bed 
           : variant === 'vip' ? Sofa 
           : Armchair;
```

### Thêm amenities/tiện ích

```tsx
import { Tv, Wifi, Coffee, Usb, Plug, Lamp } from 'lucide-react';

// Header section
<div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
  <span className="flex items-center gap-1">
    <Tv className="w-3 h-3" /> Màn hình
  </span>
  <span className="flex items-center gap-1">
    <Wifi className="w-3 h-3" /> Wifi
  </span>
  <span className="flex items-center gap-1">
    <Coffee className="w-3 h-3" /> Nước uống
  </span>
</div>
```

---

## Lưu ý quan trọng

1. **Columns format**: Sử dụng `_` để đánh dấu lối đi (aisle)
   - `['A', '_', 'B']` = 2 cột, 1 lối đi giữa
   - `['A', 'B', '_', 'C', 'D']` = 4 cột, 1 lối đi giữa
   - `['A', '_', 'B', '_', 'C']` = 3 cột, 2 lối đi

2. **Seat labeling convention**:
   - Xe giường nằm: `A1-L` (Cột A, Hàng 1, Tầng dưới/Lower), `B3-U` (Upper)
   - Xe ghế ngồi: `A1`, `B2`, `C3`...

3. **Floor numbering**: 
   - `floor: 1` = Tầng dưới
   - `floor: 2` = Tầng trên

4. **Price display**: Giá hiển thị dạng `xxxk` (chia cho 1000)

5. **User Flow**: Người dùng PHẢI đi qua trang `/routes/[id]` trước khi vào `/booking/[id]`
   - Trang route detail hiển thị `BusTypePreview` để preview loại xe
   - Sau khi bấm "Chọn ghế ngay" mới chuyển sang trang booking

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2024-01-XX | Thêm BusTypePreview component cho trang route detail |
| 1.0.0 | 2024-01-XX | Initial release với 7 layouts |

---

## Support

Nếu cần hỗ trợ hoặc có câu hỏi, liên hệ team frontend.
