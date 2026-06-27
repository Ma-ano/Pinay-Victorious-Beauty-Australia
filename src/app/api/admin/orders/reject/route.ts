import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { refundPayPalOrder } from "@/lib/paypal";

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

    const orderSnap = await getAdminDb().collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;

    if ((orderData.status === "paid" || orderData.paymentStatus === "paid") && orderData.paypalCaptureId) {
      try {
        await refundPayPalOrder(orderData.paypalCaptureId);
      } catch (refundErr) {
        const refundMsg = refundErr instanceof Error ? refundErr.message : "Refund failed";
        console.error("PayPal refund error:", refundMsg);
        return NextResponse.json({ error: `Order rejected but refund failed: ${refundMsg}` }, { status: 500 });
      }
    }

    await getAdminDb().collection("orders").doc(orderId).update({
      status: "rejected",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reject order";
    console.error("Reject order error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
