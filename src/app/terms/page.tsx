import type { Metadata } from "next";
import { site } from "@/data/site";
import TermsPage from "./TermsPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `${site.name} Terms and Conditions.`,
};

export default function Page() {
  return <TermsPage />;
}
