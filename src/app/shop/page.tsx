import { Suspense } from "react";
import type { Metadata } from "next";
import { site } from "@/data/site";
import { fetchAllProducts, fetchAllReviewStats } from "@/lib/admin-product-store";
import ShopPage from "./ShopPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description: `Browse our full collection of ${site.name} — skincare, makeup, and wellness essentials from across Asia.`,
  openGraph: { title: "Shop", description: `Browse our full collection of ${site.name}.` },
};

function ShopFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default async function Page() {
  try {
    const [products, reviewStats] = await Promise.all([
      fetchAllProducts(),
      fetchAllReviewStats(),
    ]);
    return (
      <Suspense fallback={<ShopFallback />}>
        <ShopPage initialProducts={products} initialReviewStats={reviewStats} />
      </Suspense>
    );
  } catch {
    return (
      <Suspense fallback={<ShopFallback />}>
        <ShopPage />
      </Suspense>
    );
  }
}
