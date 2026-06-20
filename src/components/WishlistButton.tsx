"use client";

import { useState, useEffect } from "react";
import { useToast } from "./Toast";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch {
    return [];
  }
}

function toggleWishlist(id: string): boolean {
  const current = getWishlist();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  localStorage.setItem("wishlist", JSON.stringify(next));
  return next.includes(id);
}

export default function WishlistButton({ productId }: { productId: string }) {
  const { showToast } = useToast();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(getWishlist().includes(productId));
  }, [productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleWishlist(productId);
    setWishlisted(now);
    showToast(now ? "Added to wishlist" : "Removed from wishlist", "info");
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1.5 rounded-full transition-all ${
        wishlisted
          ? "text-red-500 scale-110"
          : "text-gray-900 dark:text-white hover:text-red-500"
      }`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
