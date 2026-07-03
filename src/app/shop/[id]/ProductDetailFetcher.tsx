"use client";

import { useEffect, useState } from "react";
import ProductDetailPage from "./ProductDetailPage";
import { getAllProducts } from "@/lib/product-store";
import type { Product } from "@/data/products";

interface Props {
  slug: string;
  initialProduct?: Product;
}

export default function ProductDetailFetcher({ slug, initialProduct }: Props) {
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialProduct) return;
    getAllProducts().then((all) => {
      const found = all.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [slug, initialProduct]);

  if (notFound) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-foreground">?</span>
          </div>
          <h1 className="text-xl font-semibold text-dark mb-2">Page Not Found</h1>
          <p className="text-sm text-foreground mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a href="/" className="inline-block w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ProductDetailPage product={product} />;
}
