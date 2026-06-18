"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export interface User {
  uid: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapFirebaseUser(fu: FirebaseUser): User {
  return {
    uid: fu.uid,
    name: fu.displayName || fu.email?.split("@")[0] || "User",
    email: fu.email || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        setUser(mapFirebaseUser(fu));
        setEmailVerified(fu.emailVerified);
        try {
          const userDoc = await getDoc(doc(db, "users", fu.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser((prev) => prev ? { ...prev, name: data.name || prev.name } : null);
          }
        } catch {
          // Firestore rules may not be configured yet — continue with Firebase user data
        }
      } else {
        setUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fu = cred.user;
    setEmailVerified(fu.emailVerified);
    try {
      const userDoc = await getDoc(doc(db, "users", fu.uid));
      let name = fu.displayName || fu.email?.split("@")[0] || "User";
      if (userDoc.exists()) {
        name = userDoc.data().name || name;
      }
      setUser({ uid: fu.uid, name, email: fu.email || "" });
    } catch {
      setUser({ uid: fu.uid, name: fu.displayName || fu.email?.split("@")[0] || "User", email: fu.email || "" });
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const fu = cred.user;
    try {
      await setDoc(doc(db, "users", fu.uid), { name, email });
    } catch {
      // Firestore rules may not be configured yet — continue
    }
    await sendEmailVerification(fu);
    setUser({ uid: fu.uid, name, email: fu.email || "" });
    setEmailVerified(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const fu = cred.user;
    try {
      const userDoc = await getDoc(doc(db, "users", fu.uid));
      if (!userDoc.exists()) {
        const displayName = fu.displayName || fu.email?.split("@")[0] || "User";
        await setDoc(doc(db, "users", fu.uid), { name: displayName, email: fu.email });
      }
      let name = fu.displayName || fu.email?.split("@")[0] || "User";
      if (userDoc.exists()) {
        name = userDoc.data().name || name;
      }
      setUser({ uid: fu.uid, name, email: fu.email || "" });
    } catch {
      setUser({ uid: fu.uid, name: fu.displayName || fu.email?.split("@")[0] || "User", email: fu.email || "" });
    }
    setEmailVerified(fu.emailVerified);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setEmailVerified(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, emailVerified, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
