import { NextResponse } from "next/server";
import { getAdminApp, FirebaseAdminNotConfigured } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const SENSITIVE_KEYS = ["FIREBASE_ADMIN_PRIVATE_KEY", "ADMIN_SETUP_SECRET", "SMTP_PASS"];

function isPresent(key: string): boolean {
  const val = process.env[key];
  return !!val && val.length > 0;
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const vars = [
    "SITE_URL",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "ADMIN_EMAIL",
    "ADMIN_SETUP_SECRET",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
    "PAYPAL_CLIENT_SECRET",
  ];

  const status: Record<string, "present" | "missing"> = {};
  const missing: string[] = [];

  for (const key of vars) {
    if (isPresent(key)) {
      status[key] = "present";
    } else {
      status[key] = "missing";
      missing.push(key);
    }
  }

  let adminSdkOk = false;
  let adminSdkError: string | null = null;
  try {
    getAdminApp();
    adminSdkOk = true;
  } catch (err) {
    adminSdkError = err instanceof FirebaseAdminNotConfigured
      ? `Missing: ${err.missing.join(", ")}`
      : err instanceof Error
        ? err.message
        : String(err);
  }

  return NextResponse.json({
    configured: missing.length === 0,
    missing,
    vars: status,
    adminSdk: { ok: adminSdkOk, error: adminSdkError },
    nodeEnv: process.env.NODE_ENV || "unknown",
    note: SENSITIVE_KEYS,
  });
}
