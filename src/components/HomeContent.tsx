"use client";

import { useEffect, useState } from "react";
import HeroBanner from "./HeroBanner";
import TrendingSection from "./TrendingSection";
import BestSellingSection from "./BestSellingSection";
import CategoryPreview from "./CategoryPreview";
import SaleBanner from "./SaleBanner";
import ReviewSection from "./ReviewSection";
import type { Product } from "@/data/products";
import type { SiteSettings } from "@/lib/settings-store";

interface Props {
  products: Product[];
  reviewStats: Record<string, { avgRating: number; reviewCount: number }>;
  reviews: SiteSettings["reviews"];
  settings: SiteSettings | null;
}

export default function HomeContent({ products, reviewStats, reviews, settings }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`space-y-24 pb-24 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <HeroBanner featuredBrands={settings?.featuredBrands} />

      <TrendingSection products={products} reviewStats={reviewStats} />

      <BestSellingSection products={products} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryPreview categoryImages={settings?.categoryImages} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SaleBanner
          title={settings?.saleBannerTitle}
          subtitle={settings?.saleBannerSubtitle}
          discount={settings?.saleBannerDiscount}
        />
      </section>

      {reviews && reviews.length > 0 && (
        <ReviewSection reviews={reviews} />
      )}
    </div>
  );
}
