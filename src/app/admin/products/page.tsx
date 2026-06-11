"use client";

import { useState } from "react";
import { products as initialProducts } from "@/data/products";
import { productTypes } from "@/data/productTypes";
import { brands } from "@/data/brands";
import type { Product } from "@/data/products";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formType, setFormType] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");

  function startEdit(product: Product) {
    setEditingId(product.id);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormType(product.type);
    setFormBrand(product.brand);
    setFormPrice(product.price.toString());
    setFormOriginalPrice(product.originalPrice ? product.originalPrice.toString() : "");
    setFormDescription(product.description);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormCategory("");
    setFormType("");
    setFormBrand("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormDescription("");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName || !formCategory || !formType || !formBrand || !formPrice) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formName,
              category: formCategory,
              type: formType,
              brand: formBrand,
              price: parseFloat(formPrice),
              originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
              description: formDescription,
            }
          : p
      )
    );
    cancelForm();
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">Products</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setProducts([...initialProducts])}
            className="px-4 py-2 bg-primary/10 text-dark rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-2xl border border-card-border mb-6 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-sm text-dark">{editingId ? "Edit Product" : "Add Product"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Product name" value={formName} onChange={(e) => setFormName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input type="text" placeholder="Category" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <select value={formType} onChange={(e) => setFormType(e.target.value)} className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="">Select type</option>
              {productTypes.map((t) => <option key={t} value={t}>{t.replace("-", " ")}</option>)}
            </select>
            <select value={formBrand} onChange={(e) => setFormBrand(e.target.value)} className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option value="">Select brand</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Price" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input type="number" step="0.01" placeholder="Original price (optional)" value={formOriginalPrice} onChange={(e) => setFormOriginalPrice(e.target.value)} className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <textarea rows={3} placeholder="Description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none" />
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors">Save Changes</button>
            <button type="button" onClick={cancelForm} className="px-6 py-2.5 bg-primary/10 text-dark rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">Cancel</button>
          </div>
        </form>
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
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Rating</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Variants</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-primary/5">
                <td className="px-4 py-3 font-medium text-dark">{p.name}</td>
                <td className="px-4 py-3 text-foreground capitalize hidden sm:table-cell">{p.category}</td>
                <td className="px-4 py-3 text-foreground capitalize hidden lg:table-cell">{p.type.replace("-", " ")}</td>
                <td className="px-4 py-3 text-foreground hidden lg:table-cell">{p.brand}</td>
                <td className="px-4 py-3 text-dark">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-foreground hidden md:table-cell">{p.rating}</td>
                <td className="px-4 py-3 text-foreground hidden lg:table-cell">{p.variants ? p.variants.map((v) => v.name).join(", ") : "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(p)} className="text-accent hover:text-accent/80 text-xs font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
