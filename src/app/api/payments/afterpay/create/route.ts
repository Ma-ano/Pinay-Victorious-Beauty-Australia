import { NextResponse } from "next/server";
import { createAfterpayCheckout, hasAfterpayCredentials } from "@/lib/afterpay";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

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
  line1?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
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
  if (!body.shipping.line1 || !body.shipping.city) {
    return "Shipping street and city are required";
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

    const { items, total, subtotal, discount = 0, discountCode = null, shipping, email, customerName, customerPhone } =
      await request.json() as { items: ItemInput[]; total: number; subtotal: number; discount: number; discountCode: string | null; shipping: ShippingInput; email: string; customerName: string; customerPhone: string };

    const validationError = validateInput({ items, total, subtotal, discount, discountCode, shipping, email, customerName, customerPhone });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const origin = request.headers.get("origin") || process.env.SITE_URL || "";

    const afterpayItems = items.map(
      (i: { name: string; quantity: number; unitAmount: number }) => ({
        name: i.name,
        quantity: i.quantity,
        price: { amount: String(i.unitAmount), currency: "AUD" },
      })
    );

    const result = await createAfterpayCheckout({
      items: afterpayItems,
      total: String(total),
      shipping: {
        name: shipping.name || customerName || "",
        line1: shipping.line1 || "",
        city: shipping.city || "",
        state: shipping.state || "",
        postcode: shipping.postcode || "",
        country: shipping.country || "Australia",
        phoneNumber: shipping.phoneNumber || customerPhone || "",
      },
      redirectConfirmUrl: `${origin}/checkout/afterpay-callback`,
      redirectCancelUrl: `${origin}/checkout?afterpay=cancelled`,
      email,
    });

    const pendingData = {
      userId: decoded.uid,
      customerName: customerName || "",
      customerEmail: email,
      customerPhone: customerPhone || "",
      items: items.map(
        (i: {
          productId?: string;
          name: string;
          price: number;
          quantity: number;
          variant?: { id: string; name: string } | null;
        }) => ({
          productId: i.productId || "",
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          variant: i.variant || null,
        })
      ),
      shipping: {
        street: shipping.line1 || "",
        city: shipping.city || "",
        state: shipping.state || "",
        postcode: shipping.postcode || "",
        country: shipping.country || "Australia",
      },
      paymentMethod: "afterpay",
      afterpayToken: result.token,
      subtotal: subtotal ?? total,
      discount: discount ?? 0,
      discountCode: discountCode || null,
      total,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };

    await getAdminDb()
      .collection("pending_afterpay")
      .doc(result.token)
      .set(pendingData);

    return NextResponse.json({ token: result.token, checkoutUrl: result.checkoutUrl });
  } catch {
    console.error("Failed to create Afterpay checkout");
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }
}
