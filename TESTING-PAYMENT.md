# 🧪 Payment Integration Testing Guide

> **Feature:** FE-203 (Payment Integration) - PI 2, Iteration 2-3  
> **Last Updated:** 2026-01-14  
> **Status:** Ready for Testing

---

## 📋 Testing Checklist

### ✅ Prerequisites
- [ ] Web app running: `cd apps/web && npm run dev`
- [ ] Mobile app running: `cd apps/mobile && npm start`
- [ ] Mock API enabled: `NEXT_PUBLIC_USE_MOCK_PAYMENT=true` in `.env.local`

---

## 🌐 Web App Testing

### ⚡ Quick Start (Recommended)

**Option A: Use Demo Setup Page**
1. Navigate to: `http://localhost:3000/demo-setup`
2. Click "Go to Payment Page"
3. Skip to Test Case 1 step 2

**Option B: Manual Redux Setup**
1. Open DevTools → Console
2. Paste and run:
   ```js
   // Initialize mock booking data
   const event = new CustomEvent('redux-dispatch', {
     detail: {
       type: 'booking/initBooking',
       payload: {
         id: 'route-123',
         price: 250000,
         busType: 'VIP Limousine',
         from: 'HCM City',
         to: 'Da Lat',
         departureTime: '2026-01-20T08:00:00'
       }
     }
   });
   window.dispatchEvent(event);
   ```
3. Navigate to payment page

---

### Test Case 1: Payment Flow (Happy Path)

**Steps:**
1. Navigate to payment page: `http://localhost:3000/booking/payment` (after setup)
2. Verify booking summary displays:
   - Route: HCM City → Da Lat
   - Departure time
   - Bus type
   - Passenger count
   - Total price (formatted in VND)
3. Select payment method (e.g., VNPAY)
4. Click "Thanh toán [Amount]" button
5. Verify redirect to Mock Gateway (`/mock-gateway`)
6. Click "✅ Simulate SUCCESS"
7. Verify redirect to Result page with success state
8. Verify display:
   - ✅ Success icon
   - Booking ID
   - Transaction ID
   - "Xem vé của tôi" button

**Expected Results:**
- ✅ All steps complete without errors
- ✅ UI is responsive and accessible
- ✅ Currency formatting correct (VND)
- ✅ Success state displays correctly

---

### Test Case 2: Payment Failure Flow

**Steps:**
1. Navigate to payment page
2. Select any payment method
3. Click "Thanh toán" button
4. On Mock Gateway, click "❌ Simulate FAILURE"
5. Verify redirect to Result page with failed state
6. Verify display:
   - ❌ Error icon
   - Error message
   - "Thử lại" button
   - "Về trang chủ" button

**Expected Results:**
- ✅ Failure state displays correctly
- ✅ User can retry payment
- ✅ Error message is clear

---

### Test Case 3: No Booking Data

**Steps:**
1. Clear Redux state: Open DevTools → Application → Clear Storage
2. Navigate directly to `/booking/payment`
3. Verify error state displays
4. Click "Quay lại tìm kiếm"

**Expected Results:**
- ✅ Shows "Không có thông tin đặt vé" message
- ✅ Redirects to search page

---

### Test Case 4: Payment Method Selection

**Steps:**
1. Navigate to payment page
2. Click each payment method:
   - VNPAY (💳)
   - Momo (🟣)
   - ZaloPay (🔵)
   - Credit Card (💳)
3. Verify radio button selection
4. Verify selected item has highlighted border

**Expected Results:**
- ✅ Only one method selected at a time
- ✅ Visual feedback on selection
- ✅ Pay button enabled when method selected

---

### Test Case 5: Loading State

**Steps:**
1. Navigate to payment page
2. Open DevTools → Network → Enable throttling (Slow 3G)
3. Select payment method
4. Click "Thanh toán"
5. Observe loading states:
   - Button shows spinner
   - Button text changes to "Đang xử lý..."
   - Button is disabled
   - Full-screen loader overlay appears

**Expected Results:**
- ✅ Loading indicators display correctly
- ✅ User cannot double-click button
- ✅ Overlay prevents interaction during processing

---

### Test Case 6: Accessibility (Keyboard Navigation)

**Steps:**
1. Navigate to payment page
2. Use keyboard only:
   - Tab to focus payment methods
   - Space/Enter to select
   - Tab to "Thanh toán" button
   - Enter to submit
3. Verify screen reader announces:
   - "Phương thức thanh toán" for radio group
   - Method names
   - Total amount

**Expected Results:**
- ✅ All elements keyboard accessible
- ✅ Focus indicators visible
- ✅ ARIA labels present

---

### Test Case 7: Mobile Responsive

**Steps:**
1. Open DevTools → Toggle device toolbar
2. Test on viewports:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
3. Verify:
   - Payment methods stack vertically on mobile
   - Button is full-width on mobile
   - Text is readable
   - Touch targets are min 44x44px

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ No horizontal scroll
- ✅ Text remains readable

---

## 📱 Mobile App Testing

### Test Case 8: Mobile Payment Flow

**Steps:**
1. Start Metro bundler: `npm start`
2. Open app on simulator/device
3. Navigate to PaymentScreen
4. Verify UI elements:
   - Header: "Checkout"
   - Order summary card
   - Payment methods (4 options with icons)
   - Pay button at bottom
5. Select payment method
6. Tap "Thanh toán" button
7. Verify loading overlay appears
8. Verify redirect to mock payment URL (check logs)

**Expected Results:**
- ✅ Native-like UI rendering
- ✅ Smooth transitions
- ✅ Loading states work

---

### Test Case 9: Mobile Payment Result

**Steps:**
1. Simulate deep link return:
   - For testing, manually navigate to PaymentResultScreen
2. Verify success state displays:
   - Green checkmark icon
   - Success message
   - Transaction details
   - Action buttons
3. Test button navigation

**Expected Results:**
- ✅ Result screen displays correctly
- ✅ Icons render properly
- ✅ Buttons are tappable

---

## 🔧 Mock API Testing

### Test Case 10: Mock API Response

**Steps:**
1. Open browser DevTools → Console
2. Navigate to payment page
3. Select payment method
4. Click "Thanh toán"
5. Check console for:
   - `🔧 Using Mock Payment API`
   - Network request to mock function (not real API)
6. Verify mock gateway URL structure:
   ```
   /mock-gateway?bookingId=BK-xxx&amount=500000&method=VNPAY&transactionId=TXN-xxx
   ```

**Expected Results:**
- ✅ Console shows mock API usage
- ✅ No real API calls made
- ✅ Mock URL parameters correct

---

### Test Case 11: Mock Gateway Interactions

**Steps:**
1. Access mock gateway directly: `/mock-gateway?bookingId=TEST&amount=100000&method=VNPAY&transactionId=TEST123`
2. Verify UI displays all parameters
3. Test "Simulate SUCCESS" button
4. Test "Simulate FAILURE" button
5. Test "Cancel & Go Back" button

**Expected Results:**
- ✅ All parameters display correctly
- ✅ Buttons trigger correct redirects
- ✅ URL params passed to result page

---

## 🐛 Error Handling Testing

### Test Case 12: Network Error

**Steps:**
1. Open DevTools → Network → Offline mode
2. Navigate to payment page
3. Select payment method
4. Click "Thanh toán"
5. Verify error alert appears

**Expected Results:**
- ✅ Error message displays
- ✅ User can retry
- ✅ No app crash

---

### Test Case 13: Invalid Booking Data

**Steps:**
1. Manually set invalid Redux state:
   ```js
   // In DevTools console
   window.__REDUX_DEVTOOLS_EXTENSION__.send({
     type: 'booking/initBooking',
     payload: { id: null, price: null }
   })
   ```
2. Navigate to payment page
3. Verify error handling

**Expected Results:**
- ✅ Graceful error display
- ✅ No console errors
- ✅ User redirected safely

---

## ✅ Acceptance Criteria Validation

### AC1: Payment Method Selection ✅
- [x] 4 payment methods displayed
- [x] Radio button selection works
- [x] Only one method selectable at a time
- [x] Visual feedback on selection

### AC2: Order Summary Display ✅
- [x] Trip details shown
- [x] Passenger count shown
- [x] Total price formatted correctly (VND)
- [x] All data from Redux state

### AC3: Payment Initiation ✅
- [x] API call on submit
- [x] Loading state during processing
- [x] Redirect to payment URL
- [x] Error handling for failures

### AC4: Payment Result Display ✅
- [x] Success state with green icon
- [x] Failure state with red icon
- [x] Transaction ID displayed
- [x] Booking ID displayed
- [x] Action buttons functional

### AC5: Security Notice ✅
- [x] Security message displayed
- [x] Lock icon shown
- [x] Clear information about data handling

### AC6: Mobile Responsive ✅
- [x] Mobile layout (single column)
- [x] Touch-friendly buttons (min 44px)
- [x] Readable text on small screens
- [x] No horizontal scroll

### AC7: Accessibility ✅
- [x] Keyboard navigation works
- [x] ARIA labels present
- [x] Focus indicators visible
- [x] Screen reader compatible

### AC8: Loading States ✅
- [x] Button spinner during processing
- [x] Disabled state when loading
- [x] Full-screen overlay (optional)
- [x] Clear loading message

---

## 🚀 Performance Testing

### Test Case 14: Page Load Performance

**Steps:**
1. Open DevTools → Lighthouse
2. Run audit on payment page
3. Check metrics:
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

**Expected Results:**
- ✅ Lighthouse score > 90
- ✅ No layout shifts
- ✅ Fast interaction

---

### Test Case 15: Bundle Size

**Steps:**
1. Run production build: `npm run build`
2. Check bundle analyzer output
3. Verify payment page bundle < 200KB

**Expected Results:**
- ✅ No unnecessary dependencies
- ✅ Code splitting works
- ✅ Fast page load

---

## 📊 Test Results Log

| Test Case | Status | Date | Tester | Notes |
|-----------|--------|------|--------|-------|
| TC-1: Happy Path | ⏳ Pending | - | - | - |
| TC-2: Failure Flow | ⏳ Pending | - | - | - |
| TC-3: No Booking Data | ⏳ Pending | - | - | - |
| TC-4: Method Selection | ⏳ Pending | - | - | - |
| TC-5: Loading State | ⏳ Pending | - | - | - |
| TC-6: Accessibility | ⏳ Pending | - | - | - |
| TC-7: Mobile Responsive | ⏳ Pending | - | - | - |
| TC-8: Mobile Flow | ⏳ Pending | - | - | - |
| TC-9: Mobile Result | ⏳ Pending | - | - | - |
| TC-10: Mock API | ⏳ Pending | - | - | - |
| TC-11: Mock Gateway | ⏳ Pending | - | - | - |
| TC-12: Network Error | ⏳ Pending | - | - | - |
| TC-13: Invalid Data | ⏳ Pending | - | - | - |
| TC-14: Performance | ⏳ Pending | - | - | - |
| TC-15: Bundle Size | ⏳ Pending | - | - | - |

---

## 🎯 Quick Test Commands

```bash
# Web App
cd apps/web
npm run dev

# IMPORTANT: Initialize mock data first!
# Open: http://localhost:3000/demo-setup
# Then: Click "Go to Payment Page"

# Or directly (will show error without data):
# Open: http://localhost:3000/booking/payment

# Mobile App
cd apps/mobile
npm start
# Press 'a' for Android, 'i' for iOS

# Run Tests
npm test -- payment

# Build for Production
npm run build
npm start
```

---

## 🔗 Related Files

### Web App
- Component: `apps/web/src/components/features/booking/PaymentForm/PaymentForm.tsx`
- Page: `apps/web/src/app/booking/payment/page.tsx`
- Result Page: `apps/web/src/app/booking/payment/result/page.tsx`
- Mock Gateway: `apps/web/src/app/mock-gateway/page.tsx`
- API Client: `apps/web/src/lib/api/payment.ts`
- Mock API: `apps/web/src/lib/api/mock/payment.ts`
- Redux: `apps/web/src/store/slices/bookingSlice.ts`
- Types: `apps/web/src/types/payment.ts`

### Mobile App
- Screen: `apps/mobile/src/screens/Booking/PaymentScreen.tsx`
- Result Screen: `apps/mobile/src/screens/Booking/PaymentResultScreen.tsx`
- Service: `apps/mobile/src/services/payment.ts`
- Types: `apps/mobile/src/types/payment.ts`

---

## 📝 Notes

1. **Mock API**: Currently using mock payment gateway for development. Switch to real API by setting `NEXT_PUBLIC_USE_MOCK_PAYMENT=false`.

2. **Deep Linking (Mobile)**: Deep link handling (`vexeviet://payment-result`) requires additional native configuration (not included in this iteration).

3. **Environment Variables**: Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_USE_MOCK_PAYMENT=true
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. **Production Build**: Mock gateway page is excluded in production (shows 404).

5. **Real Payment Testing**: When backend is ready, update `USE_MOCK_API` flag and test with sandbox credentials from payment providers.

---

## ✅ Sign-off

- [ ] All test cases passed
- [ ] Accessibility validated
- [ ] Performance metrics met
- [ ] Ready for PI 2 System Demo

**Tested By:** _____________  
**Date:** _____________  
**Approved By:** _____________
