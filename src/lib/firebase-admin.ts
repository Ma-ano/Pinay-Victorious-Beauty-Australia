import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export class FirebaseAdminNotConfigured extends Error {
  missing: string[];

  constructor(missing: string[] = []) {
    const msg = missing.length
      ? `Firebase Admin SDK not configured — missing: ${missing.join(", ")}`
      : "Firebase Admin SDK not configured";
    super(msg);
    this.name = "FirebaseAdminNotConfigured";
    this.missing = missing;
  }
}

function cleanPrivateKey(key: string | undefined): string {
  if (!key) return "";
  let cleaned = key.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, "\n");
}

export function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new FirebaseAdminNotConfigured(missing);
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: cleanPrivateKey(privateKey),
      }),
    });
  } catch (err) {
    throw new Error(
      `Firebase Admin SDK initialization failed: ${err instanceof Error ? err.message : err}`,
    );
  }
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
