import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { site } from "@/data/site";
import { categories } from "@/data/categories";

const baseUrl = site.url.replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("products").where("visible", "==", true).get();
    productEntries = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        url: `${baseUrl}/shop/${(data.slug as string) || doc.id}`,
        lastModified: (data.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });
  } catch {
    // firebase-admin not available at build time; skip product entries
  }

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticPages, ...categoryEntries, ...productEntries];
}
