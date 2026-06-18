"use client";

import { useState } from "react";

interface Promotion {
  id: string;
  code: string;
  discount: number;
  type: string;
  expires: string;
  active: boolean;
}

const initialPromos: Promotion[] = [
  { id: "1", code: "BEAUTY20", discount: 20, type: "Percentage", expires: "2026-07-15", active: true },
  { id: "2", code: "FREESHIP", discount: 100, type: "Free Shipping", expires: "2026-06-30", active: true },
  { id: "3", code: "WELCOME10", discount: 10, type: "Percentage", expires: "2026-08-01", active: false },
];

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState(initialPromos);
  const [showForm, setShowForm] = useState(false);

  const toggleActive = (id: string) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">Promotions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          {showForm ? "Cancel" : "Add Promotion"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => e.preventDefault()} className="bg-card p-6 rounded-2xl border border-card-border mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Code" className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input type="number" placeholder="Discount value" className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <select className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
              <option>Percentage</option>
              <option>Fixed Amount</option>
              <option>Free Shipping</option>
            </select>
            <input type="date" className="px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors">
            Save Promotion
          </button>
        </form>
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
            {promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-primary/5">
                <td className="px-4 py-3 font-mono font-medium text-dark">{promo.code}</td>
                <td className="px-4 py-3 text-foreground hidden sm:table-cell">
                  {promo.type === "Free Shipping" ? "—" : `${promo.discount}%`}
                </td>
                <td className="px-4 py-3 text-foreground hidden sm:table-cell">{promo.type}</td>
                <td className="px-4 py-3 text-foreground hidden md:table-cell">{promo.expires}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${promo.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {promo.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(promo.id)} className="text-accent hover:text-accent/80 text-xs font-medium">
                    {promo.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
