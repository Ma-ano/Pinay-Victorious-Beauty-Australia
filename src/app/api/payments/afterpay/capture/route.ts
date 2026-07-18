import { NextResponse } from "next/server";
import { hasAfterpayCredentials, captureAfterpayPayment } from "@/lib/afterpay";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { CURRENCY } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    if (!hasAfterpayCredentials()) {
      return NextResponse.json({ error: "Afterpay not configured" }, { status: 400 });
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
    const userId = decoded.uid;

    const { orderId, orderToken } = await request.json();
    console.log("AFTERPAY CAPTURE TOKEN:", orderToken);

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderRef = getAdminDb().collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;
    if (orderData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (orderData.paymentStatus === "paid" && orderData.afterpayToken) {
      return NextResponse.json({ success: true, existing: true, orderId });
    }

    if (orderData.expireAt && orderData.expireAt.toDate() < new Date()) {
      await orderRef.update({
        paymentStatus: "expired",
        status: "cancelled",
        updatedAt: Timestamp.fromDate(new Date()),
      });
      return NextResponse.json({ error: "Payment session expired" }, { status: 400 });
    }

    if (!orderToken) {
      return NextResponse.json({ error: "orderToken is required" }, { status: 400 });
    }

    // Check if this Afterpay order ID was already captured in any order
    if (orderData.afterpayOrderId) {
      const alreadyCaptured = await getAdminDb().collection("orders")
        .where("afterpayOrderId", "==", orderData.afterpayOrderId)
        .where("paymentStatus", "==", "paid")
        .get();
      if (!alreadyCaptured.empty) {
        return NextResponse.json({ success: true, existing: true, orderId: alreadyCaptured.docs[0].id });
      }
    }

    // Set intermediate "capturing" status before calling Afterpay API
    await orderRef.update({ paymentStatus: "capturing", updatedAt: Timestamp.fromDate(new Date()) });

    const captureResult = await captureAfterpayPayment(orderToken);
    console.log("AFTERPAY CAPTURE RESPONSE:", JSON.stringify(captureResult));

    const now = Timestamp.fromDate(new Date());

    if (captureResult.status === "APPROVED") {
      // Verify amount matches database
      const capturedAmount = parseFloat(captureResult.originalAmount?.amount || "0");
      const capturedCurrency = captureResult.originalAmount?.currency || "";
      if (capturedCurrency !== CURRENCY) {
        await orderRef.update({ paymentStatus: "declined", status: "cancelled", afterpayToken: orderToken, updatedAt: now });
        return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
      }
      if (Math.abs(capturedAmount - (orderData.total || 0)) > 0.01) {
        await orderRef.update({ paymentStatus: "declined", status: "cancelled", afterpayToken: orderToken, updatedAt: now });
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      await orderRef.update({
        paymentStatus: "paid",
        isPaid: true,
        afterpayToken: orderToken,
        afterpayOrderId: captureResult.id || orderToken,
        updatedAt: now,
      });
    } else if (captureResult.status === "DECLINED") {
      await orderRef.update({
        paymentStatus: "declined",
        status: "cancelled",
        afterpayToken: orderToken,
        updatedAt: now,
      });
      return NextResponse.json({ success: false, orderId, status: "DECLINED" });
    } else {
      await orderRef.update({
        paymentStatus: "declined",
        status: "cancelled",
        afterpayToken: orderToken,
        updatedAt: now,
      });
      return NextResponse.json({ success: false, orderId, status: captureResult.status });
    }

    if (orderToken) {
      const pendingRef = getAdminDb().collection("pending_afterpay").doc(orderToken);
      const pendingSnap = await pendingRef.get();
      if (pendingSnap.exists) {
        await pendingRef.update({
          status: "completed",
          completedOrderId: orderId,
          capturedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment confirmation failed";
    console.error("Afterpay confirm error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
