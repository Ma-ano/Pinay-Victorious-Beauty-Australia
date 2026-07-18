"use client";

import { useState, useCallback, useRef } from "react";
import { loginWithGoogle } from "@/lib/authService";

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const login = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      return result;
    } catch (error) {
      const err = error as Error;
      if (err.message === "REDIRECT_INITIATED") {
        return { redirect: true };
      }
      throw error;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  return { login, loading };
}