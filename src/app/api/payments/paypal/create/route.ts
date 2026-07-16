import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

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

    const { items, total, subtotal, discount, discountCode, shipping, email, customerName, customerPhone, shippingMethod, shippingCost, paymentMethod } =
      await request.json();

    if (!items?.length || total == null) {
      return NextResponse.json({ error: "Items and total are required" }, { status: 400 });
    }

    const now = Timestamp.fromDate(new Date());

    const orderRef = getAdminDb().collection("orders").doc();
    const paypalOrder = await createPayPalOrder(items, total, shipping, discount, orderRef.id, shippingCost);

    if (!paypalOrder?.id) {
      return NextResponse.json({ error: "PayPal order creation returned no ID" }, { status: 500 });
    }

    const orderData: Record<string, unknown> = {
      userId: decoded.uid,
      customerName: customerName || "",
      customerEmail: email,
      customerPhone: customerPhone || "",
      items: items.map((i: { productId?: string; name: string; price: number; quantity: number; variant?: { id: string; name: string } | null }) => ({
        productId: i.productId || "",
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        variant: i.variant || null,
      })),
      shipping: {
        street: shipping?.line1 || "",
        city: shipping?.city || "",
        state: shipping?.state || "",
        postcode: shipping?.postcode || "",
        country: shipping?.country || "Australia",
      },
      paymentMethod: paymentMethod || "paypal",
      paymentStatus: "pending",
      paypalOrderId: paypalOrder.id,
      subtotal: subtotal ?? total,
      discount: discount ?? 0,
      discountCode: discountCode || null,
      shippingMethod: shippingMethod || "standard",
      shippingCost: shippingCost ?? 0,
      total,
      status: "processing",
      createdAt: now,
      updatedAt: now,
    };

    await getAdminDb().collection("orders").doc(orderRef.id).set(orderData);

    return NextResponse.json({ id: paypalOrder.id, firestoreId: orderRef.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payment failed";
    console.error("Failed to create PayPal order:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
