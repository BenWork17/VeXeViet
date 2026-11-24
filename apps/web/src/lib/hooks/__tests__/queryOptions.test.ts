import { describe, expect, it } from 'vitest';
import { API_ENDPOINTS } from '@vexeviet/types';
import { bookingQueries } from '../useBookings';
import { reviewQueries } from '../useReviews';
import { routeQueries } from '../useRoutes';
import {
  forgotPasswordSchema,
  passwordPolicySchema,
  resetPasswordSchema,
} from '@/components/features/auth/auth.schema';

describe('TanStack Query v5 queryOptions Factories & Auth Schemas', () => {
  it('exposes forgot/reset password endpoints matching backend user-service', () => {
    expect(API_ENDPOINTS.AUTH_FORGOT_PASSWORD).toBe('/auth/forgot-password');
    expect(API_ENDPOINTS.AUTH_RESET_PASSWORD).toBe('/auth/reset-password');
  });

  it('normalises booking lookup code to trimmed uppercase in bookingQueries.byCode', () => {
    const opts = bookingQueries.byCode('  vxv892041 ');
    expect(opts.queryKey).toEqual(['bookings', 'code', 'VXV892041']);
    expect(typeof opts.queryFn).toBe('function');
  });

  it('sorts bookingIds deterministically in reviewQueries.eligibility', () => {
    const first = reviewQueries.eligibility(['b-2', 'b-1', '']);
    const second = reviewQueries.eligibility(['b-1', 'b-2']);
    expect(first.queryKey).toEqual(second.queryKey);
    expect(first.queryKey).toEqual(['reviews', 'eligibility', 'b-1,b-2']);
  });

  it('builds structured route detail queryOptions', () => {
    const opts = routeQueries.detail('route-uuid-1');
    expect(opts.queryKey).toEqual(['routes', 'detail', 'route-uuid-1']);
    expect(typeof opts.queryFn).toBe('function');
  });

  it('enforces canonical backend password policy on forgot/reset schemas', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'guest@vexeviet.vn' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);

    expect(passwordPolicySchema.safeParse('StrongPass1').success).toBe(true);
    // Missing lowercase
    expect(passwordPolicySchema.safeParse('ALLUPPER123').success).toBe(false);
    // Missing uppercase
    expect(passwordPolicySchema.safeParse('alllower123').success).toBe(false);
    // Missing digit
    expect(passwordPolicySchema.safeParse('NoDigitsHere').success).toBe(false);

    expect(
      resetPasswordSchema.safeParse({
        newPassword: 'StrongPass1',
        confirmPassword: 'StrongPass2',
      }).success,
    ).toBe(false);
  });
});
