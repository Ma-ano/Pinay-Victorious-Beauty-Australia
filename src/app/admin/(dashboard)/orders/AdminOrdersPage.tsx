"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;
import { useToast } from "@/components/Toast";
import { useAuth } from "@/components/AuthContext";
import { formatPrice } from "@/lib/format";

type OrderStatus = "pending" | "approved" | "paid" | "shipped" | "delivered" | "cancelled" | "rejected" | "received" | "completed";

type PaymentFilter = "all" | "cod" | "paypal";

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

interface FirestoreOrder {
  firestoreId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  total: number;
  paymentStatus?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  fundingSource?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const statuses: Array<OrderStatus | "all"> = ["all", "pending", "paid", "approved", "shipped", "delivered", "received", "completed", "cancelled", "rejected"];

const codStatuses: Array<OrderStatus | "all"> = ["all", "pending", "approved", "shipped", "delivered", "received", "cancelled", "rejected"];
const paypalStatuses: Array<OrderStatus | "all"> = ["all", "pending", "paid", "shipped", "delivered", "completed", "cancelled", "rejected"];

function getValidTransitions(status: OrderStatus, paymentMethod: string): OrderStatus[] {
  if (paymentMethod === "paypal") {
    const map: Record<OrderStatus, OrderStatus[]> = {
      pending: ["paid", "rejected", "cancelled"],
      paid: ["shipped", "cancelled", "rejected"],
      approved: [],
      shipped: ["delivered"],
      delivered: ["completed"],
      completed: [],
      received: [],
      cancelled: [],
      rejected: [],
    };
    return map[status] || [];
  }
  const map: Record<OrderStatus, OrderStatus[]> = {
    pending: ["approved", "rejected", "cancelled"],
    paid: [],
    approved: ["shipped", "cancelled", "rejected"],
    shipped: ["delivered"],
    delivered: ["received"],
    received: [],
    completed: [],
    cancelled: [],
    rejected: [],
  };
  return map[status] || [];
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

function formatDate(ts?: Timestamp): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getTrackingLink(courier: string, tracking: string): string | null {
  if (courier === "JNT") return `https://jtexpress.ph/track?code=${encodeURIComponent(tracking)}`;
  return null;
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  updatingId,
  trackingInputs,
  setTrackingInputs,
}: {
  order: FirestoreOrder;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  updatingId: string | null;
  trackingInputs: { trackingNumber: string; courier: string };
  setTrackingInputs: (v: { trackingNumber: string; courier: string }) => void;
}) {
  const isPaypal = order.paymentMethod === "paypal";
  const allowedNext = getValidTransitions(order.status, order.paymentMethod || "cod");
  const trackingLink = order.trackingNumber && order.courier ? getTrackingLink(order.courier, order.trackingNumber) : null;
  const showTrackingFields = (order.status === "approved" && !isPaypal) || (order.status === "paid" && isPaypal) || order.status === "shipped";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border border-card-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-lg font-semibold text-foreground">
            Order #{order.firestoreId.slice(-8)}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Customer Details</h3>
            <div className="space-y-1 text-sm text-foreground">
              <p><span className="font-medium text-foreground">Name:</span> {order.customerName}</p>
              <p><span className="font-medium text-foreground">Email:</span> {order.customerEmail}</p>
              <p><span className="font-medium text-foreground">Phone:</span> {order.customerPhone || "-"}</p>
              <p><span className="font-medium text-foreground">Payment:</span> {order.paymentMethod || "cod"}
                {order.paymentStatus && <span className="ml-1">({order.paymentStatus})</span>}
                {order.fundingSource === "card" && <span className="ml-1">via Debit / Credit Card</span>}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Shipping Address</h3>
            <div className="space-y-1 text-sm text-foreground">
              <p>{order.shipping?.street || "-"}</p>
              <p>{order.shipping?.city || "-"}, {order.shipping?.state || "-"} {order.shipping?.postcode || ""}</p>
              <p>{order.shipping?.country || "-"}</p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Order Items</h3>
            <div className="space-y-2">
              {(order.items || []).map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex justify-between gap-4 text-sm bg-primary/5 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-foreground">Product:</p>
                    <p className="text-foreground font-medium">{item.name}</p>
                    {item.variant?.name && (
                      <p className="text-xs text-foreground">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-xs text-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-foreground font-medium">{formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-card-border flex justify-between text-sm font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(Number(order.subtotal || 0))}</span>
            </div>
          </section>

          {order.trackingNumber && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-2">Tracking Info</h3>
              <div className="space-y-1 text-sm text-foreground bg-primary/5 rounded-xl p-3">
                <p><span className="font-medium text-foreground">Courier:</span> {order.courier}</p>
                <p>
                  <span className="font-medium text-foreground">Tracking #:</span>{" "}
                  {trackingLink ? (
                    <a href={trackingLink} target="_blank" rel="noopener noreferrer"
                      className="text-accent hover:underline">
                      {order.trackingNumber}
                    </a>
                  ) : order.trackingNumber}
                </p>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {order.status === "shipped" ? "Update Tracking"
                : (isPaypal && order.status === "paid") || (!isPaypal && order.status === "approved")
                  ? "Add Tracking & Ship"
                  : "Status Actions"}
            </h3>
            <p className="text-[11px] text-foreground/70 mb-2">
              {order.status === "paid" || order.status === "approved"
                ? "Enter tracking details before marking as shipped."
                : "Click a status to update this order."}
            </p>

            {showTrackingFields && (
              <div className="mb-3 p-3 bg-primary/5 rounded-xl space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-foreground mb-1">Tracking Number</label>
                    <input type="text" value={trackingInputs.trackingNumber}
                      onChange={(e) => setTrackingInputs({ ...trackingInputs, trackingNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="e.g. JNT123456789" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-foreground mb-1">Courier</label>
                    <input type="text" value={trackingInputs.courier}
                      onChange={(e) => setTrackingInputs({ ...trackingInputs, courier: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="e.g. JNT, LBC, DHL, Flash Express" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allowedNext.map((status) => {
                const isShippedFromPrev = status === "shipped" && ((!isPaypal && order.status === "approved") || (isPaypal && order.status === "paid"));
                const needsTracking = isShippedFromPrev && (!trackingInputs.trackingNumber || !trackingInputs.courier);
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={updatingId === order.firestoreId || (isShippedFromPrev && needsTracking)}
                    onClick={() => onStatusChange(order.firestoreId, status)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all disabled:opacity-50 ${
                      order.status === status
                        ? "bg-accent text-white border-accent"
                        : "bg-background text-foreground border-card-border hover:border-accent/60 hover:text-accent"
                    }`}
                    title={isShippedFromPrev && needsTracking ? "Fill tracking number and courier first" : undefined}
                  >
                    {isShippedFromPrev ? "Mark as Shipped" : statusLabel(status)}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const { getIdToken } = useAuth();
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [modalOrder, setModalOrder] = useState<FirestoreOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [trackingInputs, setTrackingInputs] = useState({ trackingNumber: "", courier: "" });

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const nextOrders = snapshot.docs.map((docSnap) => ({
          firestoreId: docSnap.id,
          ...docSnap.data(),
        })) as FirestoreOrder[];
        setOrders(nextOrders);
        setError("");
      },
      () => {
        setError("Unable to load orders. Check Firestore rules and admin claims.");
      }
    );
  }, []);

  useEffect(() => {
    if (modalOrder) {
      const updated = orders.find((o) => o.firestoreId === modalOrder.firestoreId);
      if (updated) {
        setModalOrder(updated);
        setTrackingInputs({
          trackingNumber: updated.trackingNumber || "",
          courier: updated.courier || "",
        });
      }
    }
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders;
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.paymentMethod === paymentFilter);
    }
    if (filter !== "all") {
      result = result.filter((o) => o.status === filter);
    }
    return result;
  }, [paymentFilter, filter, orders]);

  const visibleStatuses = useMemo(() => {
    if (paymentFilter === "paypal") return paypalStatuses;
    if (paymentFilter === "cod") return codStatuses;
    return statuses;
  }, [paymentFilter]);

  useEffect(() => {
    if (paymentFilter !== "all") {
      const validSet = new Set(visibleStatuses);
      if (filter !== "all" && !validSet.has(filter)) {
        setFilter("all");
      }
    }
  }, [paymentFilter, visibleStatuses, filter]);

  const paymentCounts = useMemo(() => {
    const cod = orders.filter((o) => o.paymentMethod !== "paypal").length;
    const paypal = orders.filter((o) => o.paymentMethod === "paypal").length;
    return { cod, paypal };
  }, [orders]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      if (newStatus === "approved" || newStatus === "rejected" || newStatus === "paid") {
        const token = await getIdToken();
        if (!token) {
          showToast("Authentication required", "error");
          return;
        }
        const route = newStatus === "rejected" ? "reject" : "approve";
        const res = await fetch(`/api/admin/orders/${route}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to ${newStatus} order`);
        showToast(`Order ${orderId.slice(-8)} ${newStatus}`, "success");
        return;
      }

      const order = orders.find((o) => o.firestoreId === orderId);
      if (!order) return;

      if (newStatus === "shipped" && (order.status === "approved" || order.status === "paid")) {
        const trackingNumber = trackingInputs.trackingNumber.trim();
        const courier = trackingInputs.courier;
        if (!trackingNumber || !courier) {
          showToast("Tracking number and courier are required", "error");
          return;
        }
        await updateDoc(doc(db, "orders", orderId), {
          status: "shipped",
          trackingNumber,
          courier,
          updatedAt: serverTimestamp(),
        });

        if (order.paymentMethod === "paypal" && order.paypalCaptureId) {
          try {
            const { sendPayPalTracking } = await import("@/lib/paypal");
            await sendPayPalTracking(order.paypalCaptureId, trackingNumber, courier);
          } catch {
            console.error("Failed to send tracking to PayPal");
          }
        }

        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await getDoc(productRef);
          if (!productSnap.exists()) continue;
          const productData = productSnap.data();

          if (item.variant?.id && productData.variants) {
            const updatedVariants = productData.variants.map(
              (v: { id?: string; stock?: number }) =>
                v.id === item.variant!.id
                  ? { ...v, stock: Math.max(0, (v.stock ?? 0) - item.quantity) }
                  : v
            );
            await updateDoc(productRef, { variants: updatedVariants });
          } else {
            const currentStock = productData.stock ?? 0;
            await updateDoc(productRef, { stock: Math.max(0, currentStock - item.quantity) });
          }
        }

        showToast(`Order ${orderId.slice(-8)} marked shipped`, "success");
        return;
      }

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      if (newStatus === "delivered" && order) {
        if (order.status !== "shipped") {
          for (const item of order.items) {
            const productRef = doc(db, "products", item.productId);
            const productSnap = await getDoc(productRef);
            if (!productSnap.exists()) continue;
            const productData = productSnap.data();

            if (item.variant?.id && productData.variants) {
              const updatedVariants = productData.variants.map(
                (v: { id?: string; stock?: number }) =>
                  v.id === item.variant!.id
                    ? { ...v, stock: Math.max(0, (v.stock ?? 0) - item.quantity) }
                    : v
              );
              await updateDoc(productRef, { variants: updatedVariants });
            } else {
              const currentStock = productData.stock ?? 0;
              await updateDoc(productRef, { stock: Math.max(0, currentStock - item.quantity) });
            }
          }
        }
      }

      showToast(`Order ${orderId.slice(-8)} marked ${newStatus}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      showToast(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Orders</h1>
          <p className="text-sm text-foreground mt-1">Review customer details and manage fulfillment status.</p>
        </div>
        <p className="text-sm text-foreground">
          {filtered.length} of {orders.length} orders
          {paymentFilter !== "all" && ` (${paymentFilter})`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {(["all", "cod", "paypal"] as PaymentFilter[]).map((pm) => (
          <button
            key={pm}
            type="button"
            onClick={() => setPaymentFilter(pm)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              paymentFilter === pm
                ? "bg-accent text-white"
                : "bg-card text-foreground border border-card-border hover:border-accent/50"
            }`}
          >
            {pm === "all" ? "All" : pm === "cod" ? `COD (${paymentCounts.cod})` : `PayPal (${paymentCounts.paypal})`}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {visibleStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              filter === status
                ? "bg-accent text-white"
                : "bg-card text-foreground border border-card-border hover:border-accent/50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-card-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-dark">Order</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Items</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Total</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.firestoreId}
                  className="hover:bg-primary/5 cursor-pointer"
                  onClick={() => {
                    setModalOrder(order);
                    setTrackingInputs({
                      trackingNumber: order.trackingNumber || "",
                      courier: order.courier || "",
                    });
                  }}
                >
                  <td className="px-4 py-3 font-medium text-dark">#{order.firestoreId.slice(-8)}</td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="font-medium text-dark">{order.customerName}</div>
                    <div className="text-xs">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden sm:table-cell">{order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</td>
                  <td className="px-4 py-3 text-dark font-medium">{formatPrice(Number(order.subtotal || 0))}</td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell">
                    <span className="capitalize">{order.paymentMethod || "cod"}</span>
                    {order.paymentStatus && (
                      <span className="text-xs ml-1">({order.paymentStatus})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOrder && (
        <OrderDetailModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
          trackingInputs={trackingInputs}
          setTrackingInputs={setTrackingInputs}
        />
      )}
    </div>
  );
}
