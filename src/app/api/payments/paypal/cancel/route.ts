import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { getPayPalOrder, voidPayPalOrder } from "@/lib/paypal";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    const { firestoreOrderId } = await request.json();

    if (!firestoreOrderId) {
      return NextResponse.json({ error: "firestoreOrderId is required" }, { status: 400 });
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

    const orderRef = getAdminDb().collection("orders").doc(firestoreOrderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;
    if (orderData.userId !== decoded.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (orderData.paymentStatus === "paid" || orderData.paymentStatus === "cancelled" || orderData.paymentStatus === "expired") {
      return NextResponse.json({ success: true, alreadyFinal: true });
    }

    if (orderData.paypalOrderId) {
      let paypalOrderStatus: string | undefined;
      try {
        const paypalOrder = await getPayPalOrder(orderData.paypalOrderId);
        paypalOrderStatus = paypalOrder.status as string;
      } catch {
        // PayPal order not found or unreachable — skip void, proceed with clean up
        paypalOrderStatus = undefined;
      }

      if (paypalOrderStatus === "COMPLETED") {
        await orderRef.update({
          paymentStatus: "paid",
          isPaid: true,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        return NextResponse.json({ success: true, alreadyFinal: true });
      }

      if (paypalOrderStatus === "CREATED" || paypalOrderStatus === "APPROVED") {
        voidPayPalOrder(orderData.paypalOrderId).catch(() => {});
      }
    }

    await orderRef.update({
      paypalOrderId: null,
      status: "cancelled",
      paymentStatus: "cancelled",
      updatedAt: Timestamp.fromDate(new Date()),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Cancel failed";
    console.error("Failed to cancel PayPal order:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
