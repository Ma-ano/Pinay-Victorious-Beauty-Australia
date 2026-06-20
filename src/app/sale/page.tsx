import type { Metadata } from "next";
import { site } from "@/data/site";
import { fetchAllProducts, fetchAllReviewStats } from "@/lib/admin-product-store";
import SalePage from "./SalePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sale",
  description: `Shop the latest deals and discounts at ${site.name}. Limited-time offers on beauty and wellness products.`,
  robots: { index: true, follow: true },
  openGraph: { title: "Sale", description: `Shop the latest deals and discounts at ${site.name}.` },
};

export default async function Page() {
  try {
    const [products, reviewStats] = await Promise.all([
      fetchAllProducts(),
      fetchAllReviewStats(),
    ]);
    const saleProducts = products.filter((p) => p.isSale).map((p) => ({
      ...p,
      rating: reviewStats[p.id]?.avgRating ?? p.rating,
      reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
    }));
    return <SalePage initialSaleProducts={saleProducts} initialReviewStats={reviewStats} />;
  } catch {
    return <SalePage />;
  }
}
