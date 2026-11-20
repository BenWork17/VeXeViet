/**
 * Media helpers: URL resolution, client-side image validation and the
 * upload/delete calls for user avatars and operator images.
 *
 * Contract (BE): multipart field `file`, jpeg/png/webp, max 5MB.
 * Stored URLs are relative (`/api/v1/uploads/...`) and are served by the gateway.
 */

import apiClient from './client';
import type { ApiResponse, OperatorImages, OperatorImageType, User } from '@vexeviet/types';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(',');
export const MAX_OPERATOR_IMAGES_PER_TYPE = 10;

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Turn a stored (relative) media path into an absolute URL the browser can load. */
export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('/api/')) return `${API_ORIGIN}${path}`;
  return path; // local public asset, e.g. /images/default-operator.png
}

export function resolveMediaUrls(paths?: string[] | null): string[] {
  return (paths ?? []).map((p) => resolveMediaUrl(p)).filter((p): p is string => !!p);
}

/** Returns a Vietnamese error message or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Ảnh vượt quá dung lượng tối đa 5MB.';
  }
  if (file.size === 0) {
    return 'Tệp ảnh trống.';
  }
  return null;
}

function toFormData(file: File): FormData {
  const form = new FormData();
  form.append('file', file);
  return form;
}

// Let the browser set the multipart boundary (the client default is application/json).
const multipartConfig = { headers: { 'Content-Type': undefined as unknown as string }, timeout: 60000 };

// ========================
// User avatar
// ========================

export async function uploadUserAvatar(file: File): Promise<User> {
  const res = await apiClient.post<ApiResponse<User>>('/users/profile/avatar', toFormData(file), multipartConfig);
  return res.data.data;
}

export async function deleteUserAvatar(): Promise<User> {
  const res = await apiClient.delete<ApiResponse<User>>('/users/profile/avatar');
  return res.data.data;
}

// ========================
// Operator images
// ========================

const params = (operatorId?: string) => (operatorId ? { operatorId } : undefined);

export async function getPublicOperatorImages(operatorId: string): Promise<OperatorImages> {
  const res = await apiClient.get<ApiResponse<OperatorImages>>(`/users/operators/${operatorId}/images`);
  return res.data.data;
}

export async function getOperatorImages(operatorId?: string): Promise<OperatorImages> {
  const res = await apiClient.get<ApiResponse<OperatorImages>>('/users/operator/images', { params: params(operatorId) });
  return res.data.data;
}

export async function uploadOperatorAvatar(file: File, operatorId?: string): Promise<OperatorImages> {
  const res = await apiClient.put<ApiResponse<OperatorImages>>('/users/operator/avatar', toFormData(file), {
    ...multipartConfig,
    params: params(operatorId),
  });
  return res.data.data;
}

export async function deleteOperatorAvatar(operatorId?: string): Promise<OperatorImages> {
  const res = await apiClient.delete<ApiResponse<OperatorImages>>('/users/operator/avatar', { params: params(operatorId) });
  return res.data.data;
}

export async function addOperatorImage(type: OperatorImageType, file: File, operatorId?: string): Promise<OperatorImages> {
  const res = await apiClient.post<ApiResponse<OperatorImages>>(`/users/operator/images/${type}`, toFormData(file), {
    ...multipartConfig,
    params: params(operatorId),
  });
  return res.data.data;
}

export async function deleteOperatorImage(type: OperatorImageType, url: string, operatorId?: string): Promise<OperatorImages> {
  const res = await apiClient.delete<ApiResponse<OperatorImages>>(`/users/operator/images/${type}`, {
    params: { url, ...(operatorId ? { operatorId } : {}) },
  });
  return res.data.data;
}
