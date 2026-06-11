import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${site.name}'s story, mission, and values.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">Our Story</p>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mt-2">About {site.name}</h1>
        </div>

        <div className="mt-10 space-y-5 text-foreground leading-relaxed text-sm">
          <p>
            {site.name} was born from a simple belief: beauty should enhance,
            not hide. Founded in Sydney, Australia, we set out to create a
            beauty brand that celebrates natural radiance and empowers everyone
            to feel confident in their own skin.
          </p>
          <p>
            Every product in our collection is carefully formulated with
            premium, ethically sourced ingredients. We believe that what you
            put on your body matters as much as what you put in it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Our Mission", content: "To provide high-quality, accessible beauty products that inspire confidence and self-care, while staying true to our commitment to sustainability and ethical practices." },
            { title: "Our Vision", content: "A world where beauty is inclusive, sustainable, and empowers everyone to shine naturally. Self-care should be a daily ritual, not a luxury." },
          ].map((item) => (
            <div key={item.title} className="bg-card rounded-2xl p-6 md:p-8 border border-card-border">
              <h2 className="text-lg font-bold text-dark">{item.title}</h2>
              <p className="mt-3 text-sm text-foreground leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-background p-8 md:p-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <h2 className="text-2xl font-bold text-dark text-center relative z-10">
            Why Choose {site.name}?
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {[
              { title: "100% Organic", desc: "All natural ingredients, no harsh chemicals", icon: "✦" },
              { title: "Cruelty-Free", desc: "Never tested on animals, ever", icon: "♥" },
              { title: "Eco-Friendly", desc: "Sustainable packaging with minimal waste", icon: "✧" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-3">
                  <span className="text-lg text-accent">{item.icon}</span>
                </div>
                <h3 className="font-semibold text-dark text-sm">{item.title}</h3>
                <p className="text-xs text-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
