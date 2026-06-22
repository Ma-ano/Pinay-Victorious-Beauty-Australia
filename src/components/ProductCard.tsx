"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import ImagePlaceholder from "./ImagePlaceholder";
import StarDisplay from "./StarDisplay";
import { useToast } from "./Toast";
import type { Product } from "@/data/products";

import { useCart } from "./CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { showToast } = useToast();
  const { addItem } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const quickAddVariant = product.variants?.[0];
  const quickAddStock = quickAddVariant
    ? (quickAddVariant as { stock?: number }).stock
    : product.stock;
  const quickAddOutOfStock = quickAddStock !== undefined && quickAddStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quickAddOutOfStock) return;
    addItem(product, quickAddVariant);
    const label = quickAddVariant ? quickAddVariant.name : product.name;
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
                disabled={quickAddOutOfStock}
                className={`w-full py-2.5 text-sm font-medium rounded-xl transition-all ${
                  quickAddOutOfStock
                    ? "bg-gray-400/80 text-white cursor-not-allowed"
                    : "bg-white/90 backdrop-blur-sm text-black hover:bg-white"
                }`}
              >
                {quickAddOutOfStock ? "Out of Stock" : "Quick Add"}
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
            <StarDisplay rating={product.rating} />
            <span className="text-[11px] text-foreground ml-1">({product.reviews})</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
