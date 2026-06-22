import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { site } from "@/data/site";
import type { Product } from "@/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("products").where("visible", "==", true).get();
    productEntries = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        url: `${site.url}/shop/${(data.slug as string) || doc.id}`,
        lastModified: (data.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });
  } catch {
    // firebase-admin not available at build time; skip product entries
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${site.url}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticPages, ...productEntries];
}
