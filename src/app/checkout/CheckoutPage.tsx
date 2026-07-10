"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PayPalButtonGroup from "@/components/PayPalButtonGroup";
import { usePayPalReady } from "@/components/PayPalProvider";
import AfterpayButton from "@/components/AfterpayButton";
import { useAfterpayEnabled } from "@/components/AfterpayProvider";
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

type PaymentMethod = "cod" | "paypal_cards" | "afterpay";

const defaultAddress: Address = {
  street: "",
  suburb: "",
  city: "",
  state: "",
  postcode: "",
  country: "Australia",
};

export default function CheckoutPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [addressDraft] = useState<Address | null>(null);
  const [addressError, setAddressError] = useState("");
  const [saving, setSaving] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState("");
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [paypalError, setPaypalError] = useState("");
  const [afterpayLoading, setAfterpayLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    getAllPromotions().then(setAllPromotions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=checkout");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const check = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const { ready: paypalReady } = usePayPalReady();
  const { enabled: afterpayEnabled } = useAfterpayEnabled();

  const checkoutAddress = user?.address || defaultAddress;

  const discount = appliedPromo ? calculateDiscount(appliedPromo, totalPrice) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

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

  async function createFirestoreOrder(orderId?: string, paymentStatus?: string, captureId?: string, fundingSource?: string, cardBrand?: string | null, payerEmail?: string, overridePaymentMethod?: string) {
    const orderData: Record<string, unknown> = {
      userId: currentUser.uid,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone || "",
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.variant?.price ?? i.product.price,
        quantity: i.quantity,
        variant: i.variant ? { id: i.variant.id, name: i.variant.name } : null,
      })),
      shipping: shippingAddress,
      paymentMethod: overridePaymentMethod || paymentMethod,
      subtotal: totalPrice,
      discount,
      discountCode: appliedPromo?.code || null,
      total: finalTotal,
      status: "processing",
      createdAt: serverTimestamp(),
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

  async function handlePlaceOrderCod() {
    if (!validateAddress()) return;
    setSaving(true);
    try {
      await createFirestoreOrder();
      clearCart();
      setPlaced(true);
      showToast("Order placed successfully!", "success");
    } catch {
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePayPalCreateOrder() {
    if (!validateAddress()) throw new Error("Please fill in all shipping address fields");
    setPaypalError("");
    try {
      const res = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            unitAmount: i.variant?.price ?? i.product.price,
          })),
          total: finalTotal,
          shipping: shippingAddress,
          customerEmail: currentUser?.email,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to create PayPal order");
      if (!responseData.id) throw new Error("PayPal order ID missing from response");
      return responseData.id as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "PayPal error";
      setPaypalError(msg);
      showToast(msg, "error");
      throw err;
    }
  }

  async function handlePayPalApprove(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/payments/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Payment capture failed");
      }

      const usedFundingSource = (result.fundingSource as string) || "";

      if (!mountedRef.current) return;

      await createFirestoreOrder(
        data.orderID as string,
        "paid",
        result.captureId,
        result.fundingSource,
        result.cardBrand as string | null | undefined,
        result.payerEmail as string | undefined,
        "paypal",
      );
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

  function handlePayPalCancel() {
    if (!mountedRef.current) return;
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
            price: i.variant?.price ?? i.product.price,
            quantity: i.quantity,
            unitAmount: i.variant?.price ?? i.product.price,
            variant: i.variant ? { id: i.variant.id, name: i.variant.name } : null,
          })),
          subtotal: totalPrice,
          total: finalTotal,
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("afterpay") === "cancelled") {
      showToast("Afterpay payment was cancelled", "info");
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);
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
              <h2 className="text-lg font-semibold text-dark">Shipping Address</h2>
              <Link href="/profile" className="text-sm text-accent hover:text-accent/80 font-medium transition-colors">
                Edit
              </Link>
            </div>
            {checkoutAddress.street ? (
              <div className="text-sm text-foreground space-y-1">
                <p>{checkoutAddress.street}</p>
                <p>{checkoutAddress.suburb}{checkoutAddress.suburb ? ", " : ""}{checkoutAddress.city} {checkoutAddress.state} {checkoutAddress.postcode}</p>
                <p>{checkoutAddress.country}</p>
              </div>
            ) : (
              <div className="text-sm text-foreground/60">
                <p>No address set. <Link href="/profile" className="text-accent hover:underline">Add one in your profile.</Link></p>
              </div>
            )}
          </div>

          <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm animate-fade-in-delay-2">
            <h2 className="text-lg font-semibold text-dark mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-accent bg-accent/5" : "border-primary/20 bg-transparent hover:border-accent/30"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-accent"
                />
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-6 h-6 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-dark">Cash on Delivery</p>
                    <p className="text-xs text-foreground">Pay when your order arrives</p>
                  </div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "paypal_cards" ? "border-accent bg-accent/5" : "border-primary/20 bg-transparent hover:border-accent/30"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal_cards"
                  checked={paymentMethod === "paypal_cards"}
                  onChange={() => setPaymentMethod("paypal_cards")}
                  className="accent-accent"
                />
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="#003087">
                    <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                    <path d="M19.19 6.534c-.023.144-.047.289-.077.438-1.068 5.49-4.25 7.463-8.646 7.463h-2.19c-.524 0-.968.382-1.05.9L6.12 22.41l-.012.073a.641.641 0 00.634.742h4.08c.524 0 .968-.382 1.05-.9l1.12-7.106h.003c.082-.521.522-.9 1.05-.9h2.19c4.349 0 7.58-1.963 8.648-6.797.413-1.86.203-3.419-.69-4.486-.494-.59-1.14-1.002-1.904-1.302z" opacity=".25"/>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-dark">PayPal (Pay Now or Pay Later)</p>
                    <p className="text-xs text-foreground">Pay securely with your PayPal account or card</p>
                  </div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === "afterpay" ? "border-accent bg-accent/5" : "border-primary/20 bg-transparent hover:border-accent/30"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="afterpay"
                  checked={paymentMethod === "afterpay"}
                  onChange={() => setPaymentMethod("afterpay")}
                  className="accent-accent"
                />
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={isDarkMode ? "/images/Afterpay_Brand_Elements_Secondary_Logo_RGB_Bondi_Mint.svg" : "/images/Afterpay_Brand_Elements_Secondary_Logo_RGB_Black.svg"}
                    alt="Afterpay"
                    className="h-5 w-auto shrink-0"
                  />
                    <div>
                      <p className="text-xs text-foreground">Buy now, pay later in 4 interest-free payments</p>
                    </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-white border border-gray-200 dark:border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm animate-fade-in-delay-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs text-gray-500">Product:</p>
                    <p className="text-gray-900 truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-gray-500">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-gray-900 font-medium shrink-0">{formatPrice((item.variant?.price ?? item.product.salePrice ?? item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={appliedPromo ? `Code: ${appliedPromo.code}` : "Discount code"}
                  disabled={!!appliedPromo}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-200 bg-gray-50 dark:bg-gray-50 text-gray-900 text-xs focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                  style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-200 transition-colors shrink-0"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCode}
                    className="px-3 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-colors shrink-0"
                  >
                    Apply
                  </button>
                )}
              </div>
              {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
            </div>

            <hr className="border-gray-200 dark:border-gray-200 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-green-600">Discount ({appliedPromo?.code})</span>
                  <span className="text-green-600">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base pt-2 border-t border-gray-200 dark:border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-accent">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {paymentMethod === "cod" && (
              <>
                <button
                  onClick={handlePlaceOrderCod}
                  disabled={saving}
                  className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm disabled:opacity-50 mt-4"
                >
                  {saving ? "Placing Order..." : "Place Order"}
                </button>
                <p className="text-xs text-center text-foreground mt-3">You pay when your order arrives</p>
              </>
            )}

            {paypalClientId && paymentMethod === "paypal_cards" && (
              <div className="mt-4">
                <PayPalButtonGroup
                  createOrder={handlePayPalCreateOrder}
                  onApprove={handlePayPalApprove}
                  onCancel={handlePayPalCancel}
                  onError={handlePayPalError}
                  disabled={saving}
                  isReady={paypalReady}
                  amount={finalTotal}
                />
                {paypalError && (
                  <p className="text-red-500 text-xs mt-2 text-center">{paypalError}</p>
                )}
              </div>
            )}

            {paymentMethod === "afterpay" && (
              <div className="mt-4">
                <AfterpayButton
                  onClick={handleAfterpayClick}
                  disabled={saving}
                  loading={afterpayLoading}
                />
                <p className="text-xs text-center text-foreground mt-3">
                  Pay in 4 interest-free installments
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
