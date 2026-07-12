export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
  return `AU${formatted}`;
}

export function formatPhone(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+61")) {
    const digits = cleaned.slice(3).replace(/\D/g, "").slice(0, 9);
    let result = "+61";
    if (digits.length > 0) {
      result += " " + digits.slice(0, 3);
      if (digits.length > 3) result += " " + digits.slice(3, 6);
      if (digits.length > 6) result += " " + digits.slice(6, 9);
    } else {
      result += " ";
    }
    return result;
  }
  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return "+61 ";
  if (digits === "6") return "+6";
  let result = "+61";
  if (digits.length > 0) {
    result += " " + digits.slice(0, 3);
    if (digits.length > 3) result += " " + digits.slice(3, 6);
    if (digits.length > 6) result += " " + digits.slice(6, 9);
  } else {
    result += " ";
  }
  return result;
}
