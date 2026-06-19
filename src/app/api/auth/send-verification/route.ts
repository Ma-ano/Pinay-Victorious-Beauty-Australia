import { NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/otp";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const baseUrl =
      request.headers.get("origin") ||
      process.env.SITE_URL ||
      "https://pinayvictorious.com";

    await createAndSendOtp(trimmed, baseUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
