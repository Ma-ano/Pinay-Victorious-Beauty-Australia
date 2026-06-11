import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductReviews from "@/components/ProductReviews";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductBySlug(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProductBySlug(id);
  if (!product) notFound();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 text-sm text-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-accent transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-accent transition-colors capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <ImagePlaceholder category={product.category} name={product.name} imageUrl={product.imageUrl} />
            {product.isSale && (
              <span className="absolute top-4 left-4 bg-accent text-white text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-primary text-dark text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                New
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 aspect-square rounded-xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <ImagePlaceholder category={product.category} name={product.name} imageUrl={product.imageUrl} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs text-foreground uppercase tracking-widest mb-2 capitalize">
            {product.category}
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-dark leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold text-dark">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-base text-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="mt-6 text-foreground leading-relaxed text-sm">
            {product.description}
          </p>

          <div className="mt-8 space-y-3">
            <ProductVariantSelector product={product} />
            <div className="flex items-center justify-center gap-2 text-xs text-foreground">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>PayPal accepted · Free shipping over $50</span>
            </div>
          </div>

          <div className="mt-8 divide-y divide-primary/10 rounded-xl border border-card-border bg-card">
            {[
              { title: "Details", content: "Premium formula crafted with the finest ingredients. Suitable for all skin types. Dermatologist tested." },
              { title: "Shipping & Returns", content: "Free shipping on orders over $50. 30-day return policy. Items must be unused in original packaging." },
              { title: "Ingredients", content: "Water, Glycerin, Hyaluronic Acid, Vitamin E, Natural Extracts. Free from parabens and sulfates." },
            ].map((section) => (
              <details key={section.title} className="group">
                <summary className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-dark cursor-pointer hover:text-accent transition-colors list-none">
                  {section.title}
                  <svg className="w-4 h-4 text-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-3.5 text-sm text-dark leading-relaxed">{section.content}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}
