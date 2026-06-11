"use client";

import { useState } from "react";
import { recentOrders } from "@/data/admin";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? recentOrders
    : recentOrders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              filter === s
                ? "bg-accent text-white"
                : "bg-card text-foreground border border-card-border hover:border-accent/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

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
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-primary/5">
                <td className="px-4 py-3 font-medium text-dark">{order.id}</td>
                <td className="px-4 py-3 text-foreground">{order.customer}</td>
                <td className="px-4 py-3 text-foreground hidden sm:table-cell">{order.items}</td>
                <td className="px-4 py-3 text-dark font-medium">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-foreground hidden md:table-cell">{order.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
