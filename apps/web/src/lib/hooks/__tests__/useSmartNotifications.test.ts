import { describe, expect, it } from 'vitest';
import { deriveSmartNotifications } from '../useSmartNotifications';

describe('deriveSmartNotifications', () => {
  const now = new Date('2026-11-24T10:00:00.000Z');

  it('derives active seat hold, pending payment, upcoming trip, review eligibility, reply, and unverified email', () => {
    const items = deriveSmartNotifications({
      now,
      user: {
        id: 'user-1',
        email: 'khach@vexeviet.vn',
        isEmailVerified: false,
      },
      seatHold: {
        holdId: 'hold-99',
        holdExpiresAt: '2026-11-24T10:12:00.000Z',
        routeId: 'route-1',
        seats: ['A01', 'A02'],
      },
      bookings: [
        {
          id: 'b-pending',
          bookingCode: 'VXV100001',
          status: 'PENDING',
          createdAt: '2026-11-24T09:50:00.000Z',
          route: {
            id: 'r1',
            origin: 'TP.HCM',
            destination: 'Đà Lạt',
            departureTime: '2026-11-26T22:00:00.000Z',
            arrivalTime: '2026-11-27T04:00:00.000Z',
            busType: 'SLEEPER',
            licensePlate: '51B-12345',
            duration: 360,
            price: 300000,
          },
        },
        {
          id: 'b-upcoming',
          bookingCode: 'VXV100002',
          status: 'CONFIRMED',
          route: {
            id: 'r2',
            origin: 'Hà Nội',
            destination: 'Sa Pa',
            departureTime: '2026-11-25T06:00:00.000Z',
            arrivalTime: '2026-11-25T12:00:00.000Z',
            busType: 'LIMOUSINE',
            licensePlate: '29B-99999',
            duration: 360,
            price: 420000,
          },
        },
        {
          id: 'b-completed',
          bookingCode: 'VXV100003',
          status: 'COMPLETED',
          updatedAt: '2026-11-23T15:00:00.000Z',
          route: {
            id: 'r3',
            origin: 'Đà Nẵng',
            destination: 'Huế',
            departureTime: '2026-11-23T08:00:00.000Z',
            arrivalTime: '2026-11-23T10:30:00.000Z',
            busType: 'VIP',
            licensePlate: '43B-88888',
            duration: 150,
            price: 180000,
          },
        },
      ],
      eligibilityMap: {
        'b-completed': {
          canReview: true,
          reason: null,
          review: null,
        },
        'b-upcoming': {
          canReview: false,
          reason: 'ALREADY_REVIEWED',
          review: {
            id: 'rev-1',
            rating: 5,
            comment: 'Xe êm',
            createdAt: '2026-11-24T08:00:00.000Z',
            operatorReply: 'Cảm ơn quý khách đã đồng hành!',
            repliedAt: '2026-11-24T09:00:00.000Z',
          },
        },
      },
      readIds: new Set(['booking-pending:b-pending']),
    });

    const ids = items.map((i) => i.id);
    expect(ids).toEqual([
      'hold:hold-99',
      'booking-pending:b-pending',
      'trip-upcoming:b-upcoming',
      'review-reply:b-upcoming',
      'review-eligible:b-completed',
      'security:unverified-email:user-1',
    ]);

    const pendingItem = items.find((i) => i.id === 'booking-pending:b-pending');
    expect(pendingItem?.unread).toBe(false);
    expect(pendingItem?.actionHref).toBe('/booking/payment?bookingId=b-pending');

    const holdItem = items.find((i) => i.id === 'hold:hold-99');
    expect(holdItem?.unread).toBe(true);
    expect(holdItem?.title).toContain('A01, A02');
  });

  it('respects category preferences and ignores expired seat holds', () => {
    const items = deriveSmartNotifications({
      now,
      user: {
        id: 'user-1',
        email: 'khach@vexeviet.vn',
        isEmailVerified: false,
      },
      seatHold: {
        holdId: 'expired-hold',
        holdExpiresAt: '2026-11-24T09:59:00.000Z',
      },
      preferences: {
        booking: true,
        trip: false,
        security: false,
      },
    });

    expect(items).toEqual([]);
  });
});
