"use client";

import { useMemo } from "react";
import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import { formatPrice } from "@/lib/format";
import type { Product, ProductVariant } from "@/data/products";

export default function AddToCartButton({ product, selectedVariant, className = "" }: { product: Product; selectedVariant?: ProductVariant; className?: string }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const label = selectedVariant ? selectedVariant.name : product.name;

  const displayPrice = selectedVariant?.price ?? product.price;

  const outOfStock = useMemo(() => {
    const stock = selectedVariant
      ? (selectedVariant as { stock?: number }).stock
      : product.stock;
    return stock !== undefined && stock <= 0;
  }, [product, selectedVariant]);

  return (
    <button
      disabled={outOfStock}
      onClick={() => {
        if (outOfStock) return;
        addItem(product, selectedVariant);
        showToast(`${label} added to cart`);
      }}
      className={`${className || "w-full"} py-3.5 rounded-xl font-medium transition-all ${
        outOfStock
          ? "bg-primary/10 text-foreground cursor-not-allowed"
          : "bg-secondary text-dark dark:text-gray-900 hover:bg-secondary/80 hover:shadow-lg hover:shadow-secondary/25"
      }`}
    >
      {outOfStock ? "Out of Stock" : `Add to Cart — ${formatPrice(displayPrice)}`}
    </button>
  );
}
