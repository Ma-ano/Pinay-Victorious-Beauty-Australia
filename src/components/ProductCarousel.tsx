"use client";

import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

const GAP = 20;
const OFFSET = 4;

export default function ProductCarousel({ products, title, description }: { products: Product[]; title: string; description: string }) {
  const loopProducts = [
    ...products.slice(-OFFSET),
    ...products,
    ...products.slice(0, OFFSET),
  ];
  const maxIndex = OFFSET + products.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(300);
  const step = cardWidth + GAP;
  const [currentIndex, setCurrentIndex] = useState(OFFSET);
  const [isPaused, setIsPaused] = useState(false);
  const [jumpDuration, setJumpDuration] = useState(0.5);
  const [visibleCards, setVisibleCards] = useState(4);
  const [isHovering, setIsHovering] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const jumpRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.clientWidth;
      let vc = 4;
      if (w < 640) vc = 2;
      else if (w < 1024) vc = 3;
      const newWidth = Math.max(180, Math.floor((w - (vc - 1) * GAP) / vc));
      setCardWidth(newWidth);
      setVisibleCards(vc);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextVal = prev + 1;
      if (nextVal >= maxIndex) {
        jumpRef.current = true;
        return OFFSET;
      }
      return nextVal;
    });
    if (jumpRef.current) {
      jumpRef.current = false;
      setJumpDuration(0);
    }
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextVal = prev - 1;
      if (nextVal < 0) {
        jumpRef.current = true;
        return maxIndex - 1;
      }
      return nextVal;
    });
    if (jumpRef.current) {
      jumpRef.current = false;
      setJumpDuration(0);
    }
  }, [maxIndex]);

  const scrollToCard = useCallback((dotIndex: number) => {
    setCurrentIndex(OFFSET + dotIndex);
  }, []);

  const dotIndex =
    ((currentIndex - OFFSET) % products.length + products.length) % products.length;

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

  useLayoutEffect(() => {
    if (jumpDuration === 0) {
      setJumpDuration(0.6);
    }
  }, [currentIndex, jumpDuration]);

  return (
    <section className="overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">{title}</h2>
        <p className="mt-2 text-foreground">{description}</p>
      </div>
      <div
        className="relative"
        onMouseEnter={() => { setIsPaused(true); setIsHovering(true); }}
        onMouseLeave={() => { setIsPaused(false); setIsHovering(false); }}
        onWheel={pauseTemporarily}
        onTouchStart={pauseTemporarily}
      >
        <button
          onClick={() => { pauseTemporarily(); prev(); }}
          className={`absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center bg-gradient-to-r from-background/60 to-transparent transition-opacity ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Previous"
        >
          <svg className="w-5 h-5 text-dark drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => { pauseTemporarily(); next(); }}
          className={`absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center bg-gradient-to-l from-background/60 to-transparent transition-opacity ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Next"
        >
          <svg className="w-5 h-5 text-dark drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div ref={containerRef} className="overflow-hidden">
          <motion.div
            className="flex gap-5"
            animate={{ x: -currentIndex * step }}
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
          {products.slice(0, 10).map((_, i) => (
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
