"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { site, navLinks } from "@/data/site";
import { categories } from "@/data/categories";
import { getAllProducts } from "@/lib/product-store";
import { getSettings } from "@/lib/settings-store";
import type { Product } from "@/data/products";
import ThemeToggle from "./ThemeToggle";
import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import { useAuth } from "./AuthContext";
import ImagePlaceholder from "./ImagePlaceholder";

const categoryLinks = categories.map((c) => ({
  label: c.name,
  href: c.slug === "sale" ? "/sale" : `/shop?category=${c.slug}`,
  slug: c.slug,
  subcategories: c.subcategories,
}));

export default function CustomerNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(120);

  useEffect(() => {
    getSettings().then((s) => setFreeShippingThreshold(s.freeShippingThreshold ?? 120));
  }, []);

  useEffect(() => {
    getAllProducts(20).then(setAllProducts);
  }, []);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { user, isAuthenticated, needsVerification, logout, isAdmin } = useAuth();

  const ticking = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const shouldHide = currentY > 80 && currentY > lastScrollY.current;
          setHidden(shouldHide);
          if (shouldHide) setSearchOpen(false);
          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const results = useMemo<Product[]>(() => {
    if (!query.trim()) {
      return [];
    }
    const q = query.toLowerCase();
    return allProducts.filter(
      p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query, allProducts]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [searchOpen]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <nav className="bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="h-14 md:h-20 shrink-0">
              <Image
                src="/images/PinayVictoriousLogo.png"
                alt={site.name}
                width={160}
                height={56}
                className="h-full w-auto rounded-lg object-contain"
                sizes="160px"
                quality={75}
                preload={true}
              />
            </Link>
                <div className="hidden lg:flex items-center gap-0">
                  <div className="relative" ref={searchWrapperRef}>
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="p-2 text-foreground hover:text-accent transition-colors"
                      aria-label="Search"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {searchOpen && (
                        <m.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-card rounded-xl shadow-xl border border-primary/10 overflow-hidden z-50"
                        >
                          <div className="p-3">
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search products..."
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && query.trim()) {
                                    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
                                    setQuery("");
                                    setSearchOpen(false);
                                  }
                                  if (e.key === "Escape") setSearchOpen(false);
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-primary/10 bg-primary/5 text-sm text-dark placeholder-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                              />
                              {query && (
                                <button
                                  onClick={() => setQuery("")}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground hover:text-dark"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>

                          {query.trim() && (
                            <div className="border-t border-primary/10">
                              {results.length > 0 ? (
                                <div>
                                  {results.map((product) => (
                                    <Link
                                      key={product.id}
                                      href={`/shop/${product.slug}`}
                                      onClick={() => { setSearchOpen(false); setQuery(""); }}
                                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary/5 transition-colors"
                                    >
                                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-primary/10">
                                        <ImagePlaceholder
                                          category={product.category}
                                          name={product.name}
                                          imageUrl={product.images?.[0]?.url || ""}
                                          className="w-8 h-8"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-dark truncate">{product.name}</p>
                                        <p className="text-xs text-foreground">{product.brand}</p>
                                      </div>
                                      <span className="text-sm font-semibold text-accent shrink-0">{formatPrice(product.price)}</span>
                                    </Link>
                                  ))}
                                  <Link
                                    href={`/shop?search=${encodeURIComponent(query)}`}
                                    onClick={() => { setSearchOpen(false); setQuery(""); }}
                                    className="flex items-center justify-center gap-1 px-3 py-2.5 text-sm text-accent hover:bg-primary/5 transition-colors border-t border-primary/10"
                                  >
                                    View all results
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-sm text-foreground">
                                  No products found for &ldquo;{query}&rdquo;
                                </div>
                              )}
                            </div>
                          )}
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {navLinks.filter(l => l.label === "Categories").map((link) => (
                    <div key={link.label} ref={catRef} className="relative">
                      <button
                        onClick={() => setCatOpen(!catOpen)}
                        className={`flex items-center gap-1 px-1.5 sm:px-2 lg:px-3 xl:px-4 py-2 text-sm transition-colors rounded-lg ${
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
                          <m.div key="categories-dropdown"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-1 min-w-55 max-w-[90vw] sm:min-w-100 lg:min-w-125 xl:min-w-150 max-h-[70vh] overflow-y-auto bg-card rounded-xl p-4 shadow-xl"
                          >
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3">
                              {categoryLinks.filter(c => c.subcategories.length > 0).map((cat) => (
                                <div key={cat.href}>
                                  <Link
                                    href={cat.href}
                                    onClick={() => setCatOpen(false)}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-dark hover:text-accent transition-colors mb-1"
                                  >
                                    {cat.label}
                                  </Link>
                                  {cat.subcategories.length > 0 && (
                                    <div className="space-y-0.5">
                                      {cat.subcategories.map((sub) => (
                                        <Link
                                          key={sub.slug}
                                          href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                          onClick={() => setCatOpen(false)}
                                          className="block pl-4 text-sm text-foreground hover:text-accent transition-colors"
                                        >
                                          {sub.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-primary/10 flex flex-wrap gap-1.5">
                              {categoryLinks.filter(c => c.subcategories.length === 0).map((cat) => (
                                <Link
                                  key={cat.href}
                                  href={cat.href}
                                  onClick={() => setCatOpen(false)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  {cat.label}
                                </Link>
                              ))}
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  <div className="flex items-center gap-0 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {navLinks.filter(l => l.label !== "Categories").map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          className={`relative px-1.5 sm:px-2 lg:px-3 xl:px-4 py-2 text-sm transition-colors rounded-lg ${
                            isActive
                              ? "text-accent"
                              : "text-foreground hover:text-accent hover:bg-primary/10"
                          }`}
                        >
                          {link.label}
                          {isActive && (
                            <m.span
                              layoutId="nav-active"
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full"
                            />
                          )}
                        </Link>
                      );
                    })}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`relative px-1.5 sm:px-2 lg:px-3 xl:px-4 py-2 text-sm transition-colors rounded-lg text-foreground hover:text-accent hover:bg-primary/10`}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <ThemeToggle />
                  <Link
                    href="/wishlist"
                    className="p-1.5 text-foreground hover:text-accent transition-colors"
                    aria-label="Wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="relative p-1.5 text-foreground hover:text-accent transition-colors"
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
                  {user ? (
                    <div className="flex items-center gap-0.5">
                      {isAuthenticated && (
                        <Link
                          href="/orders"
                          className={`hidden lg:block px-2 py-1.5 text-xs transition-colors rounded-lg ${
                            pathname === "/orders"
                              ? "text-accent"
                              : "text-foreground hover:text-accent hover:bg-primary/10"
                          }`}
                        >
                          My Orders
                        </Link>
                      )}
                      <Link
                        href={needsVerification ? "/verify-email" : "/profile"}
                        className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden text-[10px] font-semibold text-accent hover:ring-2 hover:ring-accent/50 transition-all shrink-0"
                        title="My Profile"
                      >
                        {user.photoURL ? (
                          <Image src={user.photoURL} alt={user.name} width={28} height={28} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="hidden sm:block px-2 py-1 text-xs text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="hidden lg:flex items-center gap-0.5">
                      <Link
                        href="/login"
                        className="px-2 py-1.5 text-xs text-foreground hover:text-accent transition-colors rounded-lg hover:bg-primary/10"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="px-2 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/80 transition-colors rounded-lg"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 text-foreground"
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
              <m.div key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden glass border-t border-primary/10 overflow-hidden"
              >
                <div className="overflow-y-auto max-h-[calc(100dvh-4rem)]">
                  <div className="px-4 py-3 space-y-1">
                <div className="relative mb-3">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) { router.push(`/shop?search=${encodeURIComponent(query.trim())}`); setQuery(""); setMobileOpen(false); } }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/10 bg-primary/5 text-sm text-dark placeholder-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <MobileNavLink href="/" label="Home" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileNavLink href="/shop" label="Shop" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileCategorySection
                  categories={categoryLinks}
                  onClose={() => setMobileOpen(false)}
                />
                <MobileNavLink href="/sale" label="Sale" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileNavLink href="/about" label="About" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <MobileNavLink href="/contact" label="Contact" pathname={pathname} onClose={() => setMobileOpen(false)} />
                <div className="border-t border-primary/10 pt-2 mt-2">
                  {isAuthenticated ? (
                    <>
                      <MobileNavLink href="/wishlist" label="Wishlist" pathname={pathname} onClose={() => setMobileOpen(false)} />
                      <MobileNavLink href="/orders" label="My Orders" pathname={pathname} onClose={() => setMobileOpen(false)} />
                      {isAdmin && <MobileNavLink href="/admin" label="Admin" pathname={pathname} onClose={() => setMobileOpen(false)} />}
                      <Link
                        href={needsVerification ? "/verify-email" : "/profile"}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                          {user!.name.charAt(0).toUpperCase()}
                        </div>
                        {user!.name}
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="block w-full text-left px-3 py-2.5 text-sm text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : needsVerification ? (
                    <Link
                      href="/verify-email"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Verify Email
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 text-sm text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            </m.div>
          )}
        </AnimatePresence>
        </nav>

        <AnimatePresence>
          {needsVerification && (
            <m.div key="verify-banner"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-accent border-t border-accent/30"
            >
              <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-1.5 text-xs text-dark">
                <span>Your account is not verified.</span>
                <Link href="/verify-email" className="font-medium underline hover:no-underline">
                  Verify now
                </Link>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`${
        needsVerification ? 'h-[calc(3.5rem+34px)] md:h-[calc(5rem+34px)]' : 'h-14 md:h-20'
      }`} />

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
                      <ImagePlaceholder category={item.product.category} name={item.product.name} imageUrl={item.product.images?.[0]?.url || ""} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">Product:</p>
                      <Link href={`/shop/${item.product.slug}`} onClick={() => setCartOpen(false)} className="text-sm font-medium text-dark hover:text-accent transition-colors line-clamp-1">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-foreground mt-0.5">
                          <span className="text-foreground">Variant:</span> {item.variant.name}
                        </p>
                      )}
                      <p className="text-xs text-foreground mt-0.5">
                        Price: <span className="text-sm font-semibold text-dark">{formatPrice(item.variant?.price ?? item.product.price)}</span>
                      </p>
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
                  <span className="font-semibold text-dark">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    if (!user) {
                      router.push("/login?redirect=checkout");
                    } else if (needsVerification) {
                      showToast("Please verify your email before checking out", "error");
                    } else {
                      router.push("/checkout");
                    }
                  }}
                  className="w-full bg-accent text-white py-3 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
                >
                  Checkout
                </button>
                {totalPrice >= freeShippingThreshold ? (
                  <p className="text-xs text-center text-green-600 dark:text-green-400">You qualify for free shipping ✓</p>
                ) : (
                  <p className="text-xs text-center text-foreground/70">
                    Add {formatPrice(freeShippingThreshold - totalPrice)} more for free shipping
                  </p>
                )}
                <p className="text-xs text-center text-foreground">Cash on Delivery</p>
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

function MobileCategorySection({ categories, onClose }: { categories: { label: string; href: string; slug: string; subcategories: { name: string; slug: string }[] }[]; onClose: () => void }) {
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
          <m.div key="mobile-categories"
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
                          href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
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
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
