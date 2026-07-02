"use client";

import Image from "next/image";
import StarDisplay from "./StarDisplay";
import type { ReviewConfig } from "@/lib/settings-store";

interface Props {
  review: ReviewConfig;
  className?: string;
}

export default function ReviewCard({ review, className = "" }: Props) {
  return (
    <div
      className={`bg-card rounded-2xl border-2 border-dashed border-accent/25 p-6 flex flex-col transition-shadow hover:shadow-lg hover:shadow-accent/5 ${className}`}
    >
      <div className="mb-3">
        <StarDisplay rating={review.rating} size="md" />
      </div>

      <p className="text-foreground text-sm leading-relaxed flex-1 italic">
        &ldquo;{review.text}&rdquo;
      </p>

      <div className="mt-4 pt-4 border-t border-dashed border-accent/20">
        <div className="flex items-center gap-2">
          {review.photoURL ? (
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src={review.photoURL}
                alt=""
                fill
                sizes="28px"
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-[11px] text-accent font-medium shrink-0">
              {review.name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-dark font-semibold text-sm">{review.name}</p>
        </div>
        {review.title && (
          <span className="text-[11px] text-accent font-medium block">{review.title}</span>
        )}
        {review.productName && (
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent/80 text-[10px] font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {review.productName}
          </div>
        )}
      </div>
    </div>
  );
}
