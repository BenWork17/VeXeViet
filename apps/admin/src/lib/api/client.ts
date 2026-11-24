'use client';

import {
  ACCEPTED_IMAGE_TYPES,
  API_ENDPOINTS,
  MAX_IMAGE_SIZE,
  createMediaResolver,
  generateClientRequestId,
  normaliseApiError,
  validateImageFile,
} from '@vexeviet/api-client';
import type { AdminSession } from '../types';
import {
  StoredSession,
  clearSession,
  readStoredSession,
  writeStoredSession,
} from './session';

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const apiBaseUrl = `${apiOrigin}/api/v1`;

export type ApiQuery = Record<string, string | number | boolean | undefined>;

export type ApiFailure = {
  code: string;
  message: string;
  details: string[];
  requestId?: string;
};

export class ApiError extends Error {
  readonly failure: ApiFailure;
  readonly status: number | null;

  constructor(failure: ApiFailure, status: number | null) {
    super(failure.message);
    this.name = 'ApiError';
    this.failure = failure;
    this.status = status;
  }
}

export const NETWORK_FAILURE: ApiFailure = {
  code: 'NETWORK_ERROR',
  message:
    'Không kết nối được tới API. Kiểm tra kết nối mạng hoặc địa chỉ NEXT_PUBLIC_API_URL.',
  details: [],
};

const SESSION_EXPIRED: ApiFailure = {
  code: 'SESSION_EXPIRED',
  message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  details: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isAbort = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { name?: unknown }).name === 'AbortError';

const unexpected = (status: number): ApiFailure => ({
  code: 'UNEXPECTED_RESPONSE',
  message: `Máy chủ trả về dữ liệu không đúng định dạng (HTTP ${status}).`,
  details: [],
});

function buildUrl(path: string, query?: ApiQuery): string {
  const url = `${apiBaseUrl}${path}`;
  if (!query) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }

  const serialised = search.toString();
  return serialised ? `${url}?${serialised}` : url;
}

export type RequestInitWithQuery = RequestInit & { query?: ApiQuery };
export type Envelope = { body: unknown; status: number };

let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  const stored = readStoredSession();
  if (!stored) {
    clearSession();
    throw new ApiError(SESSION_EXPIRED, 401);
  }

  refreshInFlight = (async () => {
    const response = await fetch(`${apiBaseUrl}${API_ENDPOINTS.AUTH_REFRESH}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Request-Id': generateClientRequestId(),
      },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });

    const body = await response.json().catch(() => null);
    const reqId = response.headers.get('x-request-id') ?? undefined;

    if (!response.ok) {
      throw new ApiError(normaliseApiError(response.status, body, reqId), response.status);
    }

    if (!isRecord(body) || body.success !== true || !isRecord(body.data)) {
      throw new ApiError(unexpected(response.status), response.status);
    }

    const accessToken = body.data.accessToken;
    const refreshToken = body.data.refreshToken;
    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new ApiError(unexpected(response.status), response.status);
    }

    writeStoredSession({ ...stored, accessToken, refreshToken });
    return accessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function endSession(): void {
  clearSession();
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') window.location.assign('/login');
}

export async function send(
  path: string,
  init: RequestInitWithQuery,
  retried: boolean
): Promise<Envelope> {
  const { query, ...rest } = init;

  const headers = new Headers(rest.headers);
  headers.set('Accept', 'application/json');
  if (!headers.has('X-Request-Id')) {
    headers.set('X-Request-Id', generateClientRequestId());
  }
  if (
    rest.body !== undefined &&
    !headers.has('Content-Type') &&
    !(rest.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const stored = readStoredSession();
  if (stored) headers.set('Authorization', `Bearer ${stored.accessToken}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), { ...rest, headers });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError(NETWORK_FAILURE, null);
  }

  if (response.status === 401 && !retried && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken();
    } catch {
      endSession();
      throw new ApiError(SESSION_EXPIRED, 401);
    }
    return send(path, init, true);
  }

  const body: unknown = await response.json().catch(() => null);
  const reqId = response.headers.get('x-request-id') ?? undefined;

  if (!response.ok) {
    throw new ApiError(normaliseApiError(response.status, body, reqId), response.status);
  }

  if (!isRecord(body)) {
    throw new ApiError(unexpected(response.status), response.status);
  }

  return { body, status: response.status };
}

export async function request<T>(path: string, init?: RequestInitWithQuery): Promise<T> {
  const { body } = await send(path, init ?? {}, false);
  return body as T;
}

type LoginEnvelope = {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
};

export async function signIn(email: string, password: string): Promise<AdminSession> {
  const envelope = await request<LoginEnvelope>(API_ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = envelope.data;
  if (
    !isRecord(data) ||
    typeof data.accessToken !== 'string' ||
    typeof data.refreshToken !== 'string' ||
    !isRecord(data.user) ||
    typeof data.user.id !== 'string' ||
    typeof data.user.email !== 'string' ||
    typeof data.user.role !== 'string'
  ) {
    throw new ApiError(unexpected(200), 200);
  }

  const role = data.user.role;
  if (role !== 'ADMIN' && role !== 'OPERATOR') {
    clearSession();
    throw new ApiError(
      {
        code: 'ROLE_NOT_ALLOWED',
        message:
          'Tài khoản này không có quyền vào bảng điều khiển quản trị. Chỉ ADMIN và OPERATOR được phép.',
        details: [],
      },
      200
    );
  }

  const name =
    [data.user.firstName, data.user.lastName]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join(' ')
      .trim() || data.user.email;

  const session: StoredSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: { id: data.user.id, name, email: data.user.email, role },
  };

  writeStoredSession(session);
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function signOut(): Promise<void> {
  const stored = readStoredSession();

  if (stored) {
    try {
      await request(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
    } catch {
      // Always clear local session
    }
  }

  clearSession();
}

const { resolveMediaUrl } = createMediaResolver(apiOrigin);

export { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE, resolveMediaUrl, validateImageFile };

export async function uploadFile<T>(
  path: string,
  file: File,
  method: 'POST' | 'PUT' = 'POST',
  query?: ApiQuery
): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  return request<T>(path, { method, body: form, query });
}
