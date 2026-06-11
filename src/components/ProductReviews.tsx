"use client";

import { useState, useMemo } from "react";
import { reviews as allReviews, getReviewsByProductId, type Review } from "@/data/reviews";
import { useToast } from "./Toast";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const reviewers = ["Alice K.", "Bella M.", "Daisy R.", "Freya L.", "Georgia P.", "Hazel W.", "Iris J.", "Jasmine S.", "Kiera B.", "Luna D.", "Maya T.", "Natalie C.", "Olivia H.", "Piper F.", "Quinn A.", "Rose N.", "Skye V.", "Violet G.", "Willow Z.", "Zara Y."];

const reviewTemplates = [
  "Absolutely love this product! Exceeded my expectations in every way.",
  "Great quality for the price. Would definitely recommend to friends.",
  "I've been using this for a few weeks now and I'm really impressed.",
  "Beautiful product with excellent quality. Arrived quickly and well-packaged.",
  "Really happy with my purchase. The quality is outstanding.",
  "Perfect for my daily routine. I use it every day without fail.",
  "Lovely product but I wish it lasted a bit longer. Still very good.",
  "Exceeded expectations! Will definitely be buying more from this brand.",
  "Nice product overall. Does exactly what it promises.",
  "Super happy with this! The quality is fantastic and it looks beautiful.",
];

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(() => getReviewsByProductId(productId));
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formContent, setFormContent] = useState("");

  const sorted = useMemo(() => {
    const copy = [...reviews];
    switch (sortBy) {
      case "newest": return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "oldest": return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "highest": return copy.sort((a, b) => b.rating - a.rating);
      case "lowest": return copy.sort((a, b) => a.rating - b.rating);
      default: return copy;
    }
  }, [reviews, sortBy]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRating || !formName || !formContent) {
      showToast("Please fill in all fields", "info");
      return;
    }
    const newReview: Review = {
      id: `r-${Date.now()}`,
      productId,
      author: formName.trim(),
      rating: formRating,
      content: formContent.trim(),
      date: new Date().toISOString().split("T")[0],
      isVerified: false,
    };
    setReviews((prev) => [newReview, ...prev]);
    setFormRating(0);
    setFormName("");
    setFormEmail("");
    setFormContent("");
    setShowForm(false);
    showToast("Review submitted! Thank you.", "success");
  }

  return (
    <div className="mt-16 border-t border-card-border pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-dark">{avgRating} out of 5</span>
            <span className="text-sm text-foreground">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent/80 transition-all"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 p-6 rounded-2xl bg-card border border-card-border space-y-4">
          <h3 className="font-semibold text-dark text-sm">Write a Review for {productName}</h3>
          <div>
            <p className="text-sm text-foreground mb-2">Your Rating *</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setFormRating(i + 1)} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} className="p-0.5 focus:outline-none">
                  <svg className={`w-7 h-7 cursor-pointer transition-colors ${(hoverRating || formRating) > i ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="text-sm text-foreground ml-2">{formRating > 0 ? `${formRating}/5` : "Select"}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="review-name" className="block text-sm text-foreground mb-1">Name *</label>
              <input id="review-name" type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm" />
            </div>
            <div>
              <label htmlFor="review-email" className="block text-sm text-foreground mb-1">Email</label>
              <input id="review-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="review-content" className="block text-sm text-foreground mb-1">Your Review *</label>
            <textarea id="review-content" rows={3} value={formContent} onChange={(e) => setFormContent(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm resize-none" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-all">Submit Review</button>
        </form>
      )}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-foreground">{sorted.length} {sorted.length === 1 ? "review" : "reviews"}</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
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
          <p className="mt-4 text-foreground text-sm">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((review) => (
            <div key={review.id} className="p-5 rounded-2xl bg-card border border-card-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">{review.author}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
                {review.isVerified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium border border-green-200">
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-foreground leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
