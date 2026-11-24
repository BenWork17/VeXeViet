# 🎯 Booking Flow Design - Senior Architecture

## 📋 Current Issues

### ❌ Problems:
1. **No booking creation before payment** - Payment happens without a booking ID
2. **confirmBooking() called by frontend** - Should be called by Payment Service
3. **Inconsistent state** - Booking exists in Redux but not in DB
4. **Race conditions** - Payment success but booking not created yet

---

## ✅ Correct Flow (Industry Standard)

### **Step-by-Step Process**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                                  │
└─────────────────────────────────────────────────────────────────┘

1️⃣ Search Routes
   GET /api/v1/routes/search
   ↓
   
2️⃣ View Route Details
   GET /api/v1/routes/:id
   ↓
   
3️⃣ Select Seats
   GET /api/v1/seats/availability?routeId=xxx&date=2026-01-22
   POST /api/v1/seats/hold  (Hold seats for 15 minutes)
   ↓
   
4️⃣ Create Booking (PENDING status)
   POST /api/v1/bookings
   {
     "routeId": "xxx",
     "seatNumbers": ["A1", "A2"],
     "passengerInfo": [...],
     "contactInfo": {...}
   }
   ← Response: { bookingId, bookingCode, status: "PENDING", expiresAt }
   ↓
   
5️⃣ Initiate Payment
   Frontend redirects to Payment Gateway with bookingId
   ↓
   
6️⃣ Payment Processing
   User completes payment at VNPay/Momo/ZaloPay
   ↓
   
7️⃣ Payment Callback (Backend-to-Backend)
   Payment Gateway → Payment Service (IPN/Webhook)
   Payment Service validates signature
   Payment Service calls:
   POST /api/v1/bookings/:id/confirm
   ↓
   
8️⃣ Payment Return URL
   Payment Gateway redirects user back to:
   /booking/payment/result?bookingId=xxx&status=success
   Frontend shows success/failure message
```

---

## 🏗️ Implementation Design

### **1. Create Booking API (Before Payment)**

**Endpoint:** `POST /api/v1/bookings`

**Frontend Call:**
```typescript
// apps/web/src/app/booking/payment/page.tsx

const handlePaymentMethodSelect = async (method: PaymentMethod) => {
  setIsProcessing(true);
  
  try {
    // ✅ Step 1: Create booking first (PENDING status)
    const bookingData: CreateBookingRequest = {
      routeId: booking.currentRoute.id,
      departureDate: booking.currentRoute.departureTime,
      seatNumbers: booking.selectedSeats,
      passengerInfo: booking.passengers,
      contactInfo: {
        fullName: user?.firstName + ' ' + user?.lastName,
        email: user?.email,
        phone: user?.phone,
      },
      pickupPointId: booking.pickupPoint?.id,
      dropoffPointId: booking.dropoffPoint?.id,
      totalPrice: booking.totalPrice,
      idempotencyKey: generateIdempotencyKey(), // Prevent duplicate bookings
    };

    const bookingResponse = await createBooking(bookingData);
    // Response: { bookingId, bookingCode, status: "PENDING", expiresAt: "2026-01-22T10:15:00Z" }
    
    // ✅ Step 2: Initiate payment with bookingId
    const paymentResponse = await initiatePayment(
      bookingResponse.bookingId,
      method,
      booking.totalPrice
    );

    if (paymentResponse.success && paymentResponse.paymentUrl) {
      // Redirect to payment gateway
      window.location.href = paymentResponse.paymentUrl;
    }
  } catch (err) {
    setIsProcessing(false);
    setError('Không thể tạo đặt vé. Vui lòng thử lại.');
  }
};
```

---

### **2. Payment Flow (VNPay Example)**

**Initiate Payment:**
```typescript
// apps/web/src/lib/api/payment.ts

export async function initiatePayment(
  bookingId: string,
  method: PaymentMethod,
  amount: number
): Promise<{ success: boolean; paymentUrl: string }> {
  const response = await apiClient.post('/payments/vnpay/create', {
    bookingId,
    amount,
    returnUrl: `${window.location.origin}/booking/payment/result`,
    ipnUrl: `${process.env.NEXT_PUBLIC_API_URL}/payments/vnpay/ipn`, // Backend IPN
  });

  return response.data.data;
}
```

**Payment Gateway Flow:**
```
User → VNPay Payment Page
         ↓ (User pays)
         ├── IPN (Backend): /api/v1/payments/vnpay/ipn
         │   Payment Service validates & confirms booking
         │   POST /bookings/:id/confirm
         │
         └── Return URL (Frontend): /booking/payment/result?bookingId=xxx&status=success
             User sees success message
```

---

### **3. Confirm Booking (Backend Only)**

**This API should NEVER be called by frontend!**

```typescript
// ❌ WRONG (Frontend calls)
await confirmBooking(bookingId); // Security risk!

// ✅ CORRECT (Payment Service calls internally)
// Payment Service → Booking Service
POST /api/v1/bookings/:id/confirm
Authorization: Bearer {INTERNAL_SERVICE_TOKEN}
```

**Why?**
- Prevents fraud (users can't confirm without paying)
- Ensures payment is verified by Payment Gateway
- Backend-to-backend communication is more secure

---

### **4. Cancel Booking (User Action)**

**Endpoint:** `POST /api/v1/bookings/:id/cancel`

```typescript
// apps/web/src/app/(main)/profile/bookings/page.tsx

const handleCancelBooking = async (bookingId: string) => {
  try {
    const result = await cancelBooking(bookingId, {
      reason: 'User requested cancellation',
    });

    showToast('Booking cancelled successfully', 'success');
    await loadBookings(); // Refresh list
  } catch (error) {
    showToast('Failed to cancel booking', 'error');
  }
};
```

---

## 🗄️ Database States

### **Booking Status Flow**

```
PENDING (Initial creation)
   ↓
   ├── Payment Success → CONFIRMED
   ├── Payment Failed → EXPIRED
   ├── 15min timeout → EXPIRED
   └── User cancels → CANCELLED

CONFIRMED
   ↓
   ├── User cancels (>24h) → CANCELLED (refund 90%)
   ├── User cancels (<24h) → CANCELLED (refund 50%)
   └── Trip completed → COMPLETED
```

---

## 🔒 Security Considerations

### **1. Idempotency Key**
```typescript
// Prevent duplicate bookings on retry
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}
```

### **2. Payment Signature Verification**
```typescript
// Backend verifies VNPay signature
const isValid = verifyVNPaySignature(req.query);
if (!isValid) {
  throw new Error('Invalid payment signature');
}
```

### **3. Seat Locking**
```typescript
// Hold seats for 15 minutes
await holdSeats({
  routeId: 'xxx',
  seatNumbers: ['A1', 'A2'],
  expiresAt: new Date(Date.now() + 15 * 60 * 1000),
});
```

---

## 📊 State Management (Redux)

```typescript
// Store booking ID after creation
const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookingId: null,        // From API after creation
    status: 'idle',         // idle | pending | confirmed | failed
    expiresAt: null,        // 15-minute countdown
  },
  reducers: {
    setBookingCreated: (state, action) => {
      state.bookingId = action.payload.bookingId;
      state.status = 'pending';
      state.expiresAt = action.payload.expiresAt;
    },
    setBookingConfirmed: (state) => {
      state.status = 'confirmed';
    },
  },
});
```

---

## 🎬 Timeline

```
t=0s    User selects seats
t=5s    POST /bookings (create with PENDING)
t=6s    Redirect to VNPay
t=30s   User completes payment
t=31s   VNPay → Backend IPN (confirm booking)
t=32s   VNPay → Frontend Return URL
t=33s   User sees "Payment Success" page
```

---

## 🚀 Action Plan

1. **Add createBooking call before payment** ✅
2. **Remove confirmBooking from frontend** ✅ (Done)
3. **Backend: Implement IPN handler**
4. **Add booking expiry countdown (15 min)**
5. **Add seat hold/release logic**
6. **Test payment flow end-to-end**

---

**Summary:**
- ✅ **Create booking BEFORE payment** (status: PENDING)
- ✅ **Payment Service confirms booking** (not frontend)
- ✅ **User can cancel confirmed bookings** (with refund policy)
- ✅ **Seats are locked during checkout**
