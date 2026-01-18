# 🧪 Test Plan: Mobile Wallet & Notifications

## Test Environment

**Devices:**
- iOS Simulator (iPhone 14 Pro, iOS 16+)
- Android Emulator (Pixel 6, Android 12+)
- Real Device (Optional, recommended for notification testing)

**Test Data:**
- Mock bookings in `TicketWalletScreen.tsx` (lines 56-106)
- Booking ID: `VXV2024001`, `VXV2024002`

---

## Test Cases

### TC-01: Wallet Screen - Active Tickets Display

**Objective:** Verify active tickets display correctly

**Steps:**
1. Launch app
2. Default screen shows Ticket Wallet
3. Observe ticket cards

**Expected Results:**
- ✅ 2 active tickets visible (mock data)
- ✅ Orange gradient background (`#F97316` → `#EA580C` → `#C2410C`)
- ✅ Left and right circular perforations visible
- ✅ Booking code displayed in monospace font
- ✅ Route: "TP. Hồ Chí Minh → Đà Lạt" and "Hà Nội → Hải Phòng"
- ✅ Departure times shown
- ✅ Operator names: "Phương Trang", "Mai Linh"
- ✅ Seat numbers: "A1", "B2"
- ✅ Prices: "260.000 ₫", "188.000 ₫"
- ✅ "Vé đang hoạt động" badge visible

**Pass/Fail:** _______

---

### TC-02: Wallet Screen - Empty State

**Objective:** Verify empty state when no tickets exist

**Setup:**
```typescript
// In TicketWalletScreen.tsx, set:
const mockBookings: BookingDetails[] = [];
```

**Steps:**
1. Launch app
2. Observe empty state

**Expected Results:**
- ✅ Large ticket icon displayed (gray)
- ✅ "Chưa có vé nào" title
- ✅ "Đặt vé đầu tiên của bạn..." message
- ✅ "Đặt vé ngay" button visible and clickable

**Pass/Fail:** _______

---

### TC-03: Wallet Screen - Past Tickets Section

**Objective:** Verify past tickets section (collapsible)

**Setup:** Modify mock data to have past departure times

**Steps:**
1. Launch app
2. Scroll to "Vé đã sử dụng" section
3. Tap section header
4. Observe expansion

**Expected Results:**
- ✅ "Vé đã sử dụng" section visible
- ✅ Gray gradient tickets (`#9CA3AF` → `#6B7280`)
- ✅ Chevron icon rotates on tap
- ✅ Past tickets expand/collapse smoothly
- ✅ Badge shows count of past tickets

**Pass/Fail:** _______

---

### TC-04: Wallet Screen - Pull to Refresh

**Objective:** Verify pull-to-refresh functionality

**Steps:**
1. Launch app
2. Pull down from top of screen
3. Observe loading indicator
4. Release

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Tickets reload (console log shows re-fetch)
- ✅ UI updates smoothly
- ✅ Loading indicator disappears after refresh

**Pass/Fail:** _______

---

### TC-05: Navigation - Tap Ticket Card

**Objective:** Verify navigation to ticket detail

**Steps:**
1. Launch app
2. Tap any ticket card
3. Observe navigation

**Expected Results:**
- ✅ Navigation to "Chi tiết vé" screen
- ✅ Full ticket details displayed
- ✅ QR code rendered correctly
- ✅ Booking code matches tapped ticket
- ✅ All passenger info visible
- ✅ "Chia sẻ" and "Về trang chủ" buttons work

**Pass/Fail:** _______

---

### TC-06: Navigation - Profile Menu Integration

**Objective:** Verify wallet accessible from Profile

**Steps:**
1. Navigate to Profile screen
2. Tap "Ticket Wallet" menu item
3. Observe navigation

**Expected Results:**
- ✅ "Ticket Wallet" item at top of menu
- ✅ Credit card icon displayed
- ✅ Tapping navigates to Wallet screen
- ✅ Back button returns to Profile

**Pass/Fail:** _______

---

### TC-07: Notifications - Permission Request (First Launch)

**Objective:** Verify permission request on first use

**Setup:** Uninstall app, reinstall (fresh state)

**Steps:**
1. Launch app
2. Navigate to any ticket detail
3. Observe permission prompt

**Expected Results:**
- ✅ iOS: System alert appears requesting notification permission
- ✅ Android: System alert appears
- ✅ "Allow" option visible
- ✅ "Don't Allow" option visible

**Pass/Fail:** _______

---

### TC-08: Notifications - Permission Granted

**Objective:** Verify notification scheduling when granted

**Steps:**
1. Launch app
2. Grant notification permission
3. Navigate to ticket detail (booking ID: `VXV2024001`)
4. Check console logs

**Expected Results:**
- ✅ Console shows: "Notification scheduled: [ID] for [TIME]"
- ✅ No error messages
- ✅ App continues normally
- ✅ Ticket displays fully

**Pass/Fail:** _______

---

### TC-09: Notifications - Permission Denied

**Objective:** Verify graceful handling when permission denied

**Steps:**
1. Uninstall app, reinstall
2. Deny notification permission
3. Navigate to ticket detail
4. Observe app behavior

**Expected Results:**
- ✅ App does NOT crash
- ✅ Console shows: "Notification permission not granted"
- ✅ Ticket still displays correctly
- ✅ No error alerts shown to user
- ✅ All other features work normally

**Pass/Fail:** _______

---

### TC-10: Notifications - Scheduling Logic

**Objective:** Verify notification scheduled at correct time

**Setup:**
```typescript
// In useNotifications.ts, temporarily change to 1 minute:
const reminderTime = new Date(departureDate.getTime() - 1 * 60 * 1000);
```

**Steps:**
1. Launch app (with permissions granted)
2. Navigate to ticket with future departure time
3. Wait 1 minute
4. Observe notification

**Expected Results:**
- ✅ Notification appears after 1 minute
- ✅ Title: "🚌 Nhắc nhở chuyến đi"
- ✅ Body: "Chuyến xe [FROM] → [TO] sẽ khởi hành sau 1 giờ. Ghế: [SEATS]"
- ✅ Sound plays (default notification sound)
- ✅ Badge increments (iOS)

**Pass/Fail:** _______

---

### TC-11: Notifications - Past Departure Time

**Objective:** Verify notification NOT scheduled for past trips

**Setup:** Create booking with past departure time

**Steps:**
1. Launch app
2. Navigate to ticket with past departure
3. Check console logs

**Expected Results:**
- ✅ Console shows: "Reminder time is in the past, not scheduling"
- ✅ No notification scheduled
- ✅ No errors thrown
- ✅ Ticket displays normally

**Pass/Fail:** _______

---

### TC-12: Notifications - Payment Status Check

**Objective:** Verify notification only for PAID tickets

**Setup:**
```typescript
// In mock data, set paymentStatus: 'PENDING'
paymentStatus: 'PENDING'
```

**Steps:**
1. Launch app
2. Navigate to ticket detail
3. Check console logs

**Expected Results:**
- ✅ No notification scheduled (payment not PAID)
- ✅ Console shows appropriate message
- ✅ Ticket displays with "Chờ thanh toán" status

**Pass/Fail:** _______

---

### TC-13: Notifications - Android Channel Setup

**Objective:** Verify Android notification channel configured

**Platform:** Android only

**Steps:**
1. Launch app on Android
2. Grant notification permission
3. Navigate to ticket detail
4. Go to Android Settings → Apps → VeXeViet → Notifications

**Expected Results:**
- ✅ Notification channel "default" exists
- ✅ Importance: High
- ✅ Vibration enabled
- ✅ LED color: Orange (`#F97316`)

**Pass/Fail:** _______

---

### TC-14: Notifications - iOS Behavior

**Objective:** Verify iOS notification handling

**Platform:** iOS only

**Steps:**
1. Launch app on iOS
2. Grant notification permission
3. Schedule notification (1 minute test)
4. Lock device
5. Wait for notification

**Expected Results:**
- ✅ Notification appears on lock screen
- ✅ Banner shows while device unlocked
- ✅ Sound plays
- ✅ Badge on app icon updates
- ✅ Notification appears in Notification Center

**Pass/Fail:** _______

---

### TC-15: UI/UX - Ticket Card Styling

**Objective:** Verify visual design compliance

**Steps:**
1. Launch app
2. Examine ticket card design
3. Measure dimensions (use React DevTools)

**Expected Results:**
- ✅ Card width: Screen width - 32px
- ✅ Border radius: 16px
- ✅ Gradient: 3 colors (orange)
- ✅ Shadow visible (elevation 8)
- ✅ Perforation circles: 24px diameter
- ✅ Font sizes match spec:
  - Booking code: 16px, bold, monospace
  - Location: 18px, bold
  - Details: 14px, medium
- ✅ White text on gradient (sufficient contrast)

**Pass/Fail:** _______

---

### TC-16: UI/UX - Accessibility

**Objective:** Verify accessibility features

**Steps:**
1. Enable screen reader (VoiceOver/TalkBack)
2. Navigate through wallet screen
3. Test touch targets

**Expected Results:**
- ✅ All interactive elements have accessibility labels
- ✅ Screen reader announces ticket info correctly
- ✅ Touch targets ≥ 44x44 dp
- ✅ Color contrast ratio ≥ 4.5:1 (WCAG AA)
- ✅ Tab order logical

**Pass/Fail:** _______

---

### TC-17: Performance - Rendering

**Objective:** Verify performance with multiple tickets

**Setup:** Add 10+ tickets to mock data

**Steps:**
1. Launch app
2. Scroll through tickets
3. Observe frame rate (use Expo Performance Monitor)

**Expected Results:**
- ✅ No lag during scroll
- ✅ FPS > 50 (target: 60)
- ✅ No memory leaks
- ✅ Images load smoothly
- ✅ Gradient renders without flicker

**Pass/Fail:** _______

---

### TC-18: Error Handling - Network Failure

**Objective:** Verify error handling (future API integration)

**Setup:** Simulate network error in `fetchTickets()`

**Steps:**
1. Launch app
2. Trigger error
3. Observe error state

**Expected Results:**
- ✅ Error message displayed (currently Alert)
- ✅ Retry mechanism available
- ✅ App doesn't crash
- ✅ User can navigate away

**Pass/Fail:** _______

---

### TC-19: Integration - Ticket Detail Auto-Schedule

**Objective:** Verify automatic notification scheduling

**Steps:**
1. Launch app
2. Navigate: Profile → Booking History → View Ticket
3. Check console logs
4. Verify notification scheduled

**Expected Results:**
- ✅ Notification auto-scheduled on ticket load
- ✅ Only schedules once (not on every re-render)
- ✅ Console shows scheduling confirmation
- ✅ useEffect dependencies correct

**Pass/Fail:** _______

---

### TC-20: End-to-End - Full User Journey

**Objective:** Complete user flow from profile to notification

**Steps:**
1. Launch app
2. Navigate: Profile → Ticket Wallet
3. View active tickets
4. Tap ticket card
5. View ticket detail with QR code
6. Verify notification scheduled (check console)
7. Wait for notification (1 minute test)
8. Tap notification
9. Observe app state

**Expected Results:**
- ✅ All navigation smooth
- ✅ No crashes or errors
- ✅ Notification appears on time
- ✅ Tapping notification opens app
- ✅ Data persists across navigation
- ✅ UI responsive throughout

**Pass/Fail:** _______

---

## Test Summary

| Category | Total Tests | Passed | Failed | Blocked |
|----------|-------------|--------|--------|---------|
| UI/UX | 4 | | | |
| Navigation | 3 | | | |
| Notifications | 8 | | | |
| Integration | 3 | | | |
| Performance | 1 | | | |
| Error Handling | 1 | | | |
| **TOTAL** | **20** | | | |

---

## Bug Report Template

```markdown
### Bug: [Short Description]

**Test Case:** TC-XX  
**Severity:** Critical / High / Medium / Low  
**Platform:** iOS / Android / Both

**Steps to Reproduce:**
1. ...
2. ...

**Expected Result:**
- ...

**Actual Result:**
- ...

**Screenshot:** [Attach if applicable]

**Console Logs:**
```
[Paste logs here]
```

**Environment:**
- Device: ...
- OS Version: ...
- App Version: ...
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | Antigravity AI | 2026-01-14 | ✓ |
| QA Lead | | | |
| Product Owner | | | |
| Scrum Master | | | |

---

## Notes

- All tests assume mock data (API integration pending)
- Notification timing modified for testing (1 minute instead of 1 hour)
- Real device testing recommended for production validation
- Accessibility testing requires screen reader enabled
- Performance testing requires Expo DevTools
