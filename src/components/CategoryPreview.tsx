"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";

const mainCategories = categories.filter((c) => !["best-sellers", "new-arrivals", "gift-sets", "sale"].includes(c.slug));

export default function CategoryPreview({ categoryImages }: { categoryImages?: Record<string, string> }) {
  const [errored, setErrored] = useState<Set<string>>(new Set());

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">Shop by Category</h2>
        <p className="mt-2 text-foreground">Find exactly what you need</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 md:gap-4">
        {mainCategories.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} categoryImages={categoryImages} errored={errored} setErrored={setErrored} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ cat, categoryImages, errored, setErrored }: {
  cat: typeof mainCategories[number];
  categoryImages?: Record<string, string>;
  errored: Set<string>;
  setErrored: (fn: (prev: Set<string>) => Set<string>) => void;
}) {
  const imgUrl = categoryImages?.[cat.slug];
  const hasError = errored.has(cat.slug);
  return (
    <Link
      href={`/shop?category=${cat.slug}`}
      className="group flex flex-col items-center pt-4 sm:pt-5 md:pt-6 pb-2 sm:pb-3 md:pb-4 px-2 sm:px-3 md:px-4 bg-card border border-card-border rounded-xl transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 aspect-[5/6] overflow-hidden"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500 shrink-0">
          {imgUrl && !hasError ? (
          <Image
            src={imgUrl}
            alt={cat.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={() => setErrored((prev) => new Set(prev).add(cat.slug))}
            quality={75}
          />
        ) : null}
      </div>
      <div className="flex-1 min-h-2" />
      <h3 className="font-semibold text-dark text-[10px] sm:text-xs md:text-sm group-hover:text-accent transition-colors text-center leading-snug line-clamp-2">
        {cat.name}
      </h3>
    </Link>
  );
}
