import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const valid = await verifyOtp(trimmedEmail, code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(trimmedEmail);

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email already verified" });
    }

    await auth.updateUser(user.uid, { emailVerified: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
