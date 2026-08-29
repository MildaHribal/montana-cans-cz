'use client';

import { useShopUi } from '@/lib/shop-ui';
import { CartDrawer } from './CartDrawer';
import { QuickView } from './QuickView';
import { SearchOverlay } from './SearchOverlay';

/**
 * Mounts the three page-level overlays once, at the layout root.
 *
 * They live here rather than inside the sections that trigger them so that
 * their stacking context is the document — a drawer rendered inside a section
 * that has its own `transform` (the tilt cards, the reveal wrappers) would be
 * clipped to that section instead of covering the viewport.
 */
export function ShopOverlays() {
  const { quickView, closeQuickView, searchOpen, setSearchOpen, openQuickView } = useShopUi();

  return (
    <>
      <CartDrawer />
      <QuickView product={quickView} onClose={closeQuickView} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} onSelect={openQuickView} />
    </>
  );
}
