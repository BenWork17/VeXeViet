/**
 * React Query hooks for Authentication
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getProfile as getProfileApi,
  updateProfile as updateProfileApi,
  isAuthenticated,
  parseApiError,
} from '@/lib/api/auth';
import { tokenStorage } from '@/lib/api/client';
import {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@vexeviet/types';

// ========================
// Query Keys
// ========================

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// ========================
// Hooks
// ========================

/**
 * Hook to get current user profile
 * Only fetches if user has tokens
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: getProfileApi,
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      const parsed = parseApiError(error);
      if (parsed.status === 401) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(authKeys.profile(), data.user);
      // Invalidate all auth queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Login failed:', parseApiError(error));
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(authKeys.profile(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Registration failed:', parseApiError(error));
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Clear entire cache to be safe
      queryClient.clear();
    },
    onSettled: () => {
      // Always clear tokens, even on error
      tokenStorage.clearTokens();
    },
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfileApi(data),
    onSuccess: (updatedUser) => {
      // Update user data in cache
      queryClient.setQueryData(authKeys.profile(), updatedUser);
    },
    onError: (error) => {
      console.error('Profile update failed:', parseApiError(error));
    },
  });
}

/**
 * Combined auth hook with all auth state and actions
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const userQuery = useUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Listen for forced logout events (from token refresh failure)
  useEffect(() => {
    const handleForceLogout = () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, [queryClient]);

  const login = useCallback(
    async (data: LoginRequest) => {
      return loginMutation.mutateAsync(data);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    // User state
    user: userQuery.data as User | undefined,
    isAuthenticated: isAuthenticated() && !!userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error ? parseApiError(userQuery.error) : null,

    // Actions
    login,
    register,
    logout,

    // Mutation states (for loading spinners, etc.)
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Mutation errors
    loginError: loginMutation.error ? parseApiError(loginMutation.error) : null,
    registerError: registerMutation.error ? parseApiError(registerMutation.error) : null,

    // Reset error states
    resetLoginError: loginMutation.reset,
    resetRegisterError: registerMutation.reset,
  };
}
