"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

interface Props {
  products: Product[];
  title: string;
  description: string;
}

const PER_SLIDE = 4;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function ProductCarousel({ products, title, description }: Props) {
  const slides = useMemo(() => chunk(products, PER_SLIDE), [products]);
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  if (total === 0) return null;

  const hoverRef = useRef(false);

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(() => {
      if (!hoverRef.current) setCurrent((c) => (c + 1) % total);
    }, 10000);
    return () => clearInterval(interval);
  }, [total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <section
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark">{title}</h2>
            <p className="mt-2 text-foreground">{description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={prev}
              className="p-2 rounded-xl border border-card-border bg-card text-foreground hover:text-accent hover:border-accent/50 transition-all"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="p-2 rounded-xl border border-card-border bg-card text-foreground hover:text-accent hover:border-accent/50 transition-all"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
            >
              {slides[current].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "bg-accent w-5" : "bg-primary/30 hover:bg-primary/50 w-2"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
