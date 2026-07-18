import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    const auth = getAdminAuth();

    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
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
    console.error("Failed to create session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("__session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
