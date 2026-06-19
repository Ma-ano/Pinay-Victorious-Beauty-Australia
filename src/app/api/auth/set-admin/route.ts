import { NextResponse } from "next/server";
import { getAdminAuth, setAdminVerified } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { email, setupSecret } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const allowedAdminEmail = process.env.ADMIN_EMAIL || "admin@glowmuse.com";
    if (email.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
      return NextResponse.json({ error: "This email is not configured as the admin account" }, { status: 403 });
    }

    const configuredSecret = process.env.ADMIN_SETUP_SECRET;
    const providedSecret = request.headers.get("x-admin-setup-secret") || setupSecret;
    if (configuredSecret && providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "Invalid admin setup secret" }, { status: 401 });
    }

    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(email);
    await setAdminVerified(user.uid);

    return NextResponse.json({ success: true, uid: user.uid, message: "Admin promoted and email verified" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to set admin claim";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
