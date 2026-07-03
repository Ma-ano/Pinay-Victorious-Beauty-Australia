"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { productTypes } from "@/data/productTypes";
import { categories } from "@/data/categories";
import type { Product, ProductImage } from "@/data/products";
import { getAllProducts, getProductsByIds, saveProduct, deleteProduct } from "@/lib/product-store";
import { uploadImage, deleteImage } from "@/lib/storage";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/lib/format";
import SearchableSelect from "@/components/SearchableSelect";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

interface VariantForm {
  id: string;
  name: string;
  inStock: boolean;
  stock: string;
  price: string;
  originalPrice: string;
}

interface ProductForm {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  type: string;
  brand: string;
  price: string;
  originalPrice: string;
  salePrice: string;
  description: string;
  detail: string;
  shippingReturns: string;
  ingredients: string;
  images: ProductImage[];
  variants: VariantForm[];
  isSale: boolean;
  isNew: boolean;
  discount: string;
  stock: string;
  isBundle: boolean;
  bundleItems: string[];
  bundlePrice: string;
}

function emptyForm(): ProductForm {
  return {
    name: "",
    slug: "",
    category: "",
    subcategory: "",
    type: "",
    brand: "",
    price: "",
    originalPrice: "",
    salePrice: "",
    description: "",
    detail: "",
    shippingReturns: "",
    ingredients: "",
    images: [],
    variants: [],
    isSale: false,
    isNew: false,
    discount: "",
    stock: "",
    isBundle: false,
    bundleItems: [],
    bundlePrice: "",
  };
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterAvailability, setFilterAvailability] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterHasImages, setFilterHasImages] = useState<"all" | "yes" | "no">("all");
  const [filterHasVariants, setFilterHasVariants] = useState<"all" | "yes" | "no">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bundleSearch, setBundleSearch] = useState("");

  const bundleAutoSum = useMemo(() => {
    if (form.bundleItems.length === 0) return 0;
    return products
      .filter((p) => form.bundleItems.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
  }, [form.bundleItems, products]);

  const bundleMinStock = useMemo(() => {
    if (form.bundleItems.length === 0) return 0;
    const selected = products.filter((p) => form.bundleItems.includes(p.id));
    if (selected.length === 0) return 0;
    const stocks = selected.map((p) => {
      if (p.variants && p.variants.length > 0) {
        return p.variants.reduce((sum, v) => sum + ((v as { stock?: number }).stock ?? 0), 0);
      }
      return p.stock ?? 0;
    });
    return Math.min(...stocks);
  }, [form.bundleItems, products]);

  useEffect(() => {
    getAllProducts().then((all) => {
      setProducts(all);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const el = document.body;
    if (showForm) {
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = "";
    }
    return () => { el.style.overflow = ""; };
  }, [showForm]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && showForm) {
        setShowForm(false);
        setEditingId(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showForm]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCategory) count++;
    if (filterType) count++;
    if (filterBrand) count++;
    if (filterAvailability !== "all") count++;
    if (filterMinPrice || filterMaxPrice) count++;
    if (filterHasImages !== "all") count++;
    if (filterHasVariants !== "all") count++;
    return count;
  }, [filterCategory, filterType, filterBrand, filterAvailability, filterMinPrice, filterMaxPrice, filterHasImages, filterHasVariants]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (search) {
          const q = search.toLowerCase();
          const variantNames = (p.variants || []).map((v) => v.name.toLowerCase()).join(" ");
          const searchable = [p.name, p.category, p.subcategory || "", p.type, p.brand || "", variantNames, p.id].join(" ").toLowerCase();
          if (!searchable.includes(q)) return false;
        }

        if (filterCategory && p.category !== filterCategory) return false;
        if (filterType && p.type !== filterType) return false;
        if (filterBrand && !(p.brand || "").toLowerCase().includes(filterBrand.toLowerCase())) return false;

        if (filterAvailability !== "all") {
          const hasStock = p.variants && p.variants.length > 0
            ? p.variants.some((v) => v.inStock)
            : (p.stock ?? 0) > 0;
          if (filterAvailability === "in-stock" && !hasStock) return false;
          if (filterAvailability === "out-of-stock" && hasStock) return false;
        }

        if (filterMinPrice && p.price < parseFloat(filterMinPrice)) return false;
        if (filterMaxPrice && p.price > parseFloat(filterMaxPrice)) return false;

        if (filterHasImages === "yes" && (!p.images || p.images.length === 0)) return false;
        if (filterHasImages === "no" && p.images && p.images.length > 0) return false;

        if (filterHasVariants === "yes" && (!p.variants || p.variants.length === 0)) return false;
        if (filterHasVariants === "no" && p.variants && p.variants.length > 0) return false;

        return true;
      }),
    [products, search, filterCategory, filterType, filterBrand, filterAvailability,
     filterMinPrice, filterMaxPrice, filterHasImages, filterHasVariants]
  );

  const excludedCategorySlugs = useMemo(() => new Set(["best-sellers", "new-arrivals", "gift-sets", "sale"]), []);

  const categoryOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (const cat of categories) {
      if (excludedCategorySlugs.has(cat.slug)) continue;
      options.push({ value: cat.slug, label: cat.name });
    }
    return options;
  }, [excludedCategorySlugs]);

  const categoryLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of categoryOptions) {
      map[opt.value] = opt.label;
    }
    return map;
  }, [categoryOptions]);

  const subcategoryOptions = useMemo(() => {
    const cat = categories.find((c) => c.slug === form.category);
    if (!cat) return [];
    return cat.subcategories.map((sub) => ({ value: sub.slug, label: sub.name }));
  }, [form.category]);

  const subcategoryLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of subcategoryOptions) {
      map[opt.value] = opt.label;
    }
    return map;
  }, [subcategoryOptions]);

  function startAdd() {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      subcategory: product.subcategory || "",
      type: product.type,
      brand: product.brand,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
      salePrice: product.salePrice ? product.salePrice.toString() : "",
      description: product.description,
      detail: product.detail || "",
      shippingReturns: product.shippingReturns || "",
      ingredients: product.ingredients || "",
      images: product.images || [],
      variants: (product.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        inStock: v.inStock,
        stock: v.stock !== undefined ? String(v.stock) : "",
        price: v.price !== undefined ? String(v.price) : "",
        originalPrice: v.originalPrice !== undefined ? String(v.originalPrice) : "",
      })),
      isSale: product.isSale || false,
      isNew: product.isNew || false,
      discount: product.discount ? product.discount.toString() : "",
      stock: product.stock?.toString() || "",
      isBundle: product.isBundle || false,
      bundleItems: product.bundleItems || [],
      bundlePrice: product.bundlePrice ? product.bundlePrice.toString() : "",
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function updateField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name") {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...prev.images, { url: "", name: "" }] }));
  }

  async function handleImageUpload(index: number, file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      showToast("Image must be under 5MB", "error");
      return;
    }
    setUploadingImage(index);
    try {
      const path = `products/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setForm((prev) => {
        const images = [...prev.images];
        images[index] = { ...images[index], url };
        return { ...prev, images };
      });
    } catch {
      showToast("Failed to upload image", "error");
    } finally {
      setUploadingImage(null);
    }
  }

  function updateImage(index: number, field: keyof ProductImage, value: string) {
    setForm((prev) => {
      const images = [...prev.images];
      images[index] = { ...images[index], [field]: value };
      return { ...prev, images };
    });
  }

  function removeImage(index: number) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { id: `v-${Date.now()}`, name: "", inStock: true, stock: "", price: "", originalPrice: "" }],
    }));
  }

  function updateVariant(index: number, field: keyof VariantForm, value: string | boolean) {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  }

  function removeVariant(index: number) {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const name = stripHtml(form.name.trim());
    if (!name) { showToast("Product name is required", "error"); return; }
    if (!form.isBundle && !form.category) { showToast("Category is required", "error"); return; }
    if (!form.isBundle && !form.type) { showToast("Type is required", "error"); return; }

    if (!form.isBundle) {
      const price = parseFloat(form.price);
      if (form.variants.length > 0) {
        const invalidVariant = form.variants.find(v => !v.price || parseFloat(v.price) <= 0);
        if (invalidVariant) {
          showToast(`Variant "${invalidVariant.name || '(unnamed)'}" must have a price greater than 0`, "error");
          return;
        }
      } else if (isNaN(price) || price <= 0) {
        showToast("Price must be greater than 0", "error");
        return;
      }
    }

    const description = stripHtml(form.description.trim());
    if (!description) { showToast("Description is required", "error"); return; }
    const detail = stripHtml(form.detail.trim());
    if (!detail) { showToast("Product detail is required", "error"); return; }
    const ingredients = stripHtml(form.ingredients.trim());
    if (!ingredients) { showToast("Ingredients is required", "error"); return; }

    if (form.images.length === 0 || !form.images[0].url) {
      showToast("At least one product image is required", "error");
      return;
    }

    setSaving(true);
    try {
      const slug = form.slug || slugify(name);

      const parsedPrice = form.isBundle ? 0 : parseFloat(form.price);
      const effectivePrice = form.variants.length > 0
        ? (parseFloat(form.variants[0].price) || 0)
        : (form.isBundle ? 0 : parsedPrice);
      const salePrice = form.isSale && effectivePrice > 0 ? effectivePrice : undefined;

      const isBundle = form.isBundle;
      const bundleAutoSum = isBundle && form.bundleItems.length > 0
        ? products.filter((p) => form.bundleItems.includes(p.id)).reduce((sum, p) => sum + p.price, 0)
        : 0;
      const finalBundlePrice = isBundle
        ? (form.bundlePrice ? parseFloat(form.bundlePrice) : bundleAutoSum)
        : undefined;

      const id = await saveProduct(editingId, {
        name,
        slug,
        category: isBundle ? "gift-sets" : form.category,
        subcategory: isBundle ? undefined : (form.subcategory || undefined),
        type: form.type,
        brand: form.brand,
        price: isBundle ? (finalBundlePrice || 0) : effectivePrice,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        salePrice,
        description,
        detail,
        shippingReturns: stripHtml(form.shippingReturns.trim()),
        ingredients,
        images: form.images.filter((img) => img.url),
        variants: form.variants.filter((v) => v.name.trim()).map((v) => ({
          id: v.id,
          name: v.name.trim(),
          inStock: v.inStock,
          stock: v.stock !== "" ? parseInt(v.stock) : undefined,
          price: v.price !== "" ? parseFloat(v.price) : undefined,
          originalPrice: v.originalPrice !== "" ? parseFloat(v.originalPrice) : undefined,
        })),
        isSale: form.isSale,
        isNew: form.isNew,
        discount: form.discount ? parseInt(form.discount) : undefined,
        stock: isBundle ? bundleMinStock : (form.stock !== "" ? parseInt(form.stock) : undefined),
        isBundle,
        bundleItems: isBundle ? form.bundleItems : [],
        bundlePrice: finalBundlePrice,
      });
      const all = await getAllProducts();
      setProducts(all);
      showToast(editingId ? "Product updated" : "Product created", "success");
      cancelForm();
    } catch (err) {
      showToast("Failed to save product", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const product = products.find((p) => p.id === id);
      if (product?.images) {
        await Promise.allSettled(product.images.map((img) => deleteImage(img.url)));
      }
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted", "success");
      setDeleteConfirm(null);
    } catch (err) {
      const msg = err instanceof Error && err.message === "permission-denied"
        ? "Cannot delete: Firestore rules need to be deployed. Run firebase deploy --only firestore"
        : "Failed to delete product";
      showToast(msg, "error");
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Products</h1>
          <p className="text-sm text-foreground mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={startAdd}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div
            className="bg-card border border-card-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto px-6 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
<div className="sticky top-0 bg-card z-10 flex items-center justify-between pt-6 pb-4 border-b border-card-border">
  <h2 className="font-semibold text-sm text-dark">
    {editingId ? "Edit Product" : "Add Product"}
  </h2>
  <button onClick={cancelForm} className="text-foreground hover:text-dark" aria-label="Close">
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="pt-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Basic Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-foreground mb-1">Product Name *</label>
                    <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="e.g. Radiance Glow Serum" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-foreground mb-1">Slug</label>
                    <input type="text" value={form.slug} readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card/50 text-foreground/60 font-mono text-xs"
                      placeholder="Auto-generated from name" />
                    <p className="text-[11px] text-foreground/70 mt-1">Auto-generated from product name</p>
                  </div>
                  <div className={form.isBundle ? "opacity-40 pointer-events-none" : ""}>
                    <label className="block text-xs text-foreground mb-1">Category *</label>
                    {form.isBundle ? (
                      <div className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground/60">
                        Gift Sets &amp; Bundles
                      </div>
                    ) : (
                      <SearchableSelect
                        value={form.category}
                        onChange={(val) => { updateField("category", val); updateField("subcategory", ""); }}
                        options={categoryOptions}
                        placeholder="Type to search category..."
                        required
                      />
                    )}
                    {form.isBundle && (
                      <p className="text-[11px] text-foreground/70 mt-1">Auto-assigned to Gift Sets &amp; Bundles</p>
                    )}
                  </div>
                  <div className={form.isBundle ? "opacity-40 pointer-events-none" : ""}>
                    <label className="block text-xs text-foreground mb-1">Subcategory</label>
                    {form.isBundle ? (
                      <div className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground/60">
                        —
                      </div>
                    ) : (
                      <SearchableSelect
                        value={form.subcategory}
                        onChange={(val) => updateField("subcategory", val)}
                        options={subcategoryOptions}
                        placeholder={form.category ? "Type to search subcategory..." : "Select a category first"}
                      />
                    )}
                    {form.isBundle && (
                      <p className="text-[11px] text-foreground/70 mt-1">Not applicable for bundle sets</p>
                    )}
                  </div>
                  <div className={form.isBundle ? "opacity-40 pointer-events-none" : ""}>
                    <label className="block text-xs text-foreground mb-1">Type *</label>
                    {form.isBundle ? (
                      <div className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm text-foreground/60">
                        —
                      </div>
                    ) : (
                      <select value={form.type} onChange={(e) => updateField("type", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" required>
                        <option value="">Select type</option>
                        {productTypes.map((t) => (<option key={t} value={t}>{t.replace("-", " ")}</option>))}
                      </select>
                    )}
                    {form.isBundle && (
                      <p className="text-[11px] text-foreground/70 mt-1">Not applicable for bundle sets</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Brand (Optional)</label>
                    <input type="text" value={form.brand} onChange={(e) => updateField("brand", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="e.g. GlowLab" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Status</h4>
                <p className="text-[11px] text-foreground/70 mb-3">Mark this product as on sale or newly added.</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.isSale} onChange={(e) => {
                      const checked = e.target.checked;
                      if (!checked) {
                        setForm((prev) => ({ ...prev, isSale: false, discount: "" }));
                      } else {
                        setForm((prev) => ({ ...prev, isSale: true }));
                      }
                    }} className="accent-accent" />
                    On Sale
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.isNew} onChange={(e) => updateField("isNew", e.target.checked)} className="accent-accent" />
                    New
                  </label>
                </div>
                {form.isNew && (
                  <p className="text-[11px] text-foreground/70 italic">
                    New badge auto-removes after 7 days from date created.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Bundle / Gift Set</h4>
                <p className="text-[11px] text-foreground/70 mb-3">Mark this product as a bundle or gift set.</p>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer mb-3">
                  <input type="checkbox" checked={form.isBundle} onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((prev) => ({
                      ...prev,
                      isBundle: checked,
                      bundleItems: checked ? prev.bundleItems : [],
                      bundlePrice: checked ? prev.bundlePrice : "",
                      price: checked ? "" : prev.price,
                      originalPrice: checked ? "" : prev.originalPrice,
                      stock: checked ? "" : prev.stock,
                      salePrice: checked ? "" : prev.salePrice,
                      discount: checked ? "" : prev.discount,
                      variants: checked ? [] : prev.variants,
                    }));
                    if (!checked) setBundleSearch("");
                  }} className="accent-accent" />
                  Is Bundle Set
                </label>
                {form.isBundle && (
                  <div className="p-4 rounded-xl border border-card-border bg-background space-y-3">
                    <div>
                      <label className="block text-xs text-foreground mb-1">Bundle Price (Optional)</label>
                      <input type="number" min="0" step="0.01" value={form.bundlePrice}
                        onChange={(e) => updateField("bundlePrice", e.target.value)}
                        className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="Leave empty to auto-sum product prices" />
                      {bundleAutoSum > 0 && (
                        <p className="text-xs text-foreground/70 mt-1">
                          {form.bundlePrice
                            ? `Auto-sum: ${formatPrice(bundleAutoSum)} | Override: ${formatPrice(parseFloat(form.bundlePrice) || 0)}`
                            : `Auto-sum: ${formatPrice(bundleAutoSum)}`}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-foreground mb-1">Bundle Stock</label>
                      <div className="text-sm text-foreground/70 px-1">
                        {form.bundleItems.length > 0 ? (
                          <span>{bundleMinStock} <span className="text-[11px]">(minimum of selected products)</span></span>
                        ) : (
                          <span className="text-[11px]">Select products to calculate</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-foreground mb-1">Include Products</label>
                      <input type="text" value={bundleSearch}
                        onChange={(e) => setBundleSearch(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="Type to search products..." />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-card-border rounded-xl p-1">
                      {products
                        .filter((p) => {
                          if (editingId && p.id === editingId) return false;
                          const hasStock = p.variants && p.variants.length > 0
                            ? p.variants.some((v) => v.inStock)
                            : (p.stock ?? 0) > 0;
                          if (!hasStock) return false;
                          if (!bundleSearch) return true;
                          const q = bundleSearch.toLowerCase();
                          return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
                        })
                        .map((p) => {
                          const selected = form.bundleItems.includes(p.id);
                          return (
                            <label key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              selected ? "bg-accent/10" : "hover:bg-primary/5"
                            }`}>
                              <input type="checkbox" checked={selected}
                                onChange={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    bundleItems: selected
                                      ? prev.bundleItems.filter((id) => id !== p.id)
                                      : [...prev.bundleItems, p.id],
                                  }));
                                }}
                                className="accent-accent shrink-0" />
                              <span className="text-sm text-dark flex-1 min-w-0 truncate">{p.name}</span>
                              <span className="text-xs text-foreground shrink-0">{formatPrice(p.price)}</span>
                            </label>
                          );
                        })}
                      {products.filter((p) => editingId && p.id !== editingId).length === 0 && (
                        <p className="text-xs text-foreground/60 px-3 py-4 text-center">No products available</p>
                      )}
                    </div>
                    {form.bundleItems.length > 0 && (
                      <p className="text-xs text-foreground/70">{form.bundleItems.length} product{form.bundleItems.length > 1 ? "s" : ""} selected</p>
                    )}
                    <p className="text-[11px] text-foreground/60">Showing only in-stock products</p>
                  </div>
                )}
              </div>

              <div className={form.isBundle ? "opacity-40 pointer-events-none" : ""}>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Pricing &amp; Stock</h4>
                <p className="text-[11px] text-foreground/70 mb-3">Choose how this product is sold and set its price and stock.</p>

                <div className="flex gap-3 mb-4">
                  <label className={`flex-1 flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.variants.length === 0
                      ? "border-accent bg-accent/5"
                      : "border-card-border bg-background hover:border-accent/40"
                  }`}>
                    <input type="radio" name="productType" className="mt-0.5 accent-accent shrink-0"
                      checked={form.variants.length === 0}
                      onChange={() => setForm(prev => ({ ...prev, variants: [] }))} />
                    <div>
                      <span className="block text-sm font-medium text-dark">Simple product</span>
                      <span className="block text-[11px] text-foreground/70">One price, one stock count</span>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.variants.length > 0
                      ? "border-accent bg-accent/5"
                      : "border-card-border bg-background hover:border-accent/40"
                  }`}>
                    <input type="radio" name="productType" className="mt-0.5 accent-accent shrink-0"
                      checked={form.variants.length > 0}
                      onChange={() => setForm(prev => ({
                        ...prev,
                        variants: prev.variants.length === 0
                          ? [{ id: `v-${Date.now()}`, name: "", inStock: true, stock: "", price: "", originalPrice: "" }]
                          : prev.variants,
                      }))} />
                    <div>
                      <span className="block text-sm font-medium text-dark">Product with options</span>
                      <span className="block text-[11px] text-foreground/70">Different sizes, colors, or flavors</span>
                    </div>
                  </label>
                </div>

                {form.variants.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-foreground mb-1">Selling Price (AUD) *</label>
                      <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="0.00" required={!form.isBundle && form.variants.length === 0} />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground mb-1">Original / Compare-at Price (AUD)</label>
                      <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => updateField("originalPrice", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground mb-1">Quantity in Stock</label>
                      <input type="number" min="0" value={form.stock} onChange={(e) => updateField("stock", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="e.g. 50" />
                    </div>
                    {form.isSale && parseFloat(form.price) > 0 && form.originalPrice && parseFloat(form.originalPrice) > parseFloat(form.price) && (
                      <p className="text-xs text-green-600 font-medium col-span-full mt-1">
                        Discount: {Math.round((1 - parseFloat(form.price) / parseFloat(form.originalPrice)) * 100)}% off
                        &mdash; {formatPrice(parseFloat(form.price))} (was {formatPrice(parseFloat(form.originalPrice))})
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-1.5 items-center px-1">
                      <span className="flex-1 text-[11px] font-medium text-foreground/70">Option Name</span>
                      <span className="w-30 text-center text-[11px] font-medium text-foreground/70">Selling Price (AUD)</span>
                      <span className="w-30 text-center text-[11px] font-medium text-foreground/70">Orig. Price (AUD)</span>
                      <span className="w-20 text-center text-[11px] font-medium text-foreground/70">Stock</span>
                      <span className="w-8.5" />
                    </div>
                    {form.variants.map((v, i) => (
                      <div key={v.id} className="flex gap-1.5 items-center">
                        <input type="text" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-card-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                          placeholder="e.g. 30ml, Rose, Small" />
                        <input type="number" min="0" step="0.01" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)}
                          className="w-30 px-2 py-2 rounded-xl border border-card-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 text-center"
                          placeholder="Price" />
                        <input type="number" min="0" step="0.01" value={v.originalPrice} onChange={(e) => updateVariant(i, "originalPrice", e.target.value)}
                          className="w-30 px-2 py-2 rounded-xl border border-card-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 text-center"
                          placeholder="Orig" />
                        <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)}
                          className="w-20 px-2 py-2 rounded-xl border border-card-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 text-center"
                          placeholder="Qty" />
                        <button type="button" onClick={() => removeVariant(i)} className="px-2.5 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl shrink-0">&times;</button>
                      </div>
                    ))}
                    <div>
                      <button type="button" onClick={addVariant} className="text-xs text-accent hover:underline">+ Add Option</button>
                    </div>
                  </div>
                )}
              </div>
              {form.isBundle && (
                <p className="text-xs text-foreground/70 italic">
                  Pricing is managed through the bundle settings above.
                </p>
              )}

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Description</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-foreground mb-1">Description *</label>
                    <textarea rows={5} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Long-lasting matte lipstick with a creamy formula." required />
                    <div className="text-right text-[11px] text-foreground/70 mt-1">{form.description.length}/2000</div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Product Detail *</label>
                    <textarea rows={5} value={form.detail} onChange={(e) => updateField("detail", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Premium formula crafted with the finest ingredients." required />
                    <div className="text-right text-[11px] text-foreground/70 mt-1">{form.detail.length}/2000</div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Ingredients *</label>
                    <textarea rows={5} value={form.ingredients} onChange={(e) => updateField("ingredients", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Water, Glycerin, Hyaluronic Acid." required />
                    <div className="text-right text-[11px] text-foreground/70 mt-1">{form.ingredients.length}/2000</div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Shipping & Returns (Optional)</label>
                    <textarea rows={5} value={form.shippingReturns} onChange={(e) => updateField("shippingReturns", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Free shipping on orders over $50." />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Images *</h4>
                <p className="text-[11px] text-foreground/70 mb-3">Upload photos (JPG/PNG, max 5MB each). First image is the cover.</p>
                <div className="space-y-2">
                  {form.images.map((img, i) => {
                    const isUploading = uploadingImage === i;
                    return (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <button type="button" disabled={isUploading}
                              onClick={() => fileInputRefs.current[i]?.click()}
                              className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors disabled:opacity-50">
                              {isUploading ? "Uploading..." : "Upload Image"}
                            </button>
                            <input type="text" value={img.name} onChange={(e) => updateImage(i, "name", e.target.value)}
                              className="w-32 px-3 py-1.5 rounded-xl border border-card-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                              placeholder="Image Name *" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-xl">×</button>
                          </div>
                          <input ref={(el) => { fileInputRefs.current[i] = el; }}
                            type="file" accept=".jpg,.jpeg,.png" className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(i, file);
                              e.target.value = "";
                            }} />
                        </div>
                        {img.url && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-primary/10 border border-card-border">
                            <img src={img.url} alt="" className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={addImage} className="text-xs text-accent hover:underline">+ Add another image</button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (editingId ? "Update Product" : "Create Product")}
                </button>
                <button type="button" onClick={cancelForm}
                  className="px-6 py-2.5 bg-primary/10 text-dark rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name, category, brand, variant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-accent text-white border-accent"
              : "bg-card text-foreground border-card-border hover:border-accent/50"
          }`}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      {showFilters && (
        <div className="bg-card rounded-2xl border border-card-border p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-foreground mb-1">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">All Categories</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-foreground mb-1">Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">All Types</option>
                {productTypes.map((t) => (<option key={t} value={t}>{t.replace("-", " ")}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-foreground mb-1">Brand</label>
              <input type="text" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="Any brand" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-foreground mb-1">Availability</label>
              <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value as "all" | "in-stock" | "out-of-stock")}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                <option value="all">All</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-foreground mb-1">Min Price (AUD)</label>
              <input type="number" min="0" step="0.01" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-xs text-foreground mb-1">Max Price (AUD)</label>
              <input type="number" min="0" step="0.01" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="999" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-foreground mb-1">Has Images</label>
                <select value={filterHasImages} onChange={(e) => setFilterHasImages(e.target.value as "all" | "yes" | "no")}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-foreground mb-1">Has Variants</label>
                <select value={filterHasVariants} onChange={(e) => setFilterHasVariants(e.target.value as "all" | "yes" | "no")}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                  <option value="all">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setFilterCategory(""); setFilterType(""); setFilterBrand(""); setFilterAvailability("all"); setFilterMinPrice(""); setFilterMaxPrice(""); setFilterHasImages("all"); setFilterHasVariants("all"); }}
              className="text-xs text-accent hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-dark">Name</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Subcategory</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Form</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Price</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Images</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Variants</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Availability</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-foreground">
                  {search || activeFilterCount > 0 ? "No products match your search or filters." : 'No products yet. Click "+ Add Product" to get started.'}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3 font-medium text-dark"><span className="line-clamp-2">{p.name}</span></td>
                  <td className="px-4 py-3 text-foreground capitalize hidden sm:table-cell">
                    {categoryLabelMap[p.category] || p.category}
                  </td>
                  <td className="px-4 py-3 text-foreground capitalize hidden sm:table-cell">
                    {p.subcategory ? (subcategoryLabelMap[p.subcategory] || p.subcategory) : "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground capitalize hidden lg:table-cell">
                    {p.type.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell">{p.brand}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.isBundle
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {p.isBundle ? "Bundle" : "Single"}
                    </span>
                    {p.isBundle && p.bundleItems && (
                      <span className="block text-[10px] text-foreground/70 mt-0.5">{p.bundleItems.length} items</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-dark">
                    {p.originalPrice && p.originalPrice > p.price ? (
                      <span>
                        <span className="line-through text-foreground/60 mr-1">{formatPrice(p.originalPrice)}</span>
                        <span className="text-accent font-semibold">{formatPrice(p.price)}</span>
                      </span>
                    ) : formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">
                    {p.variants && p.variants.length > 0
                      ? p.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
                      : p.stock ?? 0}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">
                    {p.images?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell">
                    {p.variants ? p.variants.map((v) => v.name).join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {(() => {
                      const hasStock = p.variants && p.variants.length > 0
                        ? p.variants.some((v) => v.inStock)
                        : true;
                      return (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          hasStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${hasStock ? "bg-green-500" : "bg-red-500"}`} />
                          {hasStock ? "In Stock" : "Out of Stock"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-accent hover:text-accent/80 text-xs font-medium"
                      >
                        Edit
                      </button>
                      {deleteConfirm === p.id ? (
                        <span className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-500 hover:text-red-600 text-xs font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-foreground hover:text-dark text-xs"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="text-red-400 hover:text-red-500 text-xs font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
