"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, type Address } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/Toast";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAllPromotions } from "@/lib/promotions-store";
import type { Promotion } from "@/lib/promotions-store";
import { isPromotionActive, calculateDiscount } from "@/lib/promotion-utils";

const defaultAddress: Address = {
  street: "",
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

  const [addressDraft, setAddressDraft] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState("");
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    getAllPromotions().then(setAllPromotions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=checkout");
    }
  }, [loading, isAuthenticated, router]);

  const checkoutAddress = addressDraft || user?.address || defaultAddress;

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
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

  async function handlePlaceOrder() {
    if (
      !checkoutAddress.street.trim() ||
      !checkoutAddress.city.trim() ||
      !checkoutAddress.state.trim() ||
      !checkoutAddress.postcode.trim() ||
      !checkoutAddress.country.trim()
    ) {
      showToast("Please fill in all shipping address fields", "error");
      return;
    }

    setSaving(true);
    try {
      const shippingAddress: Address = {
        street: checkoutAddress.street.trim(),
        city: checkoutAddress.city.trim(),
        state: checkoutAddress.state.trim(),
        postcode: checkoutAddress.postcode.trim(),
        country: checkoutAddress.country.trim(),
      };

      const orderData = {
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
        paymentMethod: "cod",
        subtotal: totalPrice,
        discount: discount,
        discountCode: appliedPromo?.code || null,
        total: finalTotal,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const orderRef = doc(db, "orders", `${currentUser.uid}_${Date.now()}`);
      await setDoc(orderRef, orderData);

      clearCart();
      setPlaced(true);
      showToast("Order placed successfully!", "success");
    } catch {
      showToast("Failed to place order. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-dark mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-card border border-primary/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="checkout-street" className="block text-sm font-medium text-foreground mb-1">Street</label>
                <input id="checkout-street" type="text" value={checkoutAddress.street} onChange={(e) => setAddressDraft({ ...checkoutAddress, street: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="123 Beauty Lane" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-city" className="block text-sm font-medium text-foreground mb-1">City</label>
                  <input id="checkout-city" type="text" value={checkoutAddress.city} onChange={(e) => setAddressDraft({ ...checkoutAddress, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Sydney" />
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-sm font-medium text-foreground mb-1">State</label>
                  <input id="checkout-state" type="text" value={checkoutAddress.state} onChange={(e) => setAddressDraft({ ...checkoutAddress, state: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="NSW" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-postcode" className="block text-sm font-medium text-foreground mb-1">Postcode</label>
                  <input id="checkout-postcode" type="text" value={checkoutAddress.postcode} onChange={(e) => setAddressDraft({ ...checkoutAddress, postcode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="2000" />
                </div>
                <div>
                  <label htmlFor="checkout-country" className="block text-sm font-medium text-foreground mb-1">Country</label>
                  <input id="checkout-country" type="text" value={checkoutAddress.country} onChange={(e) => setAddressDraft({ ...checkoutAddress, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Australia" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-primary/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Payment Method</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <svg className="w-6 h-6 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-dark">Cash on Delivery</p>
                <p className="text-xs text-foreground">Pay when your order arrives</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-card border border-primary/10 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-dark mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs text-foreground">Product:</p>
                    <p className="text-dark truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-foreground">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-xs text-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-dark font-medium shrink-0">${((item.variant?.price ?? item.product.price) * item.quantity).toFixed(2)}</span>
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
                  className="flex-1 px-3 py-2 rounded-xl border border-primary/20 bg-transparent text-dark text-xs focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="px-3 py-2 rounded-xl bg-primary/10 text-dark text-xs font-medium hover:bg-primary/20 transition-colors shrink-0"
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

            <hr className="border-primary/10 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Subtotal</span>
                <span className="text-dark">${totalPrice.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-green-600">Discount ({appliedPromo?.code})</span>
                  <span className="text-green-600">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base pt-2 border-t border-primary/10">
                <span className="font-semibold text-dark">Total</span>
                <span className="text-lg font-bold text-accent">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={saving}
              className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm disabled:opacity-50 mt-4"
            >
              {saving ? "Placing Order..." : "Place Order"}
            </button>
            <p className="text-xs text-center text-foreground mt-3">You pay when your order arrives</p>
          </div>
        </div>
      </div>
    </div>
  );
}
