"use client";

import { ThemeProvider } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  itemId: number;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  quantity: number;
  options: { name: string; price: number }[];
};

type CartCtx = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (itemId: number) => void;
  setQty: (itemId: number, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  ready: boolean;
};

const CartContext = createContext<CartCtx | null>(null);
const KEY = "sinza-cart-v1";

function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, "quantity">, qty = 1) => {
    setLines((prev) => {
      const key = (l: { itemId: number; options: { name: string }[] }) =>
        `${l.itemId}-${l.options.map((o) => o.name).sort().join("|")}`;
      const existing = prev.find((p) => key(p) === key({ ...line, options: line.options }));
      if (existing) {
        return prev.map((p) => (p === existing ? { ...p, quantity: p.quantity + qty } : p));
      }
      return [...prev, { ...line, quantity: qty }];
    });
  }, []);

  const remove = useCallback((itemId: number) => {
    setLines((prev) => prev.filter((p) => p.itemId !== itemId));
  }, []);

  const setQty = useCallback((itemId: number, qty: number) => {
    setLines((prev) =>
      prev
        .map((p) => (p.itemId === itemId ? { ...p, quantity: Math.max(0, qty) } : p))
        .filter((p) => p.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const subtotal = lines.reduce(
      (s, l) => s + (l.price + l.options.reduce((a, o) => a + o.price, 0)) * l.quantity,
      0,
    );
    return {
      lines,
      add,
      remove,
      setQty,
      clear,
      subtotal,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      ready,
    };
  }, [lines, add, remove, setQty, clear, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
