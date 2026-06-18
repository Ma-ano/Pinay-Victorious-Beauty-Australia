import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAy_skrFRKL6r2d4nZ2xN7VFClVnWXCzT4",
  authDomain: "pinay-victorious.firebaseapp.com",
  projectId: "pinay-victorious",
  storageBucket: "pinay-victorious.firebasestorage.app",
  messagingSenderId: "790219557621",
  appId: "1:790219557621:web:3d69c4f9497b855f3ed3bc",
  measurementId: "G-0FPJRXGTXM",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
