import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ticket, TicketSyncResult } from '../types/ticket';

const TICKETS_STORAGE_KEY = '@vexeviet_tickets';
const SYNC_QUEUE_KEY = '@vexeviet_sync_queue';

export async function initOfflineStorage(): Promise<void> {
  const tickets = await AsyncStorage.getItem(TICKETS_STORAGE_KEY);
  if (tickets === null) {
    await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify([]));
  }
  
  const syncQueue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (syncQueue === null) {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
  }
}

export async function saveTicket(ticket: Ticket): Promise<void> {
  const tickets = await getTickets();
  const existingIndex = tickets.findIndex((t) => t.id === ticket.id);
  
  const ticketToSave: Ticket = {
    ...ticket,
    syncedAt: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    tickets[existingIndex] = ticketToSave;
  } else {
    tickets.push(ticketToSave);
  }
  
  await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
}

export async function getTickets(): Promise<Ticket[]> {
  const ticketsJson = await AsyncStorage.getItem(TICKETS_STORAGE_KEY);
  if (!ticketsJson) {
    return [];
  }
  
  try {
    return JSON.parse(ticketsJson) as Ticket[];
  } catch {
    return [];
  }
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const tickets = await getTickets();
  return tickets.find((t) => t.id === id) ?? null;
}

export async function deleteTicket(id: string): Promise<void> {
  const tickets = await getTickets();
  const filteredTickets = tickets.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(filteredTickets));
}

export async function clearTickets(): Promise<void> {
  await AsyncStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify([]));
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
}

async function getSyncQueue(): Promise<string[]> {
  const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!queueJson) {
    return [];
  }
  try {
    return JSON.parse(queueJson) as string[];
  } catch {
    return [];
  }
}

async function addToSyncQueue(ticketId: string): Promise<void> {
  const queue = await getSyncQueue();
  if (!queue.includes(ticketId)) {
    queue.push(ticketId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }
}

async function removeFromSyncQueue(ticketId: string): Promise<void> {
  const queue = await getSyncQueue();
  const filtered = queue.filter((id) => id !== ticketId);
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
}

export async function syncTickets(): Promise<TicketSyncResult> {
  const result: TicketSyncResult = {
    synced: [],
    failed: [],
    newTickets: [],
  };
  
  try {
    const localTickets = await getTickets();
    const syncQueue = await getSyncQueue();
    
    for (const ticketId of syncQueue) {
      const ticket = localTickets.find((t) => t.id === ticketId);
      if (ticket && ticket.isOfflineOnly) {
        try {
          // TODO: Replace with actual API call
          // await api.tickets.sync(ticket);
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          ticket.isOfflineOnly = false;
          ticket.syncedAt = new Date().toISOString();
          await saveTicket(ticket);
          await removeFromSyncQueue(ticketId);
          result.synced.push(ticketId);
        } catch {
          result.failed.push(ticketId);
        }
      }
    }
    
    try {
      // TODO: Replace with actual API call to fetch user's tickets
      // const serverTickets = await api.tickets.getUserTickets();
      const serverTickets: Ticket[] = [];
      
      for (const serverTicket of serverTickets) {
        const localTicket = localTickets.find((t) => t.id === serverTicket.id);
        if (!localTicket) {
          await saveTicket(serverTicket);
          result.newTickets.push(serverTicket);
        } else if (
          serverTicket.syncedAt &&
          localTicket.syncedAt &&
          new Date(serverTicket.syncedAt) > new Date(localTicket.syncedAt)
        ) {
          await saveTicket(serverTicket);
        }
      }
    } catch {
      // Server fetch failed, continue with local data
    }
  } catch {
    // Sync failed silently
  }
  
  return result;
}

export async function saveTicketOffline(ticket: Ticket): Promise<void> {
  const offlineTicket: Ticket = {
    ...ticket,
    isOfflineOnly: true,
    syncedAt: undefined,
  };
  
  await saveTicket(offlineTicket);
  await addToSyncQueue(ticket.id);
}
