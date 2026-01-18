/**
 * API Error Handler
 * Centralized error handling for API calls
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Handle API errors and convert to user-friendly messages
 */
export function handleAPIError(error: unknown): APIError {
  // Network error (no response)
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new APIError(
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
      0,
      'NETWORK_ERROR'
    );
  }

  // Timeout error
  if (error instanceof Error && error.name === 'AbortError') {
    return new APIError(
      'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.',
      408,
      'TIMEOUT'
    );
  }

  // API Error with response
  if (error instanceof APIError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    return new APIError(error.message, undefined, 'UNKNOWN_ERROR');
  }

  // Unknown error
  return new APIError('Đã xảy ra lỗi không xác định', undefined, 'UNKNOWN_ERROR');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.code === 'NETWORK_ERROR' || error.status === 0;
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.code === 'TIMEOUT' || error.status === 408;
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof APIError && error.status) {
    return error.status >= 500 && error.status < 600;
  }
  return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof APIError && error.status) {
    return error.status >= 400 && error.status < 500;
  }
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  const apiError = handleAPIError(error);
  
  // Specific error codes
  switch (apiError.code) {
    case 'NETWORK_ERROR':
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
    case 'TIMEOUT':
      return 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.';
    case 'UNAUTHORIZED':
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 'FORBIDDEN':
      return 'Bạn không có quyền thực hiện hành động này.';
    case 'NOT_FOUND':
      return 'Không tìm thấy dữ liệu yêu cầu.';
    case 'SEAT_CONFLICT':
      return apiError.message || 'Ghế đã được đặt bởi người khác. Vui lòng chọn ghế khác.';
    default:
      if (isServerError(apiError)) {
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      }
      return apiError.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry client errors (4xx)
      if (isClientError(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (i === maxRetries - 1) {
        break;
      }
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
