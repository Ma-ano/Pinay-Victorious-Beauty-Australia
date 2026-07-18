"use client";

import { getAuthClient, getGoogleProvider } from "@/lib/firebase";
import { setPersistence, browserLocalPersistence, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

let persistenceInitialized = false;

async function initAuthPersistence(): Promise<void> {
  if (persistenceInitialized) return;

  const auth = getAuthClient();
  if (!auth) throw new Error("Firebase Auth not initialized");

  await setPersistence(auth, browserLocalPersistence);
  persistenceInitialized = true;
}

async function handleRedirectResult(): Promise<null> {
  const auth = getAuthClient();
  if (!auth) return null;

  try {
    await getRedirectResult(auth);
    return null;
  } catch {
    return null;
  }
}

async function loginWithGoogle(): Promise<{ user: { uid: string } }> {
  await initAuthPersistence();

  const auth = getAuthClient();
  const provider = getGoogleProvider();

  if (!auth || !provider) {
    throw new Error("Firebase Auth or Google Provider not initialized");
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return { user: { uid: result.user.uid } };
  } catch (error: unknown) {
    const err = error as { code?: string };
    const code = err.code;

    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
      throw new Error("REDIRECT_INITIATED");
    }

    throw error;
  }
}

export { initAuthPersistence, loginWithGoogle, handleRedirectResult };