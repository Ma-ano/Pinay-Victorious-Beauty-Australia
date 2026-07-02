import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/lib/firebase-admin";
import PayPalProvider from "@/components/PayPalProvider";
import CheckoutPage from "./CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login?redirect=checkout");
  }

  try {
    const claims = await getAdminAuth().verifySessionCookie(sessionCookie);
    if (!claims.email_verified) {
      redirect("/verify-email");
    }
  } catch {
    redirect("/login");
  }

  return <PayPalProvider><CheckoutPage /></PayPalProvider>;
}
