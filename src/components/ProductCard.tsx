"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import ImagePlaceholder from "./ImagePlaceholder";
import StarDisplay from "./StarDisplay";
import { useToast } from "./Toast";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/data/products";

import { useCart } from "./CartContext";

export default function ProductCard({ product, preload }: { product: Product; preload?: boolean }) {
  const { showToast } = useToast();
  const { addItem } = useCart();
  const displayVariant = product.variants?.[0];
  const displayPrice = displayVariant?.salePrice ?? displayVariant?.price ?? product.salePrice ?? product.price;
  const displayOriginalPrice = displayVariant?.originalPrice ?? product.originalPrice;
  const discount = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
    : 0;

  const quickAddVariant = displayVariant;
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
            <ImagePlaceholder category={product.category} name={product.name} imageUrl={product.images?.[0]?.url || ""} preload={preload} width={400} height={400} quality={75} />
          </div>

          {product.isSale && discount > 0 && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isNew && !(product.isSale && discount > 0) && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              New
            </span>
          )}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickAdd}
                  disabled={quickAddOutOfStock}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    quickAddOutOfStock
                      ? "bg-gray-400/80 text-white cursor-not-allowed"
                      : "bg-accent text-white hover:bg-accent/85"
                  }`}
                >
                  {quickAddOutOfStock ? "Out of Stock" : "Quick Add"}
                </button>
                <WishlistButton
                  productId={product.id}
                  className="w-9 h-9 shrink-0 flex items-center justify-center bg-accent rounded-xl text-white"
                />
              </div>
            </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] text-foreground uppercase tracking-widest mb-1">
            {product.category}
            {product.isBundle && <span className="ml-1.5 text-purple-500 font-semibold">• Bundle Set</span>}
          </p>
          <h3 className="font-semibold text-dark group-hover:text-accent transition-colors line-clamp-1 text-sm">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-dark">{formatPrice(displayPrice)}</span>
            {displayOriginalPrice && displayPrice < displayOriginalPrice && (
              <span className="text-xs text-foreground line-through">
                {formatPrice(displayOriginalPrice)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1">
            <StarDisplay rating={product.rating} />
            <span className="text-[11px] text-foreground ml-1">({product.reviews ?? 0})</span>
            <span className="text-[11px] text-foreground ml-1">· {product.sold ?? 0} sold</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
