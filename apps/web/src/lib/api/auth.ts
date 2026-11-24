import apiClient, { tokenStorage, parseApiError, ParsedApiError } from './client';
import {
  ApiResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
  UpdateProfileRequest,
  API_ENDPOINTS,
} from '@vexeviet/types';

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    API_ENDPOINTS.AUTH_REGISTER,
    data
  );

  const { accessToken, refreshToken } = response.data.data;
  tokenStorage.setTokens(accessToken, refreshToken);

  return response.data.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.AUTH_LOGIN,
    data
  );

  const { accessToken, refreshToken } = response.data.data;
  tokenStorage.setTokens(accessToken, refreshToken);

  return response.data.data;
}

export async function logout(): Promise<void> {
  const currentRefreshToken = tokenStorage.getRefreshToken();
  try {
    await apiClient.post(
      API_ENDPOINTS.AUTH_LOGOUT,
      currentRefreshToken ? { refreshToken: currentRefreshToken } : {}
    );
  } catch {
    // Always clear local session even if server logout fails
  } finally {
    tokenStorage.clearTokens();
  }
}

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

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ApiResponse<ForgotPasswordResponse> & ForgotPasswordResponse>(
    API_ENDPOINTS.AUTH_FORGOT_PASSWORD,
    data
  );
  return response.data.data ?? response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ApiResponse<ResetPasswordResponse> & ResetPasswordResponse>(
    API_ENDPOINTS.AUTH_RESET_PASSWORD,
    data
  );
  return response.data.data ?? response.data;
}

export async function getProfile(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USER_PROFILE);
  return response.data.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USER_PROFILE, data);
  return response.data.data;
}

export function isAuthenticated(): boolean {
  return tokenStorage.hasTokens();
}

export function getStoredTokens() {
  return {
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken(),
  };
}

export interface AuthResult<T> {
  data: T | null;
  error: ParsedApiError | null;
  isLoading: boolean;
}

export { parseApiError };
