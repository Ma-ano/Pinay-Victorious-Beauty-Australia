"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./Toast";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

const ADMIN_TIMEOUT = 30 * 60 * 1000;
const CUSTOMER_TIMEOUT = 4 * 60 * 60 * 1000;
const WARNING_DURATION = 60 * 1000;

// testing time
// const ADMIN_TIMEOUT = 30 * 1000;        // 30 seconds
// const CUSTOMER_TIMEOUT = 30 * 1000;     // 30 seconds (if same)
// const WARNING_DURATION = 10 * 1000;     // 10 seconds warning

export default function IdleTimeoutProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const enabled = isAuthenticated && !loading;
  const timeoutDuration = useMemo(() => (isAdmin ? ADMIN_TIMEOUT : CUSTOMER_TIMEOUT), [isAdmin]);

  const handleTimeout = useCallback(async () => {
    setShowModal(false);
    await logout();
    showToast("Session expired due to inactivity", "info");
  }, [logout, showToast]);

  const handleWarning = useCallback(() => {
    setShowModal(true);
  }, []);

  const { warning, remainingSeconds, resetTimer } = useIdleTimeout({
    timeoutDuration,
    warningDuration: WARNING_DURATION,
    enabled,
    onWarning: handleWarning,
    onTimeout: handleTimeout,
  });

  useEffect(() => {
    if (!warning) setShowModal(false);
  }, [warning]);

  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
    setShowModal(false);
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const stamp = () => {
      document.cookie = `lastActivityAt=${Date.now()};path=/;maxAge=${7 * 24 * 60 * 60};samesite=lax`;
    };
    stamp();
    const heartbeat = setInterval(stamp, 2 * 60 * 1000);
    return () => clearInterval(heartbeat);
  }, [isAuthenticated]);

  const activityRef = useRef(Date.now());
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleActivity = () => {
      const now = Date.now();
      if (now - activityRef.current > 30000) {
        activityRef.current = now;
        document.cookie = `lastActivityAt=${now};path=/;maxAge=${7 * 24 * 60 * 60};samesite=lax`;
      }
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click", "wheel"];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [isAuthenticated]);

  return (
    <>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-2xl shadow-xl border border-card-border text-center max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-dark mb-2">Session Expiring</h3>
            <p className="text-sm text-foreground mb-4">
              Your session will expire in <strong>{remainingSeconds}</strong> seconds due to inactivity.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(remainingSeconds / (WARNING_DURATION / 1000)) * 100}%` }}
              />
            </div>
            <button
              onClick={handleStayLoggedIn}
              className="bg-accent text-white px-6 py-2 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </>
  );
}
