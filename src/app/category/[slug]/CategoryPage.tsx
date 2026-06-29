"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";

interface Props {
  category: Category;
  products: Product[];
}

export default function CategoryPage({ category, products }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 text-sm text-foreground mb-8 flex-wrap">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-accent transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-foreground capitalize">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-dark capitalize">{category.name}</h1>
        <p className="mt-2 text-foreground">{category.description}</p>
        <p className="mt-1 text-sm text-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</p>
      </div>

      {category.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/shop?category=${category.slug}&subcategory=${sub.slug}`}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-card text-foreground border border-card-border hover:border-accent/50 transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground">No products found in this category.</p>
          <Link href="/shop" className="mt-4 inline-block text-accent hover:underline text-sm">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="animate-fade-in-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
