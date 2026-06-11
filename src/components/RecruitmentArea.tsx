export default function RecruitmentArea() {
  const perks = [
    { icon: "🌱", text: "Growth Opportunities" },
    { icon: "💄", text: "Product Discounts" },
    { icon: "🌍", text: "Inclusive Culture" },
  ];

  return (
    <section className="relative bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/10 rounded-2xl overflow-hidden p-8 md:p-12 text-center">
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <p className="text-accent font-semibold text-sm uppercase tracking-wider">We&apos;re Hiring!</p>
        <h2 className="text-2xl md:text-4xl font-bold text-dark mt-2">Join Our Team</h2>
        <p className="text-foreground mt-3 max-w-lg mx-auto">
          Be part of something beautiful. We&apos;re looking for passionate people to help
          our community glow — from beauty experts to tech innovators.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {perks.map((perk) => (
            <div key={perk.text} className="flex items-center gap-2 text-sm font-medium text-dark">
              <span>{perk.icon}</span>
              <span>{perk.text}</span>
            </div>
          ))}
        </div>
        <a
          href="mailto:hello@beautystore.com"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent/80 transition-all hover:shadow-lg"
        >
          View Open Positions
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
