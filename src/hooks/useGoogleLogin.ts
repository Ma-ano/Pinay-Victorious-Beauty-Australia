"use client";

import { useState, useCallback, useRef } from "react";
import type { UserCredential } from "firebase/auth";
import { loginWithGoogle } from "@/lib/authService";

type GoogleLoginResult =
  | { redirect: true }
  | { isAdmin: boolean };

async function getIsAdmin(cred: UserCredential): Promise<boolean> {
  try {
    const tr = await cred.user.getIdTokenResult();
    return tr.claims.isAdmin === true;
  } catch {
    return false;
  }
}

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const login = useCallback(async (): Promise<GoogleLoginResult> => {
    if (loadingRef.current) return { isAdmin: false };
    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      const isAdmin = await getIsAdmin(result);
      return { isAdmin };
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