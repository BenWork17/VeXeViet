export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(',');
export const MAX_OPERATOR_IMAGES_PER_TYPE = 10;

export function createMediaResolver(apiOrigin = 'http://localhost:3000') {
  const trimmedOrigin = apiOrigin.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

  const resolveMediaUrl = (path?: string | null): string | undefined => {
    if (!path) return undefined;
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    if (path.startsWith('/api/')) return `${trimmedOrigin}${path}`;
    return path;
  };

  const resolveMediaUrls = (paths?: string[] | null): string[] =>
    (paths ?? []).map((p) => resolveMediaUrl(p)).filter((p): p is string => Boolean(p));

  return { resolveMediaUrl, resolveMediaUrls };
}

export function validateImageFile(file: { type: string; size: number }): string | null {
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
