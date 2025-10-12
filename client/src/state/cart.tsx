import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/state/auth";

export type CartItem = {
  id: string;
  title?: string | null;
  price?: number | null;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;                 // total quantity
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  // toast
  toast: { visible: boolean; message: string };
  showToast: (message: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

const storageKey = (uid?: string | null) => `nlh_cart_${uid ?? "guest"}`;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  // load cart per-user
  useEffect(() => {
    const raw = localStorage.getItem(storageKey(user?.id));
    setItems(raw ? JSON.parse(raw) : []);
  }, [user?.id, isAuthenticated]);

  // persist
  useEffect(() => {
    localStorage.setItem(storageKey(user?.id), JSON.stringify(items));
  }, [items, user?.id]);

  const count = useMemo(() => items.reduce((a, b) => a + (b.qty || 0), 0), [items]);

  const add = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      const next = [...prev];
      if (idx >= 0) {
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      } else {
        next.push({ ...item, qty });
      }
      return next;
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast({ visible: false, message: "" }), 1400);
  };

  const value = useMemo(() => ({ items, count, add, remove, clear, toast, showToast }), [items, count, toast]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
};
