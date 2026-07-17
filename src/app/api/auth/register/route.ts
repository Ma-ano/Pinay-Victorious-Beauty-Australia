import { NextResponse } from "next/server";
import { getAdminAuth, getAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { createAndSendOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, address } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const auth = getAdminAuth();

    let userRecord;
    try {
      userRecord = await auth.createUser({
        displayName: name.trim(),
        email: trimmedEmail,
        password,
      });
    } catch (err: unknown) {
      const fbErr = err as { code?: string };
      if (fbErr.code === "auth/email-already-exists") {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
      throw err;
    }

    const db = getFirestore(getAdminApp());
    await db.collection("users").doc(userRecord.uid).set({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone?.trim() || "",
      photoURL: "",
      address: address || { street: "", city: "", state: "", postcode: "", country: "Australia" },
      role: "customer",
      status: "active",
      createdAt: new Date().toISOString(),
    });

    const baseUrl =
      request.headers.get("origin") ||
      process.env.SITE_URL ||
      "https://pinayvictorious.com";

    try {
      await createAndSendOtp(trimmedEmail, baseUrl);
    } catch (otpError) {
      console.error("Failed to send verification email (non-blocking):", otpError);
    }

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
