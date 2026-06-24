import { site } from "@/data/site";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-widest">Legal</p>
      <h1 className="text-3xl md:text-4xl font-bold text-dark mt-2">Terms & Conditions</h1>
      <p className="mt-1 text-xs text-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">General</h2>
          <p>By accessing and using {site.name}, you agree to these terms. Please read them carefully before making a purchase.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Orders & Payment</h2>
          <p>All prices are listed in AUD. We reserve the right to modify prices at any time. Payment is processed securely through PayPal. Your order is confirmed once payment is received.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Shipping & Delivery</h2>
          <p>We ship to addresses within Australia and select international locations. Delivery times vary based on location. Free shipping is available on orders over $50.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Returns & Refunds</h2>
          <p>We accept returns within 30 days of purchase. Products must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Contact</h2>
          <p>For any questions regarding these terms, please reach out to us at <a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a>.</p>
        </section>
      </div>
    </div>
  );
}
