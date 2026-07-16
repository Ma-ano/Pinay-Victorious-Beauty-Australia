import { collection, getDocs, query, limit } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const _fb = getDb();
if (!_fb) throw new Error("Firestore not initialized");
const db = _fb;

export interface SiteStats {
  happyCustomers: number;
  beautyBrands: number;
  countriesReached: number;
  foundedYear: string;
}

async function getCompletedOrders() {
  const ordersSnap = await getDocs(query(collection(db, "orders"), limit(1000)));
  return ordersSnap.docs
    .map((d) => d.data())
    .filter((o) => o.status === "completed");
}

export async function getSiteStats(): Promise<SiteStats> {
  try {
    const [productsSnap, ordersSnap] = await Promise.allSettled([
      getDocs(query(collection(db, "products"), limit(500))),
      getDocs(query(collection(db, "orders"), limit(1000))),
    ]);

    const completedOrders =
      ordersSnap.status === "fulfilled"
        ? ordersSnap.value.docs
            .map((d) => d.data())
            .filter((o) => o.status === "completed")
        : [];

    const uniqueCustomers = new Set<string>();
    const uniqueCountries = new Set<string>();
    completedOrders.forEach((o) => {
      if (o.userId) uniqueCustomers.add(o.userId);
      if (o.shipping?.country) uniqueCountries.add(o.shipping.country);
    });

    const uniqueBrands =
      productsSnap.status === "fulfilled"
        ? new Set(
            productsSnap.value.docs
              .map((d) => d.data().brand)
              .filter((b): b is string => !!b)
          ).size
        : 0;

    return {
      happyCustomers: uniqueCustomers.size || 0,
      beautyBrands: uniqueBrands || 0,
      countriesReached: uniqueCountries.size || 0,
      foundedYear: "2020",
    };
  } catch {
    return { happyCustomers: 0, beautyBrands: 0, countriesReached: 0, foundedYear: "2020" };
  }
}
