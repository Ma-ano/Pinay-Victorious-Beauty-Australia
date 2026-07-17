import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    const { orderID, firestoreOrderId } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!firestoreOrderId) {
      return NextResponse.json({ error: "firestoreOrderId is required" }, { status: 400 });
    }

    const session = getSessionCookie(request);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await getAdminAuth().verifySessionCookie(session);
    } catch {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const orderRef = getAdminDb().collection("orders").doc(firestoreOrderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;
    if (orderData.userId !== decoded.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (orderData.paymentStatus === "paid") {
      return NextResponse.json({ success: true, existing: true, orderId: firestoreOrderId });
    }

    if (orderData.expireAt && orderData.expireAt.toDate() < new Date()) {
      await orderRef.update({
        paymentStatus: "expired",
        status: "cancelled",
        updatedAt: Timestamp.fromDate(new Date()),
      });
      return NextResponse.json({ error: "Payment session expired" }, { status: 400 });
    }

    if (orderData.status === "approved" || orderData.status === "rejected" || orderData.status === "cancelled") {
      return NextResponse.json({ success: true, existing: true, orderId: firestoreOrderId });
    }

    // Check if this PayPal order ID was already captured in any order
    const alreadyCaptured = await getAdminDb().collection("orders")
      .where("paypalOrderId", "==", orderID)
      .where("paymentStatus", "==", "paid")
      .get();
    if (!alreadyCaptured.empty) {
      return NextResponse.json({ success: true, existing: true, orderId: alreadyCaptured.docs[0].id });
    }

    // Set intermediate "capturing" status before calling PayPal API.
    // If the process crashes after capture but before Firestore update,
    // the order stays as "capturing" — the webhook will reconcile it.
    await orderRef.update({ paymentStatus: "capturing", updatedAt: Timestamp.fromDate(new Date()) });

    const captureResult = await capturePayPalOrder(orderID);
    const paypalStatus = captureResult.status || "UNKNOWN";

    const now = Timestamp.fromDate(new Date());
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0] as Record<string, unknown> | undefined;

    const updates: Record<string, unknown> = {
      paypalOrderId: orderID,
      updatedAt: now,
    };

    if (capture?.id) {
      updates.paypalCaptureId = capture.id;
    }

    if (paypalStatus === "COMPLETED") {
      const ps = captureResult.payment_source as Record<string, unknown> | undefined;
      updates.fundingSource = ps?.paypal ? "paypal" : ps?.card ? "card" : "unknown";
      updates.paymentStatus = "paid";
      if (ps?.card) {
        updates.cardBrand = (ps.card as Record<string, unknown>)?.brand || null;
      }
      updates.payerEmail = (captureResult.payer as Record<string, unknown> | undefined)?.email_address || null;
    }

    await orderRef.update(updates);

    return NextResponse.json({
      success: paypalStatus === "COMPLETED" || paypalStatus === "APPROVED",
      paypalStatus,
      orderId: firestoreOrderId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payment capture failed";
    console.error("Failed to capture PayPal order:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
