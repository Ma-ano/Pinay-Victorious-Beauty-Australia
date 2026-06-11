"use client";

import { useCart } from "./CartContext";
import { useToast } from "./Toast";
import type { Product, ProductVariant } from "@/data/products";

export default function AddToCartButton({ product, selectedVariant }: { product: Product; selectedVariant?: ProductVariant }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const label = selectedVariant ? selectedVariant.name : product.name;

  return (
    <button
      onClick={() => {
        addItem(product, selectedVariant);
        showToast(`${label} added to cart`);
      }}
      className="w-full py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/80 transition-all hover:shadow-lg hover:shadow-accent/25"
    >
      Add to Cart — ${product.price.toFixed(2)}
    </button>
  );
}
