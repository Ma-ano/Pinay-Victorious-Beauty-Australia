"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";
import { categories } from "@/data/categories";
import { getSettings, saveSettings, type SiteSettings, type FeaturedBrandConfig, type ReviewConfig } from "@/lib/settings-store";
import { uploadImage } from "@/lib/storage";
import { getAllReviews } from "@/lib/product-store";
import { useToast } from "@/components/Toast";

const db = firebaseDb!;

const emptyBrand: FeaturedBrandConfig = { brand: "", title: "", description: "", image: "" };

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<FeaturedBrandConfig[]>([emptyBrand, emptyBrand, emptyBrand]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [saleBannerTitle, setSaleBannerTitle] = useState("");
  const [saleBannerSubtitle, setSaleBannerSubtitle] = useState("");
  const [saleBannerDiscount, setSaleBannerDiscount] = useState("");
  const [reviews, setReviews] = useState<ReviewConfig[]>([]);
  const [allReviews, setAllReviews] = useState<{ id: string; author: string; rating: number; content: string; isVerified: boolean; productName?: string; userId?: string }[]>([]);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialRef = useRef("");

  useEffect(() => {
    Promise.all([
      getSettings(),
      getAllReviews(),
    ]).then(([s, fetchedReviews]) => {
      setBrands(s.featuredBrands);
      setCategoryImages(s.categoryImages || {});
      setSaleBannerTitle(s.saleBannerTitle || "");
      setSaleBannerSubtitle(s.saleBannerSubtitle || "");
      setSaleBannerDiscount(s.saleBannerDiscount || "");
      setReviews(s.reviews || []);
      setAllReviews(fetchedReviews);
      const savedIds = new Set((s.reviews || []).map((r) => (r as any)._id).filter(Boolean));
      setSelectedReviewIds(savedIds);
      initialRef.current = JSON.stringify({ brands: s.featuredBrands, categoryImages: s.categoryImages || {}, saleBannerTitle: s.saleBannerTitle || "", saleBannerSubtitle: s.saleBannerSubtitle || "", saleBannerDiscount: s.saleBannerDiscount || "", reviews: s.reviews || [] });

      // batch-fetch user avatars
      const userIds = [...new Set(fetchedReviews.map((r) => r.userId).filter(Boolean))] as string[];
      if (userIds.length > 0) {
        Promise.all(
          userIds.map((uid) =>
            getDoc(doc(db, "users", uid))
              .then((snap) => (snap.exists() ? snap.data().photoURL || "" : ""))
              .catch(() => "")
          )
        ).then((urls) => {
          const map: Record<string, string> = {};
          userIds.forEach((uid, i) => { if (urls[i]) map[uid] = urls[i]; });
          setUserAvatars(map);
        });
      }

      setLoading(false);
    });
  }, []);

  const hasChanges = useMemo(() => {
    const current = JSON.stringify({ brands, categoryImages, saleBannerTitle, saleBannerSubtitle, saleBannerDiscount, reviews });
    return current !== initialRef.current;
  }, [brands, categoryImages, saleBannerTitle, saleBannerSubtitle, saleBannerDiscount, reviews]);

  function updateBrand(index: number, field: keyof FeaturedBrandConfig, value: string) {
    setBrands((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleBrandUpload(index: number, file: File) {
    const key = `brand-${index}`;
    setUploading(key);
    try {
      const path = `featured-brands/slide-${index}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      updateBrand(index, "image", url);
      showToast(`Slide ${index + 1} image uploaded`, "success");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(null);
    }
  }

  async function handleCategoryUpload(slug: string, file: File) {
    setUploading(slug);
    try {
      const path = `categories/${slug}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setCategoryImages((prev) => ({ ...prev, [slug]: url }));
      showToast(`${slug} image uploaded`, "success");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleaned: Record<string, string> = {};
      for (const [slug, url] of Object.entries(categoryImages)) {
        if (url) cleaned[slug] = url;
      }
      const data: SiteSettings = {
        featuredBrands: brands,
        categoryImages: cleaned,
        saleBannerTitle,
        saleBannerSubtitle,
        saleBannerDiscount,
        reviews,
      };
      await saveSettings(data);
      initialRef.current = JSON.stringify({ brands, categoryImages: cleaned, saleBannerTitle, saleBannerSubtitle, saleBannerDiscount, reviews });
      showToast("Settings saved", "success");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h1 className="text-2xl font-bold text-dark mb-1">Site Settings</h1>
      <p className="text-sm text-foreground mb-8">Customize your storefront appearance.</p>

      <div className="bg-card rounded-2xl border border-card-border p-4 space-y-3 mb-6">
        <div>
          <h2 className="font-semibold text-dark text-sm">Featured Brand Slides</h2>
          <p className="text-[11px] text-foreground/80 mt-0.5">
            Configure up to 3 brand slides displayed on the homepage hero banner.
            Recommended image resolution: <strong>1600×900px (16:9)</strong> for best quality.
          </p>
        </div>

        {brands.map((brand, i) => (
          <div key={i} className="bg-[var(--background)] rounded-xl border border-card-border p-4 space-y-3">
            <h3 className="font-semibold text-dark text-xs flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] flex items-center justify-center font-bold">
                {i + 1}
              </span>
              Slide {i + 1}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-foreground mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand.brand}
                  onChange={(e) => updateBrand(i, "brand", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="e.g. COSRX"
                />
              </div>
              <div>
                <label className="block text-[11px] text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={brand.title}
                  onChange={(e) => updateBrand(i, "title", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Headline for the slide"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-foreground mb-1">Description</label>
              <textarea
                rows={2}
                value={brand.description}
                onChange={(e) => updateBrand(i, "description", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                placeholder="Brief description for the slide"
              />
            </div>

            <div>
              <label className="block text-[11px] text-foreground mb-1">Background Image</label>
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={uploading === `brand-${i}`}
                      onClick={() => fileInputRefs.current[`brand-${i}`]?.click()}
                      className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-[11px] font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                      {uploading === `brand-${i}` ? "Uploading..." : "Upload Image"}
                    </button>
                    {brand.image && (
                      <button
                        type="button"
                        onClick={() => updateBrand(i, "image", "")}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    ref={(el) => { fileInputRefs.current[`brand-${i}`] = el; }}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBrandUpload(i, file);
                      e.target.value = "";
                    }}
                  />
                </div>
                {brand.image && (
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-primary/10 border border-card-border">
                    <img
                      src={brand.image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-card-border p-4 space-y-3 mb-6">
        <div>
          <h2 className="font-semibold text-dark text-sm">Category Images</h2>
          <p className="text-[11px] text-foreground/80 mt-0.5">
            Upload images for the homepage category section. 400×400px recommended.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const imgUrl = categoryImages[cat.slug] || "";
            const isUploading = uploading === cat.slug;
            return (
              <div key={cat.slug} className="bg-[var(--background)] rounded-lg border border-card-border p-2 space-y-1.5">
                <label className="block text-[11px] font-medium text-dark truncate">{cat.name}</label>
                <div className="flex gap-1 items-center">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRefs.current[cat.slug]?.click()}
                    className="px-2 py-1 rounded bg-accent/10 text-accent text-[10px] font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "..." : "Upload"}
                  </button>
                  {imgUrl && (
                    <button
                      type="button"
                      onClick={() => setCategoryImages((prev) => ({ ...prev, [cat.slug]: "" }))}
                      className="px-2 py-1 rounded bg-red-50 text-red-500 text-[10px] font-medium hover:bg-red-100 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { fileInputRefs.current[cat.slug] = el; }}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCategoryUpload(cat.slug, file);
                    e.target.value = "";
                  }}
                />
                <div className="w-full aspect-square rounded overflow-hidden bg-primary/10 border border-card-border">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-card-border p-4 space-y-3 mb-6">
        <h2 className="font-semibold text-dark text-sm">Sale Banner</h2>
        <p className="text-[11px] text-foreground/80 -mt-1.5">
          Customize the sale banner shown on the homepage.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-foreground mb-1">Title</label>
            <input type="text" value={saleBannerTitle}
              onChange={(e) => setSaleBannerTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Limited Time" />
          </div>
          <div>
            <label className="block text-[11px] text-foreground mb-1">Subtitle</label>
            <input type="text" value={saleBannerSubtitle}
              onChange={(e) => setSaleBannerSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="On selected skincare and makeup essentials" />
          </div>
          <div>
            <label className="block text-[11px] text-foreground mb-1">Discount %</label>
            <input type="text" value={saleBannerDiscount}
              onChange={(e) => setSaleBannerDiscount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="30" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-card-border p-4 space-y-3 mb-6">
        <div>
          <h2 className="font-semibold text-dark text-sm">Customer Reviews</h2>
          <p className="text-[11px] text-foreground/80 mt-0.5">
            Select existing customer reviews to showcase on the homepage.
          </p>
        </div>

        {allReviews.length === 0 ? (
          <p className="text-xs text-foreground/60 text-center py-4">No customer reviews found yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
            {allReviews.map((review) => {
              const checked = selectedReviewIds.has(review.id);
              const avatarUrl = review.userId ? userAvatars[review.userId] : "";
              return (
                <label
                  key={review.id}
                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "border-accent bg-accent/5"
                      : "border-card-border bg-[var(--background)] hover:border-accent/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedReviewIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(review.id)) {
                          next.delete(review.id);
                        } else {
                          next.add(review.id);
                        }
                        return next;
                      });
                      setReviews((prev) => {
                        if (checked) return prev.filter((r) => r._id !== review.id);
                        return [...prev, { _id: review.id, name: review.author, rating: review.rating, text: review.content, title: review.isVerified ? "Verified Buyer" : undefined, productName: review.productName, photoURL: avatarUrl || undefined }];
                      });
                    }}
                    className="mt-1 shrink-0 accent-accent"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[9px] text-accent font-medium shrink-0">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-dark text-xs truncate">{review.author}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-yellow-400 text-xs leading-none">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className="text-[10px] text-foreground/40 font-mono">{review.rating}/5</span>
                    </div>
                    <p className="text-foreground/80 text-[11px] mt-0.5 line-clamp-1">{review.content}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {reviews.length > 0 && (
          <div>
            <p className="text-[11px] text-foreground/70 font-medium mb-1.5">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} selected for homepage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reviews.map((r, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent text-[11px] font-medium">
                  {r.name}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReviewIds((prev) => {
                        const next = new Set(prev);
                        if (r._id) next.delete(r._id);
                        return next;
                      });
                      setReviews((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          hasChanges
            ? "bg-accent text-white hover:bg-accent/80"
            : "bg-primary/10 text-foreground cursor-not-allowed"
        }`}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
