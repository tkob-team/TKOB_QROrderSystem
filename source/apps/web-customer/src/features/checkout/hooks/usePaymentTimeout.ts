/**
 * Payment Timeout Handler
 * Manages payment timeout scenarios
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UsePaymentTimeoutReturn {
  timeRemaining: number; // seconds
  isExpired: boolean;
  isWarning: boolean; // < 2 minutes remaining
  formattedTime: string;
  extendTimeout: () => void;
}

interface UsePaymentTimeoutOptions {
  expiresAt: Date | string;
  warningThreshold?: number; // seconds, default 120 (2 min)
  onExpired?: () => void;
  onWarning?: () => void;
}

export function usePaymentTimeout({
  expiresAt,
  warningThreshold = 120,
  onExpired,
  onWarning,
}: UsePaymentTimeoutOptions): UsePaymentTimeoutReturn {
  const expiryTime = new Date(expiresAt).getTime();
  
  const calculateRemaining = useCallback(() => {
    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  }, [expiryTime]);

  const [timeRemaining, setTimeRemaining] = useState(calculateRemaining);
  const [hasWarned, setHasWarned] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);

      // Check warning threshold
      if (!hasWarned && remaining <= warningThreshold && remaining > 0) {
        setHasWarned(true);
        onWarning?.();
      }

      // Check expiry
      if (!hasExpired && remaining === 0) {
        setHasExpired(true);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining, warningThreshold, hasWarned, hasExpired, onWarning, onExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extendTimeout = useCallback(() => {
    // This would typically call an API to extend the payment timeout
    // For now, just log
    console.log('Request to extend payment timeout');
  }, []);

  return {
    timeRemaining,
    isExpired: timeRemaining === 0,
    isWarning: timeRemaining <= warningThreshold && timeRemaining > 0,
    formattedTime: formatTime(timeRemaining),
    extendTimeout,
  };
}
