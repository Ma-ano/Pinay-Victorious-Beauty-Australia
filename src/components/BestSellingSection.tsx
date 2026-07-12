"use client";

import { useMemo } from "react";
import ProductCarousel from "./ProductCarousel";
import type { Product } from "@/data/products";

interface Props {
  products: Product[];
  reviewStats: Record<string, { avgRating: number; reviewCount: number }>;
}

export default function BestSellingSection({ products, reviewStats }: Props) {
  const bestSelling = useMemo(() => {
    return products
      .map((p) => ({
        ...p,
        rating: reviewStats[p.id]?.avgRating ?? p.rating,
        reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
      }))
      .filter((p) => (p.sold ?? 0) > 0)
      .sort((a, b) => {
        const aSold = a.sold ?? 0;
        const bSold = b.sold ?? 0;
        if (bSold !== aSold) return bSold - aSold;
        return a.id.localeCompare(b.id);
      });
  }, [products, reviewStats]);

  const display = bestSelling.length > 0 ? bestSelling : products;
  if (display.length === 0) return null;

  return (
    <ProductCarousel products={display} title="Best Selling" description="Most purchased products" maxSlides={5} />
  );
}
