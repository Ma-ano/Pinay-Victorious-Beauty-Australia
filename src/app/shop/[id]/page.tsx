import { notFound } from "next/navigation";
import { getAdminDb, FirebaseAdminNotConfigured } from "@/lib/firebase-admin";
import ProductDetailFetcher from "./ProductDetailFetcher";
import type { Metadata } from "next";
import type { Product } from "@/data/products";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const snapshot = await db.collection("products").where("slug", "==", id).limit(1).get();
    if (snapshot.empty) return {};
    const data = snapshot.docs[0].data() as Product;
    const url = `https://pinayvictorious.com/shop/${data.slug || id}`;
    const firstImageUrl = data.images?.[0]?.url;
    const images = firstImageUrl ? [{ url: firstImageUrl, width: 800, height: 800 }] : [];
    return {
      title: data.metaTitle || data.name,
      description: data.metaDescription || data.description,
      keywords: data.metaKeywords || [data.name, data.category].filter(Boolean).join(", "),
      alternates: { canonical: url },
      openGraph: {
        title: data.metaTitle || data.name,
        description: data.metaDescription || data.description,
        url,
        images,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: data.metaTitle || data.name,
        description: data.metaDescription || data.description,
        images: images.map((i) => i.url),
      },
    };
  } catch {
    return {};
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("products").where("slug", "==", id).limit(1).get();
    if (snapshot.empty) notFound();
    const docSnap = snapshot.docs[0];
    const { createdAt, updatedAt, ...cleanData } = docSnap.data() as Record<string, unknown>;
    const product = { ...cleanData, id: docSnap.id } as Product;
    return <ProductDetailFetcher slug={id} initialProduct={product} />;
  } catch (err) {
    if (err instanceof FirebaseAdminNotConfigured) {
      return <ProductDetailFetcher slug={id} />;
    }
    notFound();
  }
}
