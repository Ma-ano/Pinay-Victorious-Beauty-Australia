import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getPayPalOrder, voidPayPalOrder } from "@/lib/paypal";
import { Timestamp } from "firebase-admin/firestore";

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

    const now = new Date();
    const ordersRef = getAdminDb().collection("orders");

    // Fix expired orders: processing past expireAt
    const expiredSnapshot = await ordersRef
      .where("status", "==", "processing")
      .where("expireAt", "<", Timestamp.fromDate(now))
      .get();

    // Fix zombie orders: already cancelled/rejected but paymentStatus still pending
    const zombieSnapshot = await ordersRef
      .where("paymentStatus", "==", "pending")
      .where("status", "in", ["cancelled", "rejected"])
      .get();

    let cleanedCount = 0;
    const batch = getAdminDb().batch();

    for (const doc of expiredSnapshot.docs) {
      const orderData = doc.data();
      if (orderData.paymentStatus === "paid") continue;

      batch.update(doc.ref, {
        status: "cancelled",
        paymentStatus: "expired",
        updatedAt: Timestamp.fromDate(now),
      });
      cleanedCount++;
    }

    for (const doc of zombieSnapshot.docs) {
      const orderData = doc.data();
      if (orderData.paymentStatus !== "pending") continue;

      batch.update(doc.ref, {
        paymentStatus: "cancelled",
        updatedAt: Timestamp.fromDate(now),
      });
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      await batch.commit();
    }

    const allExpired = [...expiredSnapshot.docs, ...zombieSnapshot.docs];
    for (const doc of allExpired) {
      const orderData = doc.data();
      if (orderData.paymentStatus === "paid") continue;

      // Void PayPal orders on the gateway
      if (orderData.paypalOrderId) {
        try {
          let paypalOrderStatus: string | undefined;
          try {
            const paypalOrder = await getPayPalOrder(orderData.paypalOrderId);
            paypalOrderStatus = paypalOrder.status as string;
          } catch {
            paypalOrderStatus = undefined;
          }
          if (paypalOrderStatus === "CREATED" || paypalOrderStatus === "APPROVED") {
            await voidPayPalOrder(orderData.paypalOrderId);
          }
        } catch {
          // best-effort
        }
      }

      // Cancel pending Afterpay checkout
      if (orderData.afterpayToken) {
        try {
          const pendingRef = getAdminDb().collection("pending_afterpay").doc(orderData.afterpayToken);
          const pendingSnap = await pendingRef.get();
          if (pendingSnap.exists && pendingSnap.data()?.status !== "completed") {
            await pendingRef.update({
              status: "cancelled",
              cancelledAt: now.toISOString(),
            });
          }
        } catch {
          // best-effort
        }
      }
    }

    return NextResponse.json({ success: true, cleanedCount });
  } catch (err) {
    console.error("Failed to clean up expired orders:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
