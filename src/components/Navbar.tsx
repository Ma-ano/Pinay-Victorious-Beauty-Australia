"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, navLinks } from "@/data/site";
import ThemeToggle from "./ThemeToggle";
import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import ImagePlaceholder from "./ImagePlaceholder";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Promotions", href: "/admin/promotions" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const currentLinks = isAdmin ? adminLinks : navLinks;
  const { showToast } = useToast();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-strong" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="text-lg md:text-xl font-bold text-dark tracking-tight">
              {site.name}
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-foreground hover:text-accent transition-colors rounded-lg hover:bg-primary/10"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/"
                  className="px-4 py-2 text-sm text-foreground hover:text-accent transition-colors rounded-lg hover:bg-primary/10"
                >
                  ← Store
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              {!isAdmin && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-foreground hover:text-accent transition-colors"
                aria-label="Open cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-foreground"
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden glass border-t border-primary/10 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-foreground hover:text-accent transition-colors rounded-lg hover:bg-primary/10 text-sm"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-foreground hover:text-accent transition-colors rounded-lg hover:bg-primary/10 text-sm"
                >
                  ← Store
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-16 md:h-20" />

      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-card h-full shadow-xl flex flex-col animate-slide-in">
            <div className="p-6 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-dark">Your Cart</h2>
                <button onClick={() => setCartOpen(false)} className="p-1 text-foreground hover:text-dark" aria-label="Close cart">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-foreground mt-1">{totalItems} {totalItems === 1 ? "item" : "items"}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-foreground text-center py-12 text-sm">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.key} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-primary/10">
                      <ImagePlaceholder category={item.product.category} name={item.product.name} imageUrl={item.product.imageUrl} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.product.slug}`} onClick={() => setCartOpen(false)} className="text-sm font-medium text-dark hover:text-accent transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-foreground mt-0.5">{item.variant.name}</p>
                      )}
                      <p className="text-sm font-semibold text-dark mt-0.5">${item.product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-xs text-foreground hover:border-accent hover:text-accent transition-all"
                        >
                          -
                        </button>
                        <span className="text-xs font-medium text-dark w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-primary/20 flex items-center justify-center text-xs text-foreground hover:border-accent hover:text-accent transition-all"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="ml-auto text-xs text-foreground hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 glass border-t border-primary/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Subtotal</span>
                  <span className="font-semibold text-dark">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => showToast("Checkout done — Demo purposes only", "info")}
                  className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
                >
                  Checkout
                </button>
                <p className="text-xs text-center text-foreground">PayPal accepted · Free shipping over $50</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
