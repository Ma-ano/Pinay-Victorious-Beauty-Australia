"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { SalePageSkeleton } from "@/components/Skeletons";
import type { Product } from "@/data/products";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";
import { getAllPromotions } from "@/lib/promotions-store";
import type { Promotion } from "@/lib/promotions-store";
import { formatPrice } from "@/lib/format";
import { isPromotionActive, calculateDiscount, findBestPromotion } from "@/lib/promotion-utils";

const ITEMS_PER_PAGE = 24;

interface SalePageProps {
  initialSaleProducts?: Product[];
  initialReviewStats?: Record<string, { avgRating: number; reviewCount: number }>;
}

export default function SalePage({ initialSaleProducts, initialReviewStats }: SalePageProps) {
  const hasInitial = !!(initialSaleProducts && initialReviewStats);
  const [code, setCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [error, setError] = useState("");
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>(() => {
    if (initialSaleProducts && initialReviewStats) {
      return initialSaleProducts.map((p) => ({
        ...p,
        rating: initialReviewStats[p.id]?.avgRating ?? p.rating,
        reviews: initialReviewStats[p.id]?.reviewCount ?? p.reviews,
      }));
    }
    return [];
  });
  const [loading, setLoading] = useState(!hasInitial);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAllPromotions().then(setAllPromotions).catch(() => {});
  }, []);

  useEffect(() => {
    if (hasInitial) return;
    setPage(1);
    Promise.all([
      getAllProducts().catch(() => [] as Product[]),
      getAllReviewStats().catch(() => ({} as Record<string, { avgRating: number; reviewCount: number }>)),
    ]).then(([all, reviewStats]) => {
      const enriched = all
        .filter((p) => p.isSale)
        .map((p) => ({
          ...p,
          rating: reviewStats[p.id]?.avgRating ?? p.rating,
          reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
        }));
      setSaleProducts(enriched);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleApplyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAppliedPromo(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a discount code");
      return;
    }

    const match = allPromotions.find(
      (p) => p.code.toUpperCase() === trimmed
    );

    if (!match) {
      setError("Invalid discount code");
      return;
    }

    if (!isPromotionActive(match)) {
      setError("This code has expired or is not yet active");
      return;
    }

    setAppliedPromo(match);
  }

  function handleClearCode() {
    setCode("");
    setAppliedPromo(null);
    setError("");
  }

  const totalPages = Math.ceil(saleProducts.length / ITEMS_PER_PAGE);
  const paginatedSaleProducts = saleProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const subtotal = saleProducts.reduce((s, p) => s + p.price, 0);
  const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) / saleProducts.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-accent/20 via-primary/10 to-accent/5 p-8 md:p-14 text-center mb-12">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">Limited Time</p>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mt-2">Special Offers</h1>
          <p className="mt-3 text-foreground max-w-md mx-auto">
            Grab your favorites at unbeatable prices. Stock up and save!
          </p>
        </div>
      </div>

      <div className="max-w-sm mx-auto mb-12">
        <form onSubmit={handleApplyCode} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter discount code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
          />
          {appliedPromo ? (
            <button
              type="button"
              onClick={handleClearCode}
              className="px-5 py-2.5 bg-primary/10 text-dark rounded-xl font-medium hover:bg-primary/20 transition-colors text-sm"
            >
              Clear
            </button>
          ) : (
            <button type="submit" className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/80 transition-colors text-sm">
              Apply
            </button>
          )}
        </form>
        {appliedPromo && (
          <p className="text-green-600 text-xs mt-2 text-center">
            Code applied! {appliedPromo.type === "Percentage" ? `${appliedPromo.discount}% off` : appliedPromo.type === "Fixed Amount" ? `${formatPrice(appliedPromo.discount)} off` : ""}
          </p>
        )}
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      </div>

      {loading ? (
        <SalePageSkeleton />
      ) : (
        <>
          {appliedPromo && discount > 0 && (
            <p className="text-center text-sm text-green-600 mb-4">
              Each item gets {formatPrice(discount)} off with code {appliedPromo.code}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {paginatedSaleProducts.map((product) => {
              const discountedPrice = appliedPromo
                ? Math.max(0, product.price - discount)
                : product.price;
              return (
                <div key={product.id}>
                  <ProductCard product={{ ...product, price: discountedPrice }} />
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-primary/20 bg-card text-foreground hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-foreground/40 text-sm">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-accent text-white"
                          : "border border-primary/20 bg-card text-foreground hover:bg-accent hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-primary/20 bg-card text-foreground hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!loading && saleProducts.length === 0 && (
        <p className="text-center text-foreground mt-20 text-sm">No products on sale at the moment.</p>
      )}
    </div>
  );
}
