# 🎫 Hướng Dẫn Frontend - Kiểm Tra & Đặt Ghế

## 📌 Tổng Quan

Tài liệu này hướng dẫn Frontend cách sử dụng các API để kiểm tra tình trạng ghế và thực hiện đặt vé.

### ⚠️ LƯU Ý QUAN TRỌNG

**Ghế được quản lý theo `routeId` + `departureDate`**, KHÔNG phải theo xe (Bus).

Điều này có nghĩa:
- ✅ User đặt ghế A1 cho chuyến xe **HCM-Đà Lạt ngày 15/02** → chỉ ảnh hưởng chuyến đó
- ✅ Chuyến xe **HCM-Đà Lạt ngày 16/02** vẫn có ghế A1 trống
- ✅ Chuyến xe **HCM-Nha Trang ngày 15/02** vẫn có ghế A1 trống
- ✅ Cùng 1 xe vật lý chạy 2 chuyến/ngày → mỗi chuyến có bản đồ ghế riêng

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SEAT AVAILABILITY SCOPE                          │
├─────────────────────────────────────────────────────────────────────┤
│  Route: HCM → Đà Lạt                                                │
│  Bus Template: Limousine 34 chỗ                                     │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   15/02/2026    │    │   16/02/2026    │    │   17/02/2026    │  │
│  │  A1: BOOKED     │    │  A1: AVAILABLE  │    │  A1: AVAILABLE  │  │
│  │  A2: AVAILABLE  │    │  A2: BOOKED     │    │  A2: AVAILABLE  │  │
│  │  B1: HELD       │    │  B1: AVAILABLE  │    │  B1: BOOKED     │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│         ↑                       ↑                      ↑            │
│    Mỗi ngày có                Mỗi ngày              Mỗi ngày        │
│    bản đồ ghế                 có bản đồ             có bản đồ       │
│    riêng biệt                 riêng biệt            riêng biệt      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Booking Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND BOOKING FLOW                             │
└────────────────────────────────────────────────────────────────────────────┘

  Step 1                Step 2              Step 3              Step 4
┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Search  │ ──────► │  Select  │ ─────► │   Hold   │ ─────► │  Create  │
│  Routes  │         │  Seats   │        │  Seats   │        │ Booking  │
└──────────┘         └──────────┘        └──────────┘        └──────────┘
     │                    │                   │                    │
     ▼                    ▼                   ▼                    ▼
GET /routes/search   GET /seats/        POST /seats/hold     POST /bookings
                     availability
                     
  Public API           Public API         Protected API       Protected API
                                         (cần login)         (cần login)
```

---

## 📡 API Reference

### 1️⃣ Lấy Danh Sách Ghế & Trạng Thái

**Mục đích:** Hiển thị sơ đồ ghế với trạng thái real-time

**Endpoint:**
```http
GET /api/v1/seats/availability?routeId={routeId}&departureDate={YYYY-MM-DD}
```

**Auth:** ❌ Không cần (Public API)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `routeId` | UUID | ✅ | ID của tuyến xe |
| `departureDate` | string | ✅ | Ngày khởi hành (format: YYYY-MM-DD) |

**Ví dụ Request:**
```typescript
// Frontend code
const response = await fetch(
  `${API_URL}/api/v1/seats/availability?routeId=abc123&departureDate=2026-02-15`
);
const data = await response.json();
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "routeId": "abc123-uuid",
    "departureDate": "2026-02-15",
    "busTemplate": {
      "id": "tpl-uuid",
      "name": "Limousine 34 chỗ",
      "busType": "LIMOUSINE",
      "totalSeats": 34,
      "floors": 1,
      "rowsPerFloor": 10,
      "columns": ["A", "_", "B", "_", "C"]
    },
    "seats": [
      {
        "id": "seat-uuid-1",
        "seatNumber": "A1",
        "seatLabel": "A1",
        "row": 1,
        "column": "A",
        "floor": 1,
        "seatType": "VIP",
        "position": "WINDOW",
        "basePrice": 350000,
        "priceModifier": 50000,
        "finalPrice": 400000,
        "status": "AVAILABLE",
        "isSelectable": true,
        "metadata": null
      },
      {
        "id": "seat-uuid-2",
        "seatNumber": "B1",
        "seatLabel": "B1",
        "row": 1,
        "column": "B",
        "floor": 1,
        "seatType": "VIP",
        "position": "AISLE",
        "basePrice": 350000,
        "priceModifier": 50000,
        "finalPrice": 400000,
        "status": "BOOKED",
        "isSelectable": false,
        "metadata": null
      },
      {
        "id": "seat-uuid-3",
        "seatNumber": "C1",
        "seatLabel": "C1",
        "row": 1,
        "column": "C",
        "floor": 1,
        "seatType": "VIP",
        "position": "WINDOW",
        "basePrice": 350000,
        "priceModifier": 50000,
        "finalPrice": 400000,
        "status": "HELD",
        "isSelectable": false,
        "metadata": null
      }
    ],
    "summary": {
      "totalSeats": 34,
      "availableSeats": 30,
      "bookedSeats": 3,
      "heldSeats": 1,
      "blockedSeats": 0
    }
  }
}
```

**Seat Status Values:**
| Status | Mô tả | `isSelectable` | UI Action |
|--------|-------|----------------|-----------|
| `AVAILABLE` | Ghế trống, có thể đặt | `true` | ✅ Cho phép click chọn |
| `HELD` | Đang được giữ tạm (15 phút) | `false` | ⏳ Disable, hiển thị màu vàng |
| `BOOKED` | Đã được đặt | `false` | ❌ Disable, hiển thị màu đỏ |
| `BLOCKED` | Bị khóa bởi nhà xe | `false` | 🚫 Disable, hiển thị màu xám |

**Seat Type Values:**
| Type | Mô tả |
|------|-------|
| `NORMAL` | Ghế thường |
| `VIP` | Ghế VIP (thường có giá cao hơn) |
| `SLEEPER` | Giường nằm |
| `SEMI_SLEEPER` | Giường nằm bán |

**Position Values:**
| Position | Mô tả |
|----------|-------|
| `WINDOW` | Ghế cửa sổ |
| `AISLE` | Ghế lối đi |
| `MIDDLE` | Ghế giữa |

---

### 2️⃣ Kiểm Tra Ghế Cụ Thể (Trước Khi Giữ)

**Mục đích:** Quick check xem các ghế user chọn còn available không

**Endpoint:**
```http
POST /api/v1/seats/check
```

**Auth:** ❌ Không cần (Public API)

**Request Body:**
```json
{
  "routeId": "abc123-uuid",
  "departureDate": "2026-02-15",
  "seats": ["A1", "A2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `routeId` | UUID | ✅ | ID của tuyến xe |
| `departureDate` | string | ✅ | Ngày khởi hành |
| `seats` | string[] | ✅ | Danh sách ghế cần check |

**Response - Tất cả ghế available:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "unavailableSeats": []
  }
}
```

**Response - Có ghế không available:**
```json
{
  "success": true,
  "data": {
    "available": false,
    "unavailableSeats": ["A1"]
  }
}
```

**Frontend Usage:**
```typescript
const checkSeats = async (routeId: string, date: string, seats: string[]) => {
  const response = await fetch(`${API_URL}/api/v1/seats/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routeId, departureDate: date, seats })
  });
  
  const { data } = await response.json();
  
  if (!data.available) {
    // Hiển thị thông báo: "Ghế X đã được đặt, vui lòng chọn ghế khác"
    showError(`Ghế ${data.unavailableSeats.join(', ')} đã được đặt`);
    return false;
  }
  
  return true;
};
```

---

### 3️⃣ Giữ Ghế Tạm Thời (Hold Seats)

**Mục đích:** Giữ ghế trong 15 phút để user hoàn tất booking, tránh race condition

**Endpoint:**
```http
POST /api/v1/seats/hold
```

**Auth:** ✅ Yêu cầu Bearer Token

**Request Body:**
```json
{
  "routeId": "abc123-uuid",
  "departureDate": "2026-02-15",
  "seats": ["A1", "A2"],
  "ttlSeconds": 900
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `routeId` | UUID | ✅ | ID của tuyến xe |
| `departureDate` | string | ✅ | Ngày khởi hành |
| `seats` | string[] | ✅ | Danh sách ghế cần giữ |
| `ttlSeconds` | number | ❌ | Thời gian giữ (60-1800s, mặc định: 900 = 15 phút) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "holdId": "hold-uuid",
    "seats": ["A1", "A2"],
    "expiresAt": "2026-02-15T10:30:00Z"
  }
}
```

**Response (409 Conflict - Ghế không available):**
```json
{
  "success": false,
  "error": {
    "code": "SEATS_UNAVAILABLE",
    "message": "Seats are no longer available: A1",
    "details": {
      "unavailableSeats": ["A1"]
    }
  }
}
```

**Frontend Usage:**
```typescript
const holdSeats = async (routeId: string, date: string, seats: string[]) => {
  const response = await fetch(`${API_URL}/api/v1/seats/hold`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      routeId,
      departureDate: date,
      seats,
      ttlSeconds: 900  // 15 phút
    })
  });
  
  if (response.status === 409) {
    const error = await response.json();
    showError(`Ghế ${error.error.details.unavailableSeats.join(', ')} đã được người khác đặt`);
    // Refresh lại seat map
    await refreshSeatMap();
    return null;
  }
  
  const { data } = await response.json();
  
  // Lưu holdId và expiresAt để tracking
  setHoldInfo({
    holdId: data.holdId,
    expiresAt: new Date(data.expiresAt)
  });
  
  // Bắt đầu countdown timer
  startCountdown(data.expiresAt);
  
  return data;
};
```

---

### 4️⃣ Tạo Booking

**Mục đích:** Tạo booking chính thức sau khi đã giữ ghế

**Endpoint:**
```http
POST /api/v1/bookings
```

**Auth:** ✅ Yêu cầu Bearer Token

**Request Body:**
```json
{
  "routeId": "abc123-uuid",
  "departureDate": "2026-02-15",
  "passengers": [
    {
      "firstName": "Nguyen",
      "lastName": "Van A",
      "seatNumber": "A1",
      "idNumber": "123456789",
      "dateOfBirth": "1990-05-15"
    },
    {
      "firstName": "Tran",
      "lastName": "Thi B",
      "seatNumber": "A2"
    }
  ],
  "seats": ["A1", "A2"],
  "pickupPointId": "pickup-uuid",
  "dropoffPointId": "dropoff-uuid",
  "contactInfo": {
    "email": "user@example.com",
    "phone": "+84901234567"
  },
  "promoCode": "SAVE10",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Cần hỗ trợ xe lăn"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `routeId` | UUID | ✅ | ID tuyến xe |
| `departureDate` | string | ✅ | Ngày khởi hành |
| `passengers` | array | ✅ | Thông tin hành khách (số lượng phải = số ghế) |
| `seats` | string[] | ✅ | Danh sách ghế (tối đa 10) |
| `pickupPointId` | UUID | ✅ | Điểm đón |
| `dropoffPointId` | UUID | ✅ | Điểm trả |
| `contactInfo.email` | string | ✅ | Email liên hệ |
| `contactInfo.phone` | string | ✅ | SĐT liên hệ |
| `idempotencyKey` | UUID | ✅ | Key chống duplicate (tạo 1 lần/booking) |
| `promoCode` | string | ❌ | Mã giảm giá |
| `notes` | string | ❌ | Ghi chú |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking-uuid",
    "bookingCode": "VXV7A8B9C0",
    "status": "PENDING",
    "route": {
      "id": "route-uuid",
      "name": "HCM - Đà Lạt Express",
      "departureTime": "2026-02-15T08:00:00Z",
      "arrivalTime": "2026-02-15T14:00:00Z"
    },
    "passengers": [
      { "firstName": "Nguyen", "lastName": "Van A", "seatNumber": "A1" },
      { "firstName": "Tran", "lastName": "Thi B", "seatNumber": "A2" }
    ],
    "seats": ["A1", "A2"],
    "totalPrice": {
      "amount": 750000,
      "currency": "VND",
      "breakdown": {
        "tickets": 700000,
        "serviceFee": 35000,
        "discount": -85000,
        "total": 750000
      }
    },
    "paymentDeadline": "2026-02-15T10:30:00Z",
    "createdAt": "2026-02-15T10:15:00Z"
  }
}
```

**Error Responses:**
| Status | Code | Xử lý |
|--------|------|-------|
| 400 | `VALIDATION_ERROR` | Hiển thị lỗi validation |
| 401 | `UNAUTHORIZED` | Redirect về login |
| 404 | `NOT_FOUND` | Route không tồn tại |
| 409 | `SEATS_UNAVAILABLE` | Ghế đã bị đặt, refresh seat map |
| 409 | `CONFLICT` | Số passengers ≠ số seats |

---

## 🎯 Complete Flow Example

```typescript
// booking-flow.ts

import { v4 as uuidv4 } from 'uuid';

interface BookingFlowParams {
  routeId: string;
  departureDate: string;
  selectedSeats: string[];
  passengers: PassengerInfo[];
  pickupPointId: string;
  dropoffPointId: string;
  contactInfo: ContactInfo;
  promoCode?: string;
}

export async function executeBookingFlow(params: BookingFlowParams) {
  const {
    routeId,
    departureDate,
    selectedSeats,
    passengers,
    pickupPointId,
    dropoffPointId,
    contactInfo,
    promoCode
  } = params;

  try {
    // ============================================
    // STEP 1: Kiểm tra ghế còn available không
    // ============================================
    console.log('Step 1: Checking seat availability...');
    
    const checkResponse = await api.post('/seats/check', {
      routeId,
      departureDate,
      seats: selectedSeats
    });

    if (!checkResponse.data.available) {
      throw new Error(
        `Ghế ${checkResponse.data.unavailableSeats.join(', ')} đã được đặt. Vui lòng chọn ghế khác.`
      );
    }

    // ============================================
    // STEP 2: Giữ ghế (yêu cầu đăng nhập)
    // ============================================
    console.log('Step 2: Holding seats...');
    
    const holdResponse = await api.post('/seats/hold', {
      routeId,
      departureDate,
      seats: selectedSeats,
      ttlSeconds: 900  // 15 phút
    });

    const { holdId, expiresAt } = holdResponse.data;
    
    // Bắt đầu countdown
    startPaymentCountdown(expiresAt);

    // ============================================
    // STEP 3: Tạo booking
    // ============================================
    console.log('Step 3: Creating booking...');
    
    const idempotencyKey = uuidv4(); // Tạo unique key
    
    const bookingResponse = await api.post('/bookings', {
      routeId,
      departureDate,
      passengers,
      seats: selectedSeats,
      pickupPointId,
      dropoffPointId,
      contactInfo,
      promoCode,
      idempotencyKey
    });

    const booking = bookingResponse.data;
    
    // ============================================
    // STEP 4: Redirect đến trang thanh toán
    // ============================================
    console.log('Step 4: Redirecting to payment...');
    
    return {
      success: true,
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      totalPrice: booking.totalPrice.amount,
      paymentDeadline: booking.paymentDeadline
    };

  } catch (error: any) {
    if (error.response?.status === 409) {
      // Ghế đã bị người khác đặt
      return {
        success: false,
        error: 'SEATS_UNAVAILABLE',
        message: 'Ghế bạn chọn đã được người khác đặt. Vui lòng chọn ghế khác.',
        unavailableSeats: error.response.data.error.details.unavailableSeats
      };
    }
    
    throw error;
  }
}
```

---

## 🔄 Realtime Updates (Khuyến nghị)

Để có trải nghiệm tốt nhất, nên implement:

### Option 1: Polling (Simple)
```typescript
// Poll mỗi 30 giây để cập nhật seat map
useEffect(() => {
  const interval = setInterval(() => {
    refreshSeatAvailability();
  }, 30000);
  
  return () => clearInterval(interval);
}, [routeId, departureDate]);
```

### Option 2: WebSocket (Advanced)
```typescript
// Subscribe to seat updates
socket.on(`seat-update:${routeId}:${departureDate}`, (data) => {
  updateSeatStatus(data.seatNumber, data.status);
});
```

---

## ⏱️ Timeout Handling

```typescript
// Khi hold hết hạn (15 phút)
const handleHoldExpired = () => {
  showModal({
    title: 'Hết thời gian giữ ghế',
    message: 'Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế.',
    action: () => {
      // Reset về bước chọn ghế
      resetBookingFlow();
      refreshSeatAvailability();
    }
  });
};
```

---

## 📊 Database Schema (Tham khảo)

```sql
-- Bảng booking_seats lưu theo routeId + seatNumber
CREATE TABLE booking_seats (
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id),        -- ← KEY: Theo route, không phải bus
  seat_number VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL,                -- AVAILABLE, HELD, BOOKED, BLOCKED
  locked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (booking_id, seat_number),
  INDEX idx_route_seat (route_id, seat_number, status)
);

-- Query kiểm tra ghế available cho 1 chuyến cụ thể
SELECT seat_number, status 
FROM booking_seats 
WHERE route_id = ? 
  AND departure_date = ?
  AND status IN ('HELD', 'BOOKED', 'BLOCKED');
```

---

## ❓ FAQ

### Q1: Nếu 2 user cùng chọn ghế A1 cùng lúc thì sao?
**A:** API `/seats/hold` sử dụng **pessimistic locking**. User gọi hold trước sẽ được giữ ghế, user sau sẽ nhận error 409.

### Q2: Ghế HELD sẽ được release khi nào?
**A:** Sau 15 phút (hoặc `ttlSeconds` khi hold), ghế sẽ tự động release nếu không tạo booking.

### Q3: Nếu user refresh trang trong lúc đang giữ ghế?
**A:** Ghế vẫn được giữ trong Redis. Frontend nên lưu `holdId` vào localStorage để recovery.

### Q4: Có cần gọi API release seats không?
**A:** Không bắt buộc, vì có auto-release. Nhưng nếu user explicitly cancel, có thể gọi `DELETE /seats/hold/{holdId}` để release sớm.

---

## 🔗 Related Documents

- [BOOKING-FLOW-DESIGN.md](./BOOKING-FLOW-DESIGN.md) - Thiết kế luồng booking
- [BUS-SEAT-LAYOUTS.md](./BUS-SEAT-LAYOUTS.md) - Các loại layout ghế
- [API-TESTING.md](./API-TESTING.md) - Chi tiết tất cả API
