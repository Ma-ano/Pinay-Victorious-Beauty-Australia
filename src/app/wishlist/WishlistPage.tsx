"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";
import type { Product } from "@/data/products";
import { useToast } from "@/components/Toast";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch {
    return [];
  }
}

function setWishlist(ids: string[]) {
  localStorage.setItem("wishlist", JSON.stringify(ids));
  window.dispatchEvent(new Event("storage"));
}

export default function WishlistPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getWishlist();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all([getAllProducts(), getAllReviewStats()]).then(([all, reviewStats]) => {
      const wishlisted = all.filter((p) => ids.includes(p.id));
      const enriched = wishlisted.map((p) => ({
        ...p,
        rating: reviewStats[p.id]?.avgRating ?? p.rating,
        reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
      }));
      setProducts(enriched);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      const ids = getWishlist();
      setProducts((prev) => prev.filter((p) => ids.includes(p.id)));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">My Wishlist</h1>
          <p className="text-sm text-foreground mt-1">{products.length} saved {products.length === 1 ? "item" : "items"}</p>
        </div>
        <Link href="/shop" className="text-sm font-medium text-accent hover:text-accent/80">
          Continue shopping
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-card border border-card-border rounded-2xl p-10 text-center">
          <svg className="w-12 h-12 mx-auto text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-dark mt-4">Your wishlist is empty</h2>
          <p className="text-sm text-foreground mt-2">Save your favorite products to find them later.</p>
          <Link
            href="/shop"
            className="inline-block mt-6 bg-accent text-white py-2.5 px-6 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={() => {
                  const ids = getWishlist().filter((id) => id !== product.id);
                  setWishlist(ids);
                  setProducts((prev) => prev.filter((p) => p.id !== product.id));
                  showToast("Removed from wishlist", "info");
                }}
                className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/30"
                aria-label="Remove from wishlist"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
