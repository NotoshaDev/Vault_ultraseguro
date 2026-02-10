'use client';

import { useEffect, useCallback, useRef } from 'react';
import { CRYPTO_CONSTANTS } from '@/lib/crypto';

interface UseAutoLockOptions {
  timeout?: number; // Timeout in milliseconds
  onLock: () => void; // Callback when auto-lock triggers
  enabled?: boolean; // Whether auto-lock is enabled
}

/**
 * Custom hook for automatic vault locking after inactivity
 * Monitors user activity and locks vault after specified timeout
 */
export function useAutoLock({
  timeout = CRYPTO_CONSTANTS.AUTO_LOCK_TIMEOUT,
  onLock,
  enabled = true,
}: UseAutoLockOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onLock();
    }, timeout);
  }, [timeout, onLock, enabled]);

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    if (!enabled) return;

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleActivity, resetTimer]);

  /**
   * Manually trigger lock
   */
  const lockNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onLock();
  }, [onLock]);

  /**
   * Get time until auto-lock
   */
  const getTimeUntilLock = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = timeout - elapsed;
    return Math.max(0, remaining);
  }, [timeout]);

  return {
    lockNow,
    resetTimer,
    getTimeUntilLock,
  };
}
