"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Dashboard", href: "/admin", icon: "◈" },
  { label: "Products", href: "/admin/products", icon: "⊡" },
  { label: "Orders", href: "/admin/orders", icon: "☰" },
  { label: "Promotions", href: "/admin/promotions", icon: "♢" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 bg-card border-r border-card-border min-h-screen p-6 hidden md:flex md:flex-col">
      <Link href="/admin" className="text-lg font-bold text-dark block mb-8">Admin Panel</Link>
      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-foreground hover:bg-primary/10 hover:text-dark"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 pt-8 border-t border-card-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-dark transition-all"
        >
          ← Back to Store
        </Link>
        <div className="flex items-center gap-2 px-4 py-2.5">
          <ThemeToggle />
          <span className="text-xs text-foreground">Dark Mode</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
