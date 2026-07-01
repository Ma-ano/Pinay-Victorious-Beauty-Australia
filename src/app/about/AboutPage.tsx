"use client";

import { useState, useEffect } from "react";
import { site } from "@/data/site";
import { getSiteStats, type SiteStats } from "@/lib/stats-store";
import Link from "next/link";

export default function AboutPage() {
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    getSiteStats().then(setSiteStats);
  }, []);

  const stats = siteStats
    ? [
        { number: siteStats.happyCustomers > 0 ? `${siteStats.happyCustomers}+` : "0", label: "Happy Customers" },
        { number: siteStats.beautyBrands > 0 ? `${siteStats.beautyBrands}+` : "0", label: "Asian Beauty Brands" },
        { number: String(siteStats.countriesReached), label: "Countries Reached" },
        { number: siteStats.foundedYear, label: "Founded in Qatar" },
      ]
    : [
        { number: "--", label: "Happy Customers" },
        { number: "--", label: "Asian Beauty Brands" },
        { number: "--", label: "Countries Reached" },
        { number: "2020", label: "Founded in Qatar" },
      ];

  const values = [
    {
      title: "Faith",
      description: "Our journey began with faith during challenging times, and it remains the foundation of everything we do.",
      path: "M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z M8 16h8v2H8z M10 18h4v3h-4z",
    },
    {
      title: "Resilience",
      description: "From a small pandemic initiative to an international beauty movement, we grow stronger with every challenge.",
      path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm1-8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm3.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-3.5 5c1.2 2.2 3.7 3.5 6.5 3.5s5.3-1.3 6.5-3.5z",
    },
    {
      title: "Community",
      description: "We celebrate multicultural beauty traditions and empower every individual to feel confident in their own skin.",
      path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest animate-fade-in">
              About Us
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-bold text-dark leading-[1.1] tracking-tight animate-fade-in-up">
              Beauty With Purpose
            </h1>
            <p className="mt-4 text-foreground text-base md:text-lg leading-relaxed max-w-xl animate-fade-in-up">
              {site.name} is built on faith, resilience, and a passion for self-care.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="animate-fade-in-up">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest">
              Our Story
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-dark leading-tight">
              From Qatar to Australia
            </h2>
            <div className="mt-6 space-y-4 text-foreground leading-relaxed text-sm md:text-base">
              <p>
                Our story began in Qatar during the 2020 pandemic. What started as a small effort to help people maintain their confidence during a global crisis quickly grew into something far greater than we could have imagined.
              </p>
              <p>
                Driven by a deep belief in the power of self-care, we began sourcing premium beauty and wellness essentials from South Korea, Thailand, the Philippines, and across Asia. Each product was chosen with care, rooted in cherished traditions and proven results.
              </p>
              <p>
                Today, we are proud to call Sydney, Australia home. From Qatar to Australia, we continue to grow -- one community and one success story at a time.
              </p>
            </div>
            <div className="mt-6 w-16 h-0.5 bg-accent/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-background p-8 md:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest text-center">
              Why Choose Us
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-dark text-center">
              What Sets Us Apart
            </h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
              <div className="text-center animate-fade-in-up">
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dark text-sm">Curated Excellence</h3>
                <p className="text-xs text-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  High-quality, innovative beauty and wellness essentials sourced from South Korea, Thailand, the Philippines, and across Asia.
                </p>
              </div>
              <div className="text-center animate-fade-in-up">
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dark text-sm">Community-Focused</h3>
                <p className="text-xs text-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  Dedicated to empowering multicultural communities and celebrating rich Asian beauty traditions.
                </p>
              </div>
              <div className="text-center animate-fade-in-up">
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l10 10-10 10L2 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l4 4-4 4-4-4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dark text-sm">Beauty Without Borders</h3>
                <p className="text-xs text-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  Everyone deserves access to products that make them look, feel, and live their best -- no matter where they are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">
            Our Values
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-dark">
            What We Stand For
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <div
              key={value.title}
              className="glass rounded-2xl p-8 text-center"
              style={{ animation: `fadeInUp 0.7s ease-out ${i * 0.15}s forwards`, opacity: 0 }}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={value.path} />
                </svg>
              </div>
              <h3 className="font-semibold text-dark text-base">{value.title}</h3>
              <p className="text-xs text-foreground mt-2 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-primary/20 via-secondary/10 to-background py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={{ animation: `fadeIn 0.6s ease-out ${i * 0.12}s forwards`, opacity: 0 }}
              >
                <p className="text-3xl md:text-4xl font-bold text-dark">{stat.number}</p>
                <p className="text-xs text-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-primary/20 to-accent/10 p-8 md:p-12 text-center">
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-dark">Welcome to the Family</h2>
            <p className="mt-3 text-foreground text-sm md:text-base max-w-md mx-auto">
              Join thousands of customers who have discovered their confidence through our curated beauty essentials.
            </p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-full font-medium text-sm hover:bg-accent/80 transition-all hover:shadow-lg hover:shadow-accent/25"
              >
                Shop Now
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
