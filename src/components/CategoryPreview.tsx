"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";

const mainCategories = categories.filter((c) => !["best-sellers", "new-arrivals", "gift-sets", "sale"].includes(c.slug));
const topRow = mainCategories.slice(0, 7);
const bottomRow = mainCategories.slice(7);

export default function CategoryPreview({ categoryImages }: { categoryImages?: Record<string, string> }) {
  const [errored, setErrored] = useState<Set<string>>(new Set());

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">Shop by Category</h2>
        <p className="mt-2 text-foreground">Find exactly what you need</p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center gap-3 md:gap-4">
          {topRow.map((cat) => (
            <div key={cat.id} className="flex-[0_0_calc((100%-96px)/7)] max-w-[calc((100%-96px)/7)]">
              <CategoryCard cat={cat} categoryImages={categoryImages} errored={errored} setErrored={setErrored} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3 md:gap-4">
          {bottomRow.map((cat) => (
            <div key={cat.id} className="flex-[0_0_calc((100%-96px)/7)] max-w-[calc((100%-96px)/7)]">
              <CategoryCard cat={cat} categoryImages={categoryImages} errored={errored} setErrored={setErrored} />
            </div>
          ))}
        </div>
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
      className="group flex flex-col items-center justify-center aspect-square p-2 bg-card border border-card-border rounded-xl transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
    >
      <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-primary/10 mb-1.5 group-hover:scale-110 transition-transform duration-500 overflow-hidden flex items-center justify-center">
        {imgUrl && !hasError ? (
          <Image
            src={imgUrl}
            alt={cat.name}
            width={44}
            height={44}
            className="w-full h-full object-cover"
            onError={() => setErrored((prev) => new Set(prev).add(cat.slug))}
            unoptimized
          />
        ) : null}
      </div>
      <h3 className="font-semibold text-dark text-[10px] md:text-xs group-hover:text-accent transition-colors text-center leading-tight">
        {cat.name}
      </h3>
    </Link>
  );
}
