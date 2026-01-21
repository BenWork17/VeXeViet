/**
 * Axios API Client with interceptors for authentication
 * Handles token refresh automatically
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse, RefreshTokenResponse, ErrorCode, ERROR_MESSAGES } from '@vexeviet/types';

// ========================
// Configuration
// ========================

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ========================
// Token Management
// ========================

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

// ========================
// API Client Instance
// ========================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================
// Request Interceptor
// ========================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================
// Response Interceptor with Token Refresh
// ========================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if we're on auth endpoints
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        tokenStorage.clearTokens();
        // Dispatch logout event for the app to handle
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL.replace('/api/v1', '')}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        tokenStorage.setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        // Dispatch logout event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ========================
// Error Handling Utilities
// ========================

export interface ParsedApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    const status = axiosError.response?.status || 500;
    const errorData = axiosError.response?.data?.error;

    if (errorData) {
      return {
        code: errorData.code as ErrorCode,
        message: errorData.message || ERROR_MESSAGES[errorData.code as ErrorCode] || 'Đã xảy ra lỗi',
        details: errorData.details,
        status,
      };
    }

    // Network error
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        status: 0,
      };
    }

    // Timeout
    if (axiosError.code === 'ECONNABORTED') {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
        status: 408,
      };
    }
  }

  // Unknown error
  return {
    code: 'INTERNAL_ERROR',
    message: 'Đã xảy ra lỗi không xác định',
    status: 500,
  };
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

export default apiClient;
