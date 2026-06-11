export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Skincare",
    slug: "skincare",
    imageUrl: "photo-1777840347880-747242e0db00",
    description: "Nourish and rejuvenate your skin",
  },
  {
    id: "2",
    name: "Makeup",
    slug: "makeup",
    imageUrl: "photo-1770622006339-5a7a91c36e05",
    description: "Express your unique beauty",
  },
  {
    id: "3",
    name: "Haircare",
    slug: "haircare",
    imageUrl: "photo-1526947425960-945c6e72858f",
    description: "Luxurious care for your hair",
  },
  {
    id: "4",
    name: "Fragrances",
    slug: "fragrances",
    imageUrl: "photo-1541643600914-78b084683601",
    description: "Captivating scents for every moment",
  },
  {
    id: "5",
    name: "Beauty Tools",
    slug: "beauty-tools",
    imageUrl: "photo-1570172619644-dfd03ed5d881",
    description: "Professional tools for your routine",
  },
  {
    id: "6",
    name: "Bath & Body",
    slug: "bath-body",
    imageUrl: "photo-1574621100236-d25b64cfd647",
    description: "Pamper yourself with luxury",
  },
  {
    id: "7",
    name: "Wellness",
    slug: "wellness",
    imageUrl: "photo-1552693673-1bf958298935",
    description: "Mind, body & soul care",
  },
  {
    id: "8",
    name: "Gifts & Sets",
    slug: "gifts-sets",
    imageUrl: "photo-1608679152045-b827c386d312",
    description: "Perfect presents for loved ones",
  },
];
