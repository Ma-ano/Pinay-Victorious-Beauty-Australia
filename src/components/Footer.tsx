import Link from "next/link";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 mb-3" />
              <p className="text-sm text-foreground leading-relaxed max-w-xs">{site.description}</p>
            </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-4">Shop</h4>
            <div className="space-y-2.5">
              <Link href="/shop" className="block text-sm text-foreground hover:text-accent transition-colors">All Products</Link>
              <Link href="/sale" className="block text-sm text-foreground hover:text-accent transition-colors">Sale</Link>
              <Link href="/about" className="block text-sm text-foreground hover:text-accent transition-colors">About</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-4">Support</h4>
            <div className="space-y-2.5">
              <a href={`mailto:${site.email}`} className="block text-sm text-foreground hover:text-accent transition-colors">{site.email}</a>
              <span className="block text-sm text-foreground">{site.phone}</span>
              <Link href="/privacy" className="block text-sm text-foreground hover:text-accent transition-colors">Privacy</Link>
              <Link href="/terms" className="block text-sm text-foreground hover:text-accent transition-colors">Terms</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-4">Follow</h4>
            <div className="flex gap-3">
              {[
                { href: site.social.facebook, path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { href: site.social.instagram, path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" },
                { href: site.social.twitter, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-foreground hover:bg-accent/20 hover:text-accent transition-all" aria-label="Social">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-primary/10 text-center">
          <p className="text-xs text-foreground">&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
