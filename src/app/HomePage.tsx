"use client";

import FullPageLoader from "@/components/FullPageLoader";
import HomeContent from "@/components/HomeContent";
import { useHomeData } from "@/hooks/useHomeData";
import type { Product } from "@/data/products";
import type { SiteSettings } from "@/lib/settings-store";

interface HomePageProps {
  initialProducts?: Product[];
  initialReviewStats?: Record<string, { avgRating: number; reviewCount: number }>;
  initialSettings?: SiteSettings | null;
}

export default function HomePage({ initialProducts, initialReviewStats, initialSettings }: HomePageProps) {
  const { products, reviewStats, reviews, settings, isPageLoading } = useHomeData(
    initialProducts,
    initialReviewStats,
    initialSettings,
  );

  if (isPageLoading) {
    return <FullPageLoader />;
  }

  return <HomeContent products={products} reviewStats={reviewStats} reviews={reviews} settings={settings} />;
}
