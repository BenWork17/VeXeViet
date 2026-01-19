'use client';

import { useEffect, useState, useCallback } from 'react';
import { Ticket } from '@/types/ticket';
import {
  initOfflineStorage,
  saveTicket as saveTicketToStorage,
  saveTickets,
  getTickets,
  getTicket,
  syncTickets,
  isOfflineStorageAvailable,
} from '@/lib/storage/offlineStorage';

interface UseOfflineTicketsReturn {
  tickets: Ticket[];
  isLoading: boolean;
  isOnline: boolean;
  error: Error | null;
  saveTicketOffline: (ticket: Ticket) => Promise<void>;
  saveTicketsOffline: (tickets: Ticket[]) => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket | null>;
  refreshTickets: () => Promise<void>;
  sync: () => Promise<void>;
}

export function useOfflineTickets(): UseOfflineTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        syncTickets().catch(console.error);
      };

      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    async function initialize() {
      if (!isOfflineStorageAvailable()) {
        setIsLoading(false);
        return;
      }

      try {
        await initOfflineStorage();
        setIsInitialized(true);
        const cachedTickets = await getTickets();
        setTickets(cachedTickets);

        if (navigator.onLine) {
          try {
            await syncTickets();
            const updatedTickets = await getTickets();
            setTickets(updatedTickets);
          } catch (syncError) {
            console.warn('Initial sync failed, using cached data:', syncError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize offline storage'));
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  const refreshTickets = useCallback(async () => {
    if (!isInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      if (navigator.onLine) {
        await syncTickets();
      }
      const cachedTickets = await getTickets();
      setTickets(cachedTickets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh tickets'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const saveTicketOffline = useCallback(async (ticket: Ticket) => {
    if (!isInitialized) {
      throw new Error('Offline storage not initialized');
    }

    try {
      await saveTicketToStorage(ticket);
      setTickets((prev) => {
        const existing = prev.findIndex((t) => t.id === ticket.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = ticket;
          return updated;
        }
        return [ticket, ...prev];
      });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save ticket offline');
    }
  }, [isInitialized]);

  const saveTicketsOffline = useCallback(async (newTickets: Ticket[]) => {
    if (!isInitialized) {
      throw new Error('Offline storage not initialized');
    }

    try {
      await saveTickets(newTickets);
      setTickets((prev) => {
        const ticketMap = new Map(prev.map((t) => [t.id, t]));
        newTickets.forEach((t) => ticketMap.set(t.id, t));
        return Array.from(ticketMap.values()).sort(
          (a, b) => new Date(b.route.departureTime).getTime() - new Date(a.route.departureTime).getTime()
        );
      });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save tickets offline');
    }
  }, [isInitialized]);

  const getTicketById = useCallback(async (id: string): Promise<Ticket | null> => {
    if (!isInitialized) return null;
    return getTicket(id);
  }, [isInitialized]);

  const sync = useCallback(async () => {
    if (!isInitialized || !navigator.onLine) return;

    setIsLoading(true);
    try {
      await syncTickets();
      const updatedTickets = await getTickets();
      setTickets(updatedTickets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sync tickets'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  return {
    tickets,
    isLoading,
    isOnline,
    error,
    saveTicketOffline,
    saveTicketsOffline,
    getTicketById,
    refreshTickets,
    sync,
  };
}
