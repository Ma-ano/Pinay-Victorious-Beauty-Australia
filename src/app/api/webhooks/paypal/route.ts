import { NextResponse } from "next/server";
import { verifyPayPalWebhookSignature } from "@/lib/paypal";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const authAlgo = request.headers.get("PAYPAL-AUTH-ALGO") || "";
    const certUrl = request.headers.get("PAYPAL-CERT-URL") || "";
    const transmissionId = request.headers.get("PAYPAL-TRANSMISSION-ID") || "";
    const transmissionSig = request.headers.get("PAYPAL-TRANSMISSION-SIG") || "";
    const transmissionTime = request.headers.get("PAYPAL-TRANSMISSION-TIME") || "";

    if (!PAYPAL_WEBHOOK_ID) {
      console.error("PAYPAL_WEBHOOK_ID not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const isValid = await verifyPayPalWebhookSignature(
      {
        "PAYPAL-AUTH-ALGO": authAlgo,
        "PAYPAL-CERT-URL": certUrl,
        "PAYPAL-TRANSMISSION-ID": transmissionId,
        "PAYPAL-TRANSMISSION-SIG": transmissionSig,
        "PAYPAL-TRANSMISSION-TIME": transmissionTime,
      },
      body,
      PAYPAL_WEBHOOK_ID,
    );

    if (!isValid) {
      console.error("PayPal webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type as string;
    const eventId = event.id as string;
    const resource = event.resource as Record<string, unknown> | undefined;

    console.log(`PayPal webhook received: ${eventType} (id: ${eventId})`);

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      console.log("CHECKOUT.ORDER.APPROVED — no action needed, payment not yet captured");
      return NextResponse.json({ received: true });
    }

    if (eventType === "CHECKOUT.ORDER.VOIDED") {
      const paypalOrderId = (resource?.id as string) || "";
      if (!paypalOrderId) {
        console.log("CHECKOUT.ORDER.VOIDED — no order ID");
        return NextResponse.json({ received: true });
      }
      const db = getAdminDb();
      const snap = await db.collection("orders").where("paypalOrderId", "==", paypalOrderId).limit(1).get();
      if (snap.empty) {
        console.log(`CHECKOUT.ORDER.VOIDED — order not found for ${paypalOrderId}`);
        return NextResponse.json({ received: true });
      }
      const doc = snap.docs[0];
      const existingIds = doc.data()?.webhookEventIds as string[] | undefined;
      if (existingIds?.includes(eventId)) {
        console.log(`CHECKOUT.ORDER.VOIDED — duplicate event ${eventId} skipped`);
        return NextResponse.json({ received: true });
      }
      await doc.ref.update({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
        webhookEventIds: FieldValue.arrayUnion(eventId),
      });
      console.log(`CHECKOUT.ORDER.VOIDED — order ${paypalOrderId} cancelled`);
      return NextResponse.json({ received: true });
    }

    let orderLookup: { customId?: string; paypalOrderId?: string } = {};
    let paymentStatus: string | null = null;
    let captureId: string | null = null;

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const customId = resource?.custom_id as string | undefined;
      orderLookup = { customId: customId || undefined, paypalOrderId: (resource?.supplementary_data as Record<string, unknown> | undefined)?.related_ids as string | undefined };
      paymentStatus = "paid";
      captureId = (resource?.id as string) || null;
    }

    if (eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.DECLINED" || eventType === "PAYMENT.CAPTURE.FAILED") {
      orderLookup = { customId: (resource?.custom_id as string) || undefined };
      paymentStatus = "declined";
    }

    if (eventType === "PAYMENT.CAPTURE.PENDING") {
      orderLookup = { customId: (resource?.custom_id as string) || undefined };
      paymentStatus = "pending";
    }

    if (!paymentStatus || (!orderLookup.customId && !orderLookup.paypalOrderId)) {
      console.log(`PayPal webhook: unhandled event ${eventType}`);
      return NextResponse.json({ received: true });
    }

    const db = getAdminDb();

    async function findOrder() {
      if (orderLookup.customId) {
        const snap = await db.collection("orders").doc(orderLookup.customId).get();
        if (snap.exists) return { exists: true, data: () => snap.data(), ref: snap.ref };
      }
      if (orderLookup.paypalOrderId) {
        const snap = await db.collection("orders").where("paypalOrderId", "==", orderLookup.paypalOrderId).limit(1).get();
        if (!snap.empty) {
          const d = snap.docs[0];
          return { exists: true, data: () => d.data(), ref: d.ref };
        }
      }
      return null;
    }

    const orderDoc = await findOrder();

    if (!orderDoc) {
      console.error(`PayPal webhook: order not found for ${JSON.stringify(orderLookup)}`);
      return NextResponse.json({ received: true });
    }

    const existingEventIds = orderDoc.data()?.webhookEventIds as string[] | undefined;
    if (existingEventIds?.includes(eventId)) {
      console.log(`PayPal webhook: duplicate event ${eventId} skipped`);
      return NextResponse.json({ received: true });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      webhookEventIds: FieldValue.arrayUnion(eventId),
    };

    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (captureId) updates.paypalCaptureId = captureId;

    await orderDoc.ref.update(updates);

    console.log(`PayPal webhook: order → paymentStatus: ${paymentStatus}`);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
