import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import ProductDetailPage from "./ProductDetailPage";
import type { Metadata } from "next";
import type { Product } from "@/data/products";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = getAdminDb();
  const snapshot = await db.collection("products").where("slug", "==", id).limit(1).get();
  if (snapshot.empty) return {};
  const data = snapshot.docs[0].data() as Product;
  return {
    title: data.name,
    description: data.description,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const db = getAdminDb();
  const snapshot = await db.collection("products").where("slug", "==", id).limit(1).get();
  if (snapshot.empty) notFound();
  const docSnap = snapshot.docs[0];
  const product = { ...docSnap.data(), id: docSnap.id } as Product;
  return <ProductDetailPage product={product} />;
}
