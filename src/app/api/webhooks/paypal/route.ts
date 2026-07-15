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

    let paypalOrderId = "";
    let paymentStatus: string | null = null;
    let orderStatus: string | null = null;
    let captureId: string | null = null;

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      console.log("CHECKOUT.ORDER.APPROVED — no action needed, payment not yet captured");
      return NextResponse.json({ received: true });
    }

    if (eventType === "CHECKOUT.ORDER.VOIDED") {
      paypalOrderId = (resource?.id as string) || "";
      orderStatus = "cancelled";
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const customId = resource?.custom_id as string | undefined;
      const relatedIds = (resource?.supplementary_data as Record<string, unknown> | undefined)
        ?.related_ids as Record<string, unknown> | undefined;
      paypalOrderId = customId || (relatedIds?.order_id as string) || "";
      paymentStatus = "paid";
      orderStatus = "approved";
      captureId = (resource?.id as string) || null;
    }

    if (eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.DECLINED" || eventType === "PAYMENT.CAPTURE.FAILED") {
      paypalOrderId = (resource?.custom_id as string) || "";
      paymentStatus = "declined";
    }

    if (eventType === "PAYMENT.CAPTURE.PENDING") {
      paypalOrderId = (resource?.custom_id as string) || "";
      paymentStatus = "pending";
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
    if (orderStatus) updates.status = orderStatus;
    if (captureId) updates.paypalCaptureId = captureId;

    if (orderStatus === "approved") {
      const orderData = orderDoc.data();
      if (orderData?.status === "approved") {
        console.log(`PayPal webhook: order ${paypalOrderId} already approved, skipping stock reduction`);
      } else {
      const items = orderData?.items as Array<{ productId: string; quantity: number; variant?: { id: string } | null }> | undefined;
      if (items?.length) {
        for (const item of items) {
          const productRef = db.collection("products").doc(item.productId);
          const productSnap = await productRef.get();
          if (!productSnap.exists) continue;
          const productData = productSnap.data()!;
          const qty = item.quantity ?? 1;
          const stockUpdates: Record<string, unknown> = {
            sold: FieldValue.increment(qty),
          };
          if (item.variant?.id && productData.variants) {
            const variants = productData.variants.map((v: { id: string; stock?: number }) =>
              v.id === item.variant!.id
                ? { ...v, stock: Math.max(0, (v.stock ?? 0) - qty) }
                : v
            );
            stockUpdates.variants = variants;
          } else {
            stockUpdates.stock = FieldValue.increment(-qty);
          }
          await productRef.update(stockUpdates);
        }
      }
      }
    }

    await orderDoc.ref.update(updates);

    console.log(
      `PayPal webhook: order ${paypalOrderId} → ${paymentStatus ? `paymentStatus: ${paymentStatus}` : ""}${orderStatus ? `, status: ${orderStatus}` : ""}`
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
