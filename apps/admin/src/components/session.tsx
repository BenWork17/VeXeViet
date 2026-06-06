'use client';

import { useEffect, useState } from 'react';
import type { AdminSession } from '@/lib/types';
import { mockSessions } from '@/lib/mock-data';

const STORAGE_KEY = 'vexeviet-admin-session';

export function useAdminSession() {
  const [session, setSessionState] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSessionState(JSON.parse(raw) as AdminSession);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const setSession = (next: AdminSession) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSessionState(next);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionState(null);
  };

  return { session, ready, setSession, logout };
}

export function getDemoSession(kind: 'admin' | 'operator') {
  return mockSessions[kind];
}
