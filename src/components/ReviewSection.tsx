"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewCard from "./ReviewCard";
import type { ReviewConfig } from "@/lib/settings-store";

interface Props {
  reviews: ReviewConfig[];
}

const PER_SLIDE = 3;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const rotations = ["rotate-0", "rotate-1", "-rotate-1"];

export default function ReviewSection({ reviews }: Props) {
  const slides = useMemo(() => chunk(reviews, PER_SLIDE), [reviews]);
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
      className="relative overflow-hidden py-16 md:py-20"
    >
      {/* Full-bleed gradient background with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-primary/[0.05] to-secondary/[0.07]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative large quotation marks */}
      <div className="absolute top-6 left-4 md:left-12 text-accent/10 text-[200px] md:text-[300px] leading-none font-serif select-none pointer-events-none">
        &ldquo;
      </div>
      <div className="absolute bottom-6 right-4 md:right-12 text-accent/10 text-[200px] md:text-[300px] leading-none font-serif select-none pointer-events-none rotate-180">
        &ldquo;
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <span className="inline-block text-accent font-semibold text-sm tracking-widest uppercase mb-2">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark">
            What Our Customers Say
          </h2>
          <div className="mx-auto mt-3 w-24 h-0.5 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        </div>

        {/* Cards */}
        <div className="overflow-hidden">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
              >
                {slides[current].map((review, i) => (
                  <ReviewCard
                    key={review._id ?? i}
                    review={review}
                    className={rotations[i % rotations.length]}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-xl border border-card-border bg-card text-foreground hover:text-accent hover:border-accent/50 transition-all"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-xs text-foreground/60 font-mono tabular-nums select-none">
              {current + 1} / {total}
            </span>

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
        )}
      </div>
    </section>
  );
}
