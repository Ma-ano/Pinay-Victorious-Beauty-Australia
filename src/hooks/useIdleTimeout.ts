"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseIdleTimeoutOptions {
  timeoutDuration: number;
  warningDuration: number;
  enabled: boolean;
  onWarning: () => void;
  onTimeout: () => void | Promise<void>;
}

interface UseIdleTimeoutReturn {
  warning: boolean;
  remainingSeconds: number;
  resetTimer: () => void;
}

export function useIdleTimeout({
  timeoutDuration,
  warningDuration,
  enabled,
  onWarning,
  onTimeout,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [warning, setWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeWarningRef = useRef(false);
  const onWarningRef = useRef(onWarning);
  const onTimeoutRef = useRef(onTimeout);
  onWarningRef.current = onWarning;
  onTimeoutRef.current = onTimeout;

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (warningTimerRef.current) { clearTimeout(warningTimerRef.current); warningTimerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const resetTimer = useCallback(() => {
    setWarning(false);
    activeWarningRef.current = false;
    clearAllTimers();

    const warningTimer = setTimeout(() => {
      setWarning(true);
      activeWarningRef.current = true;
      setRemainingSeconds(Math.ceil(warningDuration / 1000));
      onWarningRef.current();

      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutDuration - warningDuration);

    warningTimerRef.current = warningTimer;

    const timeoutTimer = setTimeout(async () => {
      clearAllTimers();
      setWarning(false);
      activeWarningRef.current = false;
      await onTimeoutRef.current();
    }, timeoutDuration);

    timeoutRef.current = timeoutTimer;
  }, [timeoutDuration, warningDuration, clearAllTimers]);

  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      setWarning(false);
      activeWarningRef.current = false;
      return;
    }

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click", "wheel"];
    const handleActivity = () => {
      if (!activeWarningRef.current) resetTimer();
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearAllTimers();
    };
  }, [enabled, resetTimer, clearAllTimers]);

  return { warning, remainingSeconds, resetTimer };
}
