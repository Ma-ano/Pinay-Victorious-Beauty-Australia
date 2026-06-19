export interface ProductImage {
  url: string;
  name: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  detail: string;
  shippingReturns: string;
  ingredients: string;
  images: ProductImage[];
  rating: number;
  reviews: number;
  sold: number;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  variants?: ProductVariant[];
}

export const products: Product[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getSaleProducts(): Product[] {
  return products.filter((p) => p.isSale);
}

export function getTrendingProducts(): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating);
}

export function getBestSellingProducts(): Product[] {
  return [...products].sort((a, b) => b.sold - a.sold);
}
