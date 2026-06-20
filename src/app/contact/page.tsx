import type { Metadata } from "next";
import { site } from "@/data/site";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${site.name}. We'd love to hear from you — email, phone, or social media.`,
  openGraph: { title: "Contact Us", description: `Get in touch with ${site.name}.` },
};

export default function Page() {
  return <ContactPage />;
}
