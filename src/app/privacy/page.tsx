import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${site.name} Privacy Policy.`,
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-widest">Legal</p>
      <h1 className="text-3xl md:text-4xl font-bold text-dark mt-2">Privacy Policy</h1>
      <p className="mt-1 text-xs text-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Information We Collect</h2>
          <p>When you browse our store, we collect information such as your name, email address, shipping address, and payment details. We also collect browsing data through cookies to improve your shopping experience.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">How We Use Your Information</h2>
          <p>We use your information to process orders, send updates about your purchases, and occasionally inform you about promotions and new products (with your consent).</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Cookies</h2>
          <p>Our website uses cookies to remember your preferences, track cart items, and analyze site traffic. You can disable cookies in your browser settings, though this may affect some functionality.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Data Protection</h2>
          <p>We implement industry-standard security measures to protect your personal data. Your payment information is encrypted and never stored on our servers.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Contact</h2>
          <p>For any questions about this policy, please contact us at <a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a>.</p>
        </section>
      </div>
    </div>
  );
}
