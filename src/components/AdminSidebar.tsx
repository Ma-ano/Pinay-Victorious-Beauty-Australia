"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Dashboard", href: "/admin", icon: "◈", requireMaster: false },
  { label: "Products", href: "/admin/products", icon: "⊡", requireMaster: false },
  { label: "Orders", href: "/admin/orders", icon: "☰", requireMaster: false },
  { label: "Users", href: "/admin/users", icon: "◉", requireMaster: true },
  { label: "Promotions", href: "/admin/promotions", icon: "♢", requireMaster: false },
  { label: "Settings", href: "/admin/settings", icon: "⚙", requireMaster: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isMasterAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleLinks = links.filter((l) => !l.requireMaster || isMasterAdmin);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-8">
        <Link href="/admin" className="text-lg font-bold text-dark" onClick={closeSidebar}>Admin Panel</Link>
        <button onClick={closeSidebar} className="md:hidden text-foreground hover:text-dark" aria-label="Close menu">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="space-y-1 flex-1 overflow-y-auto">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeSidebar}
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
    </>
  );

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-card-border shadow-lg text-dark"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-card-border p-6 flex flex-col transform transition-transform duration-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:hidden`}>
        {sidebarContent}
      </aside>

      <aside className="w-64 bg-card border-r border-card-border h-screen p-6 hidden md:flex md:flex-col sticky top-0 self-start">
        {sidebarContent}
      </aside>
    </>
  );
}
