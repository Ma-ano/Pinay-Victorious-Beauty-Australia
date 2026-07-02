import { fetchAllProducts, fetchAllReviewStats, fetchAllSettings } from "@/lib/admin-product-store";
import HomePage from "./HomePage";

export const revalidate = 60;

export default async function Page() {
  try {
    const [products, reviewStats, settings] = await Promise.all([
      fetchAllProducts(),
      fetchAllReviewStats(),
      fetchAllSettings(),
    ]);
    const serializedSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;
    return <HomePage initialProducts={products} initialReviewStats={reviewStats} initialSettings={serializedSettings} />;
  } catch {
    return <HomePage />;
  }
}
