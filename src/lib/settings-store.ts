import { getDb } from "@/lib/firebase";

const _fb = getDb();
if (!_fb) throw new Error("Firestore not initialized");
const db = _fb;
import { doc, getDoc, setDoc } from "firebase/firestore";
import { categories } from "@/data/categories";

export interface FeaturedBrandConfig {
  brand: string;
  title: string;
  description: string;
  image: string;
}

export interface ReviewConfig {
  name: string;
  rating: number;
  text: string;
  title?: string;
  productName?: string;
  photoURL?: string;
  _id?: string;
}

export interface SiteSettings {
  featuredBrands: FeaturedBrandConfig[];
  categoryImages?: Record<string, string>;
  saleBannerTitle?: string;
  saleBannerSubtitle?: string;
  saleBannerOfferText?: string;
  reviews?: ReviewConfig[];
  freeShippingThreshold?: number;
  shippingReturns?: string;
}

const emptyBrand: FeaturedBrandConfig = { brand: "", title: "", description: "", image: "" };

const defaultSettings: SiteSettings = {
  featuredBrands: [emptyBrand, emptyBrand, emptyBrand],
  categoryImages: {},
  reviews: [],
  freeShippingThreshold: 120,
  shippingReturns: "Free shipping on orders over $120. 30-day return policy.",
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
    return {
      featuredBrands: brands,
      categoryImages: data.categoryImages || {},
      reviews: [],
      freeShippingThreshold: typeof data.freeShippingThreshold === "number" ? data.freeShippingThreshold : 120,
      shippingReturns: data.shippingReturns || "Free shipping on orders over $120. 30-day return policy.",
    };
  }

  const raw = data.featuredBrands;
  const brands: FeaturedBrandConfig[] = Array.isArray(raw)
    ? raw.filter((b: unknown): b is FeaturedBrandConfig =>
        b !== null && typeof b === "object" && "brand" in (b as any)
      )
    : [];
  while (brands.length < 3) brands.push({ ...emptyBrand });
  return {
    featuredBrands: brands.slice(0, 3),
    categoryImages: data.categoryImages || {},
    reviews: data.reviews || [],
    freeShippingThreshold: typeof data.freeShippingThreshold === "number" ? data.freeShippingThreshold : 120,
    shippingReturns: data.shippingReturns || "Free shipping on orders over $120. 30-day return policy.",
  };
}

export async function saveSettings(data: SiteSettings): Promise<void> {
  await setDoc(doc(db, "settings", "site"), data);
}

export function getUnsplashUrl(id: string): string {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  return `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;
}
