import { getAdminDb, FirebaseAdminNotConfigured } from "@/lib/firebase-admin";
import type { Product } from "@/data/products";
import { roundRating } from "@/lib/review-utils";

function serializeProduct(id: string, data: Record<string, unknown>): Product {
  const { createdAt, updatedAt, ...rest } = data;
  return { ...rest, id } as unknown as Product;
}

const LIST_FIELDS = [
  "name", "slug", "category", "subcategory", "type", "brand",
  "price", "originalPrice", "salePrice",
  "images", "rating", "reviews", "sold",
  "isNew", "isSale", "discount", "stock",
  "variants", "isBundle", "bundleItems", "bundlePrice",
];

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("products").get();
    return snapshot.docs.map((doc) => serializeProduct(doc.id, doc.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchProducts(opts?: { limit?: number }): Promise<Product[]> {
  try {
    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("products").select(...LIST_FIELDS);
    if (opts?.limit) query = query.limit(opts.limit);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => serializeProduct(doc.id, doc.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function fetchAllReviewStats(): Promise<Record<string, { avgRating: number; reviewCount: number }>> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("reviews").get();
    const acc: Record<string, { total: number; count: number }> = {};
    snapshot.docs.forEach((d) => {
      const data = d.data();
      const pid = data.productId as string | undefined;
      if (!pid) return;
      if (!acc[pid]) acc[pid] = { total: 0, count: 0 };
      acc[pid].total += (data.rating as number) || 0;
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

export async function fetchAllSettings(): Promise<Record<string, unknown> | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("settings").doc("site").get();
    if (!snap.exists) return null;
    return snap.data() as Record<string, unknown>;
  } catch {
    return null;
  }
}
