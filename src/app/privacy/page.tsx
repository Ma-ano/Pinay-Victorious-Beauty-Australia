import type { Metadata } from "next";
import { site } from "@/data/site";
import PrivacyPage from "./PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${site.name} Privacy Policy.`,
};

export default function Page() {
  return <PrivacyPage />;
}
