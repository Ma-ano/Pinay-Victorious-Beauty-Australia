import { NextResponse } from "next/server";
import { refundPayPalOrder } from "@/lib/paypal";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(token);

    const allowedAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const userEmail = decoded.email?.toLowerCase();
    if (!userEmail || userEmail !== allowedAdminEmail) {
      const userDoc = await getAdminDb().collection("users").doc(decoded.uid).get();
      const role = userDoc.data()?.role;
      if (role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const orderRef = getAdminDb().collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;

    const isPaid = orderData.isPaid === true || orderData.paymentStatus === "paid";
    if (!isPaid) {
      return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    }

    if (orderData.paymentStatus === "refunded") {
      return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
    }

    if (orderData.isPaid === undefined || orderData.isPaid === null) {
      console.warn(`Legacy order ${orderId} — missing isPaid`);
    }

    const captureId = orderData.paypalCaptureId as string | undefined;
    if (!captureId) {
      return NextResponse.json({ error: "No PayPal capture ID found for this order" }, { status: 400 });
    }

    const result = await refundPayPalOrder(captureId);

    const now = new Date().toISOString();
    await orderRef.update({
      status: "cancelled",
      paymentStatus: "refunded",
      refundAmount: orderData.total,
      refundedAt: now,
      refundedBy: decoded.uid,
      paypalRefundId: result.id,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      refundId: result.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Refund failed";
    console.error("PayPal refund error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
