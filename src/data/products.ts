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
  imageUrl: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
  variants?: ProductVariant[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Radiance Glow Serum",
    slug: "radiance-glow-serum",
    category: "skincare",
    type: "serum",
    brand: "GlowLab",
    price: 48.0,
    originalPrice: 65.0,
    description:
      "A lightweight vitamin C serum that brightens and evens skin tone. Infused with hyaluronic acid for deep hydration.",
    imageUrl: "photo-1522335789203-aabd1fc54bc9",
    rating: 4.8,
    reviews: 124,
    isSale: true,
    discount: 26,
    variants: [
      { id: "1-v-30ml", name: "30ml", inStock: true },
      { id: "1-v-50ml", name: "50ml", inStock: true },
    ],
  },
  {
    id: "2",
    name: "Velvet Matte Lipstick",
    slug: "velvet-matte-lipstick",
    category: "makeup",
    type: "lipstick",
    brand: "Velvet & Co.",
    price: 28.0,
    description:
      "Long-lasting matte lipstick with a creamy formula. Enriched with shea butter for comfortable wear.",
    imageUrl: "photo-1596462502278-27bfdc403348",
    rating: 4.6,
    reviews: 89,
    isNew: true,
    variants: [
      { id: "2-v-ruby", name: "Ruby Red", inStock: true },
      { id: "2-v-nude", name: "Nude Pink", inStock: true },
      { id: "2-v-berry", name: "Berry Burst", inStock: true },
    ],
  },
  {
    id: "3",
    name: "Silk Repair Hair Mask",
    slug: "silk-repair-hair-mask",
    category: "haircare",
    type: "hair-mask",
    brand: "Lushé",
    price: 35.0,
    originalPrice: 42.0,
    description:
      "Deep conditioning hair mask with argan oil and keratin. Restores damaged hair and adds silky shine.",
    imageUrl: "photo-1526947425960-945c6e72858f",
    rating: 4.7,
    reviews: 67,
    isSale: true,
    discount: 17,
  },
  {
    id: "4",
    name: "Bloom Eau de Parfum",
    slug: "bloom-eau-de-parfum",
    category: "fragrances",
    type: "perfume",
    brand: "Velvet & Co.",
    price: 85.0,
    description:
      "A floral bouquet of jasmine, rose, and peony with warm vanilla undertones. Long-lasting elegance.",
    imageUrl: "photo-1541643600914-78b084683601",
    rating: 4.9,
    reviews: 203,
    isNew: true,
    variants: [
      { id: "4-v-30ml", name: "30ml", inStock: true },
      { id: "4-v-50ml", name: "50ml", inStock: true },
      { id: "4-v-100ml", name: "100ml", inStock: true },
    ],
  },
  {
    id: "5",
    name: "Jade Facial Roller",
    slug: "jade-facial-roller",
    category: "beauty-tools",
    type: "tool",
    brand: "PureBloom",
    price: 22.0,
    description:
      "Natural jade roller that reduces puffiness and promotes lymphatic drainage. Perfect for your morning routine.",
    imageUrl: "photo-1570172619644-dfd03ed5d881",
    rating: 4.5,
    reviews: 156,
  },
  {
    id: "6",
    name: "Hydrating Day Cream",
    slug: "hydrating-day-cream",
    category: "skincare",
    type: "moisturizer",
    brand: "PureBloom",
    price: 42.0,
    originalPrice: 52.0,
    description:
      "Rich yet lightweight day cream with SPF 30. Protects and hydrates with hyaluronic acid and vitamin E.",
    imageUrl: "photo-1507003211169-0a1dd7228f2d",
    rating: 4.7,
    reviews: 98,
    isSale: true,
    discount: 19,
  },
  {
    id: "7",
    name: "Luminous Foundation",
    slug: "luminous-foundation",
    category: "makeup",
    type: "foundation",
    brand: "GlowLab",
    price: 38.0,
    description:
      "Buildable coverage foundation with a natural dewy finish. Infused with light-reflecting pigments.",
    imageUrl: "photo-1556228720-74787810a501",
    rating: 4.4,
    reviews: 112,
    variants: [
      { id: "7-v-fair", name: "Fair Ivory", inStock: true },
      { id: "7-v-beige", name: "Warm Beige", inStock: true },
      { id: "7-v-tan", name: "Golden Tan", inStock: true },
      { id: "7-v-espresso", name: "Deep Espresso", inStock: true },
    ],
  },
  {
    id: "8",
    name: "Argan Oil Hair Elixir",
    slug: "argan-oil-hair-elixir",
    category: "haircare",
    type: "hair-oil",
    brand: "Lushé",
    price: 30.0,
    description:
      "Lightweight argan oil treatment that tames frizz and adds brilliant shine without weighing hair down.",
    imageUrl: "photo-1772987714654-2df39af2c658",
    rating: 4.6,
    reviews: 74,
  },
  {
    id: "9",
    name: "Midnight Rose Perfume Oil",
    slug: "midnight-rose-perfume-oil",
    category: "fragrances",
    type: "perfume-oil",
    brand: "Velvet & Co.",
    price: 55.0,
    originalPrice: 70.0,
    description:
      "Concentrated perfume oil with notes of rose, amber, and musk. A little goes a long way.",
    imageUrl: "photo-1778330804164-2f6d5d3b16ad",
    rating: 4.8,
    reviews: 45,
    isSale: true,
    discount: 21,
  },
  {
    id: "10",
    name: "Sonic Facial Cleansing Brush",
    slug: "sonic-facial-cleansing-brush",
    category: "beauty-tools",
    type: "tool",
    brand: "PureBloom",
    price: 65.0,
    description:
      "Gentle sonic cleansing brush with soft silicone bristles. Removes makeup and unclogs pores effortlessly.",
    imageUrl: "photo-1532441807072-e075a14e3b69",
    rating: 4.3,
    reviews: 88,
  },
  {
    id: "11",
    name: "Retinol Night Serum",
    slug: "retinol-night-serum",
    category: "skincare",
    type: "serum",
    brand: "GlowLab",
    price: 58.0,
    description:
      "Advanced retinol serum that reduces fine lines and improves skin texture while you sleep.",
    imageUrl: "photo-1643168343279-3f93c2e592ef",
    rating: 4.7,
    reviews: 134,
    isNew: true,
  },
  {
    id: "12",
    name: "Eyeshadow Palette - Sunset",
    slug: "eyeshadow-palette-sunset",
    category: "makeup",
    type: "eyeshadow",
    brand: "Lushé",
    price: 45.0,
    originalPrice: 55.0,
    description:
      "12 warm-toned eyeshadows with buttery texture. Highly pigmented shades from matte to shimmer.",
    imageUrl: "photo-1770981667051-e2ad2a1c149d",
    rating: 4.8,
    reviews: 219,
    isSale: true,
    discount: 18,
    variants: [
      { id: "12-v-sunset", name: "Sunset", inStock: true },
      { id: "12-v-rose", name: "Rose Garden", inStock: true },
      { id: "12-v-neutrals", name: "Neutrals", inStock: true },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getSaleProducts(): Product[] {
  return products.filter((p) => p.isSale);
}

export const featuredProducts: Product[] = [
  products[0],
  products[1],
  products[2],
  products[3],
  products[4],
  products[5],
  products[6],
  products[7],
];
