"use client";

import ReviewSection from "./ReviewSection";
import type { ReviewConfig } from "@/lib/settings-store";

interface Props {
  reviews: ReviewConfig[];
}

export default function ReviewsSectionWrapper({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return <ReviewSection reviews={reviews} />;
}
