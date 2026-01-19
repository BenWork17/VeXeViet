import { useState, useEffect, useCallback, useRef } from 'react';
import type { Ticket } from '../types/ticket';
import {
  initOfflineStorage,
  getTickets,
  saveTicket,
  syncTickets,
  saveTicketOffline,
} from '../services/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { isOnline } = useNetworkStatus();
  const hasInitialized = useRef(false);
  const lastSyncAttempt = useRef<number>(0);

  const loadTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedTickets = await getTickets();
      setTickets(storedTickets);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTickets = useCallback(async () => {
    await loadTickets();
  }, [loadTickets]);

  const saveTicketOfflineHandler = useCallback(async (ticket: Ticket) => {
    try {
      if (isOnline) {
        await saveTicket(ticket);
      } else {
        await saveTicketOffline(ticket);
      }
      await loadTickets();
    } catch (err) {
      setError('Failed to save ticket');
      throw err;
    }
  }, [isOnline, loadTickets]);

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    const now = Date.now();
    const SYNC_COOLDOWN = 30000;
    if (now - lastSyncAttempt.current < SYNC_COOLDOWN) {
      return;
    }

    try {
      setIsSyncing(true);
      lastSyncAttempt.current = now;
      await syncTickets();
      await loadTickets();
    } catch {
      // Sync failed silently
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadTickets]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initOfflineStorage().then(loadTickets);
    }
  }, [loadTickets]);

  useEffect(() => {
    if (isOnline && hasInitialized.current) {
      sync();
    }
  }, [isOnline, sync]);

  return {
    tickets,
    isLoading,
    error,
    isSyncing,
    saveTicketOffline: saveTicketOfflineHandler,
    refreshTickets,
    sync,
  };
}
