import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const { items, total } = await request.json();

    if (!items?.length || total == null) {
      return NextResponse.json({ error: "Items and total are required" }, { status: 400 });
    }

    const paypalOrder = await createPayPalOrder(items, total);

    if (!paypalOrder?.id) {
      return NextResponse.json({ error: "PayPal order creation returned no ID" }, { status: 500 });
    }

    return NextResponse.json({ id: paypalOrder.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create PayPal order";
    console.error("PayPal create order error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
