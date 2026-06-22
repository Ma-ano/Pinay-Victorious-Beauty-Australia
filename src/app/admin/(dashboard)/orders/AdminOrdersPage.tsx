"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
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

type OrderStatus = "pending" | "approved" | "shipped" | "delivered" | "cancelled" | "rejected" | "received";

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
  status: OrderStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const statuses: Array<OrderStatus | "all"> = ["all", "pending", "approved", "shipped", "delivered", "received", "cancelled", "rejected"];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-green-100 text-green-700",
  received: "bg-emerald-100 text-emerald-700",
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
          <h2 className="text-lg font-semibold text-dark">
            Order #{order.firestoreId.slice(-8)}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-dark transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-dark mb-2">Customer Details</h3>
            <div className="space-y-1 text-sm text-foreground">
              <p><span className="font-medium text-dark">Name:</span> {order.customerName}</p>
              <p><span className="font-medium text-dark">Email:</span> {order.customerEmail}</p>
              <p><span className="font-medium text-dark">Phone:</span> {order.customerPhone || "-"}</p>
              <p><span className="font-medium text-dark">Payment:</span> {order.paymentMethod || "cod"}</p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-dark mb-2">Shipping Address</h3>
            <div className="space-y-1 text-sm text-foreground">
              <p>{order.shipping?.street || "-"}</p>
              <p>{order.shipping?.city || "-"}, {order.shipping?.state || "-"} {order.shipping?.postcode || ""}</p>
              <p>{order.shipping?.country || "-"}</p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-dark mb-2">Order Items</h3>
            <div className="space-y-2">
              {(order.items || []).map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex justify-between gap-4 text-sm bg-primary/5 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-foreground">Product:</p>
                    <p className="text-dark font-medium">{item.name}</p>
                    {item.variant?.name && (
                      <p className="text-xs text-foreground">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-xs text-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-dark font-medium">${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-card-border flex justify-between text-sm font-semibold text-dark">
              <span>Total</span>
              <span>${Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-dark mb-2">Status Actions</h3>
            <p className="text-[11px] text-foreground/70 mb-2">Click a status to update this order. Shipped or Delivered will reduce your stock automatically.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statuses.filter((s): s is OrderStatus => s !== "all").map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={updatingId === order.firestoreId || order.status === status}
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
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
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
      if (updated) setModalOrder(updated);
    }
  }, [orders]);

  const filtered = useMemo(() => (
    filter === "all" ? orders : orders.filter((order) => order.status === filter)
  ), [filter, orders]);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      if (newStatus === "shipped" || newStatus === "delivered") {
        const order = orders.find((o) => o.firestoreId === orderId);
        if (order && order.status !== "shipped" && order.status !== "delivered") {
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
    } catch {
      showToast("Failed to update order status", "error");
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
          <p className="text-[11px] text-foreground/70 mt-1">Click any order to see customer details. Use the status buttons to update fulfillment. Setting to Shipped or Delivered will automatically deduct from your stock.</p>
        </div>
        <p className="text-sm text-foreground">{filtered.length} of {orders.length} orders</p>
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
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-foreground">
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
                  <td className="px-4 py-3 text-dark font-medium">${Number(order.subtotal || 0).toFixed(2)}</td>
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
