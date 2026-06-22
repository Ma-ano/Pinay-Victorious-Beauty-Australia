import type { Promotion } from "@/lib/promotions-store";

export function isPromotionActive(promo: Promotion): boolean {
  if (!promo.active) return false;

  const now = new Date();
  const startDate = promo.startDate ? new Date(promo.startDate) : null;
  const endDate = promo.expires ? new Date(promo.expires) : null;

  if (startDate && startDate > now) return false;
  if (endDate && endDate < now) return false;

  return true;
}

export function getValidPromotions(promos: Promotion[]): Promotion[] {
  return promos.filter(isPromotionActive);
}

export function findBestPromotion(promos: Promotion[]): Promotion | null {
  const valid = getValidPromotions(promos);
  if (valid.length === 0) return null;

  return valid.reduce((best, current) => {
    if (current.type === "Free Shipping") {
      return best.type === "Free Shipping" ? best : current;
    }
    if (best.type === "Free Shipping") return current;
    return current.discount > best.discount ? current : best;
  });
}

export function calculateDiscount(promo: Promotion, subtotal: number): number {
  if (!isPromotionActive(promo)) return 0;

  switch (promo.type) {
    case "Percentage":
      return subtotal * (promo.discount / 100);
    case "Fixed Amount":
      return Math.min(promo.discount, subtotal);
    case "Free Shipping":
      return 0;
    default:
      return 0;
  }
}

export function getFinalPrice(originalPrice: number, promo: Promotion | null): number {
  if (!promo) return originalPrice;
  const discount = calculateDiscount(promo, originalPrice);
  return Math.max(0, originalPrice - discount);
}
