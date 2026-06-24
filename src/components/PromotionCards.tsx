"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { subscribePromotions } from "@/lib/promotions-store";
import type { Promotion } from "@/lib/promotions-store";
import { getValidPromotions } from "@/lib/promotion-utils";

export default function PromotionCards() {
  const [promos, setPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    const unsub = subscribePromotions((all) => {
      setPromos(getValidPromotions(all));
    });
    return unsub;
  }, []);

  if (promos.length === 0) return null;

  const gradients = [
    "from-accent/20 via-primary/20 to-accent/10",
    "from-secondary/30 via-primary/10 to-secondary/20",
    "from-primary/20 via-accent/10 to-primary/20",
    "from-purple-200/30 via-pink-100/20 to-purple-200/30",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {promos.slice(0, 4).map((promo, i) => (
        <Link
          key={promo.id}
          href={promo.code ? `/sale?code=${promo.code}` : "/sale"}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br shadow-sm border border-card-border transition-all hover:shadow-lg"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${gradients[i % gradients.length]})` }}
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-widest">
            {promo.type === "Percentage" ? `${promo.discount}% OFF` : promo.type === "Fixed Amount" ? `${formatPrice(promo.discount)} OFF` : promo.type}
          </p>
          <p className="mt-2 text-sm font-medium text-dark line-clamp-2">
            {promo.code}
          </p>
          <p className="mt-1 text-xs text-foreground">
            {promo.expires ? `Valid until ${new Date(promo.expires).toLocaleDateString()}` : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
