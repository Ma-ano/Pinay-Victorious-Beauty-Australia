"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const _fb = getDb();
if (!_fb) throw new Error("Firestore not initialized");
const db = _fb;
import { useToast } from "@/components/Toast";
import { useAuth } from "@/components/AuthContext";
import { formatPrice } from "@/lib/format";

type OrderStatus = "processing" | "approved" | "completed" | "cancelled" | "rejected";

type PaymentFilter = "all" | "card" | "paypal" | "afterpay";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  total?: number;
  quantity: number;
  variant?: { id: string; name: string } | null;
}

interface ShippingAddress {
  street: string;
  suburb?: string;
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
  discount?: number;
  discountCode?: string | null;
  shippingMethod?: string;
  shippingCost?: number;
  paymentStatus?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  status: OrderStatus;
  fundingSource?: string;
  cardBrand?: string;
  payerEmail?: string;
  afterpayOrderId?: string;
  afterpayToken?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  orderNumber?: string;
}

const statuses: Array<OrderStatus | "all"> = ["all", "processing", "approved", "completed", "cancelled", "rejected"];

function getValidTransitions(status: OrderStatus): OrderStatus[] {
  const map: Record<OrderStatus, OrderStatus[]> = {
    processing: ["approved", "rejected"],
    approved: ["completed"],
    completed: [],
    cancelled: [],
    rejected: [],
  };
  return map[status] || [];
}

function displayStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "processing",
    paid: "processing",
    delivered: "completed",
    shipped: "processing",
  };
  return map[status] || status;
}

const statusColors: Record<string, string> = {
  processing: "bg-blue-100 text-blue-700",
  approved: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
};

const paymentColors: Record<string, string> = {
  paypal: "bg-blue-100 text-blue-700",
  card: "bg-indigo-100 text-indigo-700",
  afterpay: "bg-teal-100 text-teal-700",
};

const paymentStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  declined: "bg-red-100 text-red-700",
};

function formatDate(ts?: Timestamp | string): string {
  if (!ts) return "-";
  const date = typeof ts === "string" ? new Date(ts) : ts.toDate();
  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function paymentLabel(order: FirestoreOrder): string {
  if (order.paymentMethod === "paypal") return "PayPal Wallet";
  if (order.paymentMethod === "card") return "Debit / Credit Card";
  if (order.paymentMethod === "afterpay") return "Afterpay";
  return order.paymentMethod || "Unknown";
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  updatingId,
}: {
  order: FirestoreOrder;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  updatingId: string | null;
}) {
  const [confirmComplete, setConfirmComplete] = useState(false);
  const allowedNext = getValidTransitions(displayStatus(order.status) as OrderStatus);

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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Order #{order.orderNumber || order.firestoreId.slice(-8)}
            </h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[displayStatus(order.status)] || "bg-gray-100 text-gray-700"}`}>
              {displayStatus(order.status)}
            </span>
          </div>
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
              <p><span className="font-medium text-foreground">Payment:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ml-1.5 ${paymentColors[order.paymentMethod] || "bg-gray-100 text-gray-700"}`}>
                  {paymentLabel(order)} · {order.paymentStatus || "pending"}
                </span>
              </p>
              {order.payerEmail && (
                <p><span className="font-medium text-foreground">Payer Email:</span> {order.payerEmail}</p>
              )}
              {order.fundingSource && (
                <p><span className="font-medium text-foreground">Funding Source:</span> {order.fundingSource}</p>
              )}
              {(order.paymentMethod === "paypal" || order.paymentMethod === "card") && (
                <>
                  {order.paypalOrderId && (
                    <p><span className="font-medium text-foreground">PayPal Order ID:</span> {order.paypalOrderId}</p>
                  )}
                  {order.paypalCaptureId && (
                    <p><span className="font-medium text-foreground">Transaction ID:</span> {order.paypalCaptureId}</p>
                  )}
                  {order.cardBrand && (
                    <p><span className="font-medium text-foreground">Card Brand:</span> {order.cardBrand}</p>
                  )}
                </>
              )}
              {order.paymentMethod === "afterpay" && (
                <>
                  {order.afterpayOrderId && (
                    <p><span className="font-medium text-foreground">Afterpay Order ID:</span> {order.afterpayOrderId}</p>
                  )}
                  {order.afterpayToken && (
                    <p><span className="font-medium text-foreground">Afterpay Token:</span> {order.afterpayToken}</p>
                  )}
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Shipping Address</h3>
            <div className="space-y-1 text-sm text-foreground">
              <p>{order.shipping?.street || "-"}</p>
              {order.shipping?.suburb && <p>{order.shipping.suburb}</p>}
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
                  <span className="text-foreground font-medium">{formatPrice(item.total ?? (item.price * item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-sm text-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal ?? 0)}</span>
            </div>
            {order.discount && order.discount > 0 && (
              <div className="mt-1 flex justify-between text-sm text-foreground">
                <span>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</span>
                <span className="text-green-600">-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.shippingMethod && (
              <div className="mt-1 flex justify-between text-sm text-foreground">
                <span>Shipping ({order.shippingMethod === "express" ? "Express" : "Standard"})</span>
                <span>{order.shippingCost != null && order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Free"}</span>
              </div>
            )}
            <div className="mt-1 pt-2 border-t border-card-border flex justify-between text-sm font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(order.total ?? order.subtotal ?? 0)}</span>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Status Actions</h3>
            <p className="text-[11px] text-foreground/70 mb-2">
              Click a status to update this order.
            </p>

            {allowedNext.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {allowedNext.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={updatingId === order.firestoreId}
                  onClick={() => {
                    if (status === "approved") {
                      setConfirmComplete(true);
                    } else {
                      onStatusChange(order.firestoreId, status);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all disabled:opacity-50 ${
                    displayStatus(order.status) === status
                      ? "bg-accent text-white border-accent"
                      : "bg-background text-foreground border-card-border hover:border-accent/60 hover:text-accent"
                  }`}
                >
                  {statusLabel(status)}
                </button>
              ))}
            </div>
            )}
            {allowedNext.length === 0 && (
              <p className="text-xs text-foreground/60">No further status changes available.</p>
            )}
          </section>
        </div>
      </div>

      {confirmComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmComplete(false)}>
          <div className="bg-card rounded-2xl border border-card-border shadow-2xl max-w-sm w-full p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-dark text-sm mb-2">Confirm Approval</h3>
            <p className="text-xs text-foreground mb-4">
              Approve this order? This will reduce product stock and update sold counts.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onStatusChange(order.firestoreId, "approved"); setConfirmComplete(false); }}
                className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-medium hover:bg-accent/80 transition-colors"
              >
                Yes, approve order
              </button>
              <button
                onClick={() => setConfirmComplete(false)}
                className="px-4 py-2 bg-primary/10 text-dark rounded-xl text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50)));
      const nextOrders = snapshot.docs.map((docSnap) => ({
        firestoreId: docSnap.id,
        ...docSnap.data(),
      })) as FirestoreOrder[];
      setOrders(nextOrders);
      setError("");
    } catch {
      setError("Unable to load orders. Check Firestore rules and admin claims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const onFocus = () => fetchOrders();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (modalOrder) {
      const updated = orders.find((o) => o.firestoreId === modalOrder.firestoreId);
      if (updated) {
        setModalOrder(updated);
      } else {
        setModalOrder(null);
      }
    }
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((o) => {
        const searchable = [
          o.customerName,
          o.customerEmail,
          o.customerPhone,
          o.payerEmail,
          o.firestoreId,
          o.orderNumber,
          o.shipping?.street,
          o.shipping?.suburb,
          o.shipping?.city,
          o.shipping?.state,
          o.shipping?.postcode,
          o.shipping?.country,
        ].join(" ").toLowerCase();
        return searchable.includes(q);
      });
    }
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.paymentMethod === paymentFilter);
    }
    if (filter !== "all") {
      result = result.filter((o) => displayStatus(o.status) === filter);
    }
    return result;
  }, [searchQuery, paymentFilter, filter, orders]);

  const paymentCounts = useMemo(() => {
    const card = orders.filter((o) => o.paymentMethod === "card").length;
    const paypal = orders.filter((o) => o.paymentMethod === "paypal").length;
    const afterpay = orders.filter((o) => o.paymentMethod === "afterpay").length;
    return { card, paypal, afterpay };
  }, [orders]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      const order = orders.find((o) => o.firestoreId === orderId);

      if (newStatus === "rejected") {
        const token = await getIdToken();
        if (!token) {
          showToast("Authentication required", "error");
          return;
        }
        const res = await fetch("/api/admin/orders/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to reject order");
        showToast(`Order ${orderId.slice(-8)} rejected`, "success");
        return;
      }

      const orderRef = doc(db, "orders", orderId);
      const statusUpdates: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      await runTransaction(db, async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists) throw new Error("Order not found");
        if (orderSnap.data()?.status === newStatus) return;

        const productEntries: Array<{ ref: any; snap: any; qty: number; variantId?: string }> = [];
        if (newStatus === "approved" && order?.items) {
          for (const item of order.items) {
            const productRef = doc(db, "products", item.productId);
            const productSnap = await transaction.get(productRef);
            if (productSnap.data()) {
              productEntries.push({ ref: productRef as any, snap: productSnap as any, qty: item.quantity ?? 1, variantId: item.variant?.id });
            }
          }
        }

        transaction.update(orderRef, statusUpdates);

        for (const { ref: productRef, snap, qty, variantId } of productEntries) {
          const productData = snap.data()!;
          const base: Record<string, unknown> = {
            sold: (productData.sold ?? 0) + qty,
          };

          if (variantId && productData.variants) {
            base.variants = productData.variants.map(
              (v: { id: string; stock?: number }) =>
                v.id === variantId
                  ? { ...v, stock: Math.max(0, (v.stock ?? 0) - qty) }
                  : v
            );
          } else if (!variantId) {
            base.stock = Math.max(0, (productData.stock ?? 0) - qty);
          }

          transaction.update(productRef, base as any);
        }
      });

      showToast(`Order ${orderId.slice(-8)} marked ${newStatus}`, "success");
      await fetchOrders();
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
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="text-xs px-3 py-1 rounded-full bg-card border border-card-border text-foreground hover:border-accent/50 transition-all disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, address, or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-dark hover:bg-primary/20 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {(["all", "card", "paypal", "afterpay"] as PaymentFilter[]).map((pm) => (
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
            {pm === "all" ? "All" : pm === "card" ? `Debit / Credit (${paymentCounts.card})` : pm === "paypal" ? `PayPal (${paymentCounts.paypal})` : `Afterpay (${paymentCounts.afterpay})`}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map((status) => (
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
            {status === "all" ? "All" : statusLabel(status)}
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
              <th className="text-left px-4 py-3 font-medium text-dark hidden xl:table-cell">Payment Status</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr
                  key={order.firestoreId}
                  className="hover:bg-primary/5 cursor-pointer"
                  onClick={() => setModalOrder(order)}
                >
                  <td className="px-4 py-3 font-medium text-dark font-mono text-xs">#{order.orderNumber || order.firestoreId.slice(-8)}</td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="font-medium text-dark">{order.customerName}</div>
                    <div className="text-xs">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden sm:table-cell">{order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</td>
                  <td className="px-4 py-3 text-dark font-medium">{formatPrice(order.total ?? order.subtotal ?? 0)}</td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${paymentColors[order.paymentMethod] || "bg-gray-100 text-gray-700"}`}>
                      {paymentLabel(order)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden xl:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus || "pending"] || "bg-gray-100 text-gray-700"}`}>
                      {order.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[displayStatus(order.status)] || "bg-gray-100 text-gray-700"}`}>
                      {displayStatus(order.status)}
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
        />
      )}
    </div>
  );
}
