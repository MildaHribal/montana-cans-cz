'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ProductArt } from '@/components/art/ProductArt';
import { useCart } from '@/lib/cart';
import { formatPrice, type Product } from '@/lib/products';

/* ──────────────────────────────────────────────────────────────────
 * Shared overlay plumbing.
 *
 * Lives here rather than in its own module because all three overlays
 * (drawer, quick view, search) need the exact same four behaviours and
 * splitting them apart tends to let one copy drift out of sync.
 * ──────────────────────────────────────────────────────────────── */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* Scroll lock is refcounted — search can sit under quick view, and the
   inner one closing must not hand scrolling back to the page. */
let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ > 0) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks > 0) return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export type OverlayShell = {
  /** put on the panel — the focus trap works off its subtree */
  panelRef: React.RefObject<HTMLDivElement | null>;
  /** kept mounted through the exit transition */
  present: boolean;
  /** flipped a frame after mount so CSS has something to transition from */
  shown: boolean;
};

/**
 * ESC to close, focus trapped inside `panelRef`, focus restored to whatever
 * opened it, body scroll locked, plus enter/exit flags for the animation.
 */
export function useOverlayShell(
  open: boolean,
  onClose: () => void,
  exitMs = 260,
): OverlayShell {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const [present, setPresent] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      if (prefersReducedMotion()) {
        setShown(true);
        return;
      }
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = window.setTimeout(() => setPresent(false), prefersReducedMotion() ? 0 : exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);

  useEffect(() => {
    if (!open) return;

    restoreTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll();

    const focusFirst = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        panel.querySelector<HTMLElement>('[data-autofocus]:not([disabled])') ??
        panel.querySelector<HTMLElement>(FOCUSABLE) ??
        panel;
      /* preventScroll — on a phone the quick view's CTA sits below the fold and
         focusing it would scroll the sheet past its own artwork on open. */
      target.focus({ preventScroll: true });
    }, 20);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const stops = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (stops.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      const outside = !(active instanceof Node) || !panel.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      window.clearTimeout(focusFirst);
      unlockScroll();
      restoreTo.current?.focus();
    };
  }, [open]);

  return { panelRef, present, shown };
}

/**
 * Paint puddle behind a product render. Two tones because the artwork sits on
 * paper in the cart and quick view, but on the wall in search results.
 */
export function artStage(hex: string, tone: 'paper' | 'wall' = 'paper'): React.CSSProperties {
  return tone === 'paper'
    ? {
        background: `radial-gradient(115% 95% at 50% 118%, ${hex}66, transparent 66%), color-mix(in srgb, var(--ink) 8%, var(--bone))`,
      }
    : {
        background: `radial-gradient(115% 95% at 50% 120%, ${hex}70, transparent 68%), var(--wall-deep)`,
      };
}

/**
 * Torn paper edge. Sits just outside the drawer's left edge so the sheet reads
 * as ripped off a roll rather than as a panel with a border. Mask carries the
 * shape only; the colour stays on the element so it tracks `--bone`.
 */
const TORN_EDGE: React.CSSProperties = {
  maskImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='48'%3E%3Cpath d='M14 0 14 48 2 44 9 38 1 32 7 26 0 20 8 14 2 8 10 4Z' fill='%23000'/%3E%3C/svg%3E\")",
  WebkitMaskImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='48'%3E%3Cpath d='M14 0 14 48 2 44 9 38 1 32 7 26 0 20 8 14 2 8 10 4Z' fill='%23000'/%3E%3C/svg%3E\")",
  maskSize: '14px 48px',
  WebkitMaskSize: '14px 48px',
  maskRepeat: 'repeat-y',
  WebkitMaskRepeat: 'repeat-y',
};

/* ──────────────────────────────────────────────────────────────────
 * CartDrawer — a poster taped to the right-hand edge of the wall.
 * ──────────────────────────────────────────────────────────────── */

export function CartDrawer() {
  const cart = useCart();
  const { isOpen, close, items, subtotal, count, amountToFreeShipping, freeShippingThreshold } =
    cart;
  const { panelRef, present, shown } = useOverlayShell(isOpen, close, 320);
  const titleId = useId();

  if (!present) return null;

  const progress = Math.min(1, subtotal / freeShippingThreshold);

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden" aria-hidden={!isOpen}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Zavřít košík"
        onClick={close}
        className={`absolute inset-0 w-full cursor-default bg-wall-deep/80 transition-opacity duration-300 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-full flex-col bg-bone text-ink outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-[27rem] ${
          shown ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <span aria-hidden className="absolute inset-y-0 -left-[13px] w-[14px] bg-bone" style={TORN_EDGE} />
        {/* the tape that holds the sheet to the wall */}
        <span
          aria-hidden
          className="tape-strip absolute -left-8 top-16 h-7 w-32 -rotate-[7deg]"
        />

        {/* ── HEADER ─────────────────────────────────────────── */}
        <header className="relative shrink-0 px-6 pb-5 pt-7 sm:px-8">
          <button
            type="button"
            onClick={close}
            aria-label="Zavřít košík"
            className="absolute right-6 top-7 inline-flex size-11 items-center justify-center bg-ink text-bone transition-transform duration-200 hover:-translate-y-0.5 sm:right-8"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <h2 id={titleId} className="display-tight text-[3.6rem] uppercase">
            Košík
          </h2>
          <span className="stamp mt-4">
            {count} {count === 1 ? 'kus' : count >= 2 && count <= 4 ? 'kusy' : 'kusů'}
          </span>
        </header>

        {/* ── LINES ──────────────────────────────────────────── */}
        {items.length === 0 ? (
          <EmptyState onClose={close} />
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 sm:px-8">
            {items.map((line) => (
              <CartRow key={line.product.id} product={line.product} qty={line.qty} />
            ))}
          </ul>
        )}

        {/* ── FOOTER ─────────────────────────────────────────── */}
        {items.length > 0 && (
          <footer
            className="shrink-0 bg-ink px-6 pb-6 pt-7 text-bone sm:px-8"
            style={{ clipPath: 'polygon(0 7px, 100% 0, 100% 100%, 0 100%)' }}
          >
            <div className="mb-5">
              <p aria-live="polite" className="text-[0.78rem] leading-snug text-chalk">
                {amountToFreeShipping > 0 ? (
                  <>
                    Do dopravy zdarma ti chybí{' '}
                    <span className="font-mono text-bone">{formatPrice(amountToFreeShipping)}</span>
                  </>
                ) : (
                  <span className="font-display text-base uppercase tracking-wide text-bone">
                    Doprava zdarma — máš to
                  </span>
                )}
              </p>
              <div className="mt-2.5 h-[8px] w-full bg-bone/15">
                <div
                  className="h-full transition-[width] duration-500 ease-out"
                  style={{ width: `${progress * 100}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>

            <div className="mb-5 flex items-end justify-between gap-4">
              <div className="pb-1">
                <div className="font-display text-lg uppercase leading-none tracking-wide text-chalk">
                  Mezisoučet
                </div>
                <div className="mt-1.5 text-[0.72rem] text-ash">vč. DPH, bez dopravy</div>
              </div>
              <div className="display-tight text-5xl" aria-live="polite">
                {formatPrice(subtotal)}
              </div>
            </div>

            <button type="button" className="btn-primary w-full justify-center">
              Do pokladny
              <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
                <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </button>

            <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] text-ash">
              <span>Odesíláme do 24 h</span>
              <button
                type="button"
                onClick={cart.clear}
                className="underline underline-offset-4 transition-colors hover:text-marker"
              >
                Vysypat košík
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function CartRow({ product, qty }: { product: Product; qty: number }) {
  const { setQty, remove } = useCart();

  return (
    <li className="flex gap-4 py-6">
      <div
        className="relative flex size-[5.5rem] shrink-0 items-center justify-center p-2"
        style={artStage(product.hex)}
      >
        <ProductArt product={product} className="h-full w-auto" shadow={false} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="display-stack font-display text-xl tracking-tightest">
              {product.name}
            </h3>
            <p className="mt-2 truncate text-[0.78rem] text-ink/55">
              {product.colorCode && (
                <span className="font-mono text-[0.68rem] tracking-wider">
                  {product.colorCode}
                </span>
              )}
              {product.colorCode ? ' · ' : ''}
              {product.colorName ?? product.line}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(product.id)}
            aria-label={`Odebrat ${product.name} z košíku`}
            className="-mr-1 shrink-0 p-1.5 text-ink/40 transition-colors hover:text-marker"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <QtyStepper
            value={qty}
            label={product.name}
            onChange={(n) => setQty(product.id, n)}
            size="sm"
          />
          <div className="text-right">
            {product.oldPrice && (
              <div className="font-mono text-[0.68rem] leading-none text-ink/45 line-through">
                {formatPrice(product.oldPrice * qty)}
              </div>
            )}
            <div
              className={`mt-1 font-display text-2xl leading-none tracking-tightest ${
                product.oldPrice ? 'text-marker' : ''
              }`}
            >
              {formatPrice(product.price * qty)}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Ink-on-paper stepper. Shared with QuickView so the control never drifts. */
export function QtyStepper({
  value,
  onChange,
  label,
  size = 'md',
}: {
  value: number;
  onChange: (qty: number) => void;
  /** product name — goes into the button labels so they aren't just "+" */
  label: string;
  size?: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'size-8' : 'size-11';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="inline-flex items-stretch border-2 border-ink">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={`Ubrat kus — ${label}`}
        className={`${box} inline-flex items-center justify-center text-ink transition-colors hover:bg-ink hover:text-bone`}
      >
        <svg width="11" height="2" viewBox="0 0 10 2" aria-hidden>
          <path d="M0 1h10" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <span
        className={`${box} inline-flex items-center justify-center border-x-2 border-ink font-mono ${text} tabular-nums`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Přidat kus — ${label}`}
        className={`${box} inline-flex items-center justify-center text-ink transition-colors hover:bg-ink hover:text-bone`}
      >
        <svg width="11" height="11" viewBox="0 0 10 10" aria-hidden>
          <path d="M0 5h10M5 0v10" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative flex flex-1 flex-col justify-center px-6 pb-16 sm:px-8">
      <span
        aria-hidden
        className="halftone pointer-events-none absolute left-6 h-24 w-40 -translate-y-[13rem] text-ink/25 sm:left-8"
      />
      <h3 className="display-tight display-stack relative text-[4rem] uppercase">
        Zatím
        <br />
        prázdno
      </h3>
      <p className="relative mt-5 max-w-[22rem] text-[0.95rem] leading-relaxed text-ink/60">
        Nic tu neleží. Vyber odstín na barevné stěně nebo mrkni na bestsellery — ať
        máš čím jet.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="relative mt-8 inline-flex w-fit items-center justify-center border-2 border-ink px-6 py-3.5 font-display text-lg uppercase leading-none transition-colors hover:bg-ink hover:text-bone"
      >
        Zpátky do krámu
      </button>
    </div>
  );
}
