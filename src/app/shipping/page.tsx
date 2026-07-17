import type { Metadata } from "next";
import { site } from "@/data/site";
import ShippingPage from "./ShippingPage";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `${site.name} Shipping Policy — Australia Post delivery rates and timeframes.`,
};

export default function Page() {
  return <ShippingPage />;
}
