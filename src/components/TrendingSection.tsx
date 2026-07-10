"use client";

import { useMemo } from "react";
import ProductCarousel from "./ProductCarousel";
import type { Product } from "@/data/products";

interface Props {
  products: Product[];
  reviewStats: Record<string, { avgRating: number; reviewCount: number }>;
}

export default function TrendingSection({ products, reviewStats }: Props) {
  const trending = useMemo(() => {
    return products
      .map((p) => ({
        ...p,
        rating: reviewStats[p.id]?.avgRating ?? p.rating,
        reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
      }))
      .filter((p) => p.rating > 0)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.id.localeCompare(b.id);
      });
  }, [products, reviewStats]);

  const display = trending.length > 0 ? trending : products;
  if (display.length === 0) return null;

  return (
    <ProductCarousel products={display} title="Trending Now" description="Top-rated by our customers" maxSlides={5} />
  );
}
