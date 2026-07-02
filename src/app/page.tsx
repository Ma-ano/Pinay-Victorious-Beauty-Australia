import { Suspense } from "react";
import { fetchAllSettings, fetchProducts, fetchAllReviewStats } from "@/lib/admin-product-store";
import HeroBanner from "@/components/HeroBanner";
import CategoryPreview from "@/components/CategoryPreview";
import SaleBanner from "@/components/SaleBanner";
import TrendingSection from "@/components/TrendingSection";
import BestSellingSection from "@/components/BestSellingSection";
import ReviewSection from "@/components/ReviewSection";
import { TrendingSkeleton, BestSellingSkeleton } from "@/components/Skeletons";

export const revalidate = 60;

async function TrendingWrapper() {
  const [products, reviewStats] = await Promise.all([
    fetchProducts({ limit: 20 }),
    fetchAllReviewStats(),
  ]);
  return <TrendingSection products={products} reviewStats={reviewStats} />;
}

async function BestSellingWrapper() {
  const products = await fetchProducts({ limit: 20 });
  return <BestSellingSection products={products} />;
}

export default async function Page() {
  const settings = await fetchAllSettings();
  const s = settings ? JSON.parse(JSON.stringify(settings)) : null;

  return (
    <div className="space-y-24 pb-24">
      <HeroBanner featuredBrands={s?.featuredBrands} />

      <Suspense fallback={<TrendingSkeleton />}>
        <TrendingWrapper />
      </Suspense>

      <Suspense fallback={<BestSellingSkeleton />}>
        <BestSellingWrapper />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryPreview categoryImages={s?.categoryImages} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SaleBanner
          title={s?.saleBannerTitle}
          subtitle={s?.saleBannerSubtitle}
          discount={s?.saleBannerDiscount}
        />
      </section>

      {s?.reviews?.length > 0 && (
        <ReviewSection reviews={s.reviews} />
      )}
    </div>
  );
}
