import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import ProductDetailPage from "./ProductDetailPage";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductBySlug(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = getProductBySlug(id);
  if (!product) notFound();
  return <ProductDetailPage product={product} />;
}
