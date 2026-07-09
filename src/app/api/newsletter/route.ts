import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { welcomeEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

function getBaseUrl(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return process.env.SITE_URL || "https://pinayvictorious.com";
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const displayName = name || email.split("@")[0];

    await sendEmail({
      to: email,
      subject: "Welcome to Pinay Victorious Beauty!",
      html: welcomeEmail(displayName, getBaseUrl(request)),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send newsletter welcome:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
