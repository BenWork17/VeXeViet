import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  API_ENDPOINTS,
  ApiError,
  ApiResponse,
  ErrorCode,
  RefreshTokenResponse,
} from '@vexeviet/types';
import {
  generateClientRequestId,
  normaliseApiError,
} from '@vexeviet/api-client';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_BASE_URL = `${API_ORIGIN}/api/v1`;

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

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

  hasTokens: (): boolean => Boolean(tokenStorage.getAccessToken()),
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      if (!config.headers['X-Request-Id']) {
        config.headers['X-Request-Id'] = generateClientRequestId();
      }
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        tokenStorage.clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Request-Id': generateClientRequestId(),
            },
          }
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

export interface ParsedApiError {
  code: ErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
  detailLines?: string[];
  requestId?: string;
  status: number;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const headerRequestId =
      typeof error.response?.headers?.['x-request-id'] === 'string'
        ? error.response.headers['x-request-id']
        : undefined;

    if (error.response?.data !== undefined) {
      const normalised = normaliseApiError(status, error.response.data, headerRequestId);
      if (process.env.NODE_ENV === 'development') {
        const reqTag = normalised.requestId ? ` [${normalised.requestId}]` : '';
        console.warn(`[VeXeViet API Error]${reqTag} ${normalised.code}: ${normalised.message}`);
      }
      return {
        code: normalised.code,
        message: normalised.message,
        details: normalised.rawDetails,
        detailLines: normalised.details,
        requestId: normalised.requestId,
        status: normalised.status,
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        status: 0,
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
        status: 408,
      };
    }
  }

  if (error instanceof Error && error.message) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      status: 500,
    };
  }

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
