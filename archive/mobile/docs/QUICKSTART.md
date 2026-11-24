# 🚀 Quick Setup: Wallet & Notifications

## Prerequisites
- Node.js 20+
- Expo CLI
- iOS Simulator or Android Emulator

## Installation

```bash
cd apps/mobile

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run ios
# or
npm run android
```

## Testing Notifications Locally

### 1. Enable Notification Permissions

When app launches for the first time, it will request notification permissions. **Grant** them.

### 2. Quick Test (Schedule notification in 1 minute)

Edit `apps/mobile/src/hooks/useNotifications.ts`:

```typescript
// Line 107 - Change from 1 hour to 1 minute
const reminderTime = new Date(departureDate.getTime() - 1 * 60 * 1000);
```

### 3. Create Test Ticket

1. Navigate to **Ticket Wallet** (default screen)
2. Mock data includes 2 tickets
3. Tap a ticket → View detail
4. Notification will appear in 1 minute (with modified code)

### 4. View Notification

**iOS Simulator:**
- Notification appears in banner at top
- Swipe down from top to see Notification Center
- Click notification to open app

**Android Emulator:**
- Notification appears in status bar
- Pull down notification drawer
- Tap notification to open app

## Wallet Features

### View Active Tickets
```
App Launch → Shows Ticket Wallet by default
- Active tickets at top (orange gradient)
- Past tickets below (gray, collapsible)
```

### Navigate to Ticket Detail
```
Tap any ticket card → Full detail view with QR code
```

### Refresh Tickets
```
Pull down from top → Reload tickets
```

## File Structure

```
apps/mobile/
├── src/
│   ├── hooks/
│   │   └── useNotifications.ts          # Notification logic
│   ├── screens/
│   │   ├── Booking/
│   │   │   └── TicketScreen.tsx         # Auto-schedules notification
│   │   └── Profile/
│   │       ├── TicketWalletScreen.tsx   # Wallet UI
│   │       └── ProfileScreen.tsx        # Links to wallet
│   ├── services/
│   │   └── bookingService.ts            # Mock data
│   └── types/
│       └── booking.ts                   # TypeScript types
├── App.tsx                               # Navigation setup
└── package.json                          # Dependencies
```

## Troubleshooting

### Notification not appearing?

1. **Check permissions:**
   ```typescript
   console.log('Permission status:', permissionStatus);
   // Should show: { granted: true, ... }
   ```

2. **Check scheduling:**
   ```typescript
   // In TicketScreen.tsx, add console.log
   console.log('Scheduling notification for:', reminderTime);
   ```

3. **Verify time is in future:**
   ```typescript
   const now = new Date();
   const reminderTime = new Date(...);
   console.log('Now:', now);
   console.log('Reminder:', reminderTime);
   console.log('In future?', reminderTime > now);
   ```

### Wallet showing empty state?

The wallet uses mock data. Check `TicketWalletScreen.tsx` line 56-106.

To test empty state:
```typescript
// Set mockBookings to empty array
const mockBookings: BookingDetails[] = [];
```

### Navigation not working?

Ensure `App.tsx` has all routes:
```typescript
<Stack.Screen name="TicketWallet" component={TicketWalletScreen} />
<Stack.Screen name="Ticket" component={TicketScreen} />
```

## Demo Scenario

### Full User Journey Test

1. **Open app** → Shows Ticket Wallet
2. **View active tickets** → See 2 tickets with orange gradient
3. **Scroll down** → See "Vé đã sử dụng" section
4. **Tap section header** → Expand past tickets (currently empty in mock)
5. **Tap an active ticket** → Navigate to detail view
6. **View QR code** → Should render booking code
7. **Wait 1 minute** (with modified code) → Notification appears
8. **Tap notification** → App opens (deep link not yet implemented)
9. **Go back** → Tap "Về trang chủ" to reset navigation
10. **Navigate via Profile** → Profile → Ticket Wallet

## Code Review Checklist

- [ ] TypeScript types are strict (no `any`)
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] Permissions denied gracefully
- [ ] No console errors
- [ ] Styling matches design specs
- [ ] Accessibility labels present
- [ ] Performance optimized (no unnecessary re-renders)

## Ready for Production?

### Checklist
- [ ] Replace mock data with real API
- [ ] Add deep linking for notifications
- [ ] Test on real devices (iOS + Android)
- [ ] Add analytics tracking
- [ ] Configure notification icon/sound
- [ ] Add error logging (Sentry, etc.)
- [ ] Performance testing
- [ ] Accessibility audit

## Next Steps

1. **Code Review** → Team 2 reviews implementation
2. **QA Testing** → Test on real devices
3. **API Integration** → Connect to backend services
4. **Demo** → Show in System Demo (Iteration 2-5)

---

**Questions?** Check `MOBILE-WALLET-NOTIFICATIONS.md` for detailed documentation.
