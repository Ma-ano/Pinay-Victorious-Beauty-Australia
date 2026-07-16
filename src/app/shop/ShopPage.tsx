"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { ShopPageSkeleton } from "@/components/Skeletons";
import { getAllProducts, getAllReviewStats } from "@/lib/product-store";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";
import { productTypes } from "@/data/productTypes";
import { formatPrice } from "@/lib/format";


const ITEMS_PER_PAGE = 24;

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const selectedCategory = searchParams.get("category") || "all";
  const selectedSubcategory = searchParams.get("subcategory") || "all";
  const selectedType = searchParams.get("type") || "all";

  const [sort, setSort] = useState<Sort>("default");
  const [view, setView] = useState<View>("grid");
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedSubcategory, selectedType, sort, priceRange]);

  function handleCategoryChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    params.delete("subcategory");
    params.delete("type");
    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSubcategoryChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("subcategory");
    else params.set("subcategory", slug);
    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleTypeChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("type");
    else params.set("type", slug);
    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  }

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

  const subcategoryOptions = useMemo(() => {
    if (selectedCategory === "all" || ["best-sellers", "new-arrivals", "gift-sets"].includes(selectedCategory)) {
      const seen = new Set<string>();
      return categories.flatMap((c) =>
        c.subcategories.filter((s) => {
          if (seen.has(s.slug)) return false;
          seen.add(s.slug);
          return true;
        })
      );
    }
    const cat = categories.find((c) => c.slug === selectedCategory);
    return cat?.subcategories ?? [];
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    const metaCategories = new Set(["best-sellers", "new-arrivals", "gift-sets"]);
    const isMeta = metaCategories.has(selectedCategory);

    const result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.subcategory || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        isMeta ||
        selectedCategory === "all" ||
        p.category === selectedCategory;
      const matchesSubcategory =
        selectedSubcategory === "all" || p.subcategory === selectedSubcategory;
      const matchesType =
        selectedType === "all" || p.type === selectedType;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      if (!(matchesSearch && matchesCategory && matchesSubcategory && matchesType && matchesPrice)) return false;
      if (selectedCategory === "new-arrivals" && !p.isNew) return false;
      return true;
    });

    if (selectedCategory === "best-sellers" && sort === "default") {
      result.sort((a, b) => {
        const soldA = a.sold ?? 0;
        const soldB = b.sold ?? 0;
        if (soldB !== soldA) return soldB - soldA;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });
    } else if (selectedCategory === "gift-sets") {
      result.sort((a, b) => {
        if (a.isBundle && !b.isBundle) return -1;
        if (!a.isBundle && b.isBundle) return 1;
        return 0;
      });
    }

    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [search, selectedCategory, selectedSubcategory, selectedType, sort, priceRange]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
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
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                const params = new URLSearchParams(searchParams.toString());
                if (val.trim()) params.set("search", val);
                else params.delete("search");
                router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
              }}
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

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-44 shrink-0 px-3 py-2 rounded-xl border border-card-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="all">All Categories</option>
          {categories.filter((c) => !["sale"].includes(c.slug)).map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        {subcategoryOptions.length > 0 && (
          <select
            value={selectedSubcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className="w-44 shrink-0 px-3 py-2 rounded-xl border border-card-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="all">All Subcategories</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub.slug} value={sub.slug}>{sub.name}</option>
            ))}
          </select>
        )}

        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-36 shrink-0 px-3 py-2 rounded-xl border border-card-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="all">All Types</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>{type.replace("-", " ")}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="text-xs text-foreground font-medium whitespace-nowrap">Price Range</span>
          <input
            type="text"
            inputMode="numeric"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
            placeholder="From"
            className="w-28 px-3 py-2 rounded-xl border border-card-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <span className="text-foreground/50 text-sm">—</span>
          <input
            type="text"
            inputMode="numeric"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
            placeholder="To"
            className="w-28 px-3 py-2 rounded-xl border border-card-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      {loading ? (
        <ShopPageSkeleton />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {paginated.map((product, i) => (
            <div key={product.id}>
              <ProductCard product={product} preload={i === 0} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((product, i) => (
            <div key={product.id}>
              <ProductCard product={product} preload={i === 0} />
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-primary/20 bg-card text-foreground hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-foreground/40 text-sm">...</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-accent text-white"
                      : "border border-primary/20 bg-card text-foreground hover:bg-accent hover:text-white"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-primary/20 bg-card text-foreground hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground"
          >
            Next
          </button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-foreground mt-20 text-sm">No products match your filters</p>
      )}
    </div>
  );
}
