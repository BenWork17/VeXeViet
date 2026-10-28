'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminSession } from '@/lib/types';
import { clearSession, loadSession, signOut } from '@/lib/api';

/**
 * Session state for the console, read from `lib/api.ts`.
 *
 * There is no setter exposed: a session is only ever created by `signIn()` and
 * only ever destroyed by `signOut()`, so nothing in the UI can mint one. The
 * demo-session helper that used to live here is gone (D6/D7) — the operator
 * fixture for inspection is seeded straight into localStorage.
 */
export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // `loadSession()` validates the stored shape and clears anything that does
    // not match, so a stale demo value can never come back as a live session.
    setSession(loadSession());
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    // Revoke first (the token must still be in storage for that), then drop the
    // local copy immediately — a dead API must not strand the user.
    void signOut();
    clearSession();
    setSession(null);
  }, []);

  return { session, ready, logout };
}
