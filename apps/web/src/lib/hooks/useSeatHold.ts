/**
 * Hook for managing seat holding functionality
 * Handles hold, release, and expiration logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { holdSeats, releaseSeats, getSeatAvailability } from '@/lib/api/bookings';
import { HoldSeatsRequest, ReleaseSeatsRequest, HoldSeatsResponse } from '@vexeviet/types';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  setHoldInfo, 
  clearHoldInfo, 
  selectHoldId, 
  selectHoldExpiresAt 
} from '@/store/slices/bookingSlice';

// Storage keys for persistence
const HOLD_STORAGE_KEY = 'vexeviet_seat_hold';

interface HoldStorageData {
  holdId: string;
  expiresAt: string;
  seats: string[];
  routeId: string;
  departureDate: string;
}

interface UseSeatHoldOptions {
  onHoldSuccess?: (data: HoldSeatsResponse) => void;
  onHoldError?: (error: Error) => void;
  onExpire?: () => void;
  onReleaseSuccess?: () => void;
  onReleaseError?: (error: Error) => void;
}

interface UseSeatHoldReturn {
  // State
  holdId: string | null;
  expiresAt: string | null;
  isHolding: boolean;
  isReleasing: boolean;
  isExpired: boolean;
  timeRemaining: number; // in seconds
  
  // Actions
  hold: (request: HoldSeatsRequest) => Promise<HoldSeatsResponse>;
  release: () => Promise<void>;
  refreshAvailability: (routeId: string, departureDate: string) => Promise<void>;
  clearHold: () => void;
}

/**
 * Save hold data to sessionStorage for persistence across page refreshes
 */
function saveHoldToStorage(data: HoldStorageData): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(HOLD_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Load hold data from sessionStorage
 */
function loadHoldFromStorage(): HoldStorageData | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(HOLD_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored) as HoldStorageData;
    // Check if hold has expired
    if (new Date(data.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(HOLD_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    sessionStorage.removeItem(HOLD_STORAGE_KEY);
    return null;
  }
}

/**
 * Clear hold data from sessionStorage
 */
function clearHoldFromStorage(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(HOLD_STORAGE_KEY);
}

export function useSeatHold(options: UseSeatHoldOptions = {}): UseSeatHoldReturn {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // Get hold info from Redux store
  const holdId = useAppSelector(selectHoldId);
  const expiresAt = useAppSelector(selectHoldExpiresAt);
  
  // Local state for time tracking
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  
  // Refs for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expireCallbackRef = useRef(options.onExpire);
  
  // Keep callback ref updated
  useEffect(() => {
    expireCallbackRef.current = options.onExpire;
  }, [options.onExpire]);
  
  // Initialize from storage on mount
  useEffect(() => {
    const storedHold = loadHoldFromStorage();
    if (storedHold && !holdId) {
      dispatch(setHoldInfo({
        holdId: storedHold.holdId,
        expiresAt: storedHold.expiresAt,
        seats: storedHold.seats,
      }));
    }
  }, [dispatch, holdId]);
  
  // Calculate time remaining and handle expiration
  useEffect(() => {
    if (!expiresAt) {
      setTimeRemaining(0);
      setIsExpired(false);
      return;
    }
    
    const calculateRemaining = () => {
      const expireTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expireTime - now) / 1000));
      return remaining;
    };
    
    // Initial calculation
    const initial = calculateRemaining();
    setTimeRemaining(initial);
    setIsExpired(initial <= 0);
    
    if (initial <= 0) {
      // Already expired
      expireCallbackRef.current?.();
      return;
    }
    
    // Update every second
    timerRef.current = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsExpired(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        expireCallbackRef.current?.();
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [expiresAt]);
  
  // Hold seats mutation
  const holdMutation = useMutation({
    mutationFn: (request: HoldSeatsRequest) => holdSeats(request),
    onSuccess: (data, variables) => {
      // Save to Redux store
      dispatch(setHoldInfo({
        holdId: data.holdId,
        expiresAt: data.expiresAt,
        seats: data.seats,
      }));
      
      // Save to sessionStorage for persistence
      saveHoldToStorage({
        holdId: data.holdId,
        expiresAt: data.expiresAt,
        seats: data.seats,
        routeId: variables.routeId,
        departureDate: variables.departureDate,
      });
      
      setIsExpired(false);
      options.onHoldSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onHoldError?.(error);
    },
  });
  
  // Release seats mutation
  const releaseMutation = useMutation({
    mutationFn: (request: ReleaseSeatsRequest) => releaseSeats(request),
    onSuccess: () => {
      dispatch(clearHoldInfo());
      clearHoldFromStorage();
      setIsExpired(false);
      setTimeRemaining(0);
      options.onReleaseSuccess?.();
    },
    onError: (error: Error) => {
      options.onReleaseError?.(error);
    },
  });
  
  // Hold action
  const hold = useCallback(async (request: HoldSeatsRequest): Promise<HoldSeatsResponse> => {
    return holdMutation.mutateAsync(request);
  }, [holdMutation]);
  
  // Release action
  const release = useCallback(async (): Promise<void> => {
    if (!holdId) return;
    await releaseMutation.mutateAsync({ holdId });
  }, [holdId, releaseMutation]);
  
  // Refresh seat availability
  const refreshAvailability = useCallback(async (routeId: string, departureDate: string): Promise<void> => {
    // Invalidate any cached seat availability data
    await queryClient.invalidateQueries({ queryKey: ['seats', 'availability', routeId, departureDate] });
    // Optionally fetch fresh data
    await getSeatAvailability(routeId, departureDate);
  }, [queryClient]);
  
  // Clear hold without API call (for local cleanup)
  const clearHold = useCallback(() => {
    dispatch(clearHoldInfo());
    clearHoldFromStorage();
    setIsExpired(false);
    setTimeRemaining(0);
  }, [dispatch]);
  
  return {
    holdId,
    expiresAt,
    isHolding: holdMutation.isPending,
    isReleasing: releaseMutation.isPending,
    isExpired,
    timeRemaining,
    hold,
    release,
    refreshAvailability,
    clearHold,
  };
}

export default useSeatHold;
