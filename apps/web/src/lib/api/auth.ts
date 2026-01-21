/**
 * Authentication API functions
 */

import apiClient, { tokenStorage, parseApiError, ParsedApiError } from './client';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  UpdateProfileRequest,
  API_ENDPOINTS,
} from '@vexeviet/types';

// ========================
// Auth API Functions
// ========================

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    API_ENDPOINTS.AUTH_REGISTER,
    data
  );
  
  // Store tokens after successful registration
  const { accessToken, refreshToken } = response.data.data;
  tokenStorage.setTokens(accessToken, refreshToken);
  
  return response.data.data;
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.AUTH_LOGIN,
    data
  );
  
  // Store tokens after successful login
  const { accessToken, refreshToken } = response.data.data;
  tokenStorage.setTokens(accessToken, refreshToken);
  
  return response.data.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
  } catch {
    // Ignore errors on logout - we still want to clear tokens
  } finally {
    tokenStorage.clearTokens();
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  const currentRefreshToken = tokenStorage.getRefreshToken();
  
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
    API_ENDPOINTS.AUTH_REFRESH,
    { refreshToken: currentRefreshToken } as RefreshTokenRequest
  );
  
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  tokenStorage.setTokens(accessToken, newRefreshToken);
  
  return response.data.data;
}

// ========================
// User API Functions
// ========================

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(
    API_ENDPOINTS.USER_PROFILE
  );
  return response.data.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>(
    API_ENDPOINTS.USER_PROFILE,
    data
  );
  return response.data.data;
}

// ========================
// Auth State Helpers
// ========================

/**
 * Check if user is authenticated (has tokens)
 */
export function isAuthenticated(): boolean {
  return tokenStorage.hasTokens();
}

/**
 * Get stored tokens
 */
export function getStoredTokens() {
  return {
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken(),
  };
}

// ========================
// Auth Result Types (for hooks)
// ========================

export interface AuthResult<T> {
  data: T | null;
  error: ParsedApiError | null;
  isLoading: boolean;
}

export { parseApiError };
