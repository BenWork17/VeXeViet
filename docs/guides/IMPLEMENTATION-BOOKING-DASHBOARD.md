# Web Booking Management

## Features Implemented

### FE-205: Booking Dashboard (`/profile/bookings`)

**Route:** [`apps/web/src/app/(main)/profile/bookings/page.tsx`](file:///d:/Vexeonline/apps/web/src/app/(main)/profile/bookings/page.tsx)

**Features:**
- ✅ **Tab Navigation:** "Upcoming Trips" vs "Past Trips"
- ✅ **Booking Cards:** Display route, date, seat, price, status
- ✅ **Status Badges:** 
  - Green (Confirmed)
  - Yellow (Pending)
  - Red (Cancelled)
- ✅ **Empty State:** Friendly message with "Book a Trip" CTA
- ✅ **Responsive Layout:** Mobile-first design

### FE-206: Cancellation Flow

**Modal:** AlertDialog (Radix UI)  
**Policy Warning:**
- More than 24h: 90% refund
- 12-24h: 50% refund
- Less than 12h: No refund

**Features:**
- ✅ **Validation:** Only confirmed bookings >24h can be cancelled
- ✅ **Toast Notifications:** Success/error feedback
- ✅ **Auto-refresh:** Booking list updates after cancellation

### Mock API Updates

**File:** [`apps/web/src/lib/api/mock/booking.ts`](file:///d:/Vexeonline/apps/web/src/lib/api/mock/booking.ts)

**New Methods:**
- ✅ `getBookingHistory(userId)`: Returns sorted bookings (upcoming first)
- ✅ `cancelBooking(bookingId)`: Handles cancellation logic with refund calculation

**Sample Data:**
- 4 mock bookings (Confirmed, Pending, Past, Cancelled)
- Includes multiple operators, routes, passengers

### UI Components

**New Components:**
- [`apps/web/src/components/ui/badge.tsx`](file:///d:/Vexeonline/apps/web/src/components/ui/badge.tsx) - Status badges with custom variants
- [`apps/web/src/components/ui/alert-dialog.tsx`](file:///d:/Vexeonline/apps/web/src/components/ui/alert-dialog.tsx) - Modal for confirmations

**Dependencies Added:**
- `@radix-ui/react-alert-dialog@^1.0.5`
- `class-variance-authority@^0.7.0`

## Usage

### Access the Dashboard
1. Login at `/login`
2. Navigate to `/profile` → Click "My Bookings"
3. Or directly visit `/profile/bookings`

### Cancel a Booking
1. View "Upcoming Trips" tab
2. Click "Cancel Booking" on confirmed booking (>24h before departure)
3. Review cancellation policy in modal
4. Confirm cancellation
5. See success toast and updated booking list

## Testing

```bash
cd apps/web
npm run dev
# Visit http://localhost:3000/profile/bookings
```

**Test Scenarios:**
1. ✅ View upcoming bookings
2. ✅ View past bookings
3. ✅ Cancel confirmed booking
4. ✅ See empty state (no bookings)
5. ✅ View E-Ticket link
6. ✅ Status badges display correctly

## Screenshots

**Booking Dashboard - Upcoming Trips:**
- Shows upcoming bookings sorted by date
- Cancel button only for eligible bookings
- Badge colors match status

**Cancellation Modal:**
- Clear policy warning
- Two-button confirmation ("Keep Booking" / "Yes, Cancel")
- Red accent for destructive action

**Toast Notification:**
- Green for success (with refund amount)
- Red for errors
- Auto-dismisses after 5 seconds

## Files Changed

1. [`apps/web/src/app/(main)/profile/bookings/page.tsx`](file:///d:/Vexeonline/apps/web/src/app/(main)/profile/bookings/page.tsx) - New dashboard page
2. [`apps/web/src/lib/api/mock/booking.ts`](file:///d:/Vexeonline/apps/web/src/lib/api/mock/booking.ts) - Updated API with cancellation
3. [`apps/web/src/components/ui/badge.tsx`](file:///d:/Vexeonline/apps/web/src/components/ui/badge.tsx) - New component
4. [`apps/web/src/components/ui/alert-dialog.tsx`](file:///d:/Vexeonline/apps/web/src/components/ui/alert-dialog.tsx) - New component
5. [`apps/web/src/components/ui/index.ts`](file:///d:/Vexeonline/apps/web/src/components/ui/index.ts) - Export updates
6. [`apps/web/src/app/(main)/profile/page.tsx`](file:///d:/Vexeonline/apps/web/src/app/(main)/profile/page.tsx) - Navigation update
7. [`apps/web/package.json`](file:///d:/Vexeonline/apps/web/package.json) - Dependencies
8. [`apps/mobile/package.json`](file:///d:/Vexeonline/apps/mobile/package.json) - Fix react-native-svg version

## Next Steps

1. ✅ Connect to real API (replace mock)
2. ✅ Add booking filters (by date, status, operator)
3. ✅ Implement pagination for large booking lists
4. ✅ Add booking modification flow
5. ✅ Email notifications for cancellations
