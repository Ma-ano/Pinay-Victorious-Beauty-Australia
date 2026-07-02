"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";

interface UseProductsResult {
  products: Product[];
  reviewStats: Record<string, { avgRating: number; reviewCount: number }>;
  loading: boolean;
}

export function useProducts(
  initialProducts?: Product[],
  initialReviewStats?: Record<string, { avgRating: number; reviewCount: number }>,
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [reviewStats, setReviewStats] = useState<Record<string, { avgRating: number; reviewCount: number }>>(
    initialReviewStats ?? {},
  );
  const [loading, setLoading] = useState(!(initialProducts && initialReviewStats));

  useEffect(() => {
    if (initialProducts && initialReviewStats) return;

    let cancelled = false;

    Promise.all([
      getAllProducts(20).catch(() => [] as Product[]),
      getAllReviewStats().catch(() => ({}) as Record<string, { avgRating: number; reviewCount: number }>),
    ]).then(([all, stats]) => {
      if (cancelled) return;
      setProducts(all);
      setReviewStats(stats);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { products, reviewStats, loading };
}
