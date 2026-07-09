import type { Product } from "@/data/products";
import { site } from "@/data/site";

interface StructuredDataProps {
  product: Product;
}

export default function StructuredData({ product }: StructuredDataProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0]?.url || "",
    description: product.metaDescription || product.description,
    sku: product.id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "AUD",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${site.url}/shop/${product.slug}`,
    },
  };

  if (product.reviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
