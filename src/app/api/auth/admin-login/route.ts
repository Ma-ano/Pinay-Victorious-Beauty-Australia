import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    const auth = getAdminAuth();

    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    const allowedAdminEmail = process.env.ADMIN_EMAIL || "admin@glowmuse.com";
    const userEmail = decoded.email || "";

    if (userEmail.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "This email is not authorized as the master admin account" },
        { status: 403 },
      );
    }

    const uid = decoded.uid;

    try {
      await auth.setCustomUserClaims(uid, { isAdmin: true, isMasterAdmin: true, email_verified: true });
    } catch {
      return NextResponse.json({ error: "Failed to set admin claims" }, { status: 500 });
    }

    try {
      await auth.updateUser(uid, { emailVerified: true });
    } catch {
      // non-critical
    }

    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json({ error: "Admin login failed" }, { status: 500 });
  }
}
