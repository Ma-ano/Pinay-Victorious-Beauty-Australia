import Link from "next/link";
import { promotions } from "@/data/promotions";

export default function PromotionCards() {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">Deals & Offers</h2>
        <p className="mt-2 text-foreground">Don&apos;t miss out on these exclusive promotions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <Link
            key={promo.id}
            href={promo.link}
            className="group relative bg-gradient-to-br rounded-2xl p-5 overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg, ${promo.gradient.split(" ").filter(Boolean).join(", ")})` }}
          >
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm text-[10px] font-semibold text-accent uppercase tracking-wider mb-3">
              {promo.discount}
            </span>
            <h3 className="font-semibold text-dark text-sm group-hover:text-accent transition-colors">{promo.title}</h3>
            <p className="mt-1.5 text-xs text-foreground leading-relaxed line-clamp-2">{promo.description}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-lg text-foreground">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {promo.code}
            </div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          </Link>
        ))}
      </div>
    </section>
  );
}
