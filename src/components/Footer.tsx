import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <Link href="/" className="inline-block">
                <Image
                  src="/images/PinayVictoriousLogo.jpg"
                  alt={site.name}
                  width={0}
                  height={0}
                  className="w-44 h-auto rounded-lg object-contain mb-3"
                  sizes="200px"
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
              <span className="block text-sm text-foreground">{site.phone}</span>
              <a
                href="https://wa.me/YOUR_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-green-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <Link href="/contact" className="block text-sm text-foreground hover:text-accent transition-colors">Contact</Link>
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
                { href: site.social.pinterest, path: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.041-1.002 2.345-1.492 3.141C9.584 23.26 10.768 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" },
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
