import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

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
    const isPayPal = orderData.paymentMethod === "paypal" || orderData.paymentMethod === "card" || orderData.paymentMethod === "afterpay";

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (!isPayPal) {
      updates.status = "completed";
      updates.paymentStatus = "paid";
    }

    await getAdminDb().collection("orders").doc(orderId).update(updates);

    return NextResponse.json({ success: true });
  } catch {
    console.error("Failed to approve order");
    return NextResponse.json({ error: "Failed to approve order" }, { status: 500 });
  }
}
