import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { CartProvider } from "@/components/CartContext";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
            <BackToTop />
            <WhatsAppBubble />
          </ToastProvider>
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
