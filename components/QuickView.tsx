'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { ProductArt } from '@/components/art/ProductArt';
import { QtyStepper, useOverlayShell } from '@/components/CartDrawer';
import { COLORS, type Swatch } from '@/lib/colors';
import { useCart } from '@/lib/cart';
import { formatPrice, type Product } from '@/lib/products';

type Props = {
  /** null = closed. Keyed internally, so switching products resets the form. */
  product: Product | null;
  onClose: () => void;
};

/**
 * A sheet pasted onto the wall: half flat paint with the render on it, half
 * paper with the copy.
 */
export function QuickView({ product, onClose }: Props) {
  const { panelRef, present, shown } = useOverlayShell(product !== null, onClose, 240);
  const titleId = useId();

  /* Keep the last product around through the exit transition so the panel
     doesn't blank out while it's still sliding away. */
  const [shownProduct, setShownProduct] = useState<Product | null>(product);
  useEffect(() => {
    if (product) setShownProduct(product);
  }, [product]);

  if (!present || !shownProduct) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center overflow-hidden sm:items-center sm:p-8"
      aria-hidden={product === null}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Zavřít náhled"
        onClick={onClose}
        className={`absolute inset-0 w-full cursor-default bg-wall-deep/85 transition-opacity duration-300 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full max-w-[64rem] overflow-y-auto overscroll-contain bg-bone text-ink outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:shadow-slab-lg ${
          shown
            ? 'translate-y-0 opacity-100 sm:rotate-[-0.5deg] sm:scale-100'
            : 'translate-y-8 opacity-0 sm:rotate-0 sm:scale-[0.97]'
        }`}
      >
        <QuickViewBody
          key={shownProduct.id}
          product={shownProduct}
          titleId={titleId}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function QuickViewBody({
  product,
  titleId,
  onClose,
}: {
  product: Product;
  titleId: string;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const swatches = useMemo<Swatch[]>(() => {
    const codes = [product.colorCode, ...(product.variants ?? [])].filter(
      (c): c is string => typeof c === 'string',
    );
    const seen = new Set<string>();
    return codes.flatMap((code) => {
      if (seen.has(code)) return [];
      seen.add(code);
      const swatch = COLORS.find((c) => c.code === code);
      return swatch ? [swatch] : [];
    });
  }, [product]);

  const [activeCode, setActiveCode] = useState(swatches[0]?.code ?? '');
  const active = swatches.find((s) => s.code === activeCode);
  const stageHex = active?.hex ?? product.hex;

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [added]);

  const saving = product.oldPrice ? product.oldPrice - product.price : 0;

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {/* Tape over the seam — the sheet is pasted, not rendered. It sits on
          the stage side of the seam and its width is a percentage, because the
          title starts a padding's width to the RIGHT of the seam and the tape
          used to land straight on top of its accents: "BRAŠNA" read
          "BRASNA". */}
      <span
        aria-hidden
        className="tape-strip absolute left-[38%] top-4 z-10 hidden h-7 w-[11%] -rotate-[5deg] md:block"
      />

      {/* ── STAGE — flat paint, dark, so any shade of can reads ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-wall-raised md:aspect-auto md:min-h-[33rem]">
        {/* the puddle: hard-edged, no blur — a blur reads as a web card */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[58%] size-[78%] -translate-x-1/2 -translate-y-1/2 transition-colors duration-300"
          /* hand-cut blob, not a circle — a perfect ellipse reads as a UI badge */
          style={{
            background: stageHex,
            opacity: 0.72,
            borderRadius: '48% 52% 44% 56% / 54% 44% 56% 46%',
          }}
        />
        <span
          aria-hidden
          className="halftone absolute inset-0 text-wall-deep/60 mix-blend-multiply"
        />

        <div className="absolute inset-0 flex items-center justify-center p-10 md:p-14">
          <ProductArt product={product} className="h-full w-auto" />
        </div>

        {product.badge && (
          <span
            className={`absolute left-0 top-7 px-4 py-1.5 font-display text-base uppercase tracking-wide ${
              product.badge === 'SLEVA' ? 'bg-marker text-bone' : 'tape-strip'
            }`}
          >
            {product.badge}
          </span>
        )}

        {active && (
          <span className="stamp absolute bottom-5 left-5">
            <span
              aria-hidden
              className="size-3"
              style={{ background: active.hex }}
            />
            {active.code}
          </span>
        )}
      </div>

      {/* ── DETAIL — paper ─────────────────────────────────────── */}
      <div className="relative flex flex-col p-6 sm:p-9">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít náhled"
          className="absolute right-6 top-6 inline-flex size-11 items-center justify-center bg-ink text-bone transition-transform duration-200 hover:-translate-y-0.5 sm:right-7 sm:top-7"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <h2
          id={titleId}
          className="display-tight display-stack pr-16 text-[2.8rem] uppercase sm:text-[3.4rem]"
        >
          {product.name}
        </h2>
        <p className="mt-3 text-[0.95rem] text-ink/60">{product.line}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Stars rating={product.rating} />
          <span className="text-[0.78rem] text-ink/55">
            {product.rating.toFixed(1).replace('.', ',')} · {product.reviews} hodnocení
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
          <span className={`display-tight text-6xl ${product.oldPrice ? 'text-marker' : ''}`}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="pb-2 font-mono text-sm text-ink/45 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          {saving > 0 && (
            <span className="mb-2 bg-marker px-2 py-1 font-display text-sm uppercase tracking-wide text-bone">
              ušetříš {formatPrice(saving)}
            </span>
          )}
        </div>

        <StockLine inStock={product.inStock} stock={product.stock} />

        {swatches.length > 1 && (
          <fieldset className="mt-7">
            <legend className="font-display text-lg uppercase leading-none tracking-wide">
              Odstín — <span className="text-ink/55">{active?.name ?? '—'}</span>
            </legend>
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              {swatches.map((s) => {
                const isActive = s.code === activeCode;
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setActiveCode(s.code)}
                    aria-pressed={isActive}
                    aria-label={`${s.name} (${s.code})`}
                    title={`${s.name} · ${s.code}`}
                    className={`size-9 rounded-full transition-transform duration-200 hover:scale-110 ${
                      isActive
                        ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-bone'
                        : 'ring-1 ring-ink/20'
                    }`}
                    style={{ background: s.hex }}
                  />
                );
              })}
            </div>
          </fieldset>
        )}

        {/* ── BUY ROW ──────────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} label={product.name} />
          <button
            type="button"
            data-autofocus
            disabled={!product.inStock}
            onClick={() => {
              add(product, qty);
              setAdded(true);
            }}
            className="btn-primary min-w-[13rem] flex-1 justify-center disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {product.inStock ? 'Do košíku' : 'Vyprodáno'}
            {product.inStock && (
              <span className="font-mono text-xs tracking-normal">
                {formatPrice(product.price * qty)}
              </span>
            )}
          </button>
        </div>

        <p aria-live="polite" className="mt-4 min-h-[1.2rem] text-[0.78rem]">
          {added ? (
            <span className="font-display text-base uppercase tracking-wide">
              Hodíme to do košíku ✓ — {qty} ks
            </span>
          ) : (
            <span className="text-ink/55">
              Objednávky do 14:00 posíláme týž den · doprava zdarma od 1 500 Kč
            </span>
          )}
        </p>

        {product.tags && product.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-8">
            {product.tags.map((tag) => (
              <li key={tag} className="stamp">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StockLine({ inStock, stock }: { inStock: boolean; stock?: number }) {
  if (!inStock) {
    return (
      <p className="mt-5 flex items-center gap-2.5 font-display text-lg uppercase leading-none tracking-wide text-marker">
        <span aria-hidden className="size-2.5 rounded-full bg-marker" />
        Došlo — dáme vědět, až naskladníme
      </p>
    );
  }
  const low = typeof stock === 'number' && stock <= 8;
  return (
    <p
      className={`mt-5 flex items-center gap-2.5 font-display text-lg uppercase leading-none tracking-wide ${
        low ? 'text-marker' : 'text-ink/70'
      }`}
    >
      <span
        aria-hidden
        className="size-2.5 rounded-full"
        /* --wash at full strength is unreadable on paper; knocked back with ink */
        style={{
          background: low ? 'var(--marker)' : 'color-mix(in srgb, var(--wash) 68%, var(--ink))',
        }}
      />
      {low ? `Poslední kusy — zbývá ${stock} ks` : 'Skladem · odesíláme do 24 h'}
    </p>
  );
}

function Stars({ rating }: { rating: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        /* hard stop at the fill ratio — half stars without a second path */
        const fill = Math.max(0, Math.min(1, rating - i)) * 100;
        const gid = `${uid}-star-${i}`;
        return (
          <svg key={i} width="15" height="15" viewBox="0 0 14 14">
            <defs>
              <linearGradient id={gid}>
                <stop offset={`${fill}%`} stopColor="var(--ink)" />
                <stop offset={`${fill}%`} stopColor="var(--ink)" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path
              d="M7 0.6l1.9 4.1 4.5.5-3.4 3.1 1 4.4L7 10.5 3 12.7l1-4.4L.6 5.2l4.5-.5z"
              fill={`url(#${gid})`}
            />
          </svg>
        );
      })}
    </span>
  );
}
