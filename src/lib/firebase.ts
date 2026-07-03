import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function createApp() {
  try {
    if (!firebaseConfig.apiKey) return null;
    if (getApps().length === 0) {
      return initializeApp(firebaseConfig);
    }
    return getApps()[0];
  } catch {
    return null;
  }
}

let _app: ReturnType<typeof initializeApp> | null | undefined;
let _auth: ReturnType<typeof getAuth> | null | undefined;
let _db: ReturnType<typeof getFirestore> | null | undefined;
let _storage: ReturnType<typeof getStorage> | null | undefined;
let _googleProvider: GoogleAuthProvider | null | undefined;

export function getApp() {
  if (_app === undefined) _app = createApp();
  return _app;
}

export function getAuthClient() {
  if (_auth === undefined) {
    const a = getApp();
    _auth = a ? getAuth(a) : null;
  }
  return _auth;
}

export function getDb() {
  if (_db === undefined) {
    const a = getApp();
    _db = a ? getFirestore(a) : null;
  }
  return _db;
}

export function getStorageClient() {
  if (_storage === undefined) {
    const a = getApp();
    _storage = a ? getStorage(a) : null;
  }
  return _storage;
}

export function getGoogleProvider() {
  if (_googleProvider === undefined) {
    _googleProvider = getApp() ? new GoogleAuthProvider() : null;
  }
  return _googleProvider;
}
