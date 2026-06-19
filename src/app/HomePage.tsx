"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import PromotionCards from "@/components/PromotionCards";
import CategoryPreview from "@/components/CategoryPreview";
import SaleBanner from "@/components/SaleBanner";
import RecruitmentArea from "@/components/RecruitmentArea";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { getSaleProducts, getTrendingProducts, getBestSellingProducts } from "@/lib/product-store";
import { getSettings, type SiteSettings } from "@/lib/settings-store";

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [bestSelling, setBestSelling] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrendingProducts().catch(() => [] as Product[]),
      getBestSellingProducts().catch(() => [] as Product[]),
      getSaleProducts().catch(() => [] as Product[]),
      getSettings().catch(() => null),
    ]).then(([t, b, s, settings]) => {
      setTrending(t);
      setBestSelling(b);
      setSaleProducts(s.slice(0, 4));
      setSettings(settings);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-24">
      <HeroBanner featuredBrands={settings?.featuredBrands} />

      <div className="animate-fade-in-up">
        <ProductCarousel products={trending} title="Trending Now" description="Top-rated by our customers" />
      </div>

      <div className="animate-fade-in-up">
        <ProductCarousel products={bestSelling} title="Best Selling" description="Most purchased products" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <PromotionCards />
      </section>

      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-dark">On Sale</h2>
            <p className="mt-2 text-foreground">Limited-time offers you don&apos;t want to miss</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <CategoryPreview categoryImages={settings?.categoryImages} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <SaleBanner />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <RecruitmentArea />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <Newsletter />
      </section>
    </div>
  );
}
