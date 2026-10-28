'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminRole, AdminSession } from './types';

/**
 * The single place the admin console talks HTTP.
 *
 * Auth is a bearer header (no cookies, so `credentials` is irrelevant) and the
 * transport is the platform `fetch` — no client library is loaded for it.
 */

export const apiBaseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1`;

export const SESSION_STORAGE_KEY = 'vexeviet-admin-session';

export type ApiQuery = Record<string, string | number | boolean | undefined>;

/** The one error shape every caller sees, whatever the service emitted. */
export type ApiFailure = {
  code: string;
  message: string;
  details: string[];
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

/**
 * What is persisted. The console's `AdminSession` is the `user` slice of this:
 * the tokens are needed by the transport, never by a page.
 */
type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: AdminRole };
};

const NETWORK_FAILURE: ApiFailure = {
  code: 'NETWORK_ERROR',
  message: 'Không kết nối được tới API. Kiểm tra kết nối mạng hoặc địa chỉ NEXT_PUBLIC_API_URL.',
  details: [],
};

const SESSION_EXPIRED: ApiFailure = {
  code: 'SESSION_EXPIRED',
  message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  details: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isAbort = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';

const unexpected = (status: number): ApiFailure => ({
  code: 'UNEXPECTED_RESPONSE',
  message: `Máy chủ trả về dữ liệu không đúng định dạng (HTTP ${status}).`,
  details: [],
});

/**
 * `details` arrives in three shapes across the services: a `string[]` (route,
 * user), `{field, message}[]` (payment) and arbitrary JSON (booking). All three
 * are flattened to lines so a page never renders an object.
 */
function normaliseDetails(...sources: unknown[]): string[] {
  const lines: string[] = [];

  for (const source of sources) {
    if (source === null || source === undefined) continue;

    if (Array.isArray(source)) {
      for (const item of source) {
        if (typeof item === 'string') {
          lines.push(item);
        } else if (isRecord(item)) {
          const field = typeof item.field === 'string' ? item.field : undefined;
          const message = typeof item.message === 'string' ? item.message : undefined;
          if (field && message) lines.push(`${field}: ${message}`);
          else if (message) lines.push(message);
          else if (field) lines.push(field);
          else lines.push(JSON.stringify(item));
        } else if (item !== null && item !== undefined) {
          lines.push(String(item));
        }
      }
    } else if (typeof source === 'string') {
      lines.push(source);
    } else if (isRecord(source)) {
      for (const [key, value] of Object.entries(source)) {
        lines.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
      }
    }
  }

  return lines;
}

/**
 * The three envelopes the accepted services actually emit:
 *
 *   booking          { success: false, error: { code, message, details? } }
 *   payment / user   { success: false, error: "<message>", code?, details? }
 *   route            { success: false, error: "<message>", details?: string[] }
 *
 * A body matching none of them is reported as `UNEXPECTED_RESPONSE` with the
 * HTTP status in the message — never dereferenced, never thrown as a
 * `SyntaxError`.
 */
function normaliseFailure(status: number, body: unknown): ApiFailure {
  if (!isRecord(body) || body.success !== false) return unexpected(status);

  const error = body.error;
  const code = typeof body.code === 'string' && body.code ? body.code : `HTTP_${status}`;

  if (typeof error === 'string') {
    return {
      code,
      message: error || `Yêu cầu thất bại (HTTP ${status}).`,
      details: normaliseDetails(body.details, isRecord(error) ? error.details : undefined),
    };
  }

  if (isRecord(error)) {
    const innerCode = typeof error.code === 'string' && error.code ? error.code : code;
    const message =
      typeof error.message === 'string' && error.message
        ? error.message
        : `Yêu cầu thất bại (HTTP ${status}).`;
    return { code: innerCode, message, details: normaliseDetails(error.details, body.details) };
  }

  return { code, message: `Yêu cầu thất bại (HTTP ${status}).`, details: normaliseDetails(body.details) };
}

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

/* ------------------------------------------------------------------ *
 * Session storage (one key, shape-validated on every read)
 * ------------------------------------------------------------------ */

function readRaw(): unknown {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * A stale demo session wrote the same key with a different shape. Anything that
 * does not validate is removed rather than coerced, so it can never be read
 * back as a logged-in user.
 */
function readStored(): StoredSession | null {
  const value = readRaw();
  if (value === null) return null;

  if (!isRecord(value) || !isRecord(value.user)) {
    clearSession();
    return null;
  }

  const { accessToken, refreshToken } = value;
  const { id, name, email, role } = value.user;

  if (
    typeof accessToken !== 'string' ||
    accessToken.length === 0 ||
    typeof refreshToken !== 'string' ||
    refreshToken.length === 0 ||
    typeof id !== 'string' ||
    id.length === 0 ||
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    (role !== 'ADMIN' && role !== 'OPERATOR')
  ) {
    clearSession();
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user: { id, name, email, role },
  };
}

function writeStored(session: StoredSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function loadSession(): AdminSession | null {
  const stored = readStored();
  if (!stored) return null;
  return { id: stored.user.id, name: stored.user.name, email: stored.user.email, role: stored.user.role };
}

/* ------------------------------------------------------------------ *
 * Transport
 * ------------------------------------------------------------------ */

type RequestInitWithQuery = RequestInit & { query?: ApiQuery };

type Envelope = { body: unknown; status: number };

/**
 * Single-flight refresh: every request that gets a 401 while a refresh is in
 * flight waits on the same promise, then retries exactly once with the new
 * access token. Auth endpoints are never retried.
 */
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  const stored = readStored();
  if (!stored) {
    clearSession();
    throw new ApiError(SESSION_EXPIRED, 401);
  }

  refreshInFlight = (async () => {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(normaliseFailure(response.status, body), response.status);
    }

    if (!isRecord(body) || body.success !== true || !isRecord(body.data)) {
      throw new ApiError(unexpected(response.status), response.status);
    }

    const accessToken = body.data.accessToken;
    const refreshToken = body.data.refreshToken;
    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      throw new ApiError(unexpected(response.status), response.status);
    }

    writeStored({ ...stored, accessToken, refreshToken });
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

async function send(path: string, init: RequestInitWithQuery, retried: boolean): Promise<Envelope> {
  const { query, ...rest } = init;

  const headers = new Headers(rest.headers);
  headers.set('Accept', 'application/json');
  if (rest.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const stored = readStored();
  if (stored) headers.set('Authorization', `Bearer ${stored.accessToken}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), { ...rest, headers });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError(NETWORK_FAILURE, null);
  }

  // A 401 on a data endpoint means the access token lapsed: refresh once and
  // replay. Auth endpoints own their own 401 (bad password, dead refresh
  // token) and must never be retried — doing so would loop.
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

  if (!response.ok) {
    throw new ApiError(normaliseFailure(response.status, body), response.status);
  }

  if (!isRecord(body)) {
    throw new ApiError(unexpected(response.status), response.status);
  }

  return { body, status: response.status };
}

/** Parsed and envelope-checked body of a successful call. */
export async function request<T>(path: string, init?: RequestInitWithQuery): Promise<T> {
  const { body } = await send(path, init ?? {}, false);
  return body as T;
}

/* ------------------------------------------------------------------ *
 * Auth lifecycle
 * ------------------------------------------------------------------ */

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

/**
 * Authenticate and persist a session.
 *
 * Only an ADMIN or an OPERATOR gets one. A CUSTOMER that authenticates
 * successfully is refused here and nothing is written — the tokens in the
 * response are discarded with the request body.
 *
 * A suspended or deleted account is refused by the service with 401 and the
 * literal message `Invalid credentials`, which is rendered as received: the API
 * deliberately does not disclose why.
 */
export async function signIn(email: string, password: string): Promise<AdminSession> {
  const envelope = await request<LoginEnvelope>('/auth/login', {
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
        message: 'Tài khoản này không có quyền vào bảng điều khiển quản trị. Chỉ ADMIN và OPERATOR được phép.',
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

  writeStored(session);
  return { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role };
}

/** Revoke server-side when possible, then clear locally regardless. */
export async function signOut(): Promise<void> {
  const stored = readStored();

  if (stored) {
    try {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
    } catch {
      // A failed revoke must never strand the user in a session they asked to end.
    }
  }

  clearSession();
}

/* ------------------------------------------------------------------ *
 * Read hook
 * ------------------------------------------------------------------ */

function serialiseQuery(query?: ApiQuery): string {
  if (!query) return '';
  return Object.keys(query)
    .filter((key) => query[key] !== undefined)
    .sort()
    .map((key) => `${key}=${String(query[key])}`)
    .join('&');
}

export type ApiResult<T> = {
  data: T | null;
  error: ApiFailure | null;
  loading: boolean;
  reload: () => void;
  status: number | null;
};

/**
 * A plain effect + AbortController read.
 *
 * `data: []` with `error: null` means the server answered with nothing; that is
 * not the same state as `data: null` with an error, and neither is `loading`.
 * The three are kept distinct on purpose — collapsing them would report a
 * failed read as "no rows".
 */
export function useApi<T>(path: string | null, query?: ApiQuery): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [loading, setLoading] = useState<boolean>(path !== null);
  const [status, setStatus] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  const key = serialiseQuery(query);
  const queryRef = useRef<ApiQuery | undefined>(query);
  queryRef.current = query;

  useEffect(() => {
    if (path === null) {
      setData(null);
      setError(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let live = true;

    setLoading(true);
    setError(null);
    setStatus(null);

    send(path, { query: queryRef.current, signal: controller.signal }, false)
      .then(({ body, status: httpStatus }) => {
        if (!live) return;
        setData(body as T);
        setStatus(httpStatus);
      })
      .catch((failure: unknown) => {
        if (!live || isAbort(failure)) return;
        if (failure instanceof ApiError) {
          setData(null);
          setError(failure.failure);
          setStatus(failure.status);
          return;
        }
        setData(null);
        setError(NETWORK_FAILURE);
        setStatus(null);
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
      controller.abort();
    };
  }, [path, key, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { data, error, loading, reload, status };
}
