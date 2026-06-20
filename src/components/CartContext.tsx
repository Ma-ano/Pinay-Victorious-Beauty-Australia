"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product, ProductVariant } from "@/data/products";
import { getCookie, setCookie } from "@/lib/cookies";

export interface CartItem {
  key: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

function makeKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}-${variantId}` : productId;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_COOKIE = "beauty_store_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = getCookie(CART_COOKIE);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => {
      if (!item.key) {
        return { ...item, key: makeKey(item.product.id) };
      }
      return item;
    });
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    setCookie(CART_COOKIE, JSON.stringify(items), 30);
  } catch {
    // Cookie may exceed size limit — silently ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, variant?: ProductVariant) => {
    const key = makeKey(product.id, variant?.id);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { key, product, quantity: 1, variant }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + (i.variant?.price ?? i.product.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
