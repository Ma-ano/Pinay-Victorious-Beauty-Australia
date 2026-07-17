import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

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
    const expireAt = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

    const orderRef = getAdminDb().collection("orders").doc();

    // Cancel any existing pending PayPal orders for this user to prevent duplicates
    const existing = await getAdminDb().collection("orders")
      .where("userId", "==", decoded.uid)
      .where("paymentStatus", "==", "pending")
      .where("paymentMethod", "==", "paypal")
      .get();
    if (existing.size > 0) {
      const batch = getAdminDb().batch();
      existing.forEach(doc => batch.update(doc.ref, {
        status: "cancelled",
        paymentStatus: "cancelled",
        updatedAt: now,
      }));
      await batch.commit();
    }

    // Write to Firestore BEFORE creating PayPal order
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
      subtotal: subtotal ?? total,
      discount: discount ?? 0,
      discountCode: discountCode || null,
      shippingMethod: shippingMethod || "standard",
      shippingCost: shippingCost ?? 0,
      total,
      status: "processing",
      expireAt,
      createdAt: now,
      updatedAt: now,
    };

    await orderRef.set(orderData);

    // Create PayPal order with deterministic idempotency key
    // Same user + same cart always produces the same key, preventing duplicate PayPal orders
    const idempotentPayload = `${decoded.uid}_${JSON.stringify(items)}_${total}_${shippingCost}_${discount}`;
    const idempotencyKey = `paypal_${crypto.createHash("sha256").update(idempotentPayload).digest("hex").slice(0, 32)}`;
    const paypalOrder = await createPayPalOrder(
      items, total, shipping, discount, orderRef.id, shippingCost, idempotencyKey
    );

    if (!paypalOrder?.id) {
      await orderRef.delete();
      return NextResponse.json({ error: "PayPal order creation returned no ID" }, { status: 500 });
    }

    // Update Firestore with PayPal order ID
    await orderRef.update({ paypalOrderId: paypalOrder.id });

    return NextResponse.json({ id: paypalOrder.id, firestoreId: orderRef.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payment failed";
    console.error("Failed to create PayPal order:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
