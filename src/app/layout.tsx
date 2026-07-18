import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { CartProvider } from "@/components/CartContext";
import IdleTimeoutProvider from "@/components/IdleTimeoutProvider";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import MotionProvider from "@/components/MotionProvider";
import PayPalProvider from "@/components/PayPalProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/data/site";
import { preconnect } from "react-dom";
import { safeJsonLd } from "@/lib/sanitize";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  metadataBase: new URL(site.url),
  openGraph: {
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "_BGOrV8oBRRoUUIeEpxPXuMF1j_fDsi9pxZtF8BfmxE",
  },
  icons: {
    icon: "/images/TitleBarLogo.png",
    shortcut: "/images/TitleBarLogo.png",
    apple: "/images/TitleBarLogo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://firebasestorage.googleapis.com");
  preconnect("https://www.paypal.com");
  preconnect("https://www.paypalobjects.com");

  const h = await headers();
  if (h.get("x-maintenance") === "1") {
    return (
      <html lang="en">
        <body className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
          {children}
        </body>
      </html>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pinay Victorious Beauty",
    url: "https://www.pinayvictoriousbeauty.com.au",
    logo: "https://www.pinayvictoriousbeauty.com.au/logo.png",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <MotionProvider>
        <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <PayPalProvider>
            <IdleTimeoutProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
            <BackToTop />
            <WhatsAppBubble />
            <SpeedInsights />
            </IdleTimeoutProvider>
            </PayPalProvider>
          </ToastProvider>
        </CartProvider>
        </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
