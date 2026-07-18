import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
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

    const snapshot = await ordersRef
      .where("paymentMethod", "==", "afterpay")
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
      if (orderData.paymentStatus === "paid" || !orderData.afterpayToken) continue;
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
        // pending_afterpay cleanup is best-effort
      }
    }

    return NextResponse.json({ success: true, cleanedCount });
  } catch (err) {
    console.error("Failed to clean up Afterpay orders:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
