import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/mail";
import { verificationEmail } from "@/lib/email-templates";
import crypto from "crypto";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function createAndSendOtp(email: string, baseUrl?: string): Promise<void> {
  const code = generateCode();
  console.log(`[OTP] Code for ${email}: ${code}`);
  const hash = hashCode(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const db = getFirestore(getAdminApp());
  await db.collection("otps").doc(email).set({
    email,
    hash,
    expiresAt,
    attempts: 0,
  });

  try {
    await sendEmail({
      to: email,
      subject: "Your verification code — Pinay Victorious Beauty",
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="color: #3A2E2A; font-size: 22px; margin: 0 0 12px;">Your verification code</h1>
          <p style="color: #3A2E2A; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Use the code below to verify your email address. It expires in 5 minutes.
          </p>
          <div style="background: #FAF6F3; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #B76E79; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #3A2E2A80; font-size: 13px; line-height: 1.5; margin: 0;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send verification email (non-blocking):", emailError);
  }
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const db = getFirestore(getAdminApp());
  const doc = await db.collection("otps").doc(email).get();

  if (!doc.exists) return false;

  const data = doc.data()!;
  const now = new Date();

  if (now > data.expiresAt.toDate()) {
    await doc.ref.delete();
    return false;
  }

  if (data.attempts >= 3) {
    await doc.ref.delete();
    return false;
  }

  const inputHash = hashCode(code);
  if (inputHash !== data.hash) {
    await doc.ref.update({ attempts: data.attempts + 1 });
    return false;
  }

  await doc.ref.delete();
  return true;
}
