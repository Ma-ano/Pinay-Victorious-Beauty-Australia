"use client";

import { useState } from "react";

export default function Newsletter() {
  const [sending, setSending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to subscribe");
      }
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-linear-to-r from-primary/20 to-secondary/20 p-8 md:p-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-dark">
        Join Our Glow Community
      </h2>
      <p className="mt-3 text-foreground max-w-md mx-auto">
        Subscribe for exclusive offers, beauty tips, and new arrivals.
      </p>
      {subscribed ? (
        <p className="mt-6 text-green-700 font-medium">
          You&apos;re in! Check your inbox for a welcome email.
        </p>
      ) : (
        <form
          className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-lg border border-primary/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
          >
            {sending ? "Subscribing..." : "Subscribe"}
          </button>
          {error && <p className="text-red-600 text-sm w-full">{error}</p>}
        </form>
      )}
    </section>
  );
}
