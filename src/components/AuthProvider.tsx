"use client";

import { useEffect } from "react";
import { handleRedirectResult } from "@/lib/authService";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    async function checkRedirect() {
      if (cancelled) return;
      await handleRedirectResult();
    }

    checkRedirect();
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}