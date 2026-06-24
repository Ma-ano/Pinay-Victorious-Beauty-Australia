export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
  return `AU${formatted}`;
}
