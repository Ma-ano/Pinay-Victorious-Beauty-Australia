import { Suspense } from "react";
import type { Product } from "@/data/products";
import { fetchAllSettings, fetchProducts, fetchAllReviewStats } from "@/lib/admin-product-store";
import HeroBanner from "@/components/HeroBanner";
import CategoryPreview from "@/components/CategoryPreview";
import SaleBanner from "@/components/SaleBanner";
import TrendingSection from "@/components/TrendingSection";
import BestSellingSection from "@/components/BestSellingSection";
import ReviewSection from "@/components/ReviewSection";
import VerifiedToast from "@/components/VerifiedToast";
import { TrendingSkeleton, BestSellingSkeleton } from "@/components/Skeletons";

export const revalidate = 60;

async function TrendingWrapper({ products }: { products: Product[] }) {
  const reviewStats = await fetchAllReviewStats();
  return <TrendingSection products={products} reviewStats={reviewStats} />;
}

async function BestSellingWrapper({ products }: { products: Product[] }) {
  const reviewStats = await fetchAllReviewStats();
  return <BestSellingSection products={products} reviewStats={reviewStats} />;
}

export default async function Page() {
  const [settings, products] = await Promise.all([
    fetchAllSettings(),
    fetchProducts({ limit: 20 }),
  ]);
  const s = settings ? JSON.parse(JSON.stringify(settings)) : null;

  return (
    <div className="space-y-24 pb-24">
      <Suspense fallback={null}>
        <VerifiedToast />
      </Suspense>
      <HeroBanner featuredBrands={s?.featuredBrands} />

      <Suspense fallback={<TrendingSkeleton />}>
        <TrendingWrapper products={products} />
      </Suspense>

      <Suspense fallback={<BestSellingSkeleton />}>
        <BestSellingWrapper products={products} />
      </Suspense>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryPreview categoryImages={s?.categoryImages} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SaleBanner
          title={s?.saleBannerTitle}
          subtitle={s?.saleBannerSubtitle}
          offerText={s?.saleBannerOfferText}
        />
      </section>

      {s?.reviews?.length > 0 && (
        <ReviewSection reviews={s.reviews} />
      )}
    </div>
  );
}
