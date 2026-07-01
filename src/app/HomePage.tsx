"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import CategoryPreview from "@/components/CategoryPreview";
import SaleBanner from "@/components/SaleBanner";
import ReviewSection from "@/components/ReviewSection";
import { HomePageSkeleton } from "@/components/Skeletons";
import type { Product } from "@/data/products";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";
import { getSettings, type SiteSettings } from "@/lib/settings-store";

interface HomePageProps {
  initialProducts?: Product[];
  initialReviewStats?: Record<string, { avgRating: number; reviewCount: number }>;
  initialSettings?: SiteSettings | null;
}

export default function HomePage({ initialProducts, initialReviewStats, initialSettings }: HomePageProps) {
  const [trending, setTrending] = useState<Product[]>([]);
  const [bestSelling, setBestSelling] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings ?? null);
  const [loading, setLoading] = useState(!(initialProducts && initialReviewStats));

  useEffect(() => {
    if (initialProducts && initialReviewStats) {
      const enriched = initialProducts.map((p) => ({
        ...p,
        rating: initialReviewStats[p.id]?.avgRating ?? p.rating,
        reviews: initialReviewStats[p.id]?.reviewCount ?? p.reviews,
      }));
      const t = [...enriched].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return Math.random() - 0.5;
      });
      const b = [...enriched].sort((a, b) => {
        if ((b as Product & { soldCount?: number }).soldCount !== (a as Product & { soldCount?: number }).soldCount)
          return ((b as Product & { soldCount?: number }).soldCount ?? 0) - ((a as Product & { soldCount?: number }).soldCount ?? 0);
        return Math.random() - 0.5;
      });
      setTrending(t);
      setBestSelling(b);
      setSettings(initialSettings ?? null);
      setLoading(false);
      return;
    }

    Promise.all([
      getAllProducts().catch(() => [] as Product[]),
      getAllReviewStats().catch(() => ({} as Record<string, { avgRating: number; reviewCount: number }>)),
      getSettings().catch(() => null),
    ]).then(([all, reviewStats, settings]) => {
      const enriched = all.map((p) => ({
        ...p,
        rating: reviewStats[p.id]?.avgRating ?? p.rating,
        reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
      }));
      const t = [...enriched].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return Math.random() - 0.5;
      });
      const b = [...enriched].sort((a, b) => {
        if ((b as Product & { soldCount?: number }).soldCount !== (a as Product & { soldCount?: number }).soldCount)
          return ((b as Product & { soldCount?: number }).soldCount ?? 0) - ((a as Product & { soldCount?: number }).soldCount ?? 0);
        return Math.random() - 0.5;
      });
      setTrending(t);
      setBestSelling(b);
      setSettings(settings);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="space-y-24 pb-24">
      <HeroBanner featuredBrands={settings?.featuredBrands} />

      {trending.length > 0 && (
        <div className="animate-fade-in-up">
          <ProductCarousel products={trending} title="Trending Now" description="Top-rated by our customers" maxSlides={5} />
        </div>
      )}

      {bestSelling.length > 0 && (
        <div className="animate-fade-in-up">
          <ProductCarousel products={bestSelling} title="Best Selling" description="Most purchased products" maxSlides={5} />
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <CategoryPreview categoryImages={settings?.categoryImages} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <SaleBanner
          title={settings?.saleBannerTitle}
          subtitle={settings?.saleBannerSubtitle}
          discount={settings?.saleBannerDiscount}
        />
      </section>

      {settings?.reviews && settings.reviews.length > 0 && (
        <div className="animate-fade-in-up">
          <ReviewSection reviews={settings.reviews} />
        </div>
      )}
    </div>
  );
}
