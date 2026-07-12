"use client";

import { useState, useRef } from "react";
import { site } from "@/data/site";

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          _hp: form.get("_hp"),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setSent(true);
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">Get in Touch</p>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mt-2">Contact Us</h1>
          <p className="mt-3 text-foreground">We&apos;d love to hear from you</p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
              <label htmlFor="_hp">Leave empty</label>
              <input id="_hp" name="_hp" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark mb-1.5">Name</label>
              <input id="name" name="name" type="text" required
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1.5">Email</label>
              <input id="email" name="email" type="email" required
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-dark mb-1.5">Message</label>
              <textarea id="message" name="message" rows={5} required
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm resize-none" />
            </div>
            {sent ? (
              <div className="w-full py-3 bg-green-100 text-green-800 rounded-xl font-medium text-sm text-center">
                Message sent! We&apos;ll get back to you soon.
              </div>
            ) : (
              <button type="submit" disabled={sending || cooldown > 0} className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/80 transition-colors text-sm disabled:opacity-50">
                {sending ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s` : "Send Message"}
              </button>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-card-border">
              <h2 className="font-semibold text-dark text-sm mb-4">Contact Details</h2>
              <div className="space-y-3 text-sm text-foreground">
                {[
                  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", content: <a href={`mailto:${site.email}`} className="hover:text-accent transition-colors">{site.email}</a> },
                  { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", content: <span>{site.phone}</span> },
                  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", content: <span>{site.address}</span> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.content}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-card-border">
              <h2 className="font-semibold text-dark text-sm mb-4">We Accept</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <svg className="w-5 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="1" y="1" width="22" height="14" rx="2" />
                    <path d="M1 6h22" />
                  </svg>
                  <span>Debit / Credit</span>
                </div>
                <img src="/images/paypal-logo.png" alt="PayPal" className="h-5 w-auto opacity-70" />
                <img src="/images/Afterpay_Brand_Elements_Secondary_Logo_RGB_Black.png" alt="Afterpay" className="h-5 w-auto opacity-70 dark:hidden" />
                <img src="/images/Afterpay_Brand_Elements_Secondary_Logo_RGB_Bondi_Mint.png" alt="Afterpay" className="h-5 w-auto opacity-70 hidden dark:block" />
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
