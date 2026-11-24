import apiClient from './client';
import type { ApiResponse, OperatorImages, User } from '@vexeviet/types';
import {
  ACCEPTED_IMAGE_ACCEPT,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_OPERATOR_IMAGES_PER_TYPE,
  createMediaResolver,
  validateImageFile,
} from '@vexeviet/api-client';

export {
  ACCEPTED_IMAGE_ACCEPT,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_OPERATOR_IMAGES_PER_TYPE,
  validateImageFile,
};

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const { resolveMediaUrl, resolveMediaUrls } = createMediaResolver(API_ORIGIN);

export { resolveMediaUrl, resolveMediaUrls };

function toFormData(file: File): FormData {
  const form = new FormData();
  form.append('file', file);
  return form;
}

const multipartConfig = {
  headers: { 'Content-Type': undefined as unknown as string },
  timeout: 60000,
};

export async function uploadUserAvatar(file: File): Promise<User> {
  const res = await apiClient.post<ApiResponse<User>>(
    '/users/profile/avatar',
    toFormData(file),
    multipartConfig
  );
  return res.data.data;
}

export async function deleteUserAvatar(): Promise<User> {
  const res = await apiClient.delete<ApiResponse<User>>('/users/profile/avatar');
  return res.data.data;
}

export async function getPublicOperatorImages(operatorId: string): Promise<OperatorImages> {
  const res = await apiClient.get<ApiResponse<OperatorImages>>(
    `/users/operators/${operatorId}/images`
  );
  return res.data.data;
}
