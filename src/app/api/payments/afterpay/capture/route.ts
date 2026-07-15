import { NextResponse } from "next/server";
import { hasAfterpayCredentials, captureAfterpayPayment } from "@/lib/afterpay";
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

    if (!orderToken) {
      return NextResponse.json({ error: "orderToken is required" }, { status: 400 });
    }

    const captureResult = await captureAfterpayPayment(orderToken);
    console.log("AFTERPAY CAPTURE RESPONSE:", JSON.stringify(captureResult));

    const now = Timestamp.fromDate(new Date());

    if (captureResult.status === "APPROVED") {
      await orderRef.update({
        paymentStatus: "paid",
        afterpayToken: orderToken,
        afterpayOrderId: captureResult.id || orderToken,
        updatedAt: now,
      });
    } else if (captureResult.status === "DECLINED") {
      await orderRef.update({
        paymentStatus: "declined",
        afterpayToken: orderToken,
        updatedAt: now,
      });
      return NextResponse.json({ success: false, orderId, status: "DECLINED" });
    } else {
      await orderRef.update({
        paymentStatus: "pending",
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
