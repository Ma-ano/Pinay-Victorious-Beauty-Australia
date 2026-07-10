import Link from "next/link";

export default function SaleBanner({
  title,
  subtitle,
  offerText,
}: {
  title?: string | null;
  subtitle?: string | null;
  offerText?: string | null;
}) {
  return (
    <section className="relative bg-linear-to-r from-accent/20 via-primary/20 to-accent/10">
      <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-accent font-semibold text-sm uppercase tracking-wider">
            {title || "Limited Time"}
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-dark mt-2">
            {offerText || "Sale"}
          </h2>
          <p className="text-foreground mt-2">
            {subtitle || "On selected skincare and makeup essentials"}
          </p>
        </div>
        <Link
          href="/sale"
          className="inline-flex items-center px-8 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent/80 transition-all hover:shadow-lg whitespace-nowrap"
        >
          Shop the Sale
        </Link>
      </div>
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
    </section>
  );
}
