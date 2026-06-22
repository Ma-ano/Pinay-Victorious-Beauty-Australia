export function roundRating(rating: number): number {
  if (rating <= 0) return 0;
  return Math.round(rating * 2) / 2;
}

export function getStarType(starIndex: number, rating: number): "full" | "half" | "empty" {
  const rounded = roundRating(rating);
  const diff = rounded - starIndex;
  if (diff >= 1) return "full";
  if (diff >= 0.5) return "half";
  return "empty";
}
