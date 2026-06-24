import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const auth = getAdminAuth();

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(trimmedEmail);
    } catch {
      return NextResponse.json(
        { error: "No account found with this email. The user must register first." },
        { status: 404 },
      );
    }

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User document not found in Firestore" },
        { status: 404 },
      );
    }

    await auth.setCustomUserClaims(userRecord.uid, { isAdmin: true });
    await db.collection("users").doc(userRecord.uid).update({ role: "admin" });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: trimmedEmail,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create admin";
    console.error("Create admin error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
