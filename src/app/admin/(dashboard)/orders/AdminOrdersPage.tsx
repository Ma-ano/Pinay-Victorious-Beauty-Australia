"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
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

type OrderStatus = "pending" | "approved" | "paid" | "cancelled" | "rejected" | "completed";

type PaymentFilter = "all" | "cod" | "paypal" | "card";

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
  discount?: number;
  discountCode?: string | null;
  paymentStatus?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  status: OrderStatus;
  fundingSource?: string;
  cardBrand?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const statuses: Array<OrderStatus | "all"> = ["all", "pending", "approved", "paid", "completed", "cancelled", "rejected"];

const codStatuses: Array<OrderStatus | "all"> = ["all", "pending", "approved", "completed", "cancelled", "rejected"];
const paypalStatuses: Array<OrderStatus | "all"> = ["all", "pending", "paid", "completed", "cancelled", "rejected"];

function getValidTransitions(status: OrderStatus, paymentMethod: string): OrderStatus[] {
  if (paymentMethod === "paypal") {
    const map: Record<OrderStatus, OrderStatus[]> = {
      pending: ["paid", "cancelled", "rejected"],
      paid: ["completed", "cancelled", "rejected"],
      approved: [],
      completed: [],
      cancelled: [],
      rejected: [],
    };
    return map[status] || [];
  }
  const map: Record<OrderStatus, OrderStatus[]> = {
    pending: ["approved", "cancelled", "rejected"],
    approved: ["completed", "cancelled", "rejected"],
    paid: [],
    completed: [],
    cancelled: [],
    rejected: [],
  };
  return map[status] || [];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-purple-100 text-purple-700",
  paid: "bg-blue-100 text-blue-700",
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
  const isPaypal = order.paymentMethod === "paypal";
  const allowedNext = getValidTransitions(order.status, order.paymentMethod || "cod");

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
                {order.cardBrand && <span className="ml-1">({order.cardBrand})</span>}
              </p>
              {order.paypalCaptureId && (
                <p><span className="font-medium text-foreground">Transaction ID:</span> {order.paypalCaptureId}</p>
              )}
              {order.paypalOrderId && !order.paypalCaptureId && (
                <p><span className="font-medium text-foreground">Order ID:</span> {order.paypalOrderId}</p>
              )}
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

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Status Actions</h3>
            <p className="text-[11px] text-foreground/70 mb-2">
              Click a status to update this order.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allowedNext.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={updatingId === order.firestoreId}
                  onClick={() => onStatusChange(order.firestoreId, status)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all disabled:opacity-50 ${
                    order.status === status
                      ? "bg-accent text-white border-accent"
                      : "bg-background text-foreground border-card-border hover:border-accent/60 hover:text-accent"
                  }`}
                >
                  {statusLabel(status)}
                </button>
              ))}
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
      }
    }
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders;
    if (paymentFilter !== "all") {
      result = result.filter((o) =>
        o.paymentMethod === paymentFilter
      );
    }
    if (filter !== "all") {
      result = result.filter((o) => o.status === filter);
    }
    return result;
  }, [paymentFilter, filter, orders]);

  const visibleStatuses = useMemo(() => {
    if (paymentFilter === "paypal" || paymentFilter === "card") return paypalStatuses;
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
    const cod = orders.filter((o) => o.paymentMethod === "cod" || !o.paymentMethod).length;
    const paypal = orders.filter((o) => o.paymentMethod === "paypal").length;
    const card = orders.filter((o) => o.paymentMethod === "card").length;
    return { cod, paypal, card };
  }, [orders]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      if (newStatus === "paid" || newStatus === "rejected") {
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

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

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
        {(["all", "cod", "paypal", "card"] as PaymentFilter[]).map((pm) => (
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
            {pm === "all" ? "All" : pm === "cod" ? `COD (${paymentCounts.cod})` : pm === "paypal" ? `PayPal (${paymentCounts.paypal})` : `Card (${paymentCounts.card})`}
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
                  onClick={() => setModalOrder(order)}
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
                    {order.cardBrand && (
                      <span className="text-xs ml-1 text-foreground/70">({order.cardBrand})</span>
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
        />
      )}
    </div>
  );
}
