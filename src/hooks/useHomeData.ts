"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";
import { getSettings, type SiteSettings } from "@/lib/settings-store";

const MIN_LOAD_MS = 400;
const PRELOAD_COUNT = 8;
const PRELOAD_TIMEOUT = 5000;

function getImageUrl(product: Product): string | null {
  const url = product.images?.[0]?.url;
  if (!url) return null;
  return url.startsWith("http")
    ? url
    : `https://images.unsplash.com/${url}?w=600&h=600&fit=crop&auto=format`;
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

interface HomeData {
  products: Product[];
  reviewStats: Record<string, { avgRating: number; reviewCount: number }>;
  reviews: SiteSettings["reviews"];
  settings: SiteSettings | null;
}

interface UseHomeDataResult extends HomeData {
  isPageLoading: boolean;
}

export function useHomeData(
  initialProducts?: Product[],
  initialReviewStats?: Record<string, { avgRating: number; reviewCount: number }>,
  initialSettings?: SiteSettings | null,
): UseHomeDataResult {
  const hasInitial = !!(initialProducts && initialReviewStats && initialSettings);

  const [state, setState] = useState<HomeData>({
    products: initialProducts ?? [],
    reviewStats: initialReviewStats ?? {},
    reviews: initialSettings?.reviews ?? [],
    settings: initialSettings ?? null,
  });
  const [isPageLoading, setIsPageLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return;

    const start = Date.now();

    Promise.all([
      getAllProducts(20).catch(() => [] as Product[]),
      getAllReviewStats().catch(() => ({}) as Record<string, { avgRating: number; reviewCount: number }>),
      getSettings().catch(() => null),
    ]).then(([products, reviewStats, settings]) => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_LOAD_MS - elapsed);

      // Preload first N product images before revealing content
      const urls = products.slice(0, PRELOAD_COUNT).map(getImageUrl).filter(Boolean) as string[];

      Promise.race([
        Promise.all(urls.map(preloadImage)),
        new Promise<void>((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT)),
      ]).then(() => {
        setTimeout(() => {
          setState({ products, reviewStats, reviews: settings?.reviews ?? [], settings });
          setIsPageLoading(false);
        }, remaining);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, isPageLoading };
}
