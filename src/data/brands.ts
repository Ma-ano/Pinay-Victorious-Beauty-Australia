export const brands = [
  "GlowLab",
  "Lushé",
  "PureBloom",
  "Velvet & Co.",
] as const;

export type Brand = (typeof brands)[number];
