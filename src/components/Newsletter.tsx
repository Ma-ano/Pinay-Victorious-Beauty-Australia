"use client";

export default function Newsletter() {
  return (
    <section className="bg-linear-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 md:p-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-dark">
        Join Our Glow Community
      </h2>
      <p className="mt-3 text-foreground max-w-md mx-auto">
        Subscribe for exclusive offers, beauty tips, and new arrivals.
      </p>
      <form
        className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 px-4 py-3 rounded-lg border border-primary/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors text-sm whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}
