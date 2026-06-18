import { site } from "@/data/site";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">About Us</p>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mt-2">
              Pinay Victorious<br />Beauty Australia
            </h1>
        </div>

        <div className="mt-10 space-y-5 text-foreground leading-relaxed text-sm">
          <p>
            {site.name} is built on faith, resilience, and a passion for self-care.
          </p>
          <p>
            Our story began in Qatar during the 2020 pandemic. What started as a small effort to help people maintain their confidence during a global crisis has grown into an international beauty and wellness movement. Today, we are thrilled to expand our roots to Australia.
          </p>
        </div>

        <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-background p-8 md:p-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <h2 className="text-2xl font-bold text-dark text-center relative z-10">
            Why Choose Us
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-3">
                <span className="text-lg text-accent">✦</span>
              </div>
              <h3 className="font-semibold text-dark text-sm">Curated Excellence</h3>
              <p className="text-xs text-foreground mt-1 leading-relaxed">
                We bring you high-quality, innovative beauty and wellness essentials from South Korea, Thailand, the Philippines, and across Asia.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-3">
                <span className="text-lg text-accent">♥</span>
              </div>
              <h3 className="font-semibold text-dark text-sm">Community-Focused</h3>
              <p className="text-xs text-foreground mt-1 leading-relaxed">
                We are dedicated to empowering multicultural communities and celebrating rich Asian beauty traditions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-3">
                <span className="text-lg text-accent">✧</span>
              </div>
              <h3 className="font-semibold text-dark text-sm">Beauty Without Borders</h3>
              <p className="text-xs text-foreground mt-1 leading-relaxed">
                We believe everyone deserves access to products that make them look, feel, and live their best.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-foreground leading-relaxed text-sm">
          <p>
            From Qatar to Australia, we continue to grow—one community and one success story at a time. Welcome to the family!
          </p>
        </div>
      </div>
    </div>
  );
}
