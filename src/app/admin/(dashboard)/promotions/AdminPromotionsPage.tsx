"use client";

import { useEffect, useState } from "react";
import { subscribePromotions, savePromotion, deletePromotion } from "@/lib/promotions-store";
import type { Promotion, PromotionData } from "@/lib/promotions-store";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/lib/format";

const emptyForm: PromotionData = {
  code: "",
  discount: 0,
  type: "Percentage",
  startDate: new Date().toISOString().split("T")[0],
  expires: "",
  active: true,
};

export default function AdminPromotionsPage() {
  const { showToast } = useToast();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribePromotions((all) => {
      setPromos(all);
      setLoading(false);
    });
    return unsub;
  }, []);

  function startAdd() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowModal(true);
  }

  function startEdit(p: Promotion) {
    setForm({ code: p.code, discount: p.discount, type: p.type, startDate: p.startDate, expires: p.expires, active: p.active });
    setEditingId(p.id);
    setShowModal(true);
  }

  function cancelForm() {
    setShowModal(false);
    setEditingId(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || form.discount <= 0 || !form.expires) {
      showToast("Code, discount, and expiry date are required", "error");
      return;
    }
    setSaving(true);
    try {
      await savePromotion(editingId, form);
      showToast(editingId ? "Promotion updated" : "Promotion created", "success");
      cancelForm();
    } catch {
      showToast("Failed to save promotion", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePromotion(id);
      showToast("Promotion deleted", "success");
      setDeleteConfirm(null);
    } catch {
      showToast("Failed to delete promotion", "error");
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
          <h1 className="text-2xl font-bold text-dark">Create Voucher Code</h1>
          <p className="text-sm text-foreground mt-1">{promos.length} voucher codes</p>
          <p className="text-[11px] text-foreground/70 mt-1">Create discount codes that customers can enter at checkout. Expired or inactive codes won't work.</p>
        </div>
        <button
          onClick={startAdd}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          + Add Promotion
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={cancelForm}
        >
          <div
            className="bg-card rounded-2xl border border-card-border shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-sm text-dark mb-4">
              {editingId ? "Edit Promotion" : "Add Promotion"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-foreground mb-1">Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="e.g. SUMMER20"
                  />
                  <p className="text-[11px] text-foreground/70 mt-0.5">Customers type this at checkout. Keep it short and easy to remember.</p>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Discount *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.discount || ""}
                    onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="e.g. 20"
                  />
                  <p className="text-[11px] text-foreground/70 mt-0.5">For Percentage, enter the number only (e.g. 20 = 20% off). For Fixed Amount, enter the dollar amount.</p>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                    <option>Free Shipping</option>
                  </select>
                  <p className="text-[11px] text-foreground/70 mt-0.5">Percentage = % off the price. Fixed Amount = $ off. Free Shipping = no delivery fee.</p>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <p className="text-[11px] text-foreground/70 mt-0.5">Promotion becomes active from this date. Defaults to today.</p>
                </div>
                <div>
                  <label className="block text-xs text-foreground mb-1">Expires *</label>
                  <input
                    type="date"
                    value={form.expires}
                    onChange={(e) => setForm({ ...form, expires: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <p className="text-[11px] text-foreground/70 mt-0.5">After this date, the code will stop working.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-accent"
                />
                Active
              </label>
              <p className="text-[11px] text-foreground/70 -mt-2">Uncheck to disable without deleting. Customers won't be able to use this code.</p>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-6 py-2.5 bg-primary/10 text-dark rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-dark">Code</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Expires</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Status</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-foreground">
                  No promotions yet. Click &ldquo;+ Add Promotion&rdquo; to get started.
                </td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3 font-mono font-medium text-dark">{promo.code}</td>
                  <td className="px-4 py-3 text-foreground hidden sm:table-cell">
                    {promo.type === "Free Shipping" ? "—" : promo.type === "Percentage" ? `${promo.discount}%` : formatPrice(promo.discount)}
                  </td>
                  <td className="px-4 py-3 text-foreground hidden sm:table-cell">{promo.type}</td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">{promo.expires}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${promo.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {promo.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(promo)} className="text-accent hover:text-accent/80 text-xs font-medium">
                        Edit
                      </button>
                      {deleteConfirm === promo.id ? (
                        <span className="flex items-center gap-1">
                          <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:text-red-600 text-xs font-medium">
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-foreground hover:text-dark text-xs">
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(promo.id)} className="text-red-400 hover:text-red-500 text-xs font-medium">
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
