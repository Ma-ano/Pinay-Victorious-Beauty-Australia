import { NextResponse } from "next/server";
import { verifyPayPalWebhookSignature, mapPayPalStatus } from "@/lib/paypal";
import { getAdminDb } from "@/lib/firebase-admin";

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
    const resource = event.resource as Record<string, unknown> | undefined;

    let paypalOrderId = "";
    let paypalStatus = "";

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      paypalOrderId = (resource?.id as string) || "";
      paypalStatus = "APPROVED";
    } else if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const customId = resource?.custom_id as string | undefined;
      const relatedIds = (resource?.supplementary_data as Record<string, unknown> | undefined)
        ?.related_ids as Record<string, unknown> | undefined;
      paypalOrderId = customId || (relatedIds?.order_id as string) || "";
      paypalStatus = "COMPLETED";
    } else if (eventType === "PAYMENT.CAPTURE.DENIED") {
      paypalOrderId = (resource?.custom_id as string) || "";
      paypalStatus = "DENIED";
    } else if (eventType === "PAYMENT.CAPTURE.DECLINED") {
      paypalOrderId = (resource?.custom_id as string) || "";
      paypalStatus = "DECLINED";
    } else if (eventType === "PAYMENT.CAPTURE.FAILED") {
      paypalOrderId = (resource?.custom_id as string) || "";
      paypalStatus = "FAILED";
    } else if (eventType === "PAYMENT.CAPTURE.PENDING") {
      paypalOrderId = (resource?.custom_id as string) || "";
      paypalStatus = "PENDING";
    } else {
      return NextResponse.json({ received: true });
    }

    if (!paypalOrderId) {
      console.error(`PayPal webhook: no order ID for event ${eventType}`);
      return NextResponse.json({ received: true });
    }

    const db = getAdminDb();
    const ordersSnap = await db
      .collection("orders")
      .where("paypalOrderId", "==", paypalOrderId)
      .limit(1)
      .get();

    if (ordersSnap.empty) {
      console.error(`PayPal webhook: order not found for ${paypalOrderId}`);
      return NextResponse.json({ received: true });
    }

    const orderDoc = ordersSnap.docs[0];
    const paymentStatus = mapPayPalStatus(paypalStatus);

    const updates: Record<string, unknown> = {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    if (eventType === "PAYMENT.CAPTURE.COMPLETED" && resource) {
      updates.paypalCaptureId = (resource.id as string) || null;
    }

    await orderDoc.ref.update(updates);

    console.log(`PayPal webhook: order ${paypalOrderId} → paymentStatus: ${paymentStatus}`);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
