"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";
import { productTypes } from "@/data/productTypes";
import { formatPrice } from "@/lib/format";
import { brands } from "@/data/brands";

type Sort = "default" | "price-asc" | "price-desc" | "name";
type View = "grid" | "list";

interface ShopPageProps {
  initialProducts?: Product[];
  initialReviewStats?: Record<string, { avgRating: number; reviewCount: number }>;
}

export default function ShopPage({ initialProducts, initialReviewStats }: ShopPageProps) {
  const hasInitial = !!(initialProducts && initialReviewStats);
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialProducts && initialReviewStats) {
      return initialProducts.map((p) => ({
        ...p,
        rating: initialReviewStats[p.id]?.avgRating ?? p.rating,
        reviews: initialReviewStats[p.id]?.reviewCount ?? p.reviews,
      }));
    }
    return [];
  });
  const [loading, setLoading] = useState(!hasInitial);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sort, setSort] = useState<Sort>("default");
  const [view, setView] = useState<View>("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const fetchProducts = useCallback(async () => {
    const [all, reviewStats] = await Promise.all([getAllProducts(), getAllReviewStats()]);
    const enriched = all.map((p) => ({
      ...p,
      rating: reviewStats[p.id]?.avgRating ?? p.rating,
      reviews: reviewStats[p.id]?.reviewCount ?? p.reviews,
    }));
    setProducts(enriched);
    if (enriched.length > 0) {
      const max = Math.max(...enriched.map((p) => p.originalPrice || p.price));
      setPriceRange((prev) => [prev[0], Math.max(prev[1], max)]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasInitial) fetchProducts();
  }, [fetchProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasInitial) return;
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchProducts();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchProducts, hasInitial]);

  const maxPrice = Math.max(...products.map((p) => p.originalPrice || p.price), 200);

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.subcategory || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory || p.subcategory === selectedCategory;
      const matchesType =
        selectedType === "all" || p.type === selectedType;
      const matchesBrand =
        selectedBrand === "all" || p.brand === selectedBrand;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesType && matchesBrand && matchesPrice;
    });

    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [search, selectedCategory, selectedType, selectedBrand, sort, priceRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-dark">Shop All</h1>
          <p className="mt-1 text-foreground">{filtered.length} products</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 pl-9 pr-3 py-2 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="px-3 py-2 rounded-xl border border-card-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>

          <div className="flex border border-card-border rounded-xl overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-accent text-white" : "bg-card text-foreground hover:text-foreground"}`}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 border-l border-card-border ${view === "list" ? "bg-accent text-white" : "bg-card text-foreground hover:text-foreground"}`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-accent text-white"
              : "bg-card text-foreground border border-card-border hover:border-accent/50"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              selectedCategory === cat.slug
                ? "bg-accent text-white"
                : "bg-card text-foreground border border-card-border hover:border-accent/50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedType === "all"
              ? "bg-accent text-white"
              : "bg-card text-foreground border border-card-border hover:border-accent/50"
          }`}
        >
          All Types
        </button>
        {productTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              selectedType === type
                ? "bg-accent text-white"
                : "bg-card text-foreground border border-card-border hover:border-accent/50"
            }`}
          >
            {type.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedBrand("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedBrand === "all"
              ? "bg-accent text-white"
              : "bg-card text-foreground border border-card-border hover:border-accent/50"
          }`}
        >
          All Brands
        </button>
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedBrand === brand
                ? "bg-accent text-white"
                : "bg-card text-foreground border border-card-border hover:border-accent/50"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs text-foreground whitespace-nowrap">Price: {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}</span>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="flex-1 max-w-xs accent-accent h-1.5"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="animate-fade-in-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((product) => (
            <div key={product.id} className="animate-fade-in-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-foreground mt-20 text-sm">No products match your filters</p>
      )}
    </div>
  );
}
