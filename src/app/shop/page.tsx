import type { Metadata } from "next";
import { site } from "@/data/site";
import { fetchAllProducts, fetchAllReviewStats } from "@/lib/admin-product-store";
import ShopPage from "./ShopPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: `Browse our full collection of ${site.name} — skincare, makeup, and wellness essentials from across Asia.`,
  openGraph: { title: "Shop", description: `Browse our full collection of ${site.name}.` },
};

export default async function Page() {
  try {
    const [products, reviewStats] = await Promise.all([
      fetchAllProducts(),
      fetchAllReviewStats(),
    ]);
    return <ShopPage initialProducts={products} initialReviewStats={reviewStats} />;
  } catch {
    return <ShopPage />;
  }
}
