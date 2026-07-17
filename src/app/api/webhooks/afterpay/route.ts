import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const AFTERPAY_SECRET_KEY = process.env.AFTERPAY_SECRET_KEY || "";

function verifySignature(rawBody: string, signatureHeader: string): boolean {
  if (!AFTERPAY_SECRET_KEY) return false;
  const expected = crypto
    .createHmac("sha256", AFTERPAY_SECRET_KEY)
    .update(rawBody, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Webhook-Signature") || "";

    if (!verifySignature(rawBody, signature)) {
      console.error("Afterpay webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const eventId = event.id as string;
    const payload = event.payment || event.payload || {};
    const orderId = payload.id as string | undefined;

    console.log(`Afterpay webhook received: ${eventType} (id: ${eventId})`);

    if (eventType === "payment:created") {
      return NextResponse.json({ received: true });
    }

    if (eventType === "payment:approved" || eventType === "payment:captured") {
      if (!orderId) {
        console.log(`Afterpay webhook: no order ID in ${eventType} event`);
        return NextResponse.json({ received: true });
      }

      const db = getAdminDb();
      const snap = await db.collection("orders")
        .where("afterpayOrderId", "==", orderId)
        .limit(1)
        .get();

      if (snap.empty) {
        console.log(`Afterpay webhook: order not found for ${orderId}`);
        return NextResponse.json({ received: true });
      }

      const doc = snap.docs[0];
      const orderData = doc.data();

      if (orderData.paymentStatus === "paid") {
        console.log(`Afterpay webhook: order ${orderId} already paid, skipping`);
        return NextResponse.json({ received: true });
      }

      await doc.ref.update({
        paymentStatus: "paid",
        updatedAt: new Date().toISOString(),
      });

      console.log(`Afterpay webhook: order ${orderId} marked as paid`);
      return NextResponse.json({ received: true });
    }

    if (eventType === "payment:declined" || eventType === "payment:failed") {
      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      const db = getAdminDb();
      const snap = await db.collection("orders")
        .where("afterpayOrderId", "==", orderId)
        .limit(1)
        .get();

      if (!snap.empty) {
        await snap.docs[0].ref.update({
          paymentStatus: "declined",
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({ received: true });
    }

    console.log(`Afterpay webhook: unhandled event ${eventType}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Afterpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
