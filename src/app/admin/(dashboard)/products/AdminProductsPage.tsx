"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { productTypes } from "@/data/productTypes";
import { categories } from "@/data/categories";
import type { Product, ProductImage } from "@/data/products";
import { getAllProducts, saveProduct, deleteProduct } from "@/lib/product-store";
import { uploadImage, deleteImage } from "@/lib/storage";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/lib/format";

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
}

function emptyForm(): ProductForm {
  return {
    name: "",
    slug: "",
    category: "",
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
  };
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

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
      if (key === "name" && !prev.slug) {
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
    if (!form.category) { showToast("Category is required", "error"); return; }
    if (!form.type) { showToast("Type is required", "error"); return; }

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

      const effectivePrice = form.variants.length > 0
        ? (parseFloat(form.variants[0].price) || 0)
        : price;
      const salePrice = form.isSale && effectivePrice > 0 ? effectivePrice : undefined;

      const id = await saveProduct(editingId, {
        name,
        slug,
        category: form.category,
        type: form.type,
        brand: form.brand,
        price: effectivePrice,
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
        stock: form.stock !== "" ? parseInt(form.stock) : undefined,
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
            className="bg-card rounded-2xl border border-card-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
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
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Basic Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-foreground mb-1">Product Name *</label>
                    <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="e.g. Radiance Glow Serum" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-foreground mb-1">Slug</label>
                    <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono text-xs"
                      placeholder="Auto-generated from name" />
                    <p className="text-[11px] text-foreground/70 mt-1">URL identifier. Auto-filled from name.</p>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Category *</label>
                    <select value={form.category} onChange={(e) => updateField("category", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" required>
                      <option value="">Select category</option>
                      {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Type *</label>
                    <select value={form.type} onChange={(e) => updateField("type", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" required>
                      <option value="">Select type</option>
                      {productTypes.map((t) => (<option key={t} value={t}>{t.replace("-", " ")}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Brand (Optional)</label>
                    <input type="text" value={form.brand} onChange={(e) => updateField("brand", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
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
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Pricing &amp; Stock</h4>
                <p className="text-[11px] text-foreground/70 mb-3">Choose how this product is sold and set its price and stock.</p>

                <div className="flex gap-3 mb-4">
                  <label className={`flex-1 flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.variants.length === 0
                      ? "border-accent bg-accent/5"
                      : "border-card-border bg-[var(--background)] hover:border-accent/40"
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
                      : "border-card-border bg-[var(--background)] hover:border-accent/40"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="0.00" required />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground mb-1">Original / Compare-at Price (AUD)</label>
                      <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => updateField("originalPrice", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground mb-1">Quantity in Stock</label>
                      <input type="number" min="0" value={form.stock} onChange={(e) => updateField("stock", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
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
                      <span className="w-[120px] text-center text-[11px] font-medium text-foreground/70">Selling Price (AUD)</span>
                      <span className="w-[120px] text-center text-[11px] font-medium text-foreground/70">Orig. Price (AUD)</span>
                      <span className="w-[80px] text-center text-[11px] font-medium text-foreground/70">Stock</span>
                      <span className="w-[34px]" />
                    </div>
                    {form.variants.map((v, i) => (
                      <div key={v.id} className="flex gap-1.5 items-center">
                        <input type="text" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                          placeholder="e.g. 30ml, Rose, Small" />
                        <input type="number" min="0" step="0.01" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)}
                          className="w-[120px] px-2 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 text-center"
                          placeholder="Price" />
                        <input type="number" min="0" step="0.01" value={v.originalPrice} onChange={(e) => updateVariant(i, "originalPrice", e.target.value)}
                          className="w-[120px] px-2 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 text-center"
                          placeholder="Orig" />
                        <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)}
                          className="w-[80px] px-2 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 text-center"
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

              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Description</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-foreground mb-1">Description *</label>
                    <textarea rows={2} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Long-lasting matte lipstick with a creamy formula." required />
                    <div className="text-right text-[11px] text-foreground/70 mt-1">{form.description.length}/2000</div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Product Detail *</label>
                    <textarea rows={2} value={form.detail} onChange={(e) => updateField("detail", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Premium formula crafted with the finest ingredients." required />
                    <div className="text-right text-[11px] text-foreground/70 mt-1">{form.detail.length}/2000</div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Ingredients *</label>
                    <textarea rows={2} value={form.ingredients} onChange={(e) => updateField("ingredients", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
                      placeholder="e.g. Water, Glycerin, Hyaluronic Acid." required />
                    <div className="text-right text-[11px] text-foreground/70 mt-1">{form.ingredients.length}/2000</div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground mb-1">Shipping & Returns (Optional)</label>
                    <textarea rows={2} value={form.shippingReturns} onChange={(e) => updateField("shippingReturns", e.target.value)}
                      maxLength={2000}
                      className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-vertical"
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
                              className="w-32 px-3 py-1.5 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
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

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm mb-4"
      />

      <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-dark">Name</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Brand</th>
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
                <td colSpan={10} className="px-4 py-12 text-center text-foreground">
                  {search ? "No products match your search." : 'No products yet. Click "+ Add Product" to get started.'}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3 font-medium text-dark">{p.name}</td>
                  <td className="px-4 py-3 text-foreground capitalize hidden sm:table-cell">
                    {p.category}
                  </td>
                  <td className="px-4 py-3 text-foreground capitalize hidden lg:table-cell">
                    {p.type.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell">{p.brand}</td>
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
