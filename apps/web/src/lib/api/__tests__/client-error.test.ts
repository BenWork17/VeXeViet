import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { API_ENDPOINTS } from '@vexeviet/types';
import {
  createMediaResolver,
  flattenErrorDetails,
  generateClientRequestId,
  MAX_IMAGE_SIZE,
  normaliseApiError,
  validateImageFile,
} from '@vexeviet/api-client';
import { getErrorMessage, parseApiError } from '../client';

describe('API Contracts & Unified Error Normalisation', () => {
  it('points AUTH_REFRESH to /auth/refresh matching backend user-service route', () => {
    expect(API_ENDPOINTS.AUTH_REFRESH).toBe('/auth/refresh');
    expect(API_ENDPOINTS.AUTH_LOGOUT).toBe('/auth/logout');
  });

  it('generates non-empty client request IDs', () => {
    const first = generateClientRequestId();
    const second = generateClientRequestId();
    expect(first.length).toBeGreaterThan(8);
    expect(first).not.toBe(second);
  });

  it('normalises standard backend error envelope and preserves requestId', () => {
    const normalised = normaliseApiError(400, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ',
        details: [
          { field: 'email', message: 'Email không hợp lệ' },
          { field: 'password', message: 'Mật khẩu tối thiểu 8 ký tự' },
        ],
      },
      requestId: 'req-abc-123',
    });

    expect(normalised.code).toBe('VALIDATION_ERROR');
    expect(normalised.message).toBe('Dữ liệu đầu vào không hợp lệ');
    expect(normalised.requestId).toBe('req-abc-123');
    expect(normalised.status).toBe(400);
    expect(normalised.details).toEqual([
      'email: Email không hợp lệ',
      'password: Mật khẩu tối thiểu 8 ký tự',
    ]);
  });

  it('falls back to X-Request-Id header and legacy flat error string gracefully', () => {
    const normalised = normaliseApiError(
      401,
      {
        success: false,
        code: 'INVALID_CREDENTIALS',
        error: 'Sai tài khoản hoặc mật khẩu',
      },
      'req-from-header-999',
    );

    expect(normalised.code).toBe('INVALID_CREDENTIALS');
    expect(normalised.message).toBe('Sai tài khoản hoặc mật khẩu');
    expect(normalised.requestId).toBe('req-from-header-999');
  });

  it('flattens object and array error detail shapes consistently', () => {
    const lines = flattenErrorDetails(
      [{ field: 'seats', message: 'Ghế A1 đã có người giữ' }],
      { holdId: 'Hết hạn' },
    );
    expect(lines).toEqual(['seats: Ghế A1 đã có người giữ', 'holdId: Hết hạn']);
  });

  it('parses AxiosError with backend envelope and network/timeout errors', () => {
    const headers = new AxiosHeaders({ 'x-request-id': 'req-axios-42' });
    const axiosErr = new AxiosError(
      'Request failed with status code 409',
      'ERR_BAD_REQUEST',
      { headers },
      null,
      {
        data: {
          success: false,
          error: {
            code: 'SEAT_UNAVAILABLE',
            message: 'Ghế B02 vừa được đặt bởi hành khách khác',
          },
          requestId: 'req-body-42',
        },
        status: 409,
        statusText: 'Conflict',
        headers,
        config: { headers },
      },
    );

    const parsed = parseApiError(axiosErr);
    expect(parsed.code).toBe('SEAT_UNAVAILABLE');
    expect(parsed.requestId).toBe('req-body-42');
    expect(parsed.status).toBe(409);
    expect(getErrorMessage(axiosErr)).toBe('Ghế B02 vừa được đặt bởi hành khách khác');

    const networkErr = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(parseApiError(networkErr)).toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
      status: 0,
    });
  });

  it('resolves relative media URLs and validates image uploads', () => {
    const { resolveMediaUrl, resolveMediaUrls } = createMediaResolver('http://localhost:3000/');
    expect(resolveMediaUrl('/api/v1/users/uploads/avatars/u1.webp')).toBe(
      'http://localhost:3000/api/v1/users/uploads/avatars/u1.webp',
    );
    expect(resolveMediaUrl('/images/hero.webp')).toBe('/images/hero.webp');
    expect(resolveMediaUrl('https://cdn.vexeviet.vn/bus.jpg')).toBe(
      'https://cdn.vexeviet.vn/bus.jpg',
    );
    expect(resolveMediaUrls(['/api/v1/users/uploads/a.png', ''])).toEqual([
      'http://localhost:3000/api/v1/users/uploads/a.png',
    ]);

    const validImage = { type: 'image/webp', size: 1024 * 100 };
    expect(validateImageFile(validImage)).toBeNull();

    const invalidType = { type: 'application/pdf', size: 1024 };
    expect(validateImageFile(invalidType)).toContain('JPG, PNG hoặc WebP');

    const oversized = { type: 'image/png', size: MAX_IMAGE_SIZE + 1 };
    expect(validateImageFile(oversized)).toContain('5MB');
  });
});
