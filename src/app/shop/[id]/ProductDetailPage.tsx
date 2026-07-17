"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Product, ProductVariant } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import StarDisplay from "@/components/StarDisplay";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductReviews from "@/components/ProductReviews";
import WishlistButton from "@/components/WishlistButton";
import { formatPrice } from "@/lib/format";
import { getProductReviews, getProductsByIds, getAllProducts } from "@/lib/product-store";
import { getSettings } from "@/lib/settings-store";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/Toast";
import StructuredData from "@/components/StructuredData";
import { site } from "@/data/site";

interface Props {
  product: Product;
}

export default function ProductDetailPage({ product }: Props) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );

  const images = product.images?.length ? product.images : [{ url: "", name: product.name }];
  const currentImage = images[selectedImage] || images[0];

  const displayPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.price;
  const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const discount = displayOriginalPrice
    ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
    : 0;

  const currentStock = selectedVariant
    ? (selectedVariant as { stock?: number }).stock
    : product.variants && product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + ((v as { stock?: number }).stock ?? 0), 0)
      : (product.stock ?? 0);

  const stockDisplay = currentStock !== undefined && currentStock > 0
    ? `In Stock (Qty: ${currentStock})`
    : "Out of Stock";

  const [liveRating, setLiveRating] = useState(product.rating);
  const [liveReviewCount, setLiveReviewCount] = useState(product.reviews);
  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(120);
  const [shippingReturnsText, setShippingReturnsText] = useState("");

  useEffect(() => {
    getSettings().then((s) => {
      setFreeShippingThreshold(s.freeShippingThreshold ?? 120);
      setShippingReturnsText(s.shippingReturns || "");
    });
  }, []);

  useEffect(() => {
    getProductReviews(product.id).then((stats) => {
      setLiveRating(stats.avgRating);
      setLiveReviewCount(stats.reviewCount);
    });
  }, [product.id]);

  useEffect(() => {
    if (product.isBundle && product.bundleItems?.length) {
      getProductsByIds(product.bundleItems).then(setBundleProducts);
    }
  }, [product.isBundle, product.bundleItems]);

  useEffect(() => {
    getAllProducts().then((all) => {
      const related = all
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 4);
      setRelatedProducts(related);
    });
  }, [product.id, product.category]);

  const bundleInStock = useMemo(() => {
    if (!product.isBundle || bundleProducts.length === 0) return true;
    return bundleProducts.every((bp) => {
      if (bp.variants && bp.variants.length > 0) {
        return bp.variants.some((v) => v.inStock);
      }
      return (bp.stock ?? 0) > 0;
    });
  }, [product.isBundle, bundleProducts]);

  const maxVisibleThumbs = 4;

  return (
    <>
      <StructuredData product={product} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
              { "@type": "ListItem", position: 2, name: "Shop", item: `${site.url}/shop` },
              { "@type": "ListItem", position: 3, name: product.category, item: `${site.url}/shop?category=${product.category}` },
              { "@type": "ListItem", position: 4, name: product.name },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
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
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-card group">
            <ImagePlaceholder
              category={product.category}
              name={currentImage.name || product.name}
              imageUrl={currentImage.url}
              key={selectedImage}
              preload={true}
              width={800} height={800} quality={85}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            {product.isSale && discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-white text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-accent text-white text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                New
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setThumbStart((s) => Math.max(0, s - 1))}
                disabled={thumbStart === 0}
                className="shrink-0 w-7 h-7 rounded-full border border-card-border bg-card flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none hover:border-accent/50 transition-all"
                aria-label="Previous thumbnails"
              >
                <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex gap-2 flex-1">
                {images.slice(thumbStart, thumbStart + maxVisibleThumbs).map((img, i) => {
                  const realIndex = thumbStart + i;
                  return (
                    <button
                      key={realIndex}
                      onClick={() => setSelectedImage(realIndex)}
                      className={`flex-1 aspect-square rounded-xl overflow-hidden transition-all cursor-pointer ${
                        realIndex === selectedImage
                          ? "border-2 border-accent opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <ImagePlaceholder
                        category={product.category}
                        name={img.name || product.name}
                        imageUrl={img.url}
                        width={100} height={100} quality={75}
                      />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setThumbStart((s) => Math.min(images.length - maxVisibleThumbs, s + 1))}
                disabled={thumbStart >= images.length - maxVisibleThumbs}
                className="shrink-0 w-7 h-7 rounded-full border border-card-border bg-card flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none hover:border-accent/50 transition-all"
                aria-label="Next thumbnails"
              >
                <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs text-foreground uppercase tracking-widest mb-2">
            {product.category}
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-dark leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <StarDisplay rating={liveRating} size="md" />
            <span className="text-sm text-foreground">({liveReviewCount ?? 0} reviews) · {product.sold ?? 0} sold</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold text-dark">{formatPrice(displayPrice)}</span>
            {displayOriginalPrice && displayPrice < displayOriginalPrice && (
              <span className="text-base text-foreground line-through">{formatPrice(displayOriginalPrice)}</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              currentStock !== undefined && currentStock > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentStock !== undefined && currentStock > 0 ? "bg-green-500" : "bg-red-500"}`} />
              {stockDisplay}
            </span>
          </div>

          <p className="mt-4 text-foreground leading-relaxed text-sm wrap-break-word max-h-32 overflow-y-auto">
            {product.description}
          </p>

          <div className="mt-8 space-y-3">
            {product.isBundle ? (
              <div className="flex items-center gap-2">
                <button
                  disabled={!bundleInStock}
                  onClick={() => {
                    if (!bundleInStock) return;
                    addItem(product);
                    showToast(`${product.name} added to cart`);
                  }}
                  className={`flex-1 py-3.5 rounded-xl font-medium transition-all ${
                    bundleInStock
                      ? "bg-accent text-white hover:bg-accent/80 hover:shadow-lg hover:shadow-accent/25"
                      : "bg-primary/10 text-foreground cursor-not-allowed"
                  }`}
                >
                  {bundleInStock ? `Add to Cart — ${formatPrice(product.bundlePrice || product.price)}` : "Out of Stock"}
                </button>
                <WishlistButton
                  productId={product.id}
                  className="w-12 h-12 shrink-0 flex items-center justify-center bg-accent rounded-xl text-white"
                />
              </div>
            ) : (
              <ProductVariantSelector
                product={product}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-foreground">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>PayPal accepted · Free shipping over ${freeShippingThreshold}</span>
            </div>
          </div>

          {product.isBundle && bundleProducts.length > 0 && (
            <div className="mt-8 p-5 rounded-xl border border-purple-200 bg-purple-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-dark">Includes:</h3>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  bundleInStock
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${bundleInStock ? "bg-green-500" : "bg-red-500"}`} />
                  {bundleInStock ? "All in stock" : "Some out of stock"}
                </span>
              </div>
              <div className="space-y-2">
                {bundleProducts.map((bp) => (
                  <Link key={bp.id} href={`/shop/${bp.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-primary/10">
                      <ImagePlaceholder category={bp.category} name={bp.name} imageUrl={bp.images?.[0]?.url || ""} width={40} height={40} unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark truncate">{bp.name}</p>
                      <p className="text-xs text-foreground">{formatPrice(bp.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              {product.bundlePrice && (
                <div className="mt-3 pt-3 border-t border-purple-200 flex items-center justify-between">
                  <span className="text-xs text-foreground">Total Value: {formatPrice(
                    bundleProducts.reduce((sum, bp) => sum + bp.price, 0)
                  )}</span>
                  <span className="text-sm font-bold text-accent">Bundle: {formatPrice(product.bundlePrice)}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 divide-y divide-primary/10 rounded-xl border border-card-border bg-card">
            {[
              { title: "Details", content: product.detail || "Premium formula crafted with the finest ingredients." },
              { title: "Ingredients", content: product.ingredients || "Contact us for ingredient details." },
            ].map((section) => (
              <details key={section.title} className="group">
                <summary className="flex items-center justify-between px-4 py-3.5 text-sm font-bold text-dark cursor-pointer hover:text-accent transition-colors list-none">
                  {section.title}
                  <svg className="w-4 h-4 text-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-3.5 text-sm text-dark leading-relaxed wrap-break-word whitespace-pre-wrap max-h-60 overflow-y-auto">{section.content}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} productName={product.name} />

      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-card-border pt-10">
          <h2 className="text-2xl font-bold text-dark mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {relatedProducts.map((rp) => (
              <div key={rp.id} className="animate-fade-in-up">
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
