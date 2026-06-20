"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product, ProductVariant } from "@/data/products";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import ProductReviews from "@/components/ProductReviews";
import WishlistButton from "@/components/WishlistButton";
import { getProductReviews } from "@/lib/product-store";

interface Props {
  product: Product;
}

export default function ProductDetailPage({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );

  const images = product.images?.length ? product.images : [{ url: "", name: product.name }];
  const currentImage = images[selectedImage] || images[0];

  const displayPrice = selectedVariant?.price ?? product.price;
  const discount = product.originalPrice
    ? Math.round((1 - displayPrice / product.originalPrice) * 100)
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

  useEffect(() => {
    getProductReviews(product.id).then((stats) => {
      setLiveRating(stats.avgRating);
      setLiveReviewCount(stats.reviewCount);
    });
  }, [product.id]);

  const maxVisibleThumbs = 4;

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
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-card group">
            <ImagePlaceholder
              category={product.category}
              name={currentImage.name || product.name}
              imageUrl={currentImage.url}
              key={selectedImage}
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
              <span className="absolute top-4 left-4 bg-primary text-dark text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                New
              </span>
            )}
            <div className="absolute top-4 right-4 z-10">
              <WishlistButton productId={product.id} />
            </div>
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
              <div className="flex gap-2 flex-1 overflow-hidden">
                {images.slice(thumbStart, thumbStart + maxVisibleThumbs).map((img, i) => {
                  const realIndex = thumbStart + i;
                  return (
                    <button
                      key={realIndex}
                      onClick={() => setSelectedImage(realIndex)}
                      className={`flex-1 aspect-square rounded-xl overflow-hidden transition-all cursor-pointer ${
                        realIndex === selectedImage
                          ? "ring-2 ring-accent ring-offset-2 opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <ImagePlaceholder
                        category={product.category}
                        name={img.name || product.name}
                        imageUrl={img.url}
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
          <p className="text-xs text-foreground uppercase tracking-widest mb-2 capitalize">
            {product.category}
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-dark leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.floor(liveRating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-foreground">({liveReviewCount} reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-bold text-dark">${displayPrice.toFixed(2)}</span>
            {product.originalPrice && displayPrice < product.originalPrice && (
              <span className="text-base text-foreground line-through">${product.originalPrice.toFixed(2)}</span>
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

          <p className="mt-4 text-foreground leading-relaxed text-sm break-words">
            {product.description}
          </p>

          <div className="mt-8 space-y-3">
            <ProductVariantSelector
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
            <div className="flex items-center justify-center gap-2 text-xs text-foreground">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>PayPal accepted · Free shipping over $50</span>
            </div>
          </div>

          <div className="mt-8 divide-y divide-primary/10 rounded-xl border border-card-border bg-card">
            {[
              { title: "Details", content: product.detail || "Premium formula crafted with the finest ingredients." },
              { title: "Shipping & Returns", content: product.shippingReturns || "Free shipping on orders over $50. 30-day return policy." },
              { title: "Ingredients", content: product.ingredients || "Contact us for ingredient details." },
            ].map((section) => (
              <details key={section.title} className="group">
                <summary className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-dark cursor-pointer hover:text-accent transition-colors list-none">
                  {section.title}
                  <svg className="w-4 h-4 text-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-4 pb-3.5 text-sm text-dark leading-relaxed break-words whitespace-pre-wrap">{section.content}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}
