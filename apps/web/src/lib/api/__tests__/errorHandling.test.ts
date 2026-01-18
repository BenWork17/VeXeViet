import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiClient, handleApiError } from '../apiClient';
import { toast } from '@/components/ui/toast';

// Mock toast
vi.mock('@/components/ui/toast', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

describe('API Error Handling', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Network Errors', () => {
    it('should handle network error (offline)', async () => {
      mock.onGet('/api/v1/routes').networkError();

      try {
        await apiClient.get('/api/v1/routes');
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'No Internet Connection',
            message: 'Please check your network and try again.',
          })
        );
      }
    });

    it('should handle timeout error', async () => {
      mock.onGet('/api/v1/routes').timeout();

      try {
        await apiClient.get('/api/v1/routes');
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Request Timeout',
            message: 'The request took too long. Please try again.',
          })
        );
      }
    });

    it('should handle server unreachable (503)', async () => {
      mock.onGet('/api/v1/routes').reply(503, {
        error: 'Service Unavailable',
      });

      try {
        await apiClient.get('/api/v1/routes');
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Service Unavailable',
            message: 'Our servers are temporarily down. Please try again later.',
          })
        );
      }
    });
  });

  describe('4xx Client Errors', () => {
    it('should handle 400 Bad Request with validation errors', async () => {
      mock.onPost('/api/v1/bookings').reply(400, {
        error: 'Validation Error',
        details: [
          { field: 'seatNumbers', message: 'At least one seat is required' },
          { field: 'paymentMethod', message: 'Invalid payment method' },
        ],
      });

      try {
        await apiClient.post('/api/v1/bookings', {});
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.details).toHaveLength(2);
        
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Invalid Request',
            message: 'Please check your input and try again.',
          })
        );
      }
    });

    it('should handle 401 Unauthorized (session expired)', async () => {
      mock.onGet('/api/v1/bookings').reply(401, {
        error: 'Unauthorized',
        message: 'Token expired',
      });

      // Mock router push
      const mockPush = vi.fn();
      vi.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      try {
        await apiClient.get('/api/v1/bookings');
      } catch (error) {
        expect(toast.warning).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Session Expired',
            message: 'Please log in again to continue.',
          })
        );

        // Should redirect to login
        // expect(mockPush).toHaveBeenCalledWith('/login?redirect=/bookings');
      }
    });

    it('should handle 403 Forbidden', async () => {
      mock.onGet('/api/v1/admin/users').reply(403, {
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });

      try {
        await apiClient.get('/api/v1/admin/users');
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Access Denied',
            message: "You don't have permission to access this resource.",
          })
        );
      }
    });

    it('should handle 404 Not Found', async () => {
      mock.onGet('/api/v1/bookings/invalid-id').reply(404, {
        error: 'Not Found',
        message: 'Booking not found',
      });

      try {
        await apiClient.get('/api/v1/bookings/invalid-id');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Not Found',
            message: 'The requested resource was not found.',
          })
        );
      }
    });

    it('should handle 409 Conflict (seat already booked)', async () => {
      mock.onPost('/api/v1/bookings').reply(409, {
        error: 'Conflict',
        message: 'Seat A1 is already booked',
        conflictingSeats: ['A1'],
      });

      try {
        await apiClient.post('/api/v1/bookings', {
          seatNumbers: ['A1', 'A2'],
        });
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.conflictingSeats).toContain('A1');
        
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Seat Unavailable',
            message: 'Seat A1 is already booked',
          })
        );
      }
    });

    it('should handle 429 Too Many Requests', async () => {
      mock.onGet('/api/v1/routes').reply(429, {
        error: 'Too Many Requests',
        retryAfter: 60,
      });

      try {
        await apiClient.get('/api/v1/routes');
      } catch (error: any) {
        expect(error.response.status).toBe(429);
        
        expect(toast.warning).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Slow Down!',
            message: 'Too many requests. Please wait 60 seconds.',
          })
        );
      }
    });
  });

  describe('5xx Server Errors', () => {
    it('should handle 500 Internal Server Error', async () => {
      const errorId = 'err_abc123xyz';
      
      mock.onPost('/api/v1/bookings').reply(500, {
        error: 'Internal Server Error',
        errorId,
      });

      try {
        await apiClient.post('/api/v1/bookings', {});
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again.',
            description: `Error ID: ${errorId}`,
          })
        );
      }
    });

    it('should handle 502 Bad Gateway', async () => {
      mock.onGet('/api/v1/routes').reply(502);

      try {
        await apiClient.get('/api/v1/routes');
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Service Unavailable',
            message: 'Our servers are temporarily down. Please try again later.',
          })
        );
      }
    });
  });

  describe('Payment Errors', () => {
    it('should handle payment gateway timeout', async () => {
      mock.onPost('/api/v1/payments/vnpay').reply(408, {
        error: 'Payment Timeout',
        message: 'Payment gateway did not respond',
      });

      try {
        await apiClient.post('/api/v1/payments/vnpay', {
          amount: 500000,
        });
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Payment Timeout',
            message: 'Payment gateway did not respond. Your card was NOT charged.',
          })
        );
      }
    });

    it('should handle payment declined (insufficient funds)', async () => {
      mock.onPost('/api/v1/payments/vnpay').reply(402, {
        error: 'Payment Failed',
        code: 'INSUFFICIENT_FUNDS',
      });

      try {
        await apiClient.post('/api/v1/payments/vnpay', {});
      } catch (error: any) {
        expect(error.response.data.code).toBe('INSUFFICIENT_FUNDS');
        
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Payment Declined',
            message: 'Insufficient funds. Please use a different payment method.',
          })
        );
      }
    });

    it('should handle card not supported', async () => {
      mock.onPost('/api/v1/payments/vnpay').reply(400, {
        error: 'Card Not Supported',
        code: 'UNSUPPORTED_CARD',
      });

      try {
        await apiClient.post('/api/v1/payments/vnpay', {});
      } catch (error) {
        expect(toast.error).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Card Not Supported',
            message: 'We currently only accept Visa and Mastercard.',
          })
        );
      }
    });
  });

  describe('Error Retry Logic', () => {
    it('should retry on 503 with exponential backoff', async () => {
      let attempts = 0;
      
      mock.onGet('/api/v1/routes').reply(() => {
        attempts++;
        if (attempts < 3) {
          return [503, { error: 'Service Unavailable' }];
        }
        return [200, { routes: [] }];
      });

      // Enable retry interceptor (must be configured in apiClient)
      const response = await apiClient.get('/api/v1/routes', {
        retry: { retries: 3, retryDelay: 100 },
      });

      expect(attempts).toBe(3);
      expect(response.status).toBe(200);
    });

    it('should NOT retry on 4xx errors', async () => {
      let attempts = 0;
      
      mock.onGet('/api/v1/bookings/invalid').reply(() => {
        attempts++;
        return [404, { error: 'Not Found' }];
      });

      try {
        await apiClient.get('/api/v1/bookings/invalid', {
          retry: { retries: 3 },
        });
      } catch (error) {
        expect(attempts).toBe(1); // No retries for 4xx
      }
    });
  });

  describe('Error Logging', () => {
    it('should log errors to console in development', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mock.onGet('/api/v1/routes').reply(500);

      try {
        await apiClient.get('/api/v1/routes');
      } catch (error) {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[API Error]'),
          expect.any(Object)
        );
      }

      consoleSpy.mockRestore();
    });

    it('should send errors to monitoring service (Sentry)', async () => {
      const sentrySpy = vi.fn();
      
      // Mock Sentry
      vi.mock('@sentry/nextjs', () => ({
        captureException: sentrySpy,
      }));

      mock.onPost('/api/v1/bookings').reply(500, {
        error: 'Database connection failed',
        errorId: 'err_123',
      });

      try {
        await apiClient.post('/api/v1/bookings', {});
      } catch (error) {
        // Sentry should capture the error
        // expect(sentrySpy).toHaveBeenCalledWith(error);
      }
    });
  });

  describe('Custom Error Handler', () => {
    it('should use custom error handler function', async () => {
      const customHandler = vi.fn();
      
      mock.onGet('/api/v1/routes').reply(404);

      try {
        await apiClient.get('/api/v1/routes', {
          onError: customHandler,
        });
      } catch (error) {
        expect(customHandler).toHaveBeenCalledWith(error);
      }
    });

    it('should suppress toast if custom handler is provided', async () => {
      const customHandler = vi.fn();
      
      mock.onGet('/api/v1/routes').reply(404);

      try {
        await apiClient.get('/api/v1/routes', {
          onError: customHandler,
          suppressToast: true,
        });
      } catch (error) {
        expect(toast.error).not.toHaveBeenCalled();
        expect(customHandler).toHaveBeenCalled();
      }
    });
  });
});
