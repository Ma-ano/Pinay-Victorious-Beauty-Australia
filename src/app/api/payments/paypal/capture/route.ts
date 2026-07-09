import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const captureData = await capturePayPalOrder(orderID as string);

    if (captureData.status === "COMPLETED") {
      const ps = captureData.payment_source as Record<string, unknown> | undefined;
      const hasCard = !!ps?.card;
      const hasPayPal = !!ps?.paypal;
      const fundingSource = hasPayPal ? "paypal" : hasCard ? "card" : "unknown";
      const cardBrand = hasCard ? ((ps!.card as Record<string, unknown>)?.brand as string | null ?? null) : null;
      const payerEmail = (captureData.payer as Record<string, unknown> | undefined)?.email_address as string | undefined;

      return NextResponse.json({
        success: true,
        captureId: (captureData.purchase_units?.[0]?.payments?.captures?.[0] as Record<string, unknown>)?.id as string | undefined,
        fundingSource,
        cardBrand,
        payerEmail,
      });
    }

    return NextResponse.json({
      success: false,
      status: captureData.status,
    });
  } catch {
    console.error("Failed to capture PayPal order");
    return NextResponse.json({ error: "Payment capture failed" }, { status: 500 });
  }
}
