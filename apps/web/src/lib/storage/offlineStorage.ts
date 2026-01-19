import { Ticket } from '@/types/ticket';

const DB_NAME = 'vexeviet-offline';
const DB_VERSION = 1;
const TICKETS_STORE = 'tickets';

let db: IDBDatabase | null = null;

export async function initOfflineStorage(): Promise<void> {
  if (db) return;

  if (typeof window === 'undefined' || !window.indexedDB) {
    console.warn('IndexedDB not available');
    return;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(TICKETS_STORE)) {
        const store = database.createObjectStore(TICKETS_STORE, { keyPath: 'id' });
        store.createIndex('bookingId', 'bookingId', { unique: false });
        store.createIndex('bookingCode', 'bookingCode', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('departureTime', 'route.departureTime', { unique: false });
      }
    };
  });
}

function getDB(): IDBDatabase {
  if (!db) {
    throw new Error('IndexedDB not initialized. Call initOfflineStorage() first.');
  }
  return db;
}

export async function saveTicket(ticket: Ticket): Promise<void> {
  const database = getDB();

  const ticketWithOfflineData: Ticket = {
    ...ticket,
    offlineData: {
      cachedAt: new Date().toISOString(),
      lastSyncedAt: ticket.offlineData?.lastSyncedAt,
      pendingSync: false,
    },
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readwrite');
    const store = transaction.objectStore(TICKETS_STORE);
    const request = store.put(ticketWithOfflineData);

    request.onerror = () => {
      reject(new Error('Failed to save ticket'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

export async function saveTickets(tickets: Ticket[]): Promise<void> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readwrite');
    const store = transaction.objectStore(TICKETS_STORE);

    let completed = 0;
    let hasError = false;

    tickets.forEach((ticket) => {
      const ticketWithOfflineData: Ticket = {
        ...ticket,
        offlineData: {
          cachedAt: new Date().toISOString(),
          lastSyncedAt: ticket.offlineData?.lastSyncedAt,
          pendingSync: false,
        },
      };

      const request = store.put(ticketWithOfflineData);

      request.onerror = () => {
        if (!hasError) {
          hasError = true;
          reject(new Error('Failed to save tickets'));
        }
      };

      request.onsuccess = () => {
        completed++;
        if (completed === tickets.length && !hasError) {
          resolve();
        }
      };
    });

    if (tickets.length === 0) {
      resolve();
    }
  });
}

export async function getTickets(): Promise<Ticket[]> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readonly');
    const store = transaction.objectStore(TICKETS_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error('Failed to get tickets'));
    };

    request.onsuccess = () => {
      const tickets = request.result as Ticket[];
      tickets.sort((a, b) => 
        new Date(b.route.departureTime).getTime() - new Date(a.route.departureTime).getTime()
      );
      resolve(tickets);
    };
  });
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readonly');
    const store = transaction.objectStore(TICKETS_STORE);
    const request = store.get(id);

    request.onerror = () => {
      reject(new Error('Failed to get ticket'));
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

export async function getTicketsByBookingId(bookingId: string): Promise<Ticket[]> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readonly');
    const store = transaction.objectStore(TICKETS_STORE);
    const index = store.index('bookingId');
    const request = index.getAll(bookingId);

    request.onerror = () => {
      reject(new Error('Failed to get tickets by booking ID'));
    };

    request.onsuccess = () => {
      resolve(request.result as Ticket[]);
    };
  });
}

export async function deleteTicket(id: string): Promise<void> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readwrite');
    const store = transaction.objectStore(TICKETS_STORE);
    const request = store.delete(id);

    request.onerror = () => {
      reject(new Error('Failed to delete ticket'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

export async function clearTickets(): Promise<void> {
  const database = getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([TICKETS_STORE], 'readwrite');
    const store = transaction.objectStore(TICKETS_STORE);
    const request = store.clear();

    request.onerror = () => {
      reject(new Error('Failed to clear tickets'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

export async function syncTickets(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline - skipping sync');
    return;
  }

  const database = getDB();
  const cachedTickets = await getTickets();

  try {
    const response = await fetch('/api/tickets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketIds: cachedTickets.map((t) => t.id),
        lastSyncedAt: cachedTickets[0]?.offlineData?.lastSyncedAt,
      }),
    });

    if (!response.ok) {
      throw new Error('Sync request failed');
    }

    const { tickets: serverTickets, deletedIds } = await response.json() as {
      tickets: Ticket[];
      deletedIds: string[];
    };

    const transaction = database.transaction([TICKETS_STORE], 'readwrite');
    const store = transaction.objectStore(TICKETS_STORE);

    for (const id of deletedIds) {
      store.delete(id);
    }

    for (const ticket of serverTickets) {
      const ticketWithOfflineData: Ticket = {
        ...ticket,
        offlineData: {
          cachedAt: new Date().toISOString(),
          lastSyncedAt: new Date().toISOString(),
          pendingSync: false,
        },
      };
      store.put(ticketWithOfflineData);
    }

    console.log(`Synced ${serverTickets.length} tickets, removed ${deletedIds.length}`);
  } catch (error) {
    console.error('Failed to sync tickets:', error);
    throw error;
  }
}

export function isOfflineStorageAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.indexedDB;
}

export async function getStorageStats(): Promise<{
  ticketCount: number;
  oldestTicket?: string;
  newestTicket?: string;
}> {
  const tickets = await getTickets();

  if (tickets.length === 0) {
    return { ticketCount: 0 };
  }

  const sorted = [...tickets].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return {
    ticketCount: tickets.length,
    oldestTicket: sorted[0]?.createdAt,
    newestTicket: sorted[sorted.length - 1]?.createdAt,
  };
}
