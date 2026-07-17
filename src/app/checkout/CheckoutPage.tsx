"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PayPalButtonGroup from "@/components/PayPalButtonGroup";
import { usePayPalReady } from "@/components/PayPalProvider";
import AfterpayButton from "@/components/AfterpayButton";
import { useAuth, type Address } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/Toast";
import { CheckoutFormSkeleton } from "@/components/Skeletons";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { formatPrice } from "@/lib/format";
import { getPostcode, normalizeState } from "@/data/address-config";

const _fb = getDb();
if (!_fb) throw new Error("Firestore not initialized");
const db = _fb;
import { getAllPromotions } from "@/lib/promotions-store";
import type { Promotion } from "@/lib/promotions-store";
import { isPromotionActive, calculateDiscount } from "@/lib/promotion-utils";
import { getSettings } from "@/lib/settings-store";

type PaymentMethod = "card" | "afterpay" | "paypal";

const defaultAddress: Address = {
  street: "",
  suburb: "",
  city: "",
  state: "",
  postcode: "",
  country: "Australia",
};

function CreditCardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
      <path d="M6 14h6" strokeWidth={2} />
    </svg>
  );
}

function AfterpayIcon() {
  return (
    <>
      <img
        src="/images/Afterpay_Brand_Elements_Secondary_Logo_RGB_Black.png"
        alt="Afterpay"
        className="h-5 w-auto dark:hidden"
      />
      <img
        src="/images/Afterpay_Brand_Elements_Secondary_Logo_RGB_Bondi_Mint.png"
        alt="Afterpay"
        className="h-5 w-auto hidden dark:block"
      />
    </>
  );
}

function PayPalIcon() {
  return (
    <>
      <img
        src="/images/paypal-logo.png"
        alt="PayPal"
        className="h-5 w-auto dark:hidden"
      />
      <img
        src="/images/paypal-white.png"
        alt="PayPal"
        className="h-5 w-auto hidden dark:block"
      />
    </>
  );
}

export default function CheckoutPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [addressError, setAddressError] = useState("");
  const [saving, setSaving] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState("");
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paypalError, setPaypalError] = useState("");
  const [afterpayLoading, setAfterpayLoading] = useState(false);
  const mountedRef = useRef(true);
  const firestoreOrderIdRef = useRef<string | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(120);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  useEffect(() => {
    getSettings().then((s) => {
      if (mountedRef.current) setFreeShippingThreshold(s.freeShippingThreshold ?? 120);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    getAllPromotions().then((p) => {
      if (mountedRef.current) setAllPromotions(p);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=checkout");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderToken = params.get("orderToken");
    const orderId = params.get("orderId");
    if (params.get("afterpay") === "cancelled" && orderToken) {
      fetch("/api/payments/afterpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderToken, orderId }),
      }).catch(() => {});
      showToast("Payment cancelled", "info");
    }
  }, []);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const { ready: paypalReady } = usePayPalReady();

  const checkoutAddress = user?.address || defaultAddress;

  const discount = appliedPromo ? calculateDiscount(appliedPromo, totalPrice) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

  const shippingCost = finalTotal >= freeShippingThreshold
    ? (shippingMethod === "express" ? 5 : 0)
    : (shippingMethod === "express" ? 15.20 : 11.70);
  const orderTotal = finalTotal + shippingCost;

  function handleApplyCode() {
    setPromoError("");
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) {
      setPromoError("Please enter a discount code");
      return;
    }
    const match = allPromotions.find((p) => p.code.toUpperCase() === trimmed);
    if (!match) {
      setPromoError("Invalid discount code");
      return;
    }
    if (!isPromotionActive(match)) {
      setPromoError("This code has expired or is not yet active");
      return;
    }
    setAppliedPromo(match);
    showToast(`Code "${match.code}" applied!`, "success");
  }

  function handleClearCode() {
    setPromoCode("");
    setAppliedPromo(null);
    setPromoError("");
  }

  function validateAddress(): boolean {
    const missing: string[] = [];
    if (!checkoutAddress.street.trim()) missing.push("Street");
    if (!checkoutAddress.suburb?.trim()) missing.push("Suburb");
    if (!checkoutAddress.city.trim()) missing.push("City");
    if (!checkoutAddress.state.trim()) missing.push("State");
    if (!checkoutAddress.postcode.trim()) missing.push("Postcode");
    if (missing.length > 0) {
      setAddressError(`Missing shipping address fields: ${missing.join(", ")}. Please update your profile.`);
      showToast("Shipping address is incomplete", "error");
      return false;
    }
    const postcode = checkoutAddress.postcode.trim();
    if (!/^\d{4}$/.test(postcode)) {
      setAddressError("Postcode must be a valid 4-digit Australian postcode. Please update your profile.");
      showToast("Invalid postcode", "error");
      return false;
    }
    const stateCode = normalizeState(checkoutAddress.state);
    if (!stateCode || !["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"].includes(stateCode)) {
      setAddressError(`State "${checkoutAddress.state}" is not a valid Australian state. Please update your profile.`);
      showToast("Invalid state", "error");
      return false;
    }
    setAddressError("");
    return true;
  }

  const shippingAddress: Address = {
    street: checkoutAddress.street.trim(),
    suburb: checkoutAddress.suburb?.trim() || "",
    city: checkoutAddress.city.trim(),
    state: normalizeState(checkoutAddress.state),
    postcode: getPostcode(checkoutAddress.suburb?.trim() || "", normalizeState(checkoutAddress.state)) || checkoutAddress.postcode.trim(),
    country: checkoutAddress.country.trim(),
  };

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD-";
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.random() * chars.length | 0);
  return result;
}

  async function createFirestoreOrder(orderId?: string, paymentStatus?: string, captureId?: string, fundingSource?: string, cardBrand?: string | null, payerEmail?: string, overridePaymentMethod?: string, orderStatus?: string) {
    const orderData: Record<string, unknown> = {
      userId: currentUser.uid,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone || "",
        items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.variant?.price ?? i.product.price,
        total: (i.variant?.price ?? i.product.price) * i.quantity,
        quantity: i.quantity,
        variant: i.variant ? { id: i.variant.id, name: i.variant.name } : null,
      })),
      shipping: shippingAddress,
      paymentMethod: overridePaymentMethod || paymentMethod,
      subtotal: totalPrice,
      discount,
      discountCode: appliedPromo?.code || null,
      shippingMethod,
      shippingCost,
      total: orderTotal,
      status: orderStatus || "processing",
      createdAt: serverTimestamp(),
      orderNumber: generateOrderNumber(),
    };

    if (orderId) {
      orderData.paypalOrderId = orderId;
    }
    if (captureId) {
      orderData.paypalCaptureId = captureId;
    }
    if (paymentStatus) {
      orderData.paymentStatus = paymentStatus;
    }
    if (fundingSource) {
      orderData.fundingSource = fundingSource;
    }
    if (cardBrand) {
      orderData.cardBrand = cardBrand;
    }
    if (payerEmail) {
      orderData.payerEmail = payerEmail;
    }

    const orderRef = doc(collection(db, "orders"));
    await setDoc(orderRef, orderData);
  }

  async function handlePayPalCreateOrder() {
    if (!validateAddress()) throw new Error("Please fill in all shipping address fields");
    setPaypalError("");
    try {
      const res = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: currentUser.name,
          customerPhone: currentUser.phone || "",
          email: currentUser.email,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.variant?.price ?? i.product.salePrice ?? i.product.price,
            quantity: i.quantity,
            unitAmount: i.variant?.price ?? i.product.salePrice ?? i.product.price,
            variant: i.variant ? { id: i.variant.id, name: i.variant.name } : null,
          })),
          subtotal: totalPrice,
          total: orderTotal,
          shippingCost: shippingCost,
          shippingMethod,
          discount,
          discountCode: appliedPromo?.code || null,
          paymentMethod,
          shipping: {
            name: `${currentUser.name}`,
            line1: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postcode: shippingAddress.postcode,
            country: shippingAddress.country,
            phoneNumber: currentUser.phone || "",
          },
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to create PayPal order");
      if (!responseData.id) throw new Error("PayPal order ID missing from response");
      firestoreOrderIdRef.current = responseData.firestoreId;
      return responseData.id as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PayPal error";
      setPaypalError(msg);
      showToast(msg, "error");
      throw err;
    }
  }

  async function captureAndCreateOrder(data: Record<string, unknown>, methodOverride: string) {
    setSaving(true);
    const firestoreId = firestoreOrderIdRef.current;
    if (!firestoreId) {
      showToast("Order reference not found", "error");
      if (mountedRef.current) setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/payments/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID, firestoreOrderId: firestoreId }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Payment declined");
      }

      if (!mountedRef.current) return;

      clearCart();
      setPlaced(true);
      showToast("Payment successful! Order placed.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      showToast(msg, "error");
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }

  const handleCardApprove = (data: Record<string, unknown>) => captureAndCreateOrder(data, "card");
  const handlePayPalApprove = (data: Record<string, unknown>) => captureAndCreateOrder(data, "paypal");

  async function handlePayPalCancel() {
    if (!mountedRef.current) return;
    const firestoreId = firestoreOrderIdRef.current;
    if (firestoreId) {
      try {
        await fetch("/api/payments/paypal/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firestoreOrderId: firestoreId }),
        });
      } catch {
      }
    }
    showToast("Payment cancelled", "info");
  }

  function handlePayPalError(err: Record<string, unknown>) {
    if (!mountedRef.current) return;
    console.error("PayPal SDK error:", err);
  }

  async function handleAfterpayClick() {
    if (!validateAddress()) return;
    setAfterpayLoading(true);
    try {
      const res = await fetch("/api/payments/afterpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: currentUser.name,
          customerPhone: currentUser.phone || "",
          email: currentUser.email,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.variant?.price ?? i.product.salePrice ?? i.product.price,
            quantity: i.quantity,
            unitAmount: i.variant?.price ?? i.product.salePrice ?? i.product.price,
            variant: i.variant ? { id: i.variant.id, name: i.variant.name } : null,
          })),
          subtotal: totalPrice,
          total: orderTotal,
          shippingCost: shippingCost,
          shippingMethod,
          discount,
          discountCode: appliedPromo?.code || null,
          shipping: {
            name: `${currentUser.name}`,
            line1: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postcode: shippingAddress.postcode,
            country: shippingAddress.country,
            phoneNumber: currentUser.phone || "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create Afterpay checkout");
      if (!data.checkoutUrl) throw new Error("Missing checkout URL");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Afterpay error";
      showToast(msg, "error");
    } finally {
      if (mountedRef.current) setAfterpayLoading(false);
    }
  }



  if (loading) {
    return <CheckoutFormSkeleton />;
  }

  if (!isAuthenticated || !user) return null;

  const currentUser = user;

  if (placed) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-dark mb-2">Order Placed!</h1>
          <p className="text-sm text-foreground mb-6">
            Thank you for your order. We&apos;ll send you a confirmation once it ships.
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

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-dark mb-2">Your cart is empty</h1>
          <Link
            href="/shop"
            className="inline-block mt-4 bg-accent text-white py-2.5 px-6 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const tabs: Array<{ key: PaymentMethod; label: string; icon: React.ReactNode }> = [
    { key: "card", label: "Debit / Credit Card", icon: <CreditCardIcon /> },
    { key: "afterpay", label: "Afterpay", icon: <AfterpayIcon /> },
    { key: "paypal", label: "PayPal", icon: <PayPalIcon /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-dark mb-8 animate-fade-in-up">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          {addressError && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Shipping address invalid</p>
                <p className="mt-1">{addressError}</p>
                <Link href="/profile" className="mt-2 inline-block text-red-700 dark:text-red-300 font-medium underline hover:no-underline">
                  Update in profile
                </Link>
              </div>
            </div>
          )}

          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm animate-fade-in-delay-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-dark">Shipping Address</h2>
              </div>
              <Link href="/profile" className="text-sm text-accent hover:text-accent/80 font-medium transition-colors">
                Edit
              </Link>
            </div>
            {checkoutAddress.street ? (
              <div className="text-sm text-foreground space-y-1 pl-7">
                <p>{checkoutAddress.street}</p>
                <p>{checkoutAddress.suburb}{checkoutAddress.suburb ? ", " : ""}{checkoutAddress.city} {checkoutAddress.state} {checkoutAddress.postcode}</p>
                <p>{checkoutAddress.country}</p>
              </div>
            ) : (
              <div className="text-sm text-foreground/60 pl-7">
                <p>No address set. <Link href="/profile" className="text-accent hover:underline">Add one in your profile.</Link></p>
              </div>
            )}
          </div>

          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm animate-fade-in-delay-2">
            <h2 className="text-lg font-semibold text-dark mb-5">Payment Method</h2>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPaymentMethod(tab.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all ${
                    paymentMethod === tab.key
                      ? "bg-accent/10 text-accent border border-accent/30 shadow-sm"
                      : "bg-primary/5 text-foreground/70 border border-transparent hover:bg-primary/10 hover:text-dark"
                  }`}
                >
                  {tab.icon}
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="text-center py-6">
                <p className="text-sm text-foreground/70 mb-6 max-w-xs mx-auto">
                  Fast and secure payments with your card, powered by PayPal.
                  🔒 For your security, please make sure your PayPal shipping address matches the delivery address you entered on this website.

                </p>
                {paypalClientId ? (
                  <>
                    <PayPalButtonGroup
                      createOrder={handlePayPalCreateOrder}
                      onApprove={handleCardApprove}
                      onCancel={handlePayPalCancel}
                      onError={handlePayPalError}
                      disabled={saving}
                      isReady={paypalReady}
                      amount={orderTotal}
                      fundingSources={["card"]}
                    />
                    {paypalError && (
                      <p className="text-red-500 text-xs mt-2 text-center">{paypalError}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-500">Card payments are not configured.</p>
                )}
              </div>
            )}

            {paymentMethod === "afterpay" && (
              <div className="text-center py-6">
                <p className="text-sm text-foreground/70 mb-6 max-w-xs mx-auto">
                  Split your payment into 4 interest-free installments. Pay every 2 weeks.
                </p>
                <AfterpayButton
                  onClick={handleAfterpayClick}
                  disabled={saving}
                  loading={afterpayLoading}
                />
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="text-center py-6">
                <p className="text-sm text-foreground/70 mb-6 max-w-xs mx-auto">
                  Fast, secure payments with PayPal.
                </p>
                {paypalClientId ? (
                  <>
                    <PayPalButtonGroup
                      createOrder={handlePayPalCreateOrder}
                      onApprove={handlePayPalApprove}
                      onCancel={handlePayPalCancel}
                      onError={handlePayPalError}
                      disabled={saving}
                      isReady={paypalReady}
                      amount={orderTotal}
                      fundingSources={["paypal"]}
                    />
                    {paypalError && (
                      <p className="text-red-500 text-xs mt-2 text-center">{paypalError}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-500">PayPal is not configured.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm sticky top-24 animate-fade-in-delay-3">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-dark">Order Summary</h2>
            </div>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-foreground truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-foreground/60">{item.variant.name}</p>
                    )}
                    <p className="text-xs text-foreground/50">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-dark font-medium shrink-0">{formatPrice((item.variant?.price ?? item.product.salePrice ?? item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={appliedPromo ? `Code: ${appliedPromo.code}` : "Discount code"}
                  disabled={!!appliedPromo}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-primary/20 bg-background text-dark text-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all disabled:opacity-50"
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="px-4 py-2.5 rounded-xl bg-primary/20 text-foreground text-xs font-medium hover:bg-primary/30 transition-all shrink-0"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCode}
                    className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-all shrink-0"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
            </div>

            <div className="border-t border-primary/10 pt-4 space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-dark mb-2">Shipping Method</h3>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShippingMethod("standard")}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border transition-all ${
                      shippingMethod === "standard"
                        ? "border-accent bg-accent/5 text-dark"
                        : "border-primary/10 bg-background text-foreground/70 hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === "standard" ? "border-accent" : "border-foreground/30"
                      }`}>
                        {shippingMethod === "standard" && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <span className="font-medium">Standard</span>
                      <span className="text-foreground/60">2–8 business days</span>
                    </div>
                    <span className="font-medium">
                      {finalTotal >= freeShippingThreshold ? "FREE" : formatPrice(11.70)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingMethod("express")}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border transition-all ${
                      shippingMethod === "express"
                        ? "border-accent bg-accent/5 text-dark"
                        : "border-primary/10 bg-background text-foreground/70 hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === "express" ? "border-accent" : "border-foreground/30"
                      }`}>
                        {shippingMethod === "express" && <div className="w-2 h-2 rounded-full bg-accent" />}
                      </div>
                      <span className="font-medium">Express</span>
                      <span className="text-foreground/60">1–4 business days</span>
                    </div>
                    <span className="font-medium">
                      {finalTotal >= freeShippingThreshold ? formatPrice(5) : formatPrice(15.20)}
                    </span>
                  </button>
                </div>
              </div>

              <div className="border-t border-primary/10 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="text-dark">{formatPrice(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Discount{appliedPromo?.code ? ` (${appliedPromo.code})` : ""}</span>
                    <span className="text-green-600 dark:text-green-400">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Shipping</span>
                  <span className={`font-medium ${shippingCost === 0 ? "text-green-600 dark:text-green-400" : "text-dark"}`}>
                    {shippingCost === 0 ? "Free ✓" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                  <span className="text-base font-semibold text-dark">Total</span>
                  <span className="text-xl font-bold text-accent">{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
