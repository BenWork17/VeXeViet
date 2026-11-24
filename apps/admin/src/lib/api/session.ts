import type { AdminRole, AdminSession } from '../types';

export const SESSION_STORAGE_KEY = 'vexeviet-admin-session';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: AdminRole };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function readStoredSession(): StoredSession | null {
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

export function writeStoredSession(session: StoredSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): AdminSession | null {
  const stored = readStoredSession();
  if (!stored) return null;
  return {
    id: stored.user.id,
    name: stored.user.name,
    email: stored.user.email,
    role: stored.user.role,
  };
}
