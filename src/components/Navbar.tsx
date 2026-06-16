"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { site, navLinks } from "@/data/site";
import { categories } from "@/data/categories";
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

const categoryLinks = categories.map((c) => ({
  label: c.name,
  href: `/shop?category=${c.slug}`,
  slug: c.slug,
  subcategories: c.subcategories,
}));

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const currentLinks = isAdmin ? adminLinks : navLinks;
  const { showToast } = useToast();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY > 80) {
        setHidden(currentY > lastScrollY.current);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    if (catOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [catOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-card ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/20" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {currentLinks.map((link) => {
                if (link.label === "Shop") {
                  return (
                    <div key={link.href} ref={catRef} className="relative">
                      <button
                        onClick={() => setCatOpen(!catOpen)}
                        className={`flex items-center gap-1 px-4 py-2 text-sm transition-colors rounded-lg ${
                          catOpen || pathname.startsWith("/shop")
                            ? "text-accent"
                            : "text-foreground hover:text-accent hover:bg-primary/10"
                        }`}
                      >
                        Categories
                        <svg className={`w-3.5 h-3.5 transition-transform ${catOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {catOpen && (
                          <motion.div key="categories-dropdown"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-1 w-195 bg-card rounded-xl p-6 shadow-xl"
                          >
                            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                              {categoryLinks.filter(c => c.subcategories.length > 0).map((cat) => (
                                <div key={cat.href}>
                                  <Link
                                    href={cat.href}
                                    onClick={() => setCatOpen(false)}
                                    className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-dark hover:text-accent transition-colors mb-1.5"
                                  >
                                    {cat.label}
                                  </Link>
                                  {cat.subcategories.length > 0 && (
                                    <div className="space-y-0.5">
                                      {cat.subcategories.map((sub) => (
                                        <Link
                                          key={sub.slug}
                                          href={`/shop?category=${cat.slug}&type=${sub.slug}`}
                                          onClick={() => setCatOpen(false)}
                                          className="block pl-7 text-sm text-foreground hover:text-accent transition-colors"
                                        >
                                          {sub.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-primary/10 flex flex-wrap gap-2.5">
                              {categoryLinks.filter(c => c.subcategories.length === 0).map((cat) => (
                                <Link
                                  key={cat.href}
                                  href={cat.href}
                                  onClick={() => setCatOpen(false)}
                                  className="inline-flex items-center gap-1 px-4 py-2 text-sm text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  {cat.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm transition-colors rounded-lg ${
                      isActive
                        ? "text-accent"
                        : "text-foreground hover:text-accent hover:bg-primary/10"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
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
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] min-w-4 h-4 rounded-full flex items-center justify-center px-1">
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

        <AnimatePresence>
          {mobileOpen && (
              <motion.div key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden glass border-t border-primary/10 overflow-hidden"
              >
                <div className="overflow-y-auto max-h-[calc(100dvh-4rem)]">
                  <div className="px-4 py-3 space-y-1">
                <MobileNavLink href="/" label="Home" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileNavLink href="/shop" label="Shop" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileCategorySection
                  categories={categoryLinks}
                  onClose={() => setMobileOpen(false)}
                />
                <MobileNavLink href="/sale" label="Sale" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileNavLink href="/about" label="About" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileNavLink href="/contact" label="Contact" pathname={pathname} onClose={() => setMobileOpen(false)} />
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-16 md:h-20" />

      {cartOpen && (
        <div className="fixed inset-0 z-60 flex justify-end">
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
                  onClick={() => showToast("Order placed — Thank you for your purchase!", "success")}
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

function MobileNavLink({ href, label, pathname, onClose }: { href: string; label: string; pathname: string; onClose: () => void }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`block px-3 py-2.5 transition-colors rounded-lg text-sm ${
        isActive
          ? "text-accent bg-accent/10"
          : "text-foreground hover:text-accent hover:bg-primary/10"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileCategorySection({ categories, onClose }: { categories: { label: string; href: string; subcategories: { name: string; slug: string }[] }[]; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
      >
        Categories
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div key="mobile-categories"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-1 space-y-2">
              {categories.map((cat) => (
                <div key={cat.href}>
                  <Link
                    href={cat.href}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-dark hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    {cat.label}
                  </Link>
                  {cat.subcategories.length > 0 && (
                    <div className="pl-9 space-y-0.5 pb-1">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/shop?category=${cat.href.split("=")[1]}&type=${sub.slug}`}
                          onClick={onClose}
                          className="block px-3 py-1.5 text-xs text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
