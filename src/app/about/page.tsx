import type { Metadata } from "next";
import { site } from "@/data/site";
import AboutPage from "./AboutPage";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${site.name}'s story, mission, and values.`,
};

export default function Page() {
  return <AboutPage />;
}
