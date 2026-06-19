"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import ImagePlaceholder from "./ImagePlaceholder";
import { useToast } from "./Toast";
import type { Product } from "@/data/products";

import { useCart } from "./CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { showToast } = useToast();
  const { addItem } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.[0];
    addItem(product, variant);
    const label = variant ? variant.name : product.name;
    showToast(`${label} added to cart`);
  };

  return (
    <div className="group relative">
      <Link
        href={`/shop/${product.slug}`}
        className="block bg-card overflow-hidden border border-gray-200 dark:border-gray-600 transition-all duration-500 hover:border-[#E8CFCF] dark:hover:border-[#E8CFCF] hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="relative aspect-square overflow-hidden">
          <div className="w-full h-full transition-transform duration-700 group-hover:scale-110">
            <ImagePlaceholder category={product.category} name={product.name} imageUrl={product.images?.[0]?.url || ""} />
          </div>

          {product.isSale && discount > 0 && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-primary text-dark text-xs font-semibold px-2.5 py-1 rounded-full">
              New
            </span>
          )}

          <WishlistButton productId={product.id} />

          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-white/90 backdrop-blur-sm text-black text-sm font-medium rounded-xl hover:bg-white transition-all"
            >
              Quick Add
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] text-foreground uppercase tracking-widest mb-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-dark group-hover:text-accent transition-colors line-clamp-1 text-sm">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-dark">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[11px] text-foreground ml-1">({product.reviews})</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
