import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getPayPalOrder, voidPayPalOrder } from "@/lib/paypal";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const ordersRef = getAdminDb().collection("orders");

    const snapshot = await ordersRef
      .where("status", "==", "processing")
      .where("expireAt", "<", Timestamp.fromDate(now))
      .get();

    let cleanedCount = 0;
    const batch = getAdminDb().batch();

    for (const doc of snapshot.docs) {
      const orderData = doc.data();
      if (orderData.paymentStatus === "paid") continue;

      batch.update(doc.ref, {
        status: "cancelled",
        paymentStatus: "expired",
        updatedAt: Timestamp.fromDate(now),
      });
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      await batch.commit();
    }

    for (const doc of snapshot.docs) {
      const orderData = doc.data();
      if (orderData.paymentStatus === "paid") continue;

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
    console.error("Cron cleanup failed:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
