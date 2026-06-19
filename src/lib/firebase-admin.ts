import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK not configured. " +
      "Set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
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
