import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import { categories } from "@/data/categories";
import { site } from "@/data/site";
import type { Metadata } from "next";
import type { Product } from "@/data/products";
import CategoryPage from "./CategoryPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return {};
    return {
      title: `${cat.name} - ${site.name}`,
      description: cat.description,
      alternates: { canonical: `${site.url}/category/${slug}` },
      openGraph: {
        title: `${cat.name} - ${site.name}`,
        description: cat.description,
        url: `${site.url}/category/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function Page({ params }: Props) {
  try {
    const { slug } = await params;
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) notFound();

    const db = getAdminDb();
    const snapshot = await db
      .collection("products")
      .where("category", "==", slug)
      .get();
    const products = snapshot.docs.map((doc) => {
      const { createdAt, updatedAt, ...data } = doc.data() as Record<string, unknown>;
      return { ...data, id: doc.id } as Product;
    });

    return <CategoryPage category={cat} products={products} />;
  } catch {
    notFound();
  }
}
