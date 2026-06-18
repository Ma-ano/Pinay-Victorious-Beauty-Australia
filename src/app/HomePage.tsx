import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import PromotionCards from "@/components/PromotionCards";
import CategoryPreview from "@/components/CategoryPreview";
import SaleBanner from "@/components/SaleBanner";
import RecruitmentArea from "@/components/RecruitmentArea";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import { products, getSaleProducts, getTrendingProducts, getBestSellingProducts } from "@/data/products";

const saleProducts = getSaleProducts().slice(0, 4);
const trending = getTrendingProducts();
const bestSelling = getBestSellingProducts();

export default function HomePage() {
  return (
    <div className="space-y-24 pb-24">
      <HeroBanner />

      <div className="animate-fade-in-up">
        <ProductCarousel
          products={trending}
          title="Trending Now"
          description="Our most popular picks this week"
        />
      </div>

      <div className="animate-fade-in-up">
        <ProductCarousel
          products={bestSelling}
          title="Best Selling"
          description="Our most popular products"
        />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <PromotionCards />
      </section>

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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <CategoryPreview />
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
