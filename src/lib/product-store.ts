import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  FirestoreError,
} from "firebase/firestore";
import type { Product, ProductImage, ProductVariant } from "@/data/products";
import { roundRating } from "@/lib/review-utils";

export interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  type: string;
  brand: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  description: string;
  detail: string;
  shippingReturns: string;
  ingredients: string;
  images: ProductImage[];
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  stock?: number;
  variants?: ProductVariant[];
  isBundle?: boolean;
  bundleItems?: string[];
  bundlePrice?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = { ...obj };
  for (const key in cleaned) {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  }
  return cleaned;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));
  const result = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Product;
    return {
      ...data,
      id: docSnap.id,
      rating: data.rating ?? 0,
      reviews: data.reviews ?? 0,
      sold: data.sold ?? 0,
      images: data.images ?? [],
      stock: data.stock ?? 0,
      variants: data.variants ?? [],
    };
  });
  return result;
}

export function subscribeProducts(callback: (products: Product[]) => void): () => void {
  return onSnapshot(collection(db, "products"), (snapshot) => {
    callback(snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Product;
      return {
        ...data,
        id: docSnap.id,
        rating: data.rating ?? 0,
        reviews: data.reviews ?? 0,
        sold: data.sold ?? 0,
        images: data.images ?? [],
        stock: data.stock ?? 0,
        variants: data.variants ?? [],
      };
    }));
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Product;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) || null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const all = await getAllProducts();
  const map = new Map(all.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
}

export async function saveProduct(
  id: string | null,
  data: ProductFormData
): Promise<string> {
  const productId = id || doc(collection(db, "products")).id;
  const slug = data.slug || slugify(data.name);
  const metaTitle = data.metaTitle || `Buy ${data.name} Philippines`;
  const metaDescription = data.metaDescription || data.description.slice(0, 160);
  const metaKeywords = data.metaKeywords || `${data.name}, buy online philippines, cheap ${data.name}`;
  await setDoc(doc(db, "products", productId), stripUndefined({
    ...data,
    slug,
    metaTitle,
    metaDescription,
    metaKeywords,
    createdAt: id ? undefined : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return productId;
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (err) {
    if (err instanceof FirestoreError && err.code === "permission-denied") {
      throw new Error("permission-denied");
    }
    throw err;
  }
}

export async function getAllReviewStats(): Promise<Record<string, { avgRating: number; reviewCount: number }>> {
  try {
    const snap = await getDocs(collection(db, "reviews"));
    const acc: Record<string, { total: number; count: number }> = {};
    snap.docs.forEach((d) => {
      const data = d.data();
      const pid = data.productId;
      if (!pid) return;
      if (!acc[pid]) acc[pid] = { total: 0, count: 0 };
      acc[pid].total += data.rating || 0;
      acc[pid].count += 1;
    });
    const result: Record<string, { avgRating: number; reviewCount: number }> = {};
    for (const [pid, v] of Object.entries(acc)) {
      result[pid] = { avgRating: roundRating(v.total / v.count), reviewCount: v.count };
    }
    return result;
  } catch {
    return {};
  }
}

export async function getProductReviews(productId: string): Promise<{ avgRating: number; reviewCount: number }> {
  try {
    const q = query(collection(db, "reviews"), where("productId", "==", productId));
    const snap = await getDocs(q);
    if (snap.empty) return { avgRating: 0, reviewCount: 0 };
    let total = 0;
    snap.docs.forEach((d) => {
      total += d.data().rating || 0;
    });
    return { avgRating: roundRating(total / snap.size), reviewCount: snap.size };
  } catch {
    return { avgRating: 0, reviewCount: 0 };
  }
}

export async function getProductSoldCount(productId: string): Promise<number> {
  try {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["delivered", "completed"])
    );
    const snap = await getDocs(q);
    let count = 0;
    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.items) {
        data.items.forEach((item: { productId: string; quantity: number }) => {
          if (item.productId === productId) {
            count += item.quantity || 0;
          }
        });
      }
    });
    return count;
  } catch {
    return 0;
  }
}

async function enrichProductWithStats(product: Product): Promise<Product & { avgRating: number; reviewCount: number; soldCount: number }> {
  const [reviews, sold] = await Promise.all([
    getProductReviews(product.id),
    getProductSoldCount(product.id),
  ]);
  return { ...product, avgRating: reviews.avgRating, reviewCount: reviews.reviewCount, soldCount: sold };
}

export async function getSaleProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isSale);
}

export async function getTrendingProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  const enriched = await Promise.all(all.map(enrichProductWithStats));
  return enriched.sort((a, b) => {
    if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
    return Math.random() - 0.5;
  });
}

export async function getBestSellingProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  const enriched = await Promise.all(all.map(enrichProductWithStats));
  return enriched.sort((a, b) => {
    if (b.soldCount !== a.soldCount) return b.soldCount - a.soldCount;
    return Math.random() - 0.5;
  });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === category);
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.brand === brand);
}
