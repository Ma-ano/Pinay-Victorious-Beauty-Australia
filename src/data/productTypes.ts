export const productTypes = [
  "cream",
  "lotion",
  "gel",
  "serum",
  "soap",
  "capsule-topical",
  "capsule-oral",
  "powder-drink",
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
