"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function CategoryPreview({ categoryImages }: { categoryImages?: Record<string, string> }) {
  const [errored, setErrored] = useState<Set<string>>(new Set());

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">Shop by Category</h2>
        <p className="mt-2 text-foreground">Find exactly what you need</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {categories.slice(0, 10).map((cat) => {
          const imgUrl = categoryImages?.[cat.slug];
          const hasError = errored.has(cat.slug);
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center p-5 md:p-6 bg-card rounded-2xl border border-card-border transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 group-hover:scale-110 transition-transform duration-500 overflow-hidden flex items-center justify-center">
                {imgUrl && !hasError ? (
                  <img
                    src={imgUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={() => setErrored((prev) => new Set(prev).add(cat.slug))}
                  />
                ) : null}
              </div>
              <h3 className="font-semibold text-dark text-sm md:text-base group-hover:text-accent transition-colors text-center">
                {cat.name}
              </h3>
              <p className="text-[11px] text-foreground mt-1 text-center line-clamp-1 leading-relaxed">
                {cat.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
