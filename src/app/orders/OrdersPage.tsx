"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/components/Toast";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { getAllProducts } from "@/lib/product-store";
import { formatPrice } from "@/lib/format";

type OrderStatus = "pending" | "approved" | "shipped" | "delivered" | "cancelled" | "rejected" | "received" | "paid" | "completed";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: { id: string; name: string } | null;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface CustomerOrder {
  firestoreId: string;
  userId: string;
  customerName: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  total: number;
  paymentStatus?: string;
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  fundingSource?: string;
  discount?: number;
  discountCode?: string | null;
  createdAt?: Timestamp;
}

interface CustomerReview {
  orderId: string;
  productId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  approved: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-green-100 text-green-700",
  received: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
};

const COURIERS = ["JNT", "LBC", "DHL"];

function getTrackingLink(courier: string, tracking: string): string | null {
  if (courier === "JNT") return `https://jtexpress.ph/track?code=${encodeURIComponent(tracking)}`;
  return null;
}

async function getProductInfoMap(): Promise<{ slug: Map<string, string>; image: Map<string, string> }> {
  try {
    const allProducts = await getAllProducts();
    return {
      slug: new Map(allProducts.map((p) => [p.id, p.slug])),
      image: new Map(allProducts.map((p) => [p.id, p.images?.[0]?.url || ""])),
    };
  } catch {
    return { slug: new Map(), image: new Map() };
  }
}

function formatDate(ts?: Timestamp): string {
  if (!ts) return "Processing";
  return ts.toDate().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function reviewDocId(orderId: string, productId: string) {
  return `${orderId}_${productId}`.replaceAll("/", "_");
}

const STEPS_PAYPAL: OrderStatus[] = ["pending", "paid", "shipped", "completed"];
const STEPS_COD: OrderStatus[] = ["pending", "approved", "shipped", "delivered"];

function OrderProgress({ status, paymentMethod }: { status: OrderStatus; paymentMethod: string }) {
  const steps = paymentMethod === "paypal" ? STEPS_PAYPAL : STEPS_COD;
  const currentIndex = steps.indexOf(status);

  if (currentIndex < 0 || ["cancelled", "rejected"].includes(status)) return null;

  return (
    <div className="flex items-center gap-1 mb-3">
      {steps.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-1.5 ${isActive ? "text-accent" : "text-foreground/40"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isCurrent
                  ? "bg-accent text-white"
                  : isActive
                    ? "bg-accent/20 text-accent"
                    : "bg-primary/10 text-foreground/40"
              }`}>
                {i + 1}
              </div>
              <span className={`text-[10px] font-medium capitalize ${isCurrent ? "font-semibold" : ""}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${i < currentIndex ? "bg-accent" : "bg-primary/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading, isAuthenticated, needsVerification } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeReviewKey, setActiveReviewKey] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [error, setError] = useState("");
  const [productSlugById, setProductSlugById] = useState<Map<string, string>>(new Map());
  const [productImageById, setProductImageById] = useState<Map<string, string>>(new Map());
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [receiveConfirmId, setReceiveConfirmId] = useState<string | null>(null);

  useEffect(() => {
    getProductInfoMap().then((info) => {
      setProductSlugById(info.slug);
      setProductImageById(info.image);
    });
  }, []);

  useEffect(() => {
    if (!loading && needsVerification) {
      router.push("/verify-email");
    } else if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/orders");
    }
  }, [isAuthenticated, loading, needsVerification, router]);

  useEffect(() => {
    if (!user) return;

    const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const nextOrders = snapshot.docs
          .map((docSnap) => ({
            firestoreId: docSnap.id,
            ...docSnap.data(),
          })) as CustomerOrder[];
        nextOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setOrders(nextOrders);
        setOrdersLoading(false);
        setError("");
      },
      () => {
        setError("Unable to load your orders right now.");
        setOrdersLoading(false);
      }
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const reviewsQuery = query(collection(db, "reviews"), where("userId", "==", user.uid));
    return onSnapshot(reviewsQuery, (snapshot) => {
      const nextKeys = new Set<string>();
      snapshot.docs.forEach((docSnap) => {
        const review = docSnap.data() as CustomerReview;
        nextKeys.add(reviewDocId(review.orderId, review.productId));
      });
      setReviewedKeys(nextKeys);
    });
  }, [user]);

  const activeReview = (() => {
    if (!activeReviewKey) return null;
    for (const order of orders) {
      for (const item of order.items || []) {
        if (reviewDocId(order.firestoreId, item.productId) === activeReviewKey) {
          return { order, item };
        }
      }
    }
    return null;
  })();

  function startReview(order: CustomerOrder, item: OrderItem) {
    setActiveReviewKey(reviewDocId(order.firestoreId, item.productId));
    setRating(0);
    setContent("");
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !activeReview || !activeReviewKey) return;
    if (rating < 1 || rating > 5) {
      showToast("Choose a rating", "info");
      return;
    }

    setSavingReview(true);
    try {
      await setDoc(doc(db, "reviews", activeReviewKey), {
        orderId: activeReview.order.firestoreId,
        productId: activeReview.item.productId,
        productName: activeReview.item.name,
        userId: user.uid,
        author: user.name,
        rating,
        content: content.trim(),
        isVerified: true,
        createdAt: serverTimestamp(),
      });
      setReviewedKeys((previous) => new Set(previous).add(activeReviewKey));
      setActiveReviewKey(null);
      setRating(0);
      setContent("");
      showToast("Review submitted. Thank you!", "success");
    } catch {
      showToast("Failed to submit review", "error");
    } finally {
      setSavingReview(false);
    }
  }

  async function handleCancel(orderId: string) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
      setCancelConfirmId(null);
      showToast("Order cancelled", "success");
    } catch {
      showToast("Failed to cancel order", "error");
    }
  }

  async function handleReceive(orderId: string) {
    try {
      const order = orders.find((o) => o.firestoreId === orderId);
      const finalStatus = order?.paymentMethod === "paypal" ? "completed" : "received";
      await updateDoc(doc(db, "orders", orderId), {
        status: finalStatus,
        updatedAt: serverTimestamp(),
      });
      setReceiveConfirmId(null);
      showToast("Order marked as received", "success");
    } catch {
      showToast("Failed to update order", "error");
    }
  }

  if (loading || ordersLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">My Orders</h1>
          <p className="text-sm text-foreground mt-1">Track your orders and review delivered items.</p>
        </div>
        <Link href="/shop" className="text-sm font-medium text-accent hover:text-accent/80">
          Continue shopping
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-card border border-card-border rounded-2xl p-10 text-center">
          <h2 className="text-lg font-semibold text-dark">No orders yet</h2>
          <p className="text-sm text-foreground mt-2">Your purchases will appear here after checkout.</p>
          <Link
            href="/shop"
            className="inline-block mt-6 bg-accent text-white py-2.5 px-6 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const isPaypal = order.paymentMethod === "paypal";
            const canCancel = order.status === "pending" || order.status === "approved" || order.status === "paid";
            const canReceive = order.status === "delivered";
            const trackingLink = order.trackingNumber && order.courier ? getTrackingLink(order.courier, order.trackingNumber) : null;

            return (
              <article key={order.firestoreId} className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 bg-primary/10">
                  <div>
                    <p className="text-sm font-semibold text-dark">Order #{order.firestoreId.slice(-8)}</p>
                    <p className="text-xs text-foreground">{formatDate(order.createdAt)} / {order.paymentMethod || "cod"}
                      {order.fundingSource === "card" && <span> via Debit / Credit Card</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCancel && (
                      cancelConfirmId === order.firestoreId ? (
                        <span className="flex items-center gap-1">
                          <button
                            onClick={() => handleCancel(order.firestoreId)}
                            className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-full transition-all"
                          >
                            Confirm Cancel?
                          </button>
                          <button
                            onClick={() => setCancelConfirmId(null)}
                            className="text-xs text-foreground hover:text-dark transition-colors"
                          >
                            Keep
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setCancelConfirmId(order.firestoreId)}
                          className="text-xs font-medium text-red-500 hover:text-red-600 px-2.5 py-1 rounded-full border border-red-200 hover:border-red-300 transition-all"
                        >
                          Cancel
                        </button>
                      )
                    )}
                    {canReceive && (
                      receiveConfirmId === order.firestoreId ? (
                        <span className="flex items-center gap-1">
                          <button
                            onClick={() => handleReceive(order.firestoreId)}
                            className="text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1 rounded-full transition-all"
                          >
                            Confirm Received?
                          </button>
                          <button
                            onClick={() => setReceiveConfirmId(null)}
                            className="text-xs text-foreground hover:text-dark transition-colors"
                          >
                            Keep
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setReceiveConfirmId(order.firestoreId)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 hover:border-emerald-300 transition-all"
                        >
                          {isPaypal ? "Mark as Completed" : "Mark as Received"}
                        </button>
                      )
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                    {Number(order.total || order.subtotal || 0) > 0 && (
                      <span className="text-sm font-bold text-accent">{formatPrice(Number(order.total || order.subtotal || 0))}</span>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-background/50 border-b border-primary/5">
                  <OrderProgress status={order.status} paymentMethod={order.paymentMethod || "cod"} />
                </div>

                {order.trackingNumber && (
                  <div className="px-5 py-2 bg-accent/5 border-b border-primary/5">
                    <p className="text-xs text-foreground">
                      Courier: <span className="font-medium text-dark">{order.courier || "-"}</span>{" "}
                      | Tracking:{" "}
                      {trackingLink ? (
                        <a href={trackingLink} target="_blank" rel="noopener noreferrer"
                          className="text-accent hover:underline font-medium">
                          {order.trackingNumber}
                        </a>
                      ) : (
                        <span className="font-medium text-dark">{order.trackingNumber}</span>
                      )}
                    </p>
                  </div>
                )}

                {order.discount != null && order.discount > 0 && (
                  <div className="px-5 py-2 bg-green-50 border-b border-primary/5">
                    <p className="text-xs text-green-700">
                      Discount applied{order.discountCode ? ` (${order.discountCode})` : ""}: -{formatPrice(order.discount)}
                    </p>
                  </div>
                )}

                <div className="divide-y divide-primary/10">
                  {(order.items || []).map((item, index) => {
                    const key = reviewDocId(order.firestoreId, item.productId);
                    const reviewed = reviewedKeys.has(key);
                    const productSlug = productSlugById.get(item.productId);
                    return (
                      <div key={`${item.productId}-${index}`} className="px-5 py-4">
                        <div className="flex gap-3 items-start">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-primary/10">
                            <ImagePlaceholder category="" name={item.name} imageUrl={productImageById.get(item.productId) || ""} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground">Product:</p>
                            {productSlug ? (
                              <Link href={`/shop/${productSlug}`} className="text-sm font-semibold text-dark hover:text-accent transition-colors truncate block">
                                {item.name}
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold text-dark truncate">{item.name}</p>
                            )}
                            {item.variant?.name && (
                              <p className="text-xs text-foreground">Variant: {item.variant.name}</p>
                            )}
                            <p className="text-xs text-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {(order.status === "received" || order.status === "completed") && (
                              reviewed ? (
                                <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full">Reviewed</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startReview(order, item)}
                                  className="text-xs font-medium text-white bg-accent hover:bg-accent/80 px-3 py-1.5 rounded-full transition-all"
                                >
                                  Review
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {activeReviewKey === key && (
                          <form onSubmit={submitReview} className="mt-4 rounded-xl border border-card-border bg-background p-4 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-dark mb-2">Rate {item.name}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                  <button
                                    key={starIndex}
                                    type="button"
                                    onClick={() => setRating(starIndex + 1)}
                                    className="p-0.5 focus:outline-none"
                                    aria-label={`${starIndex + 1} stars`}
                                  >
                                    <svg className={`w-7 h-7 ${rating > starIndex ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={content}
                              onChange={(event) => setContent(event.target.value)}
                              rows={3}
                              maxLength={1000}
                              className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card text-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                              placeholder="Share what you liked, how it felt, or who you would recommend it to."
                            />
                            <div className="text-right text-[11px] text-foreground">{content.length}/1000</div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveReviewKey(null)}
                                className="px-4 py-2 rounded-xl text-sm text-foreground hover:text-dark transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={savingReview}
                                className="px-5 py-2 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent/80 transition-all disabled:opacity-50"
                              >
                                {savingReview ? "Submitting..." : "Submit Review"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
