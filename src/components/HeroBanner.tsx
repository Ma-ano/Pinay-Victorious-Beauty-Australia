"use client";

import Link from "next/link";
import { site } from "@/data/site";

export default function HeroBanner() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&q=80&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[15%] w-32 h-32 rounded-full bg-accent/15 animate-float blur-xl" />
        <div className="absolute top-40 right-[20%] w-24 h-24 rounded-full bg-primary/20 animate-float blur-lg" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-[30%] w-40 h-40 rounded-full bg-secondary/20 animate-float blur-xl" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-[25%] w-20 h-20 rounded-full bg-accent/10 animate-pulse-slow blur-lg" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
        <div className="max-w-2xl">
          <p className="text-sm md:text-base text-accent font-semibold tracking-widest uppercase animate-fade-in">
            New Collection
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-7xl font-bold text-dark leading-[1.1] tracking-tight animate-fade-in-delay-1">
            {site.tagline}
          </h1>
          <p className="mt-6 text-base md:text-lg text-foreground leading-relaxed max-w-lg animate-fade-in-delay-2">
            Curated beauty essentials for the modern you. Premium skincare, makeup, and self-care — because you deserve it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-delay-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white rounded-full font-medium hover:bg-accent/80 transition-all hover:shadow-lg hover:shadow-accent/25"
            >
              Shop Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/sale"
              className="inline-flex items-center px-8 py-3.5 bg-white/70 backdrop-blur-sm text-dark rounded-full font-medium border border-primary/20 hover:border-accent/50 hover:bg-white transition-all"
            >
              View Sale
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
