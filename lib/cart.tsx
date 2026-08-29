'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PRODUCTS, type Product } from '@/lib/products';

/**
 * Client-side basket for the mockup.
 *
 * Only `{ id, qty }` pairs go to localStorage — lines are re-resolved against
 * `PRODUCTS` on load, so a price edit in the catalogue never gets shadowed by
 * a stale copy in someone's browser, and an id that no longer exists just
 * drops out instead of rendering a broken row.
 */

export type CartLine = { product: Product; qty: number };

const STORAGE_KEY = 'mtn:cart:v1';
const FREE_SHIPPING_THRESHOLD = 1500;
const MAX_QTY = 99;

/** First-time visitors get a demo basket — an empty shop demos badly. */
const SEED: StoredLine[] = [
  { id: 'black-400-mandarine', qty: 2 },
  { id: 'cap-fat-10', qty: 1 },
  { id: 'blackbook-a5', qty: 1 },
];

type StoredLine = { id: string; qty: number };

export type CartApi = {
  items: CartLine[];
  isOpen: boolean;
  /** false until localStorage has been read — guards SSR/client mismatch. */
  hydrated: boolean;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: number;
  subtotal: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
};

const CartContext = createContext<CartApi | null>(null);

/* ── storage, hardened ────────────────────────────────────────────
 * Private mode, a full quota and "cookies blocked" all throw on plain
 * access, so every touch of localStorage is wrapped. Failing to persist
 * must never take the basket down with it.
 * ──────────────────────────────────────────────────────────────── */

function readStored(): StoredLine[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.flatMap((entry): StoredLine[] => {
      if (typeof entry !== 'object' || entry === null) return [];
      const { id, qty } = entry as Partial<StoredLine>;
      if (typeof id !== 'string' || typeof qty !== 'number') return [];
      return [{ id, qty: clampQty(qty) }];
    });
  } catch {
    return null;
  }
}

function writeStored(lines: StoredLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* quota full or storage disabled — the session keeps working in memory */
  }
}

function clampQty(qty: number): number {
  return Math.min(MAX_QTY, Math.max(1, Math.round(qty)));
}

function resolve(stored: StoredLine[]): CartLine[] {
  return stored.flatMap((line): CartLine[] => {
    const product = PRODUCTS.find((p) => p.id === line.id);
    return product ? [{ product, qty: clampQty(line.qty) }] : [];
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  /* Start empty on both sides of the render boundary, fill in after mount —
     reading storage during render would desync the server HTML. */
  useEffect(() => {
    setItems(resolve(readStored() ?? SEED));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStored(items.map(({ product, qty }) => ({ id: product.id, qty })));
  }, [items, hydrated]);

  const add = useCallback((product: Product, qty = 1) => {
    setItems((curr) => {
      const found = curr.find((l) => l.product.id === product.id);
      if (found) {
        return curr.map((l) =>
          l.product.id === product.id ? { ...l, qty: clampQty(l.qty + qty) } : l,
        );
      }
      return [...curr, { product, qty: clampQty(qty) }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((curr) => curr.filter((l) => l.product.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((curr) =>
      qty <= 0
        ? curr.filter((l) => l.product.id !== id)
        : curr.map((l) => (l.product.id === id ? { ...l, qty: clampQty(qty) } : l)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  const value = useMemo<CartApi>(() => {
    const count = items.reduce((n, l) => n + l.qty, 0);
    const subtotal = items.reduce((n, l) => n + l.product.price * l.qty, 0);
    return {
      items,
      isOpen,
      hydrated,
      add,
      remove,
      setQty,
      clear,
      open,
      close,
      toggle,
      count,
      subtotal,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    };
  }, [items, isOpen, hydrated, add, remove, setQty, clear, open, close, toggle]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart() musí být uvnitř <CartProvider>.');
  return ctx;
}
