import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-white dark:bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <Link href="/" className="inline-block">
                <Image
                  src="/images/PinayVictoriousLogo.png"
                  alt={site.name}
                  width={200}
                  height={70}
                  className="w-44 h-auto rounded-lg object-contain mb-3"
                  quality={75}
                  unoptimized
                />
              </Link>
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
              <a href={`https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-foreground hover:text-accent transition-colors">{site.whatsapp}</a>

              <Link href="/contact" className="block text-sm text-foreground hover:text-accent transition-colors">Contact</Link>
              <Link href="/privacy" className="block text-sm text-foreground hover:text-accent transition-colors">Privacy</Link>
              <Link href="/terms" className="block text-sm text-foreground hover:text-accent transition-colors">Terms</Link>
              <Link href="/shipping" className="block text-sm text-foreground hover:text-accent transition-colors">Shipping Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-dark mb-4">Follow</h4>
            <div className="flex gap-3">
              {[
                { href: site.social.facebook, path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                { href: site.social.instagram, path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" },
                { href: `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`, path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-foreground hover:bg-accent/20 hover:text-accent transition-all" aria-label="Social">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary/10 text-center">
          <p className="text-xs text-foreground">&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
