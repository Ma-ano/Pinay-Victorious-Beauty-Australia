"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { site } from "@/data/site";
import ThemeToggle from "./ThemeToggle";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Promotions", href: "/admin/promotions" },
];

export default function AdminNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-card ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/admin" className="h-full py-2 shrink-0">
              <Image
                src="/images/PinayVictoriousLogo.jpg"
                alt={site.name}
                width={160}
                height={56}
                className="h-full w-auto rounded-lg object-contain"
                quality={75}
                unoptimized
              />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {adminLinks.map((link) => {
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
                      <m.span
                        layoutId="nav-active"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
              <Link
                href="/"
                className="px-4 py-2 text-sm text-foreground hover:text-accent transition-colors rounded-lg hover:bg-primary/10"
              >
                ← Store
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
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
            <m.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass border-t border-primary/10 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {adminLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2.5 transition-colors rounded-lg text-sm ${
                        isActive
                          ? "text-accent bg-accent/10"
                          : "text-foreground hover:text-accent hover:bg-primary/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-foreground hover:text-accent hover:bg-primary/10 rounded-lg transition-colors text-sm"
                >
                  ← Store
                </Link>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-16 md:h-20" />
    </>
  );
}
