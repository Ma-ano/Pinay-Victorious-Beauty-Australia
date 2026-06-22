"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsSnap, ordersSnap, usersSnap] = await Promise.allSettled([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users")),
        ]);

        const totalProducts = productsSnap.status === "fulfilled" ? productsSnap.value.size : 0;
        const totalOrders = ordersSnap.status === "fulfilled" ? ordersSnap.value.size : 0;
        const totalCustomers = usersSnap.status === "fulfilled" ? usersSnap.value.size : 0;

        let totalRevenue = 0;
        if (ordersSnap.status === "fulfilled") {
          ordersSnap.value.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status === "delivered" && data.subtotal) {
              totalRevenue += Number(data.subtotal);
            }
          });
        }

        setStats({ totalRevenue, totalOrders, totalProducts, totalCustomers });
      } catch {
        // Stats will show zeros
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, change: 0 },
    { label: "Total Orders", value: stats.totalOrders.toLocaleString(), change: 0 },
    { label: "Products", value: stats.totalProducts.toLocaleString(), change: 0 },
    { label: "Customers", value: stats.totalCustomers.toLocaleString(), change: 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
      <p className="text-sm text-foreground mt-1">Welcome back, Admin</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-2xl border border-card-border">
            <p className="text-xs text-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-dark mt-1">{stat.value}</p>
            {stat.change !== 0 && (
              <p className={`text-xs mt-2 ${stat.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                {stat.change >= 0 ? "+" : ""}{stat.change}% from last month
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-card-border">
          <h2 className="font-semibold text-dark text-sm">Recent Orders</h2>
          <p className="text-xs text-foreground mt-2">{stats.totalOrders} total orders placed</p>
        </div>
        <Link href="/admin/orders" className="bg-card p-6 rounded-2xl border border-card-border hover:border-accent/30 transition-colors">
          <h2 className="font-semibold text-dark text-sm">View Orders →</h2>
          <p className="text-xs text-foreground mt-2">{stats.totalOrders} total orders to manage</p>
        </Link>
      </div>
    </div>
  );
}
