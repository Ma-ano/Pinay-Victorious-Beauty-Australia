"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where, type Timestamp } from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";

const db = firebaseDb!;
import StarDisplay from "@/components/StarDisplay";
import { roundRating } from "@/lib/review-utils";
import { getReviewsByProductId, type Review } from "@/data/reviews";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface FirestoreReview {
  productId: string;
  author: string;
  rating: number;
  content: string;
  variantName?: string | null;
  isVerified: boolean;
  createdAt?: Timestamp;
}

function ExpandableReview({ content }: { content: string }) {
  if (!content) return null;
  const [expanded, setExpanded] = useState(false);
  const long = content.length > 200;
  return (
    <div>
      <p className={`mt-3 text-sm text-foreground leading-relaxed break-words ${!expanded && long ? "line-clamp-3" : ""}`}>
        {content}
      </p>
      {long && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-accent hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function mapFirestoreReview(id: string, review: FirestoreReview): Review {
  return {
    id,
    productId: review.productId,
    author: review.author || "Customer",
    rating: Number(review.rating || 0),
    content: review.content || "",
    date: review.createdAt
      ? review.createdAt.toDate().toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    isVerified: review.isVerified === true,
    variantName: review.variantName || undefined,
  };
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [persistedReviews, setPersistedReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const reviewsQuery = query(collection(db, "reviews"), where("productId", "==", productId));
    return onSnapshot(reviewsQuery, (snapshot) => {
      setPersistedReviews(
        snapshot.docs.map((docSnap) => mapFirestoreReview(docSnap.id, docSnap.data() as FirestoreReview))
      );
    });
  }, [productId]);

  const reviews = useMemo(() => [
    ...persistedReviews,
    ...getReviewsByProductId(productId),
  ], [persistedReviews, productId]);

  const sorted = useMemo(() => {
    const copy = [...reviews];
    switch (sortBy) {
      case "newest":
        return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "oldest":
        return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "highest":
        return copy.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return copy.sort((a, b) => a.rating - b.rating);
      default:
        return copy;
    }
  }, [reviews, sortBy]);

  const avgRating = reviews.length > 0
    ? roundRating(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-16 border-t border-card-border pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarDisplay rating={Number(avgRating)} size="md" />
            <span className="text-sm font-medium text-dark">{avgRating} out of 5</span>
            <span className="text-sm text-foreground">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>
        </div>
        <p className="text-sm text-foreground max-w-sm">
          Reviews for {productName} come from customers with delivered orders.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-foreground">{sorted.length} {sorted.length === 1 ? "review" : "reviews"}</p>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="text-sm border border-card-border rounded-lg px-3 py-1.5 bg-card text-dark focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="mt-4 text-foreground text-sm">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((review) => (
            <div key={review.id} className="p-5 rounded-2xl bg-card border border-card-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">{review.author}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <StarDisplay rating={review.rating} />
                      </div>
                      <span className="text-xs text-foreground">{review.date}</span>
                      {review.variantName && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-foreground">
                          {review.variantName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {review.isVerified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium border border-green-200">
                    Verified Purchase
                  </span>
                )}
              </div>
              <ExpandableReview content={review.content} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
