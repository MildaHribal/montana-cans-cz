'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/products';

/**
 * The two overlays that any part of the page can summon: quick view and search.
 *
 * Kept out of the cart context on purpose — the cart is domain state that
 * persists, this is throwaway view state. Both live at the layout level so a
 * card deep inside the catalogue can open a modal without the sections having
 * to thread callbacks up to a common ancestor.
 */

type ShopUiApi = {
  quickView: Product | null;
  openQuickView: (p: Product) => void;
  closeQuickView: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const Ctx = createContext<ShopUiApi | null>(null);

export function ShopUiProvider({ children }: { children: ReactNode }) {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const openQuickView = useCallback((p: Product) => {
    setSearchOpen(false);
    setQuickView(p);
  }, []);
  const closeQuickView = useCallback(() => setQuickView(null), []);

  const value = useMemo<ShopUiApi>(
    () => ({ quickView, openQuickView, closeQuickView, searchOpen, setSearchOpen }),
    [quickView, openQuickView, closeQuickView, searchOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShopUi(): ShopUiApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShopUi() musí být uvnitř <ShopUiProvider>.');
  return ctx;
}
