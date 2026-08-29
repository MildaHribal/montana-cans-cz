'use client';

import { formatPrice, type Product } from '@/lib/products';
import { ProductArt } from './art/ProductArt';

/**
 * Catalogue card — a small pasted poster, not a tile.
 *
 * Presentational on purpose: `onAdd` / `onQuickView` come from whoever owns the
 * cart, so the card also drops into the colour wall without dragging shop state
 * along.
 *
 * What survived the cut: the artwork (which is the product), the name, the
 * price, add-to-cart, quick view. Badges, rating rows, stock pills and variant
 * dots all argued for themselves at the same weight as the product and lost —
 * the only markers left are the two that change a buying decision: a discount
 * and "sold out".
 */

type Props = {
  product: Product;
  onAdd?: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  /** Drops the descriptive line — for dense rails. */
  compact?: boolean;
  className?: string;
};

export function ProductCard({
  product: p,
  onAdd,
  onQuickView,
  compact = false,
  className = '',
}: Props) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const low = p.inStock && typeof p.stock === 'number' && p.stock <= 8;

  return (
    <article className={`group relative flex flex-col ${className}`}>
      {/* ── PASTED SHEET ───────────────────────────────────────── */}
      <div className="relative">
        {/* Hard offset shadow as a real element: clip-path on the sheet would
            eat a box-shadow, and the shadow has to keep the same torn
            silhouette. It stays put while the sheet lifts on hover. */}
        <div
          aria-hidden
          className="paint-block absolute inset-0 translate-x-[5px] translate-y-[5px] bg-wall-deep"
        />

        <div className="paint-block relative aspect-[4/5] overflow-hidden bg-wall-raised transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1 group-focus-within:-translate-x-1 group-focus-within:-translate-y-1">
          {/* Neutral lift first, and it is not optional: a near-black can on a
              near-black sheet is invisible, and tinting the stage with the
              product's own colour does nothing for the black/grey/chrome half
              of the catalogue. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 74% 58% at 50% 44%, rgba(242,239,230,0.13), transparent 70%)',
            }}
          />
          {/* Paint bloom in the product's colour, on top of the lift. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle at 50% 62%, ${p.hex}3d, transparent 66%)` }}
          />
          <div aria-hidden className="absolute inset-x-8 bottom-[13%] h-px bg-bone/10" />

          <div className="absolute inset-0 p-5 pb-[13%] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.06]">
            <ProductArt product={p} className="h-full w-full" />
          </div>

          {p.colorCode && (
            <span className="absolute bottom-2 right-2.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-bone/35">
              {p.colorCode}
            </span>
          )}

          {discount > 0 && (
            <span
              aria-hidden
              className="paint-block absolute -left-1 top-3 -rotate-2 bg-marker px-2.5 py-1 font-display text-base leading-none tracking-tightest text-bone"
            >
              −{discount}&nbsp;%
            </span>
          )}

          {!p.inStock && (
            <>
              <div aria-hidden className="absolute inset-0 bg-wall-deep/65 backdrop-grayscale" />
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-6 bg-bone py-1.5 text-center font-display text-lg tracking-tightest text-ink">
                Vyprodáno
              </span>
            </>
          )}

          {/* Hover affordance, but reachable: it shows on keyboard focus too. */}
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(p)}
              aria-label={`Rychlý náhled: ${p.name}`}
              className="stamp absolute bottom-2 left-2 translate-y-1 opacity-0 transition-all duration-300 hover:bg-bone hover:text-ink focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
            >
              Náhled
            </button>
          )}
        </div>
      </div>

      {/* ── LABEL ──────────────────────────────────────────────── */}
      <div className="mt-4 min-w-0">
        {/* accent-guard: truncate clips overflow, and a 0.9 line-height box is
            shorter than the glyphs at BOTH ends — the descenders on ů/j/p and,
            more visibly, the kroužek on Ů/ů above the cap line. */}
        <h3 className="accent-guard truncate font-display text-xl leading-[0.9] tracking-tightest md:text-2xl">
          {p.name}
        </h3>
        {!compact && <p className="mt-1.5 truncate text-[0.82rem] text-ash">{p.line}</p>}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0 leading-none">
          {/* Fixed slot so the price baselines — and the add squares next to
              them — line up across a grid row whether or not the card carries
              a struck price or a low-stock warning. */}
          <div className="h-4">
            {p.oldPrice ? (
              <span className="font-mono text-[0.68rem] text-ash line-through">
                {formatPrice(p.oldPrice)}
              </span>
            ) : low ? (
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-marker">
                Poslední {p.stock} ks
              </span>
            ) : null}
          </div>
          <div
            className={`mt-1.5 font-display text-2xl tracking-tightest md:text-[1.7rem] ${
              p.oldPrice ? 'text-marker' : ''
            }`}
          >
            {formatPrice(p.price)}
          </div>
        </div>

        {onAdd && (
          <button
            type="button"
            disabled={!p.inStock}
            onClick={() => onAdd(p)}
            aria-label={p.inStock ? `Přidat do košíku: ${p.name}` : `${p.name} — vyprodáno`}
            title={p.inStock ? 'Do košíku' : 'Vyprodáno'}
            className="grid size-11 shrink-0 place-items-center bg-[color:var(--accent)] text-[color:var(--accent-ink)] shadow-[4px_4px_0_#0a090d] transition-transform duration-200 ease-out enabled:hover:-translate-x-0.5 enabled:hover:-translate-y-0.5 enabled:active:translate-x-1 enabled:active:translate-y-1 disabled:cursor-not-allowed disabled:bg-wall-soft disabled:text-ash disabled:shadow-none"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              {p.inStock ? (
                <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="2.4" fill="none" />
              ) : (
                <path d="M3 9h12" stroke="currentColor" strokeWidth="2.4" fill="none" />
              )}
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}
