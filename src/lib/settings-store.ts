import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;
import { doc, getDoc, setDoc } from "firebase/firestore";
import { categories } from "@/data/categories";

export interface FeaturedBrandConfig {
  brand: string;
  title: string;
  description: string;
  image: string;
}

export interface SiteSettings {
  featuredBrands: FeaturedBrandConfig[];
  categoryImages?: Record<string, string>;
}

const emptyBrand: FeaturedBrandConfig = { brand: "", title: "", description: "", image: "" };

const defaultSettings: SiteSettings = {
  featuredBrands: [emptyBrand, emptyBrand, emptyBrand],
  categoryImages: {},
};

export async function getSettings(): Promise<SiteSettings> {
  const snap = await getDoc(doc(db, "settings", "site"));
  if (!snap.exists()) return defaultSettings;
  const data = snap.data();

  // migrate from old single-brand format
  if (!data.featuredBrands && data.featuredBrand) {
    const brands = [
      {
        brand: data.featuredBrand || "",
        title: data.featuredBrandTitle || "",
        description: data.featuredBrandDescription || "",
        image: data.featuredBrandImage || "",
      },
      { ...emptyBrand },
      { ...emptyBrand },
    ];
    return { featuredBrands: brands, categoryImages: data.categoryImages || {} };
  }

  const raw = data.featuredBrands;
  const brands: FeaturedBrandConfig[] = Array.isArray(raw)
    ? raw.filter((b: unknown): b is FeaturedBrandConfig =>
        b !== null && typeof b === "object" && "brand" in (b as any)
      )
    : [];
  while (brands.length < 3) brands.push({ ...emptyBrand });
  return { featuredBrands: brands.slice(0, 3), categoryImages: data.categoryImages || {} };
}

export async function saveSettings(data: SiteSettings): Promise<void> {
  await setDoc(doc(db, "settings", "site"), data);
}

export function getUnsplashUrl(id: string): string {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  return `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;
}
