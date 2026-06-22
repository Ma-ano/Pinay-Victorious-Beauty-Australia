import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export class FirebaseAdminNotConfigured extends Error {
  constructor() {
    super("Firebase Admin SDK not configured");
    this.name = "FirebaseAdminNotConfigured";
  }
}

let _initAttempted = false;

export function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  if (_initAttempted) throw new FirebaseAdminNotConfigured();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    _initAttempted = true;
    throw new FirebaseAdminNotConfigured();
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export async function setAdminClaim(uid: string) {
  await getAdminAuth().setCustomUserClaims(uid, { isAdmin: true });
}

export async function setAdminVerified(uid: string) {
  await getAdminAuth().updateUser(uid, { emailVerified: true });
  await getAdminAuth().setCustomUserClaims(uid, { isAdmin: true, email_verified: true });
}
