import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { contactNotification } from "@/lib/email-templates";
import { site } from "@/data/site";

function getBaseUrl(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return process.env.SITE_URL || "https://pinayvictorious.com";
}

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    await sendEmail({
      to: site.email,
      subject: `New Contact Form Message from ${name}`,
      html: contactNotification({ name, email, message }, getBaseUrl(request)),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
