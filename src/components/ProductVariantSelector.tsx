"use client";

import AddToCartButton from "./AddToCartButton";
import type { Product, ProductVariant } from "@/data/products";

interface Props {
  product: Product;
  selectedVariant?: ProductVariant;
  onVariantChange: (variant?: ProductVariant) => void;
}

export default function ProductVariantSelector({ product, selectedVariant, onVariantChange }: Props) {
  if (!product.variants || product.variants.length === 0) {
    return <AddToCartButton product={product} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-dark mb-2">
          {selectedVariant ? `${selectedVariant.name}` : "Select option"}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onVariantChange(v)}
              disabled={!v.inStock}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedVariant?.id === v.id
                  ? "bg-accent text-white shadow-md"
                  : "bg-card text-foreground border border-card-border hover:border-accent/50"
              } ${!v.inStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {v.name}
              {!v.inStock && " — Out of stock"}
            </button>
          ))}
        </div>
      </div>
      <AddToCartButton product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
