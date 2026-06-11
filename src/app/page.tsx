import Link from "next/link";
import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import PromotionCards from "@/components/PromotionCards";
import CategoryPreview from "@/components/CategoryPreview";
import SaleBanner from "@/components/SaleBanner";
import RecruitmentArea from "@/components/RecruitmentArea";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import { featuredProducts, getSaleProducts } from "@/data/products";

const saleProducts = getSaleProducts().slice(0, 4);
const featured = featuredProducts.slice(0, 4);

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <ProductCarousel />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Featured Products</h2>
          <p className="mt-2 text-foreground">Handpicked just for you</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

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
