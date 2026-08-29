'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ProductArt } from '@/components/art/ProductArt';
import { artStage, useOverlayShell } from '@/components/CartDrawer';
import { CATEGORIES, PRODUCTS, formatPrice, type Product } from '@/lib/products';

type Props = {
  open: boolean;
  /** the overlay also opens itself on "/" — parent stays the source of truth */
  onOpenChange: (open: boolean) => void;
  /** fired on Enter / click; the overlay closes itself right after */
  onSelect?: (product: Product) => void;
};

const MAX_RESULTS = 24;

/** "cerna" has to find "černá" — strip the combining marks, then compare. */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Pre-folded haystack per product, built once. */
const INDEX: { product: Product; haystack: string }[] = PRODUCTS.map((product) => ({
  product,
  haystack: fold(
    [
      product.name,
      product.line,
      product.colorName ?? '',
      product.colorCode ?? '',
      CATEGORIES.find((c) => c.slug === product.category)?.label ?? '',
      ...(product.tags ?? []),
    ].join(' '),
  ),
}));

const HINTS = ['černá', 'fat cap', 'blackbook', 'MTN-6080', 'chrome'];

/** Paper chip — the wall is dark, so hints are pasted, not outlined. */
const CHIP =
  'bg-bone px-3 py-1.5 font-display text-sm uppercase leading-none tracking-wide text-ink transition-transform duration-200 hover:-translate-y-0.5';

export function SearchOverlay({ open, onOpenChange, onSelect }: Props) {
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const { panelRef, present, shown } = useOverlayShell(open, close, 240);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const titleId = useId();

  /* "/" anywhere on the page opens search — unless the user is typing. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable ||
          t instanceof HTMLInputElement ||
          t instanceof HTMLTextAreaElement ||
          t instanceof HTMLSelectElement)
      ) {
        return;
      }
      e.preventDefault();
      onOpenChange(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpenChange]);

  /* fresh query each time it opens */
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return [];
    const terms = q.split(/\s+/);
    return INDEX.filter((entry) => terms.every((t) => entry.haystack.includes(t)))
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.product);
  }, [query]);

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      items: results.filter((p) => p.category === cat.slug),
    })).filter((g) => g.items.length > 0);
  }, [results]);

  /* flat order matching what's painted, so arrow keys walk the visible list */
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor, query]);

  const pick = useCallback(
    (product: Product) => {
      close();
      onSelect?.(product);
    },
    [close, onSelect],
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flat.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + flat.length) % flat.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCursor(flat.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flat[cursor];
      if (target) pick(target);
    }
  };

  if (!present) return null;

  const activeId = flat[cursor] ? `${listboxId}-${flat[cursor].id}` : undefined;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Zavřít hledání"
        onClick={close}
        className={`absolute inset-0 w-full cursor-default bg-wall-deep transition-opacity duration-300 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* texture instead of a blur — the wall is stencilled over, not frosted */}
      <span aria-hidden className="halftone pointer-events-none absolute inset-0 text-bone/[0.045]" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute inset-0 flex flex-col outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          shown ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
        }`}
      >
        <div className="shrink-0">
          <div className="content-grid">
            <div className="flex items-center justify-between gap-4 pb-4 pt-6">
              <h2 id={titleId} className="display-tight text-2xl uppercase text-bone">
                Hledám ve skladu
              </h2>
              <button
                type="button"
                onClick={close}
                className="flex items-center gap-2.5 bg-bone px-3 py-2 font-display text-sm uppercase leading-none tracking-wide text-ink transition-transform duration-200 hover:-translate-y-0.5"
              >
                Zavřít
                <kbd className="font-mono text-[0.65rem] not-italic">ESC</kbd>
              </button>
            </div>
          </div>

          {/* the one loud move: a band of paint with the query stencilled in it */}
          <div className="paint-band bg-accent text-accent-ink">
            <div className="content-grid">
              <div className="flex items-center gap-4 py-5 sm:gap-6">
                <SearchIcon />
                <input
                  data-autofocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Barva, kód, produkt…"
                  aria-label="Hledat produkty"
                  aria-controls={listboxId}
                  aria-expanded={flat.length > 0}
                  aria-activedescendant={activeId}
                  autoComplete="off"
                  spellCheck={false}
                  className="display-tight w-full appearance-none bg-transparent text-[2.2rem] uppercase text-accent-ink caret-accent-ink outline-none placeholder:text-[color:color-mix(in_srgb,var(--accent-ink)_38%,transparent)] focus-visible:outline-none sm:text-[3.4rem] [&::-webkit-search-cancel-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          <div className="content-grid">
            <p aria-live="polite" className="py-3.5 text-[0.8rem] text-ash">
              {query.trim() === ''
                ? 'Piš klidně bez háčků — „cerna“ najde černou.'
                : `${flat.length} ${plural(flat.length)} · ↑↓ vybírej, Enter otevře`}
            </p>
          </div>
        </div>

        {/* ── RESULTS ────────────────────────────────────────── */}
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="content-grid pb-16 [&>*]:w-full [&>*]:max-w-[62rem]">
            {query.trim() === '' ? (
              <QuickLinks onPick={setQuery} />
            ) : flat.length === 0 ? (
              <NoResults query={query} onPick={setQuery} />
            ) : (
              <div id={listboxId} role="listbox" aria-label="Výsledky hledání">
                {groups.map((group) => (
                  <section key={group.slug} className="pt-8 first:pt-2">
                    <h3 className="flex items-baseline gap-3 pb-2 font-display text-2xl uppercase leading-none tracking-tightest text-bone">
                      {group.label}
                      <span className="font-mono text-[0.7rem] tracking-widest text-ash">
                        {group.items.length}
                      </span>
                    </h3>
                    <ul>
                      {group.items.map((product) => {
                        const idx = flat.indexOf(product);
                        return (
                          <ResultRow
                            key={product.id}
                            id={`${listboxId}-${product.id}`}
                            product={product}
                            query={query}
                            active={idx === cursor}
                            onHover={() => setCursor(idx)}
                            onPick={() => pick(product)}
                          />
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  id,
  product,
  query,
  active,
  onHover,
  onPick,
}: {
  id: string;
  product: Product;
  query: string;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
}) {
  return (
    <li role="none">
      <button
        id={id}
        role="option"
        aria-selected={active}
        type="button"
        tabIndex={-1}
        onMouseMove={onHover}
        onClick={onPick}
        data-active={active}
        /* selection is a slab of paper slid under the row, not a tint */
        className={`relative flex w-full items-center gap-4 px-3 py-3.5 text-left transition-colors duration-150 sm:gap-5 ${
          active ? 'bg-bone text-ink' : 'text-bone hover:bg-bone/[0.06]'
        }`}
      >
        <span
          className="relative flex size-14 shrink-0 items-center justify-center p-1.5"
          style={artStage(product.hex, active ? 'paper' : 'wall')}
        >
          <ProductArt product={product} className="h-full w-auto" shadow={false} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="accent-guard block truncate font-display text-xl leading-none tracking-tightest">
            <Highlight text={product.name} query={query} active={active} />
          </span>
          <span
            className={`mt-2 block truncate text-[0.78rem] ${active ? 'text-ink/60' : 'text-ash'}`}
          >
            {product.colorCode && (
              <span className="font-mono text-[0.68rem] tracking-wider">{product.colorCode}</span>
            )}
            {product.colorCode ? ' · ' : ''}
            <Highlight text={product.line} query={query} active={active} />
          </span>
        </span>

        {!product.inStock && (
          <span className="hidden shrink-0 font-display text-sm uppercase tracking-wide text-marker sm:block">
            Vyprodáno
          </span>
        )}
        <span className="shrink-0 font-display text-2xl leading-none tracking-tightest">
          {formatPrice(product.price)}
        </span>
      </button>
    </li>
  );
}

/** Marks the matched run — matching is diacritic-insensitive, so the offsets
 *  are computed on the folded string and sliced out of the original. */
function Highlight({
  text,
  query,
  active,
}: {
  text: string;
  query: string;
  active: boolean;
}) {
  const term = fold(query.trim().split(/\s+/)[0] ?? '');
  if (!term) return <>{text}</>;
  const at = fold(text).indexOf(term);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark
        className={`bg-transparent underline decoration-2 underline-offset-[3px] ${
          active ? 'text-ink decoration-ink' : 'text-bone decoration-[color:var(--accent)]'
        }`}
      >
        {text.slice(at, at + term.length)}
      </mark>
      {text.slice(at + term.length)}
    </>
  );
}

function QuickLinks({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="pt-2">
      <ul>
        {CATEGORIES.map((cat) => (
          <li key={cat.slug}>
            <button
              type="button"
              onClick={() => onPick(cat.label)}
              className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-6 py-3 text-left sm:grid-cols-[17rem_minmax(0,1fr)_auto]"
            >
              <span className="display-tight whitespace-nowrap text-[2.2rem] uppercase text-bone transition-colors group-hover:text-accent sm:text-[3rem]">
                {cat.label}
              </span>
              <span className="hidden min-w-0 truncate text-[0.8rem] text-ash sm:block">
                {cat.blurb}
              </span>
              <span
                aria-hidden
                className="font-display text-2xl text-wall-edge transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent"
              >
                →
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-display text-lg uppercase leading-none tracking-wide text-ash">
          Zkus třeba
        </span>
        {HINTS.map((h) => (
          <button key={h} type="button" onClick={() => onPick(h)} className={CHIP}>
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query, onPick }: { query: string; onPick: (q: string) => void }) {
  return (
    <div className="py-10">
      <h3 className="display-tight sprayed text-[clamp(3rem,12vw,7rem)] uppercase text-bone">
        Nic. Nula.
      </h3>
      <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-chalk/70">
        Na „{query.trim()}“ ve skladu nic nemáme. Zkus to bez háčků, podle kódu
        odstínu (MTN-3050) nebo hoď jen kus názvu. Kdyžtak napiš — sháníme i věci
        mimo katalog.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {HINTS.map((h) => (
          <button key={h} type="button" onClick={() => onPick(h)} className={CHIP}>
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}

function plural(n: number): string {
  if (n === 1) return 'výsledek';
  if (n >= 2 && n <= 4) return 'výsledky';
  return 'výsledků';
}

function SearchIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      aria-hidden
      className="hidden shrink-0 text-accent-ink sm:block"
    >
      <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <path d="M15.6 15.6L21 21" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
