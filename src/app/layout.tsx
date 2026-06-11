import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { CartProvider } from "@/components/CartContext";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import DemoBanner from "@/components/DemoBanner";
import { site } from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <DemoBanner />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
            <BackToTop />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
