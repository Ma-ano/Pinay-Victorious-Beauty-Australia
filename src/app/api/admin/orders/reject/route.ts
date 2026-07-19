import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getPayPalOrder, voidPayPalOrder } from "@/lib/paypal";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

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

    // Void payment gateway before cancelling
    if (orderData.paypalOrderId) {
      let paypalOrderStatus: string | undefined;
      try {
        const paypalOrder = await getPayPalOrder(orderData.paypalOrderId);
        paypalOrderStatus = paypalOrder.status as string;
      } catch {
        paypalOrderStatus = undefined;
      }

      if (paypalOrderStatus === "COMPLETED") {
        await orderRef.update({
          paymentStatus: "paid",
          isPaid: true,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        return NextResponse.json({ error: "Order is already paid — use refund instead" }, { status: 400 });
      }

      if (paypalOrderStatus === "CREATED" || paypalOrderStatus === "APPROVED") {
        voidPayPalOrder(orderData.paypalOrderId).catch(() => {});
      }
    }

    if (orderData.paymentMethod === "afterpay" && orderData.afterpayToken) {
      try {
        const pendingRef = getAdminDb().collection("pending_afterpay").doc(orderData.afterpayToken);
        const pendingSnap = await pendingRef.get();
        if (pendingSnap.exists && pendingSnap.data()?.status !== "completed") {
          await pendingRef.update({
            status: "cancelled",
            cancelledAt: new Date().toISOString(),
          });
        }
      } catch {
        // best-effort
      }
    }

    await orderRef.update({
      status: "rejected",
      paymentStatus: "cancelled",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    console.error("Failed to reject order");
    return NextResponse.json({ error: "Failed to reject order" }, { status: 500 });
  }
}
