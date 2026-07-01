import { collection, getDocs } from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;

export interface SiteStats {
  happyCustomers: number;
  beautyBrands: number;
  countriesReached: number;
  foundedYear: string;
}

async function getCompletedOrders() {
  const ordersSnap = await getDocs(collection(db, "orders"));
  return ordersSnap.docs
    .map((d) => d.data())
    .filter((o) => o.status === "completed" || o.status === "delivered");
}

export async function getSiteStats(): Promise<SiteStats> {
  try {
    const [productsSnap, ordersSnap] = await Promise.allSettled([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "orders")),
    ]);

    const completedOrders =
      ordersSnap.status === "fulfilled"
        ? ordersSnap.value.docs
            .map((d) => d.data())
            .filter((o) => o.status === "completed" || o.status === "delivered")
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
