import { NextResponse } from "next/server";
import { captureAfterpayPayment, hasAfterpayCredentials } from "@/lib/afterpay";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    if (!hasAfterpayCredentials()) {
      return NextResponse.json({ error: "Afterpay not configured" }, { status: 400 });
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
    const userId = decoded.uid;

    const { orderToken } = await request.json();

    if (!orderToken) {
      return NextResponse.json({ error: "orderToken is required" }, { status: 400 });
    }

    const pendingRef = getAdminDb().collection("pending_afterpay").doc(orderToken);

    const result = await getAdminDb().runTransaction(async (transaction) => {
      const pendingSnap = await transaction.get(pendingRef);

      if (!pendingSnap.exists) {
        throw new PendingOrderNotFound();
      }

      const pending = pendingSnap.data()!;

      if (pending.userId !== userId) {
        throw new UnauthorizedCapture();
      }

      if (pending.status === "completed") {
        return {
          success: true,
          existing: true,
          orderId: pending.completedOrderId,
          afterpayOrderId: pending.afterpayOrderId || "",
        };
      }

      const captureResult = await captureAfterpayPayment(orderToken);

      if (captureResult.status !== "APPROVED") {
        throw new CaptureError(`Afterpay payment status: ${captureResult.status}`);
      }

      const capturedAmount = parseFloat(captureResult.totalAmount.amount);
      const expectedAmount = parseFloat(pending.total);
      if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
        throw new AmountMismatchError(capturedAmount, expectedAmount);
      }

      const orderRef = getAdminDb().collection("orders").doc();
      const orderData: Record<string, unknown> = {
        userId: pending.userId,
        customerName: pending.customerName,
        customerEmail: pending.customerEmail,
        customerPhone: pending.customerPhone || "",
        items: pending.items,
        shipping: pending.shipping,
        paymentMethod: "afterpay",
        afterpayOrderId: captureResult.id,
        afterpayToken: orderToken,
        subtotal: pending.subtotal,
        discount: pending.discount || 0,
        discountCode: pending.discountCode || null,
        total: pending.total,
        status: "processing",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      };

      transaction.set(orderRef, orderData);
      transaction.update(pendingRef, {
        status: "completed",
        completedOrderId: orderRef.id,
        afterpayOrderId: captureResult.id,
        capturedAt: new Date().toISOString(),
      });

      return {
        success: true,
        existing: false,
        orderId: orderRef.id,
        afterpayOrderId: captureResult.id,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof PendingOrderNotFound) {
      return NextResponse.json({ error: "Pending order not found" }, { status: 404 });
    }
    if (err instanceof UnauthorizedCapture) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (err instanceof AmountMismatchError) {
      console.error("Afterpay amount mismatch:", err.message);
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }
    if (err instanceof CaptureError) {
      return NextResponse.json({ error: "Payment capture failed" }, { status: 400 });
    }
    console.error("Afterpay capture error");
    return NextResponse.json({ error: "Payment capture failed" }, { status: 500 });
  }
}

class PendingOrderNotFound extends Error {
  constructor() { super("Pending order not found"); this.name = "PendingOrderNotFound"; }
}

class UnauthorizedCapture extends Error {
  constructor() { super("Unauthorized capture attempt"); this.name = "UnauthorizedCapture"; }
}

class CaptureError extends Error {
  constructor(msg: string) { super(msg); this.name = "CaptureError"; }
}

class AmountMismatchError extends Error {
  constructor(captured: number, expected: number) {
    super(`Amount mismatch: captured ${captured}, expected ${expected}`);
    this.name = "AmountMismatchError";
  }
}
