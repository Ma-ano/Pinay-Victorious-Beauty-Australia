"use client";

import { useEffect, useState, useRef } from "react";
import { categories } from "@/data/categories";
import { getSettings, saveSettings, type SiteSettings, type FeaturedBrandConfig } from "@/lib/settings-store";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/components/Toast";

const emptyBrand: FeaturedBrandConfig = { brand: "", title: "", description: "", image: "" };

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<FeaturedBrandConfig[]>([emptyBrand, emptyBrand, emptyBrand]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setBrands(s.featuredBrands);
      setCategoryImages(s.categoryImages || {});
      setLoading(false);
    });
  }, []);

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
      const data: SiteSettings = { featuredBrands: brands, categoryImages: cleaned };
      await saveSettings(data);
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
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-dark mb-1">Site Settings</h1>
      <p className="text-sm text-foreground mb-8">Customize your storefront appearance.</p>

      <div className="space-y-6 mb-6">
        <h2 className="font-semibold text-dark text-lg">Featured Brand Slides</h2>
        <p className="text-xs text-foreground -mt-4">
          Configure up to 3 brand slides displayed on the homepage hero banner.
          Recommended image resolution: <strong>1600×900px (16:9)</strong> for best quality.
        </p>

        {brands.map((brand, i) => (
          <div key={i} className="bg-card rounded-2xl border border-card-border p-6 space-y-4">
            <h3 className="font-semibold text-dark text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              Slide {i + 1}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand.brand}
                  onChange={(e) => updateBrand(i, "brand", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="e.g. COSRX"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={brand.title}
                  onChange={(e) => updateBrand(i, "title", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Headline for the slide"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-foreground mb-1">Description</label>
              <textarea
                rows={2}
                value={brand.description}
                onChange={(e) => updateBrand(i, "description", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                placeholder="Brief description for the slide"
              />
            </div>

            <div>
              <label className="block text-xs text-foreground mb-1">Background Image</label>
              <p className="text-[11px] text-foreground mb-2">
                Recommended resolution: <strong>1600×900px</strong> (16:9 landscape). Max file size: 2MB.
              </p>
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={uploading === `brand-${i}`}
                      onClick={() => fileInputRefs.current[`brand-${i}`]?.click()}
                      className="px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                      {uploading === `brand-${i}` ? "Uploading..." : "Upload Image"}
                    </button>
                    {brand.image && (
                      <button
                        type="button"
                        onClick={() => updateBrand(i, "image", "")}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    ref={(el) => { fileInputRefs.current[`brand-${i}`] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBrandUpload(i, file);
                      e.target.value = "";
                    }}
                  />
                </div>
                {brand.image && (
                  <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-primary/10 border border-card-border">
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

      <div className="bg-card rounded-2xl border border-card-border p-6 space-y-6 mb-6">
        <h2 className="font-semibold text-dark text-sm">Category Images</h2>
        <p className="text-xs text-foreground -mt-4">
          Upload an image for each category displayed on the homepage.
          Recommended resolution: <strong>400×400px</strong> (1:1 square).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const imgUrl = categoryImages[cat.slug] || "";
            const isUploading = uploading === cat.slug;
            return (
              <div key={cat.slug} className="space-y-2">
                <label className="block text-xs font-medium text-dark">{cat.name}</label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRefs.current[cat.slug]?.click()}
                        className="px-3 py-2 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </button>
                      {imgUrl && (
                        <button
                          type="button"
                          onClick={() => setCategoryImages((prev) => ({ ...prev, [cat.slug]: "" }))}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      ref={(el) => { fileInputRefs.current[cat.slug] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCategoryUpload(cat.slug, file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  {imgUrl && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-primary/10 border border-card-border">
                      <img
                        src={imgUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
