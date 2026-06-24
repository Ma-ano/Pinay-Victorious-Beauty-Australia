import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const captureData = await capturePayPalOrder(orderID as string);

    if (captureData.status === "COMPLETED") {
      const paymentSource = captureData.payment_source;
      const fundingSource = paymentSource?.card ? "card" : "paypal";

      return NextResponse.json({
        success: true,
        captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        fundingSource,
      });
    }

    return NextResponse.json({
      success: false,
      status: captureData.status,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to capture PayPal order";
    console.error("PayPal capture error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
