import { NextResponse } from "next/server";
import { createAfterpayCheckout, hasAfterpayCredentials } from "@/lib/afterpay";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";
import { sanitizeText, sanitizeItemName, sanitizePhone } from "@/lib/sanitize";
import { CURRENCY } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const siteUrl = process.env.SITE_URL || "";
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const allowed = ["localhost", "127.0.0.1"];
    if (allowed.some((h) => o.hostname.includes(h))) return true;
    if (siteUrl) {
      const s = new URL(siteUrl);
      if (o.origin === s.origin) return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface ItemInput {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  unitAmount: number;
  variant?: { id: string; name: string } | null;
}

interface ShippingInput {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  phoneNumber?: string;
}

function validateInput(body: {
  items: ItemInput[];
  total: number;
  subtotal: number;
  discount: number;
  discountCode: string | null;
  shipping: ShippingInput;
  email: string;
  customerName: string;
  customerPhone: string;
}): string | null {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "Items are required";
  }

  if (body.total == null || typeof body.total !== "number" || body.total <= 0) {
    return "Invalid total amount";
  }

  for (const item of body.items) {
    if (!item.name || typeof item.name !== "string") {
      return "Item name is required";
    }
    if (!item.quantity || item.quantity <= 0) {
      return "Item quantity must be positive";
    }
    if (item.unitAmount == null || item.unitAmount < 0) {
      return "Invalid item price";
    }
  }

  if (!body.shipping || typeof body.shipping !== "object") {
    return "Shipping address is required";
  }
  if (!body.shipping.addressLine1 || !body.shipping.suburb) {
    return "Shipping street and suburb are required";
  }

  if (!body.email || typeof body.email !== "string") {
    return "Email is required";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    if (!hasAfterpayCredentials()) {
      return NextResponse.json({ error: "Afterpay not configured" }, { status: 400 });
    }

    if (!validateOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
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

    const { items, total, subtotal, discount = 0, discountCode = null, shipping, email, customerName, customerPhone, shippingMethod, shippingCost } =
      await request.json() as { items: ItemInput[]; total: number; subtotal: number; discount: number; discountCode: string | null; shipping: ShippingInput; email: string; customerName: string; customerPhone: string; shippingMethod?: string; shippingCost?: number };

    const validationError = validateInput({ items, total, subtotal, discount, discountCode, shipping, email, customerName, customerPhone });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const origin = request.headers.get("origin") || process.env.SITE_URL || "";
    const now = Timestamp.fromDate(new Date());
    const expireAt = Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000));

    const orderRef = getAdminDb().collection("orders").doc();

    // Cancel any existing pending Afterpay orders for this user to prevent duplicates
    const existing = await getAdminDb().collection("orders")
      .where("userId", "==", decoded.uid)
      .where("paymentStatus", "==", "pending")
      .where("paymentMethod", "==", "afterpay")
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

    // Write to Firestore BEFORE creating Afterpay checkout
    const orderData: Record<string, unknown> = {
      userId: decoded.uid,
      customerName: sanitizeText(customerName || "", 100),
      customerEmail: sanitizeText(email || "", 254),
      customerPhone: sanitizePhone(customerPhone),
      items: items.map(
        (i: {
          productId?: string;
          name: string;
          price: number;
          quantity: number;
          variant?: { id: string; name: string } | null;
        }) => ({
          productId: i.productId || "",
          name: sanitizeItemName(i.name),
          price: i.price,
          quantity: i.quantity,
          variant: i.variant ? { id: i.variant.id, name: sanitizeItemName(i.variant.name) } : null,
        })
      ),
      shipping: {
        addressLine1: sanitizeText(shipping.addressLine1 || "", 128),
        addressLine2: shipping.addressLine2 ? sanitizeText(shipping.addressLine2, 128) : null,
        suburb: sanitizeText(shipping.suburb || "", 100),
        state: sanitizeText(shipping.state || "", 10),
        postcode: sanitizeText(shipping.postcode || "", 4),
      },
      paymentMethod: "afterpay",
      isPaid: false,
      paymentStatus: "pending",
      subtotal: subtotal ?? total,
      discount: discount ?? 0,
      discountCode: sanitizeText(discountCode || "", 30) || null,
      shippingMethod: sanitizeText(shippingMethod || "standard", 20),
      shippingCost: shippingCost ?? 0,
      total,
      status: "processing",
      createdAt: now,
      updatedAt: now,
      expireAt,
    };

    await orderRef.set(orderData);

    const afterpayItems = items.map(
      (i: { name: string; quantity: number; unitAmount: number }) => ({
        name: i.name,
        quantity: i.quantity,
        price: { amount: String(i.unitAmount), currency: CURRENCY },
      })
    );

    // Deterministic idempotency key — same cart + user always produces same key
    const idempotentPayload = `${decoded.uid}_${orderRef.id}_${JSON.stringify(items)}_${total}_${shippingCost}_${discount}_afterpay`;
    const idempotencyKey = crypto.createHash("sha256").update(idempotentPayload).digest("hex").slice(0, 32);

    const result = await createAfterpayCheckout({
      items: afterpayItems,
      total: String(total),
      shipping: {
        name: shipping.name || customerName || "",
        line1: shipping.addressLine1 || "",
        city: shipping.suburb || "",
        state: shipping.state || "",
        postcode: shipping.postcode || "",
        country: "Australia",
        phoneNumber: shipping.phoneNumber || customerPhone || "",
      },
      redirectConfirmUrl: `${origin}/checkout/afterpay-callback?orderId=${orderRef.id}`,
      redirectCancelUrl: `${origin}/checkout?afterpay=cancelled&orderId=${orderRef.id}`,
      email,
      customerName,
      merchantReference: orderRef.id,
      idempotencyKey,
    });

    if (!result?.token) {
      await orderRef.delete();
      return NextResponse.json({ error: "Afterpay checkout creation returned no token" }, { status: 500 });
    }

    const pendingData = {
      orderId: orderRef.id,
      userId: decoded.uid,
      customerName: sanitizeText(customerName || "", 100),
      customerEmail: sanitizeText(email || "", 254),
      customerPhone: sanitizePhone(customerPhone),
      items: items.map(
        (i: {
          productId?: string;
          name: string;
          price: number;
          quantity: number;
          variant?: { id: string; name: string } | null;
        }) => ({
          productId: i.productId || "",
          name: sanitizeItemName(i.name),
          price: i.price,
          quantity: i.quantity,
          variant: i.variant ? { id: i.variant.id, name: sanitizeItemName(i.variant.name) } : null,
        })
      ),
      shipping: {
        addressLine1: sanitizeText(shipping.addressLine1 || "", 128),
        addressLine2: shipping.addressLine2 ? sanitizeText(shipping.addressLine2, 128) : null,
        suburb: sanitizeText(shipping.suburb || "", 100),
        state: sanitizeText(shipping.state || "", 10),
        postcode: sanitizeText(shipping.postcode || "", 4),
      },
      paymentMethod: "afterpay",
      afterpayToken: result.token,
      subtotal: subtotal ?? total,
      discount: discount ?? 0,
      discountCode: sanitizeText(discountCode || "", 30) || null,
      shippingMethod: sanitizeText(shippingMethod || "standard", 20),
      shippingCost: shippingCost ?? 0,
      total,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
      expireAt: expireAt.toDate().toISOString(),
    };

    await getAdminDb()
      .collection("pending_afterpay")
      .doc(result.token)
      .set(pendingData);

    return NextResponse.json({ token: result.token, checkoutUrl: result.redirectCheckoutUrl, orderId: orderRef.id });
  } catch (err) {
    console.error("Failed to create Afterpay checkout:", err);
    const message = err instanceof Error ? err.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
