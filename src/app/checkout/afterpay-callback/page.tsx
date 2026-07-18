"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie } from "@/lib/cookies";

const CART_COOKIE = "beauty_store_cart";

export default function AfterpayCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const orderToken = searchParams.get("orderToken") || searchParams.get("token");
    const orderId = searchParams.get("orderId");

    if (!orderToken || !orderId) {
      setStatus("error");
      setErrorMsg("Missing order parameters");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/payments/afterpay/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, orderToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Payment confirmation failed");
        }
        setCookie(CART_COOKIE, "", 0);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Payment failed");
      }
    })();

    return () => { cancelled = true; };
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-foreground">Processing your Afterpay payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-dark mb-2">Payment Successful!</h1>
          <p className="text-sm text-foreground mb-6">
            Your Afterpay payment has been processed. Your order is being prepared.
          </p>
          <Link
            href="/orders"
            className="inline-block w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
          >
            View My Orders
          </Link>
          <Link href="/shop" className="inline-block mt-3 text-sm font-medium text-accent hover:text-accent/80">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-dark mb-2">Payment Failed</h1>
        <p className="text-sm text-foreground mb-6">{errorMsg || "Something went wrong processing your Afterpay payment."}</p>
        <Link
          href="/checkout"
          className="inline-block w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
        >
          Return to Checkout
        </Link>
      </div>
    </div>
  );
}
