"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { brands } from "@/data/brands";
import { productTypes } from "@/data/productTypes";
import { categories } from "@/data/categories";
import type { Product, ProductImage, ProductVariant } from "@/data/products";
import { getAllProducts, saveProduct, deleteProduct } from "@/lib/product-store";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/components/Toast";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const emptyForm = {
  name: "",
  slug: "",
  category: "",
  type: "",
  brand: "",
  price: "",
  originalPrice: "",
  description: "",
  detail: "",
  shippingReturns: "",
  ingredients: "",
  images: [] as ProductImage[],
  variants: [] as ProductVariant[],
  isSale: false,
  isNew: false,
  discount: "",
};

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
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
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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
    setForm({ ...emptyForm });
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
      description: product.description,
      detail: product.detail || "",
      shippingReturns: product.shippingReturns || "",
      ingredients: product.ingredients || "",
      images: product.images || [],
      variants: product.variants || [],
      isSale: product.isSale || false,
      isNew: product.isNew || false,
      discount: product.discount ? product.discount.toString() : "",
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...prev.images, { url: "", name: "" }] }));
  }

  async function handleImageUpload(index: number, file: File) {
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
      variants: [...prev.variants, { id: `v-${Date.now()}`, name: "", inStock: true }],
    }));
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string | boolean) {
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
    if (!form.name || !form.category || !form.price) {
      showToast("Name, Category, and Price are required", "error");
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug || slugify(form.name);
      const id = await saveProduct(editingId, {
        name: form.name,
        slug,
        category: form.category,
        type: form.type,
        brand: form.brand,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        description: form.description,
        detail: form.detail,
        shippingReturns: form.shippingReturns,
        ingredients: form.ingredients,
        images: form.images.filter((img) => img.url),
        variants: form.variants.filter((v) => v.name),
        isSale: form.isSale,
        isNew: form.isNew,
        discount: form.discount ? parseInt(form.discount) : undefined,
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
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted", "success");
      setDeleteConfirm(null);
    } catch {
      showToast("Failed to delete product", "error");
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
          onClick={cancelForm}
        >
          <div
            className="bg-card rounded-2xl border border-card-border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-dark">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={cancelForm} className="text-foreground hover:text-dark" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-foreground mb-1">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="e.g. Radiance Glow Serum" />
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="auto-generated if empty" />
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => updateField("category", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                    <option value="">Select category</option>
                    {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Type</label>
                  <select value={form.type} onChange={(e) => updateField("type", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                    <option value="">Select type</option>
                    {productTypes.map((t) => (<option key={t} value={t}>{t.replace("-", " ")}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Brand</label>
                  <select value={form.brand} onChange={(e) => updateField("brand", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                    <option value="">Select brand</option>
                    {brands.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Price *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Original Price</label>
                  <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => updateField("originalPrice", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="0.00" />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.isSale} onChange={(e) => updateField("isSale", e.target.checked)} className="accent-accent" />
                    On Sale
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.isNew} onChange={(e) => updateField("isNew", e.target.checked)} className="accent-accent" />
                    New
                  </label>
                  <input type="number" value={form.discount} onChange={(e) => updateField("discount", e.target.value)}
                    className="w-20 px-3 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="%" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-foreground mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                  placeholder="Short product description..." />
              </div>
              <div>
                <label className="block text-xs text-foreground mb-1">Product Detail</label>
                <textarea rows={2} value={form.detail} onChange={(e) => updateField("detail", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                  placeholder="e.g. Premium formula crafted with the finest ingredients..." />
              </div>
              <div>
                <label className="block text-xs text-foreground mb-1">Shipping & Returns</label>
                <textarea rows={2} value={form.shippingReturns} onChange={(e) => updateField("shippingReturns", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                  placeholder="e.g. Free shipping on orders over $50..." />
              </div>
              <div>
                <label className="block text-xs text-foreground mb-1">Ingredients</label>
                <textarea rows={2} value={form.ingredients} onChange={(e) => updateField("ingredients", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                  placeholder="e.g. Water, Glycerin, Hyaluronic Acid..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground font-medium">Images</span>
                  <button type="button" onClick={addImage} className="text-xs text-accent hover:underline">+ Add Image</button>
                </div>
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
                              className="w-28 px-3 py-1.5 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                              placeholder="Name" />
                            <button type="button" onClick={() => removeImage(i)}
                              className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-xl">×</button>
                          </div>
                          <input ref={(el) => { fileInputRefs.current[i] = el; }}
                            type="file" accept="image/*" className="hidden"
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
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground font-medium">Variants</span>
                  <button type="button" onClick={addVariant} className="text-xs text-accent hover:underline">+ Add Variant</button>
                </div>
                <div className="space-y-2">
                  {form.variants.map((v, i) => (
                    <div key={v.id} className="flex gap-2 items-center">
                      <input type="text" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-card-border bg-[var(--background)] text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
                        placeholder="Variant name (e.g. 30ml, Red)" />
                      <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer whitespace-nowrap">
                        <input type="checkbox" checked={v.inStock} onChange={(e) => updateVariant(i, "inStock", e.target.checked)} className="accent-accent" />
                        In stock
                      </label>
                      <button type="button" onClick={() => removeVariant(i)} className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
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
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Images</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Variants</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-foreground">
                  {search ? "No products match your search." : "No products yet. Click \"+ Add Product\" to get started."}
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
                  <td className="px-4 py-3 text-dark">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">
                    {p.images?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell">
                    {p.variants ? p.variants.map((v) => v.name).join(", ") : "—"}
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
