export const productTypes = [
  "serum",
  "moisturizer",
  "lipstick",
  "foundation",
  "eyeshadow",
  "hair-mask",
  "hair-oil",
  "perfume",
  "perfume-oil",
  "tool",
] as const;

export type ProductType = (typeof productTypes)[number];
