"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onIdTokenChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  type User as FirebaseUser,
  type Auth,
  type GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, type Firestore } from "firebase/firestore";
import { getAuthClient as getFirebaseAuth, getDb as getFirebaseDb, getGoogleProvider as getFirebaseGoogleProvider } from "@/lib/firebase";
import type { Address, StateCode } from "./address";
import { createDefaultAddress, normalizeState } from "./address";

let _firebase: { auth: Auth; db: Firestore; googleProvider: GoogleAuthProvider } | null = null;
function getFirebase() {
  if (!_firebase) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth not initialized");
    const db = getFirebaseDb();
    if (!db) throw new Error("Firestore not initialized");
    const googleProvider = getFirebaseGoogleProvider();
    if (!googleProvider) throw new Error("Google Auth provider not initialized");
    _firebase = { auth, db, googleProvider };
  }
  return _firebase;
}

export type { Address, StateCode } from "./address";
export { createDefaultAddress, STATE_OPTIONS, normalizeState } from "./address";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  address: Address;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  isAuthenticated: boolean;
  needsVerification: boolean;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string, address?: Address) => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; photoURL?: string; address?: Address }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const defaultAddress: Address = createDefaultAddress();

function migrateAddress(raw: Record<string, unknown> | undefined): Address {
  if (!raw) return { ...defaultAddress };
  const state = normalizeState(raw.state as string) || "NSW";
  if ("addressLine1" in raw) {
    return { ...(raw as unknown as Address), state };
  }
  return {
    addressLine1: (raw.street as string) || "",
    addressLine2: raw.suburb && raw.city && raw.suburb !== raw.city ? (raw.suburb as string) : undefined,
    suburb: (raw.city as string) || (raw.suburb as string) || "",
    state,
    postcode: (raw.postcode as string) || "",
  };
}

const defaultUser: Omit<User, "uid" | "name" | "email"> = {
  phone: "",
  photoURL: "",
  address: { ...defaultAddress },
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapFirebaseUser(fu: FirebaseUser): User {
  return {
    ...defaultUser,
    uid: fu.uid,
    name: fu.displayName || fu.email?.split("@")[0] || "User",
    email: fu.email || "",
          photoURL: fu.photoURL || "",
  };
}

async function syncSession(fu: FirebaseUser | null) {
  try {
    if (fu) {
      const idToken = await fu.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    } else {
      await fetch("/api/auth/session", { method: "DELETE" });
    }
  } catch {
    // Session sync is best-effort
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  const isAuthenticated = user !== null && emailVerified;
  const needsVerification = user !== null && !emailVerified;

  async function checkAdminClaim(fu: import("firebase/auth").User) {
    try {
      const tokenResult = await fu.getIdTokenResult();
      setIsAdmin(tokenResult.claims.isAdmin === true);
      setIsMasterAdmin(tokenResult.claims.isMasterAdmin === true);
    } catch {
      setIsAdmin(false);
      setIsMasterAdmin(false);
    }
  }

  useEffect(() => {
    const { auth, db } = getFirebase();
    let fresh = false;
    const unsub = onIdTokenChanged(auth, async (fu) => {
      if (fu) {
        setEmailVerified(fu.emailVerified);
        if (!fresh) {
          fresh = true;
          await fu.getIdToken(true);
          return;
        }
        await checkAdminClaim(fu);
        const base = mapFirebaseUser(fu);
        try {
          const userDoc = await getDoc(doc(db, "users", fu.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              ...base,
              name: data.name || base.name,
              phone: data.phone || "",
              photoURL: data.photoURL || base.photoURL,
              address: migrateAddress(data.address),
            });
          } else {
            setUser(base);
          }
        } catch {
          setUser(base);
        }
        await syncSession(fu);
      } else {
        setUser(null);
        setEmailVerified(false);
        setIsAdmin(false);
        setIsMasterAdmin(false);
        await syncSession(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { auth } = getFirebase();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const tr = await cred.user.getIdTokenResult();
    return tr.claims.isAdmin === true;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string, address?: Address) => {
    const userAddress = address || createDefaultAddress();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone?.trim() || undefined,
        address: userAddress,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = (data as { error?: string }).error || "Registration failed";
      if (res.status === 409) {
        throw { code: "auth/email-already-in-use", message: msg };
      }
      throw new Error(msg);
    }

    const { auth } = getFirebase();
    await signInWithEmailAndPassword(auth, email.trim(), password);
    setEmailVerified(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { auth, db, googleProvider } = getFirebase();
    let cred;
    try {
      cred = await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      const code = fbErr?.code;
      console.error("[Google Sign-In]", code, fbErr?.message);
      if (code === "auth/account-exists-with-different-credential") {
        throw new Error("An account with this email already exists. Please sign in with your email and password instead.");
      }
      if (code === "auth/popup-blocked") {
        throw new Error("Google sign-in popup was blocked. Please allow popups for this site and try again.");
      }
      if (code === "auth/unauthorized-domain") {
        throw new Error("Google sign-in is not configured for this domain. Please contact support.");
      }
      if (code === "auth/operation-not-allowed") {
        throw new Error("Google sign-in is not enabled. Please contact support.");
      }
      if (code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in was cancelled.");
      }
      throw new Error(`Google sign-in failed${code ? ` (${code})` : ""}. Please try again.`);
    }
    const fu = cred.user;
    const { db: firestore } = getFirebase();
    try {
      const userDoc = await getDoc(doc(firestore, "users", fu.uid));
      if (!userDoc.exists()) {
        const displayName = fu.displayName || fu.email?.split("@")[0] || "User";
        await setDoc(doc(firestore, "users", fu.uid), {
          name: displayName,
          email: fu.email,
          phone: "",
          photoURL: "",
          address: createDefaultAddress(),
          role: "customer",
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // user doc creation is best-effort
    }
    try {
      const tr = await fu.getIdTokenResult();
      return tr.claims.isAdmin === true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const { auth } = getFirebase();
    await signOut(auth);
    setUser(null);
    setEmailVerified(false);
    await syncSession(null);
  }, []);

  const resendVerification = useCallback(async (emailOverride?: string) => {
    const email = emailOverride || user?.email;
    if (!email) throw new Error("Email is required");
    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Failed to resend verification email");
  }, [user?.email]);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string; photoURL?: string; address?: Address }) => {
    const { db } = getFirebase();
    if (!user) throw new Error("Not authenticated");

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
    if (data.address !== undefined) updateData.address = data.address;

    await updateDoc(doc(db, "users", user.uid), updateData);

    setUser((prev) => prev ? {
      ...prev,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
    } : null);
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const { auth } = getFirebase();
    const fu = auth.currentUser;
    if (!fu || !user) throw new Error("Not authenticated");

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(fu, credential);
    await updatePassword(fu, newPassword);
  }, [user]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const { auth } = getFirebase();
    try {
      const fu = auth.currentUser;
      if (!fu) return null;
      return await fu.getIdToken(true);
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    user, loading, emailVerified, isAuthenticated, needsVerification,
    isAdmin, isMasterAdmin, login, register, loginWithGoogle,
    logout, updateProfile, changePassword, resendVerification, getIdToken,
  }), [user, loading, emailVerified, isAdmin, isMasterAdmin, isAuthenticated, needsVerification,
    login, register, loginWithGoogle, logout, updateProfile, changePassword, resendVerification, getIdToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
