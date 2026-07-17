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
      { name: "Whitening Products", slug: "whitening" },
    ],
  },
  {
    id: "2",
    name: "Beauty & Cosmetics",
    slug: "beauty-cosmetics",

    imageUrl: "photo-1770622006339-5a7a91c36e05",
    description: "Makeup, foundation, lipstick & beauty tools",
    subcategories: [
      { name: "Makeup", slug: "makeup" },
      { name: "BB Cream & Foundation", slug: "bb-cream-foundation" },
      { name: "Lipstick", slug: "lipstick" },
      { name: "Eyebrow & Eye Makeup", slug: "eye-makeup" },
      { name: "Beauty Tools", slug: "beauty-tools" },
      { name: "Face", slug: "face" },
      { name: "Lips", slug: "lips" },
      { name: "Eyes & Brows", slug: "eyes-brows" },
      { name: "Cheeks", slug: "cheeks" },
    ],
  },
  {
    id: "3",
    name: "Body Care",
    slug: "body-care",

    imageUrl: "photo-1574621100236-d25b64cfd647",
    description: "Lotion, scrub, body wash & hand care",
    subcategories: [
      { name: "Body Lotion", slug: "body-lotion" },
      { name: "Body Scrub", slug: "body-scrub" },
      { name: "Body Wash", slug: "body-wash" },
      { name: "Body Bar", slug: "body-bar" },
      { name: "Whitening Lotion", slug: "whitening-lotion" },
      { name: "Hand & Foot Care", slug: "hand-foot-care" },
      { name: "Body Capsules (topical)", slug: "body-capsules-topical" },
      { name: "Body Booster / Lotion / Gel-Cream", slug: "body-booster" },
    ],
  },
  {
    id: "4",
    name: "Soap Collection",
    slug: "soap-collection",

    imageUrl: "photo-1556228720-74787810a501",
    description: "Whitening, herbal, glutathione & kojic soaps",
    subcategories: [
      { name: "Whitening Soap", slug: "whitening-soap" },
      { name: "Herbal Soap", slug: "herbal-soap" },
      { name: "Glutathione Soap", slug: "glutathione-soap" },
      { name: "Kojic Soap", slug: "kojic-soap" },
    ],
  },
  {
    id: "5",
    name: "Hair Care",
    slug: "hair-care",

    imageUrl: "photo-1526947425960-945c6e72858f",
    description: "Shampoo, conditioner, treatment & hair growth",
    subcategories: [
      { name: "Shampoo", slug: "shampoo" },
      { name: "Conditioner", slug: "conditioner" },
      { name: "Hair Treatment/Mask", slug: "hair-treatment-mask" },
      { name: "Hair Growth Products", slug: "hair-growth" },
      { name: "Hair Oil", slug: "hair-oil" },
    ],
  },
  {
    id: "6",
    name: "Wellness Products",
    slug: "wellness",

    imageUrl: "photo-1552693673-1bf958298935",
    description: "Collagen, supplements, wellness drinks & herbs",
    subcategories: [
      { name: "Collagen Drinks", slug: "collagen-drinks" },
      { name: "Beauty Supplements", slug: "beauty-supplements" },
      { name: "Coffee & Wellness Drinks", slug: "wellness-drinks" },
      { name: "Herbal Products", slug: "herbal-products" },
    ],
  },
  {
    id: "7",
    name: "Korean Beauty",
    slug: "k-beauty",

    imageUrl: "photo-1596462502278-27bfdc403348",
    description: "K-Beauty skincare, cosmetics & wellness",
    subcategories: [
      { name: "Korean Skincare", slug: "korean-skincare" },
      { name: "Korean Cosmetics", slug: "korean-cosmetics" },
      { name: "Korean Wellness", slug: "korean-wellness" },
    ],
  },
  {
    id: "8",
    name: "Thai Beauty",
    slug: "thai-beauty",

    imageUrl: "photo-1570172619644-dfd03ed5d881",
    description: "Thai skincare, herbal & wellness products",
    subcategories: [
      { name: "Thai Skincare", slug: "thai-skincare" },
      { name: "Thai Herbal Products", slug: "thai-herbal" },
      { name: "Thai Wellness", slug: "thai-wellness" },
    ],
  },
  {
    id: "9",
    name: "Filipino Favorites",
    slug: "filipino-favorites",

    imageUrl: "photo-1541643600914-78b084683601",
    description: "Best sellers from the Philippines",
    subcategories: [
      { name: "Best Sellers", slug: "pinoy-best-sellers" },
      { name: "Beauty Essentials", slug: "pinoy-beauty-essentials" },
      { name: "Wellness Products", slug: "pinoy-wellness" },
    ],
  },
  {
    id: "10",
    name: "Underarm Care",
    slug: "underarm-care",
    imageUrl: "",
    description: "Underarm creams and care products",
    subcategories: [
      { name: "Underarm Cream", slug: "underarm-cream" },
    ],
  },
  {
    id: "11",
    name: "Dietary Supplement",
    slug: "dietary-supplement",
    imageUrl: "",
    description: "Capsules, coffee mixes, beauty drinks, fiber drinks & more",
    subcategories: [
      { name: "Capsules (ingestible supplement)", slug: "capsules-ingestible" },
      { name: "Coffee Mix Supplement", slug: "coffee-mix-supplement" },
      { name: "Beauty Drink Supplement", slug: "beauty-drink-supplement" },
      { name: "Fiber Drink Supplement", slug: "fiber-drink-supplement" },
    ],
  },
  {
    id: "12",
    name: "Facial Serum",
    slug: "facial-serum",
    imageUrl: "",
    description: "Serums for radiant and healthy skin",
    subcategories: [
      { name: "Facial Serum", slug: "facial-serum" },
    ],
  },
  {
    id: "13",
    name: "Face & Body Soap",
    slug: "face-body-soap",
    imageUrl: "",
    description: "Soap bars and cleansers for face and body",
    subcategories: [
      { name: "Soap (Face & Body)", slug: "soap-face-body" },
    ],
  },
  {
    id: "14",
    name: "Best Sellers",
    slug: "best-sellers",

    imageUrl: "photo-1608679152045-b827c386d312",
    description: "Our most popular products",
    subcategories: [],
  },
  {
    id: "15",
    name: "New Arrivals",
    slug: "new-arrivals",

    imageUrl: "photo-1570172619644-dfd03ed5d881",
    description: "Fresh from the latest collections",
    subcategories: [],
  },
  {
    id: "16",
    name: "Gift Sets & Bundles",
    slug: "gift-sets",

    imageUrl: "photo-1608679152045-b827c386d312",
    description: "Perfect presents and value bundles",
    subcategories: [],
  },
  {
    id: "17",
    name: "Sale & Promotions",
    slug: "sale",

    imageUrl: "photo-1522335789203-aabd1fc54bc9",
    description: "Limited-time offers you don't want to miss",
    subcategories: [],
  },
  {
    id: "18",
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
    id: "19",
    name: "Health & Wellness",
    slug: "health-wellness",

    imageUrl: "photo-1552693673-1bf958298935",
    description: "Collagen, supplements & dietary products",
    subcategories: [
      { name: "Collagen", slug: "collagen" },
      { name: "Glutathione", slug: "glutathione" },
      { name: "Dietary Supplement", slug: "dietary-supplement" },
    ],
  },
];
