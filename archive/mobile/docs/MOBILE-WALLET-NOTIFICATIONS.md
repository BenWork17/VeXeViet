# Mobile Wallet & Notifications - Implementation Guide

## 📋 Overview

This implementation covers **MOB-206 (Ticket Wallet)** and **MOB-205 (Push Notifications Setup)** for the VeXeViet mobile app.

## ✨ Features Implemented

### 1. Ticket Wallet Screen (`TicketWalletScreen.tsx`)

**Location:** `apps/mobile/src/screens/Profile/TicketWalletScreen.tsx`

**Features:**
- **Visual Ticket Cards:** Gradient-styled cards mimicking physical tickets
- **Perforation Design:** Left and right circular notches for realistic appearance
- **Active vs Past Tickets:** Automatic categorization based on departure time
- **Collapsible Past Tickets:** Toggle to show/hide past tickets
- **Empty State:** Friendly UI when no tickets exist
- **Pull to Refresh:** Swipe down to reload tickets
- **Navigation Integration:** Tap any ticket to view full details with QR code

**UI Highlights:**
- Active tickets: Orange gradient (`#F97316` → `#EA580C` → `#C2410C`)
- Past tickets: Gray gradient (`#9CA3AF` → `#6B7280` → `#4B5563`)
- Route visualization with arrow and duration
- Payment status badge
- QR code preview icon

### 2. Notification Hook (`useNotifications.ts`)

**Location:** `apps/mobile/src/hooks/useNotifications.ts`

**Capabilities:**
- **Permission Management:** Request and track notification permissions
- **Local Notifications:** Schedule trip reminders using `expo-notifications`
- **Android Channel Setup:** Configure notification channel for Android
- **iOS Support:** Handle iOS notification permissions
- **Graceful Degradation:** Handle denied permissions without crashing

**Key Functions:**
```typescript
scheduleTripReminder(
  departureTime: string,
  bookingCode: string,
  from: string,
  to: string,
  seatNumbers: string
): Promise<string | null>
```
- Schedules notification 1 hour before departure
- Returns notification ID for future cancellation
- Validates that reminder time is in the future

```typescript
cancelNotification(notificationId: string): Promise<void>
```
- Cancel a specific scheduled notification

```typescript
requestPermissions(): Promise<boolean>
```
- Request notification permissions from user

### 3. Integration with Existing Screens

**TicketScreen.tsx:**
- Automatically schedules trip reminder when ticket is loaded
- Only schedules if:
  - Payment status is `PAID`
  - Notification permission is granted
  - Departure time is in the future

**ProfileScreen.tsx:**
- Added "Ticket Wallet" menu item at the top
- Uses `credit-card` icon for visual consistency

**App.tsx:**
- Added navigation routes for:
  - `TicketWallet` screen
  - `Ticket` screen (detail view)

## 📦 Dependencies Added

```json
{
  "expo-notifications": "~0.30.8",
  "expo-linear-gradient": "~14.0.3"
}
```

## 🚀 Installation

1. **Install dependencies:**
   ```bash
   cd apps/mobile
   npm install
   # or
   pnpm install
   ```

2. **Configure app.json for notifications (if not already done):**
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-notifications",
           {
             "icon": "./assets/notification-icon.png",
             "color": "#F97316",
             "sounds": ["./assets/notification-sound.wav"]
           }
         ]
       ]
     }
   }
   ```

3. **Run the app:**
   ```bash
   npm run ios
   # or
   npm run android
   ```

## 🧪 Testing Guide

### Test Ticket Wallet

1. **Launch the app**
2. **Navigate to Profile → Ticket Wallet**
3. **Verify UI:**
   - Active tickets appear at top with orange gradient
   - Past tickets appear below in gray (collapsible)
   - Empty state shows when no tickets exist

4. **Tap a ticket card:**
   - Should navigate to detailed ticket view
   - QR code should render correctly

5. **Pull down to refresh:**
   - Loading indicator should appear
   - Tickets should reload

### Test Notifications

1. **First Time User:**
   ```
   - App requests notification permission on first ticket creation
   - If denied, app continues without crash
   - If granted, notification scheduled
   ```

2. **Verify Scheduling:**
   ```typescript
   // In TicketScreen, check console logs:
   console.log('Notification scheduled:', notificationId, 'for', reminderTime);
   ```

3. **Test Reminder (Quick Test):**
   - Modify `useNotifications.ts` line 107 to test immediately:
   ```typescript
   // Change from 1 hour to 1 minute for testing
   const reminderTime = new Date(departureDate.getTime() - 1 * 60 * 1000);
   ```
   - Create a booking with departure time 5 minutes in the future
   - Wait 1 minute, notification should appear

4. **Permission Handling:**
   - Deny permissions → App should still work, just no notifications
   - Grant permissions → Notifications should be scheduled
   - Revoke in system settings → App should detect and update status

### Test Edge Cases

1. **Past Departure Time:**
   - Create booking with past departure time
   - Verify notification is NOT scheduled (check console)

2. **Multiple Tickets:**
   - Create 3+ bookings
   - Verify all appear in wallet
   - Verify sorting (active tickets first, then by date)

3. **Permission Changes:**
   - Grant permission
   - Create ticket (notification scheduled)
   - Revoke permission in system settings
   - Create another ticket (should gracefully skip scheduling)

## 📱 User Flow

```
1. User books ticket → Payment successful
   ↓
2. TicketScreen loads → Auto-schedule reminder
   ↓
3. User can access ticket from:
   - Profile → Ticket Wallet → Tap card
   - Booking History → View ticket
   ↓
4. 1 hour before departure:
   - Notification appears
   - "🚌 Nhắc nhở chuyến đi"
   - "Chuyến xe HCM → Đà Lạt sẽ khởi hành sau 1 giờ"
   ↓
5. User taps notification → Opens app (future enhancement)
```

## 🎨 Design Specifications

### Ticket Card Dimensions
- Width: `Screen Width - 32px` (16px margin on each side)
- Border Radius: `16px`
- Shadow: Elevation 8 (Android) / Shadow opacity 0.3 (iOS)

### Colors
- **Active Ticket Gradient:**
  - Start: `#F97316` (Orange)
  - Middle: `#EA580C` (Dark Orange)
  - End: `#C2410C` (Burnt Orange)

- **Past Ticket Gradient:**
  - Start: `#9CA3AF` (Gray)
  - Middle: `#6B7280` (Dark Gray)
  - End: `#4B5563` (Darker Gray)

- **Perforation Background:** `#F9FAFB` (matches app background)

### Typography
- **Ticket Code:** 16px, Bold, Monospace, White
- **Location Name:** 18px, Bold, White
- **Time Text:** 12px, Regular, White (90% opacity)
- **Detail Text:** 14px, Medium, White

## 🔧 Configuration

### Notification Settings

Edit `apps/mobile/src/hooks/useNotifications.ts`:

```typescript
// Change reminder time (default: 1 hour)
const reminderTime = new Date(departureDate.getTime() - 60 * 60 * 1000);

// Change notification title/body
title: '🚌 Nhắc nhở chuyến đi',
body: `Chuyến xe ${from} → ${to} sẽ khởi hành sau 1 giờ. Ghế: ${seatNumbers}`,

// Change notification sound
sound: 'default', // or custom sound file
```

### Mock Data

The wallet currently uses mock data in `TicketWalletScreen.tsx` (line 56-106).

**To connect to real API:**
1. Create `getActiveTickets()` in `services/bookingService.ts`
2. Replace mock data with API call:
   ```typescript
   const { active, past } = await getActiveTickets(userId);
   setActiveTickets(active);
   setPastTickets(past);
   ```

## 🐛 Known Issues & Future Enhancements

### Known Issues
- Mock data currently used instead of real API
- Notification tap doesn't navigate to specific ticket (deep linking needed)
- No background fetch for updated ticket status

### Future Enhancements
1. **Deep Linking:**
   - Tap notification → Open specific ticket
   - Handle URL schemes: `vexeviet://ticket/{bookingCode}`

2. **Background Sync:**
   - Periodically fetch updated ticket status
   - Cancel notifications for cancelled tickets

3. **Rich Notifications:**
   - Add route map image to notification
   - Quick actions: "View Ticket", "Cancel Booking"

4. **Offline Support:**
   - Cache tickets locally
   - Show cached data when offline

5. **Analytics:**
   - Track notification open rate
   - Measure wallet engagement

## 📞 Support

For questions or issues:
- **Team:** Mobile Team (Team 2)
- **Iteration:** PI 1 - Iteration 2-5
- **Features:** MOB-206, MOB-205

## 🎯 Success Criteria

- [x] Wallet displays active tickets prominently
- [x] Visual design mimics physical ticket
- [x] Tapping ticket opens detailed view
- [x] Notifications scheduled 1 hour before departure
- [x] Permission denial handled gracefully
- [x] Past tickets collapsible
- [x] Empty state shown when no tickets
- [x] Pull-to-refresh works

## 📸 Screenshots

*Note: Screenshots should be added to `docs/screenshots/mobile/` directory*

- `wallet-active.png` - Active tickets view
- `wallet-empty.png` - Empty state
- `wallet-past-expanded.png` - Past tickets expanded
- `notification.png` - Trip reminder notification
- `ticket-detail.png` - Full ticket with QR code
