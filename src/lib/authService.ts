"use client";

import { getAuthClient, getGoogleProvider } from "@/lib/firebase";
import {
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
  type UserCredential,
} from "firebase/auth";

let persistenceInitialized = false;

async function initAuthPersistence(): Promise<void> {
  if (persistenceInitialized) return;

  const auth = getAuthClient();
  if (!auth) throw new Error("Firebase Auth not initialized");

  await setPersistence(auth, browserLocalPersistence);
  persistenceInitialized = true;
}

async function handleRedirectResult(): Promise<User | null> {
  const auth = getAuthClient();
  if (!auth) return null;

  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch {
    return null;
  }
}

async function loginWithGoogle(): Promise<UserCredential> {
  await initAuthPersistence();

  const auth = getAuthClient();
  const provider = getGoogleProvider();

  if (!auth || !provider) {
    throw new Error("Firebase Auth or Google Provider not initialized");
  }

  try {
    return await signInWithPopup(auth, provider);
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
