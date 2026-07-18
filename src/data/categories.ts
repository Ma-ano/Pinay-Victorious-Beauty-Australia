export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;

  subcategories: SubCategory[];
  imageUrl: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Skincare",
    slug: "skincare",

    imageUrl: "photo-1777840347880-747242e0db00",
    description: "Facial cleanser, toner, serum, moisturizer & more",
    subcategories: [
      { name: "Facial Cleanser", slug: "facial-cleanser" },
      { name: "Toner", slug: "toner" },
      { name: "Serum", slug: "serum" },
      { name: "Moisturizer", slug: "moisturizer" },
      { name: "Sunscreen", slug: "sunscreen" },
      { name: "Face Mask", slug: "face-mask" },
      { name: "Eye Cream", slug: "eye-cream" },
      { name: "Face Set", slug: "face-set" },
      { name: "Pimple Patch", slug: "pimple-patch" },
    ],
  },
  {
    id: "2",
    name: "Body Care",
    slug: "body-care",

    imageUrl: "photo-1574621100236-d25b64cfd647",
    description: "Lotion, body wash, scrub & hand care",
    subcategories: [
      { name: "Body Lotion", slug: "body-lotion" },
      { name: "Body Wash", slug: "body-wash" },
      { name: "Body Bar", slug: "body-bar" },
      { name: "Body Scrub", slug: "body-scrub" },
      { name: "Hand & Foot Care", slug: "hand-foot-care" },
    ],
  },
  {
    id: "3",
    name: "Hair Care",
    slug: "hair-care",

    imageUrl: "photo-1526947425960-945c6e72858f",
    description: "Shampoo, conditioner, treatment & growth products",
    subcategories: [
      { name: "Shampoo", slug: "shampoo" },
      { name: "Conditioner", slug: "conditioner" },
      { name: "Hair Treatment/Mask", slug: "hair-treatment-mask" },
      { name: "Hair Growth Products", slug: "hair-growth" },
      { name: "Hair Oil", slug: "hair-oil" },
      { name: "Hair Color", slug: "hair-color" },
    ],
  },
  {
    id: "4",
    name: "Underarm/Bikini Care",
    slug: "underarm-bikini-care",

    imageUrl: "",
    description: "Underarm and bikini care products",
    subcategories: [
      { name: "Soap Bar", slug: "soap-bar" },
      { name: "Roll on/Powder Stick", slug: "roll-on-powder-stick" },
      { name: "Cream/Spray", slug: "cream-spray" },
      { name: "Sets", slug: "sets" },
    ],
  },
  {
    id: "5",
    name: "Beauty & Cosmetics",
    slug: "beauty-cosmetics",

    imageUrl: "photo-1770622006339-5a7a91c36e05",
    description: "Makeup, foundation, lipstick & beauty tools",
    subcategories: [
      { name: "Face", slug: "face" },
      { name: "Lips", slug: "lips" },
      { name: "Eyes & Brows", slug: "eyes-brows" },
      { name: "Cheeks", slug: "cheeks" },
    ],
  },
  {
    id: "6",
    name: "Health & Wellness",
    slug: "health-wellness",

    imageUrl: "photo-1552693673-1bf958298935",
    description: "Collagen, glutathione, dietary supplements",
    subcategories: [
      { name: "Collagen", slug: "collagen" },
      { name: "Glutathione", slug: "glutathione" },
      { name: "Dietary Supplement", slug: "dietary-supplement" },
    ],
  },
  {
    id: "7",
    name: "Korean Beauty",
    slug: "k-beauty",

    imageUrl: "photo-1596462502278-27bfdc403348",
    description: "K-Beauty skincare, cosmetics & wellness",
    subcategories: [
      { name: "Featured Picks", slug: "featured-picks" },
      { name: "Trending Now", slug: "trending-now" },
      { name: "Signature Products", slug: "signature-products" },
    ],
  },
  {
    id: "8",
    name: "Filipino Beauty",
    slug: "filipino-beauty",

    imageUrl: "photo-1541643600914-78b084683601",
    description: "Best sellers from the Philippines",
    subcategories: [
      { name: "Featured Picks", slug: "featured-picks" },
      { name: "Trending Now", slug: "trending-now" },
      { name: "Signature Products", slug: "signature-products" },
    ],
  },
  {
    id: "9",
    name: "Thai Beauty",
    slug: "thai-beauty",

    imageUrl: "photo-1570172619644-dfd03ed5d881",
    description: "Thai skincare, herbal & wellness products",
    subcategories: [
      { name: "Featured Picks", slug: "featured-picks" },
      { name: "Trending Now", slug: "trending-now" },
      { name: "Signature Products", slug: "signature-products" },
    ],
  },
  {
    id: "10",
    name: "Best Sellers",
    slug: "best-sellers",

    imageUrl: "photo-1608679152045-b827c386d312",
    description: "Our most popular products",
    subcategories: [],
  },
  {
    id: "11",
    name: "New Arrivals",
    slug: "new-arrivals",

    imageUrl: "photo-1570172619644-dfd03ed5d881",
    description: "Fresh from the latest collections",
    subcategories: [],
  },
  {
    id: "12",
    name: "Gift Sets & Bundles",
    slug: "gift-sets",

    imageUrl: "photo-1608679152045-b827c386d312",
    description: "Perfect presents and value bundles",
    subcategories: [],
  },
  {
    id: "13",
    name: "Sale & Promotions",
    slug: "sale",

    imageUrl: "photo-1522335789203-aabd1fc54bc9",
    description: "Limited-time offers you don't want to miss",
    subcategories: [],
  },
  {
    id: "14",
    name: "Food",
    slug: "food",

    imageUrl: "",
    description: "Food products",
    subcategories: [],
  },
  {
    id: "15",
    name: "Fragrances",
    slug: "fragrances",

    imageUrl: "",
    description: "Perfumes, body mists & fragrance sets",
    subcategories: [
      { name: "Perfume for Women", slug: "perfume-women" },
      { name: "Perfume for Men", slug: "perfume-men" },
      { name: "Body Mist", slug: "body-mist" },
      { name: "Perfume Sets", slug: "perfume-sets" },
    ],
  },
  {
    id: "16",
    name: "Fashion & Apparel",
    slug: "fashion-apparel",

    imageUrl: "",
    description: "Clothing, sleepwear & accessories",
    subcategories: [
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Sleepwear", slug: "sleepwear" },
      { name: "Accessories", slug: "accessories" },
    ],
  },
];