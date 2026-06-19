import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export interface PromotionData {
  code: string;
  discount: number;
  type: string;
  expires: string;
  active: boolean;
}

export interface Promotion extends PromotionData {
  id: string;
}

export async function getAllPromotions(): Promise<Promotion[]> {
  const snapshot = await getDocs(collection(db, "promotions"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
}

export function subscribePromotions(callback: (promos: Promotion[]) => void): () => void {
  return onSnapshot(collection(db, "promotions"), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion)));
  });
}

export async function savePromotion(id: string | null, data: PromotionData): Promise<string> {
  const promoId = id || doc(collection(db, "promotions")).id;
  await setDoc(doc(db, "promotions", promoId), {
    ...data,
    createdAt: id ? undefined : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return promoId;
}

export async function deletePromotion(id: string): Promise<void> {
  await deleteDoc(doc(db, "promotions", id));
}
