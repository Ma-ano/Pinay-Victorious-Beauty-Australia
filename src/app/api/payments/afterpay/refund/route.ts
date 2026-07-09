import { NextResponse } from "next/server";
import { refundAfterpayPayment, hasAfterpayCredentials } from "@/lib/afterpay";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!hasAfterpayCredentials()) {
      return NextResponse.json({ error: "Afterpay not configured" }, { status: 400 });
    }

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

    const { afterpayOrderId, amount, orderId } = await request.json();

    if (!afterpayOrderId || !amount || !orderId) {
      return NextResponse.json({ error: "afterpayOrderId, amount, and orderId are required" }, { status: 400 });
    }

    const result = await refundAfterpayPayment(afterpayOrderId, String(amount));

    const orderRef = getAdminDb().collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (orderSnap.exists) {
      await orderRef.update({
        status: "cancelled",
        paymentStatus: "refunded",
        refundAmount: amount,
        refundedAt: new Date().toISOString(),
        afterpayRefundId: result.id,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      refundId: result.id,
      status: result.status,
    });
  } catch {
    console.error("Afterpay refund error");
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
