import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { contactNotification } from "@/lib/email-templates";
import { checkRateLimit } from "@/lib/rate-limit";

function getBaseUrl(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return process.env.SITE_URL || "https://pinayvictorious.com";
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export async function POST(request: Request) {
  try {
    const { name, email, message, _hp } = await request.json();

    if (_hp) {
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.resetIn / 60000);
      return NextResponse.json(
        { error: `Too many messages. Try again in ${minutes} minute(s).` },
        { status: 429 },
      );
    }

    const recipient = process.env.SMTP_USER;
    if (!recipient) {
      return NextResponse.json({ error: "Contact email not configured" }, { status: 500 });
    }

    await sendEmail({
      to: recipient,
      subject: `New Contact Form Message from ${name}`,
      html: contactNotification({ name, email, message }, getBaseUrl(request)),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
