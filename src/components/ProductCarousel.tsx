"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const GAP = 20;
const OFFSET = 4;
const DEFAULT_CARD_WIDTH = 300;

const loopProducts = [
  ...products.slice(-OFFSET),
  ...products,
  ...products.slice(0, OFFSET),
];

const maxIndex = OFFSET + products.length;

export default function ProductCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(DEFAULT_CARD_WIDTH);
  const step = cardWidth + GAP;

  const [showIndex, setShowIndex] = useState(OFFSET);
  const [isPaused, setIsPaused] = useState(false);
  const [jumpDuration, setJumpDuration] = useState(0.5);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const w = el.clientWidth - 32;
      const newWidth = Math.max(200, Math.floor((w - 3 * GAP) / 4));
      if (newWidth !== cardWidth) setCardWidth(newWidth);
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cardWidth]);

  const next = useCallback(() => {
    setShowIndex((prev) => {
      const nextVal = prev - 1;
      if (nextVal < OFFSET) {
        setJumpDuration(0);
        return nextVal + products.length;
      }
      return nextVal;
    });
  }, []);

  const prev = useCallback(() => {
    setShowIndex((prev) => {
      const nextVal = prev + 1;
      if (nextVal >= maxIndex) {
        setJumpDuration(0);
        return nextVal - products.length;
      }
      return nextVal;
    });
  }, []);

  const scrollToCard = useCallback((dotIndex: number) => {
    setShowIndex(OFFSET + dotIndex);
  }, []);

  const dotIndex =
    ((showIndex - OFFSET) % products.length + products.length) % products.length;

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 4000);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  useEffect(() => {
    if (jumpDuration === 0) {
      requestAnimationFrame(() => setJumpDuration(0.5));
    }
  }, [showIndex, jumpDuration]);

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">Trending Now</h2>
        <p className="mt-2 text-foreground">Our most popular picks this week</p>
      </div>
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onWheel={pauseTemporarily}
        onTouchStart={pauseTemporarily}
      >
        <button
          onClick={() => { pauseTemporarily(); prev(); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-dark hover:bg-white transition-all"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => { pauseTemporarily(); next(); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-dark hover:bg-white transition-all"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div ref={containerRef} className="overflow-hidden -mx-4 px-4">
          <motion.div
            className="flex gap-5"
            animate={{ x: -showIndex * step }}
            transition={{
              type: "tween",
              ease: "easeOut",
              duration: jumpDuration,
            }}
            drag="x"
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -50) {
                next();
              } else if (info.offset.x > 50) {
                prev();
              }
              pauseTemporarily();
            }}
          >
            {loopProducts.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                className="shrink-0"
                style={{ width: cardWidth, minWidth: cardWidth }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => { pauseTemporarily(); scrollToCard(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === dotIndex ? "bg-accent w-5" : "bg-primary/30 hover:bg-primary/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
