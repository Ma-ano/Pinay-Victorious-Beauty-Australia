"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { FeaturedBrandConfig } from "@/lib/settings-store";

const fallbackSlides: FeaturedBrandConfig[] = [
  { brand: "", title: "Welcome", description: "Discover premium beauty products curated for you.", image: "" },
  { brand: "", title: "New Arrivals", description: "Fresh from the latest collections.", image: "" },
  { brand: "", title: "Best Sellers", description: "Our most popular products loved by customers.", image: "" },
];

const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function HeroBanner({ featuredBrands }: { featuredBrands?: FeaturedBrandConfig[] }) {
  const slides = (featuredBrands?.filter((b) => b.brand || b.title) || []).length > 0
    ? featuredBrands!.filter((b) => b.brand || b.title)
    : fallbackSlides;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, next]);

  return (
    <section
      className="relative min-h-[50vh] flex items-center overflow-hidden bg-linear-to-br from-primary/20 via-secondary/10 to-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {slides[current]?.image ? (
            <div className="w-full h-full">
              <Image
                src={slides[current].image}
                alt=""
                fill
                className="object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                unoptimized
                preload={current === 0}
                fetchPriority="high"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 -z-10" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="max-w-lg">
              <div className="glass-strong rounded-3xl p-6 md:p-8">
                {slides[current].brand && (
                  <p className="text-sm md:text-base text-accent font-semibold tracking-widest uppercase">
                    Featured Brand
                  </p>
                )}
                <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold text-dark leading-[1.15] tracking-tight">
                  {slides[current].title}
                </h1>
                <p className="mt-3 text-sm md:text-base text-foreground leading-relaxed">
                  {slides[current].description}
                </p>
                <div className="mt-4">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-full font-medium text-sm hover:bg-accent/80 transition-all hover:shadow-lg hover:shadow-accent/25"
                  >
                    Shop Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={prev}
        className="absolute left-0 top-0 bottom-0 z-20 w-14 flex items-center justify-center bg-linear-to-r from-background/40 to-transparent opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-dark drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-0 z-20 w-14 flex items-center justify-center bg-gradient-to-l from-background/40 to-transparent opacity-0 hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-dark drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-accent w-5" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
