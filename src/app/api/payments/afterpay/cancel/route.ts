import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  try {
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

    const { orderToken, orderId: bodyOrderId } = await request.json();
    if (!orderToken) {
      return NextResponse.json({ error: "orderToken is required" }, { status: 400 });
    }

    const realOrderId = bodyOrderId || null;

    const pendingRef = getAdminDb().collection("pending_afterpay").doc(orderToken);
    const pendingSnap = await pendingRef.get();

    if (pendingSnap.exists) {
      const pending = pendingSnap.data()!;
      if (pending.userId !== decoded.uid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (pending.status === "completed" || pending.status === "cancelled") {
        return NextResponse.json({ success: true });
      }

      const orderId = pending.orderId || realOrderId;
      if (orderId) {
        const orderRef = getAdminDb().collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists && orderSnap.data()!.paymentStatus === "paid") {
          return NextResponse.json({ error: "Cannot cancel paid order" }, { status: 400 });
        }
        await orderRef.update({
          status: "canceled",
          paymentStatus: "cancelled",
          afterpayToken: null,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }

      await pendingRef.update({
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });
    } else if (realOrderId) {
      const orderRef = getAdminDb().collection("orders").doc(realOrderId);
      const orderSnap = await orderRef.get();
      if (orderSnap.exists) {
        const data = orderSnap.data()!;
        if (data.userId !== decoded.uid) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (data.paymentStatus === "paid") {
          return NextResponse.json({ error: "Cannot cancel paid order" }, { status: 400 });
        }
        await orderRef.update({
          status: "canceled",
          paymentStatus: "cancelled",
          afterpayToken: null,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
    } else {
      return NextResponse.json({ error: "Pending order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }
}
