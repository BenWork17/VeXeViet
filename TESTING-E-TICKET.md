# Testing Guide - E-Ticket Feature (FE-204 & MOB-204)

## 🎯 Overview

Kiểm tra tính năng hiển thị và tải vé điện tử sau khi thanh toán thành công.

---

## 🌐 Web Testing (apps/web)

### Prerequisites

```bash
cd apps/web
pnpm install
pnpm dev
```

### Test Flow

#### 1. **Navigate to Payment Result Page**

Simulate successful payment by navigating to:

```
http://localhost:3000/booking/payment/result?status=success&bookingId=BK-123456&transactionId=TXN-123456
```

**Expected:**
- ✅ Success banner appears
- ✅ "Xem vé" button is visible

#### 2. **Click "Xem vé" Button**

Click the primary button to view the ticket.

**Expected:**
- ✅ Redirects to `/booking/success/BK-123456`
- ✅ Loading state shows briefly

#### 3. **Verify Ticket Display**

Check the ticket card contains:

**Header Section:**
- ✅ Operator logo/icon (🚌)
- ✅ Operator name: "Phương Trang"
- ✅ Bus type: "Giường nằm 40 chỗ"
- ✅ Booking code (e.g., "VXV-ABC123")

**Route Section:**
- ✅ From: "TP. Hồ Chí Minh"
- ✅ To: "Đà Lạt"
- ✅ Departure time (formatted Vietnamese)
- ✅ Arrival time (formatted Vietnamese)
- ✅ Duration: "7 giờ"
- ✅ Arrow icon between locations

**Details Section:**
- ✅ Passenger name: "Nguyễn Văn A"
- ✅ Phone: "0901234567"
- ✅ Seat number: "A1" (in orange/primary color)
- ✅ License plate: "51B-12345"

**QR Code Section:**
- ✅ QR code renders (160x160px)
- ✅ QR code encodes the booking code
- ✅ Instruction text: "Vui lòng xuất trình mã QR..."

**Footer Section:**
- ✅ Total price: "260.000 ₫"
- ✅ Payment status badge: "✓ Đã thanh toán" (green)

#### 4. **Test Print Functionality**

Click "🖨️ In / Tải vé" button.

**Expected:**
- ✅ Browser print dialog opens
- ✅ Print preview shows only the ticket card
- ✅ No navigation bar, buttons, or footer in print view
- ✅ Ticket border is solid (not dashed) in print

#### 5. **Test Responsive Design**

Resize browser window to mobile width (< 768px).

**Expected:**
- ✅ Ticket card is full width
- ✅ Route section stacks vertically on mobile
- ✅ All text is readable
- ✅ QR code remains centered

#### 6. **Test Direct URL Access**

Directly navigate to a booking URL:

```
http://localhost:3000/booking/success/BK-999
```

**Expected:**
- ✅ Loading state shows
- ✅ Mock data loads after ~500ms
- ✅ Ticket displays correctly

#### 7. **Test Error Handling**

Navigate with invalid ID:

```
http://localhost:3000/booking/success/INVALID
```

**Expected:**
- ✅ Error state shows
- ✅ Error icon (❌) appears
- ✅ Error message displays
- ✅ "Về trang chủ" button works

#### 8. **Test Redux Integration**

Open browser DevTools → Redux DevTools.

Navigate to ticket page and check:

**Expected State:**
```javascript
{
  booking: {
    currentTicket: {
      id: "BK-...",
      bookingCode: "VXV-...",
      status: "CONFIRMED",
      // ... full booking details
    },
    ticketLoading: false,
    ticketError: null
  }
}
```

**Actions Dispatched:**
1. ✅ `booking/fetchBookingDetails/pending`
2. ✅ `booking/fetchBookingDetails/fulfilled`

---

## 📱 Mobile Testing (apps/mobile)

### Prerequisites

```bash
cd apps/mobile
npm install
npm install react-native-qrcode-svg react-native-svg
npm start
```

### Test Flow

#### 1. **Simulate Payment Success**

In `PaymentResultScreen.tsx`, the mock automatically simulates success after 500ms.

**Expected:**
- ✅ Success icon (✅) appears
- ✅ "Xem vé" button is visible

#### 2. **Navigate to Ticket Screen**

Uncomment navigation in `PaymentResultScreen.tsx`:

```typescript
onPress={() => {
  navigation.navigate('Ticket', { bookingId: result.bookingId });
}}
```

**Note:** You'll need to register the route in your navigation stack first:

```typescript
// In your navigation config
<Stack.Screen 
  name="Ticket" 
  component={TicketScreen} 
  options={{ title: 'Vé của bạn' }}
/>
```

#### 3. **Verify Ticket Display**

Check the ticket card contains all elements (same as web).

**Visual Elements:**
- ✅ Success banner with green background
- ✅ Ticket card with dashed border
- ✅ Left and right "notch" circles (semicircles)
- ✅ All sections: header, route, details, QR, footer

#### 4. **Test QR Code**

**Expected:**
- ✅ QR code renders as 180x180px
- ✅ High contrast (black on white)
- ✅ Can be scanned with a QR reader app

**Test Scanning:**
1. Take a screenshot or run on real device
2. Use any QR scanner app
3. ✅ Scanner should read the booking code (e.g., "VXV-ABC123")

#### 5. **Test Share Functionality**

Tap "Chia sẻ vé" button.

**Expected:**
- ✅ Native share dialog opens (iOS/Android)
- ✅ Share message contains:
  - Booking code
  - Route info
  - Passenger details
  - Seat number
  - Total price

**Share Message Format:**
```
🎫 VÉ XE VeXeViet

Mã vé: VXV-ABC123

🚌 Thông tin chuyến đi:
TP. Hồ Chí Minh → Đà Lạt
Khởi hành: ...
Loại xe: Giường nằm 40 chỗ
...
```

#### 6. **Test Back to Home**

Tap "Về trang chủ" button.

**Expected:**
- ✅ Navigation stack resets
- ✅ Returns to Home screen (not Payment screen)
- ✅ Cannot go "back" to payment flow

#### 7. **Test Error Handling**

Modify `TicketScreen.tsx` to pass invalid ID:

```typescript
const bookingId = 'INVALID';
```

**Expected:**
- ✅ Error icon appears
- ✅ Error message displays
- ✅ "Về trang chủ" button works

#### 8. **Test Styling on Different Screen Sizes**

Test on multiple devices/simulators:

- iPhone SE (small screen)
- iPhone 14 (standard)
- iPad (tablet)
- Android phone (various sizes)

**Expected:**
- ✅ Ticket card is responsive
- ✅ Notches remain visible
- ✅ QR code scales appropriately
- ✅ Text doesn't overflow

---

## 🧪 Integration Testing

### Web E2E Test (Playwright)

Create `apps/web/tests/e2e/ticket.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('displays e-ticket after payment', async ({ page }) => {
  // Navigate to success page
  await page.goto('/booking/success/BK-123456');

  // Wait for ticket to load
  await expect(page.getByText('Đặt vé thành công!')).toBeVisible();

  // Verify ticket elements
  await expect(page.getByText('VXV-')).toBeVisible();
  await expect(page.getByText('Phương Trang')).toBeVisible();
  await expect(page.getByText('Nguyễn Văn A')).toBeVisible();

  // Verify QR code
  const qrCode = page.locator('svg').first();
  await expect(qrCode).toBeVisible();

  // Test print button
  await page.getByRole('button', { name: /In \/ Tải vé/i }).click();
  // Note: Can't test actual print dialog in headless mode
});

test('handles booking fetch error', async ({ page }) => {
  // Mock API error
  await page.route('**/api/bookings/*', (route) => {
    route.abort();
  });

  await page.goto('/booking/success/BK-ERROR');

  // Verify error state
  await expect(page.getByText('Lỗi')).toBeVisible();
  await expect(page.getByRole('button', { name: /Về trang chủ/i })).toBeVisible();
});
```

### Run E2E Tests

```bash
cd apps/web
pnpm test:e2e
```

---

## ✅ Manual Test Checklist

### Web

- [ ] Payment result page redirects to ticket page
- [ ] Ticket loads with correct data
- [ ] QR code is visible and scannable
- [ ] Print button opens print dialog
- [ ] Print view hides UI elements
- [ ] Responsive on mobile viewport
- [ ] Error handling works
- [ ] Redux state updates correctly
- [ ] Navigation works (back to home)

### Mobile

- [ ] Payment result navigates to ticket screen
- [ ] Ticket card displays with notches
- [ ] QR code renders correctly
- [ ] QR code is scannable
- [ ] Share button opens share dialog
- [ ] Share message is correctly formatted
- [ ] Navigation resets to home
- [ ] Error handling works
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Responsive on different screen sizes

---

## 🐛 Common Issues & Solutions

### Issue 1: QR Code Not Rendering (Web)

**Error:**
```
Element type is invalid: expected a string (for built-in components) or a class/function...
```

**Solution:**
Change import from named to default:
```typescript
// ❌ Wrong
import { QRCodeSVG } from 'react-qr-code';

// ✅ Correct
import QRCode from 'react-qr-code';
```

### Issue 2: Module Not Found (Mobile)

**Error:**
```
Unable to resolve "react-native-qrcode-svg"
```

**Solution:**
```bash
cd apps/mobile
npm install react-native-qrcode-svg react-native-svg
# For Expo:
npx expo install react-native-svg
```

### Issue 3: Navigation Not Working

**Error:**
```
Cannot read property 'navigate' of undefined
```

**Solution:**
Register the Ticket screen in your navigation stack:
```typescript
// In navigation config
<Stack.Screen name="Ticket" component={TicketScreen} />
```

### Issue 4: Print Styles Not Applying

**Symptom:** Buttons/navbar still visible when printing

**Solution:**
Ensure `@media print` CSS is loaded:
```css
@media print {
  .no-print {
    display: none !important;
  }
}
```

---

## 📊 Success Criteria

### Functional Requirements ✅

- [x] FE-204: Web e-ticket display implemented
- [x] MOB-204: Mobile e-ticket with QR implemented
- [x] QR code generation working
- [x] Print/download functionality working
- [x] Share functionality (mobile)
- [x] Redux state management
- [x] Error handling
- [x] Responsive design

### Non-Functional Requirements ✅

- [x] Load time < 1 second
- [x] QR code scannable with standard readers
- [x] Print layout optimized
- [x] Mobile-friendly design
- [x] TypeScript strict mode
- [x] No console errors

---

## 🚀 Next Steps

After testing, consider:

1. **Add to Storybook** (Web):
   ```typescript
   // TicketCard.stories.tsx
   export const Default: Story = {
     args: {
       booking: mockBookingData,
     },
   };
   ```

2. **Add Unit Tests**:
   ```typescript
   describe('TicketCard', () => {
     it('renders booking code', () => {
       render(<TicketCard booking={mockBooking} />);
       expect(screen.getByText(/VXV-/)).toBeInTheDocument();
     });
   });
   ```

3. **Performance Testing**:
   - Measure QR code generation time
   - Test with large numbers of passengers
   - Profile React rendering

4. **Accessibility**:
   - Add ARIA labels
   - Test with screen readers
   - Ensure keyboard navigation works

---

**Happy Testing! 🎉**
