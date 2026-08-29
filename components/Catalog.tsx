'use client';

import { useMemo, useState } from 'react';
import {
  CATEGORIES,
  PRODUCTS,
  SORTS,
  sortProducts,
  type CategorySlug,
  type Product,
  type SortMode,
} from '@/lib/products';
import { useCart } from '@/lib/cart';
import { useShopUi } from '@/lib/shop-ui';
import { ProductCard } from './ProductCard';
import { SectionNumber } from './interactive';
import { StencilText } from './graffiti';

/**
 * The shop proper: category tabs, sort, price bands, stock toggle, paged grid.
 *
 * All filtering is client-side over the in-memory catalogue — there is no API
 * behind this mockup, and doing it here keeps every control instant.
 *
 * The controls are painted, not boxed: the category tabs are blocks of colour
 * and everything under them is plain type. A toolbar of outlined chips competes
 * with the product grid for attention and always loses it something.
 */

type PriceBand = 'all' | 'lt200' | 'mid' | 'gt500';

const BANDS: { id: PriceBand; label: string; test: (p: Product) => boolean }[] = [
  { id: 'all', label: 'Jakákoli', test: () => true },
  { id: 'lt200', label: 'do 200', test: (p) => p.price < 200 },
  { id: 'mid', label: '200–500', test: (p) => p.price >= 200 && p.price <= 500 },
  { id: 'gt500', label: 'nad 500', test: (p) => p.price > 500 },
];

const PAGE = 12;

export function Catalog() {
  const { add, open: openCart } = useCart();
  const { openQuickView } = useShopUi();

  const onAdd = (p: Product) => {
    add(p);
    openCart();
  };

  const [cat, setCat] = useState<CategorySlug | 'vse'>('vse');
  const [sort, setSort] = useState<SortMode>('doporucene');
  const [band, setBand] = useState<PriceBand>('all');
  const [stockOnly, setStockOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const counts = useMemo(() => {
    const m = new Map<string, number>([['vse', PRODUCTS.length]]);
    for (const c of CATEGORIES) {
      m.set(c.slug, PRODUCTS.filter((p) => p.category === c.slug).length);
    }
    return m;
  }, []);

  const filtered = useMemo(() => {
    const bandTest = BANDS.find((b) => b.id === band)?.test ?? (() => true);
    const list = PRODUCTS.filter(
      (p) => (cat === 'vse' || p.category === cat) && bandTest(p) && (!stockOnly || p.inStock),
    );
    return sortProducts(list, sort);
  }, [cat, band, stockOnly, sort]);

  /* Any filter change resets paging — otherwise switching to a 5-item
     category while "shown" is 36 silently hides the Load-more affordance. */
  const reset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setShown(PAGE);
    };

  const visible = filtered.slice(0, shown);
  const clearAll = () => {
    setBand('all');
    setStockOnly(false);
    setCat('vse');
    setShown(PAGE);
  };

  return (
    <section id="katalog" className="content-grid py-24 md:py-32">
      <SectionNumber n="03" label="Celý katalog" className="mb-8" />

      <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* The one stencilled headline on the page. It lives here because the
            catalogue is otherwise the most "e-shop" band — grid, filters, sort —
            and a second stencil anywhere else would turn the effect into a
            typeface. */}
        <h2 className="display-tight display-stack type-slab">
          KRÁM
          <br />
          <StencilText uid="katalog-stencil">OD PODLAHY.</StencilText>
        </h2>
        <p className="max-w-sm text-bone/70">
          Všechno, co vedeme, na jedné hromadě. Filtruj podle kategorie, ceny nebo si nech nahoře jen
          to, co máme fyzicky v Brně.
        </p>
      </div>

      {/* ── CATEGORY TABS — painted blocks ─────────────────────── */}
      <div
        role="tablist"
        aria-label="Kategorie"
        /* Full-bleed scroll rail on phones. `pb` leaves room for the drips —
           the rail scrolls horizontally, which clips vertical overflow, so the
           runs must sit inside the padding. `scroll-pl` is not optional either:
           .rail snaps mandatorily, and without it the snap eats the left
           padding and the first tab lands flush against the screen edge. */
        className="rail -mx-5 gap-x-2 gap-y-7 scroll-pl-5 px-5 pb-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      >
        {[{ slug: 'vse' as const, label: 'Vše' }, ...CATEGORIES].map((c) => {
          const on = cat === c.slug;
          return (
            <span key={c.slug} className="relative flex">
              <button
                role="tab"
                aria-selected={on}
                aria-controls="katalog-vypis"
                type="button"
                onClick={() => reset(setCat)(c.slug as CategorySlug | 'vse')}
                className={`paint-block px-4 py-3 font-display text-2xl leading-none tracking-tightest transition-colors duration-200 md:px-5 md:text-3xl ${
                  on ? 'text-[color:var(--accent-ink)]' : 'bg-wall-raised text-ash hover:text-bone'
                }`}
                style={on ? { background: 'var(--accent)' } : undefined}
              >
                {c.label}
                <sup className="ml-1.5 align-super font-mono text-[0.55rem] tracking-normal opacity-60">
                  {counts.get(c.slug) ?? 0}
                </sup>
              </button>
            </span>
          );
        })}
      </div>

      {/* ── FILTERS — type, not chrome ─────────────────────────── */}
      <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
        <div className="flex items-center gap-3">
          <span className="font-display text-base uppercase tracking-[0.08em] text-ash">Cena</span>
          <div className="flex items-center gap-1">
            {BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => reset(setBand)(b.id)}
                aria-pressed={band === b.id}
                className={`px-2.5 py-1.5 font-display text-xl leading-none tracking-tightest transition-colors ${
                  band === b.id ? 'bg-bone text-ink' : 'text-ash hover:text-bone'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <label className="group flex cursor-pointer select-none items-center gap-2.5">
          <span
            className={`inline-flex size-5 items-center justify-center transition-colors ${
              stockOnly ? '' : 'bg-wall-soft group-hover:bg-wall-edge'
            }`}
            style={stockOnly ? { background: 'var(--accent)' } : undefined}
          >
            {stockOnly && (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M1 6l3.5 3.5L11 2" stroke="var(--accent-ink)" strokeWidth="2.4" fill="none" />
              </svg>
            )}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={stockOnly}
            onChange={(e) => reset(setStockOnly)(e.target.checked)}
          />
          <span className="font-display text-xl leading-none tracking-tightest text-ash transition-colors group-hover:text-bone">
            Jen skladem
          </span>
        </label>

        <div className="ml-auto flex items-center gap-3">
          <label
            htmlFor="catalog-sort"
            className="font-display text-base uppercase tracking-[0.08em] text-ash"
          >
            Řadit
          </label>
          <span className="relative inline-flex items-center">
            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) => reset(setSort)(e.target.value as SortMode)}
              style={{ borderBottom: '3px solid var(--accent)' }}
              className="cursor-pointer appearance-none bg-transparent pb-1.5 pr-6 font-display text-xl leading-none tracking-tightest text-bone"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-wall-deep font-sans">
                  {s.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden
              width="10"
              height="7"
              viewBox="0 0 10 7"
              className="pointer-events-none absolute right-0 text-ash"
            >
              <path d="M0 0l5 6 5-6" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>

      <p
        aria-live="polite"
        className="py-6 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ash"
      >
        {filtered.length === 0
          ? 'Nic nesedí'
          : `Zobrazeno ${visible.length} z ${filtered.length} produktů`}
      </p>

      {/* ── GRID ───────────────────────────────────────────────── */}
      <div id="katalog-vypis" role="tabpanel" aria-label="Výpis produktů">
        {filtered.length === 0 ? (
          <div className="py-10 md:py-16">
            <p className="display-tight display-stack text-5xl md:text-7xl">
              TADY NIC
              <br />
              <span style={{ color: 'var(--accent)' }}>NENÍ.</span>
            </p>
            <p className="mt-6 max-w-sm text-bone/70">
              Zkus povolit filtr ceny nebo vypnout „jen skladem“. Když sháníš něco konkrétního,
              napiš nám a sženeme to.
            </p>
            <button type="button" onClick={clearAll} className="btn-ghost mt-8">
              Zrušit filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} onQuickView={openQuickView} />
            ))}
          </div>
        )}
      </div>

      {shown < filtered.length && (
        <div className="mt-16 flex justify-center">
          <button type="button" onClick={() => setShown((s) => s + PAGE)} className="btn-primary">
            Načíst dalších {Math.min(PAGE, filtered.length - shown)}
            <span className="font-mono text-xs opacity-60">
              {shown}/{filtered.length}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
