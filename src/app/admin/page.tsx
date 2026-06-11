import { adminStats } from "@/data/admin";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Revenue", value: `$${adminStats.totalRevenue.toLocaleString()}`, change: adminStats.revenueChange },
    { label: "Total Orders", value: adminStats.totalOrders.toLocaleString(), change: adminStats.ordersChange },
    { label: "Products", value: adminStats.totalProducts, change: adminStats.productsChange },
    { label: "Customers", value: adminStats.totalCustomers, change: adminStats.customersChange },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
      <p className="text-sm text-foreground mt-1">Welcome back, Admin</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-2xl border border-card-border">
            <p className="text-xs text-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-dark mt-1">{stat.value}</p>
            <p className={`text-xs mt-2 ${stat.change >= 0 ? "text-green-600" : "text-red-500"}`}>
              {stat.change >= 0 ? "+" : ""}{stat.change}% from last month
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-card-border">
          <h2 className="font-semibold text-dark text-sm">Recent Activity</h2>
          <p className="text-xs text-foreground mt-2">8 new orders in the last 24 hours. Revenue up 12%.</p>
        </div>
        <Link href="/admin/orders" className="bg-card p-6 rounded-2xl border border-card-border hover:border-accent/30 transition-colors">
          <h2 className="font-semibold text-dark text-sm">View Orders →</h2>
          <p className="text-xs text-foreground mt-2">{adminStats.totalOrders} total orders to manage</p>
        </Link>
      </div>
    </div>
  );
}
