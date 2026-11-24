import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import {
  forgotPassword as forgotPasswordApi,
  getProfile as getProfileApi,
  isAuthenticated,
  login as loginApi,
  logout as logoutApi,
  parseApiError,
  register as registerApi,
  resetPassword as resetPasswordApi,
  updateProfile as updateProfileApi,
} from '@/lib/api/auth';
import { tokenStorage } from '@/lib/api/client';
import { deleteUserAvatar, uploadUserAvatar } from '@/lib/api/media';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from '@vexeviet/types';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export const authQueries = {
  all: () => authKeys.all,
  profile: () =>
    queryOptions({
      queryKey: authKeys.profile(),
      queryFn: getProfileApi,
      staleTime: 5 * 60 * 1000,
      retry: (failureCount: number, error: unknown) => {
        const parsed = parseApiError(error);
        if (parsed.status === 401) return false;
        return failureCount < 3;
      },
    }),
};

export function useUser() {
  return useQuery({
    ...authQueries.profile(),
    enabled: isAuthenticated(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data.user as User);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Login failed:', parseApiError(error));
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Registration failed:', parseApiError(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
    onSettled: () => {
      tokenStorage.clearTokens();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPasswordApi(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPasswordApi(data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfileApi(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.profile(), updatedUser);
    },
    onError: (error) => {
      console.error('Profile update failed:', parseApiError(error));
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.profile(), (prev: User | undefined) => ({
        ...(prev ?? ({} as User)),
        ...updatedUser,
      }));
    },
    onError: (error) => {
      console.error('Avatar upload failed:', parseApiError(error));
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteUserAvatar(),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.profile(), (prev: User | undefined) => ({
        ...(prev ?? ({} as User)),
        ...updatedUser,
        avatarUrl: null,
      }));
    },
    onError: (error) => {
      console.error('Avatar removal failed:', parseApiError(error));
    },
  });
}

export function useAuth() {
  const queryClient = useQueryClient();
  const userQuery = useUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

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
    async (data: LoginRequest) => loginMutation.mutateAsync(data),
    [loginMutation]
  );

  const register = useCallback(
    async (data: RegisterRequest) => registerMutation.mutateAsync(data),
    [registerMutation]
  );

  const logout = useCallback(async () => logoutMutation.mutateAsync(), [logoutMutation]);

  return {
    user: userQuery.data as User | undefined,
    isAuthenticated: isAuthenticated() && !!userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error ? parseApiError(userQuery.error) : null,
    login,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error ? parseApiError(loginMutation.error) : null,
    registerError: registerMutation.error ? parseApiError(registerMutation.error) : null,
    resetLoginError: loginMutation.reset,
    resetRegisterError: registerMutation.reset,
  };
}
