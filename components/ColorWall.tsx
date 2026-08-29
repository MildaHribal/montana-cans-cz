'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS, FAMILIES, type Swatch } from '@/lib/colors';
import { PRODUCTS, type Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { useShopUi } from '@/lib/shop-ui';
import { ProductArt } from './art/ProductArt';
import { ProductCard } from './ProductCard';
import { Reveal, SectionNumber } from './interactive';
import { SprayMist } from './graffiti';

/** Crude luminance check for picking readable ink over an arbitrary swatch. */
function textOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#0a090d' : '#f2efe6';
}

/**
 * The signature feature: pick a shade and the whole page adopts it.
 *
 * Selecting a swatch writes `--accent` / `--accent-ink` on <html>, which every
 * other section reads — CTAs, section headings, the add-to-cart square. It also
 * filters the rail underneath to what actually exists in that colour family.
 *
 * Everything around the wall is deliberately thin: one readout line instead of
 * the two panels this used to carry, because the wall is the thing worth
 * looking at and a stats box next to it just splits the attention.
 */
export function ColorWall() {
  const { add, open: openCart } = useCart();
  const { openQuickView } = useShopUi();

  const onAdd = (p: Product) => {
    add(p);
    openCart();
  };

  const [active, setActive] = useState<Swatch | null>(null);
  const [hovered, setHovered] = useState<Swatch | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  /** Hover wins for the readout, selection wins for the page accent. */
  const focused = hovered ?? active;

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.style.setProperty('--accent', active.hex);
      root.style.setProperty('--accent-ink', textOn(active.hex));
    } else {
      root.style.setProperty('--accent', '#84cc16');
      root.style.setProperty('--accent-ink', '#0a090d');
    }
  }, [active]);

  /* Spray-nozzle cursor that tracks the pointer inside the wall. */
  useEffect(() => {
    const wall = wallRef.current;
    const cursor = cursorRef.current;
    if (!wall || !cursor) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = wall.getBoundingClientRect();
        cursor.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px)`;
      });
    };
    const onEnter = () => {
      cursor.style.opacity = '1';
    };
    const onLeave = () => {
      cursor.style.opacity = '0';
    };

    wall.addEventListener('mousemove', onMove);
    wall.addEventListener('mouseenter', onEnter);
    wall.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wall.removeEventListener('mousemove', onMove);
      wall.removeEventListener('mouseenter', onEnter);
      wall.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const grouped = useMemo(() => {
    const out: Record<string, Swatch[]> = {};
    for (const f of FAMILIES) out[f.id] = [];
    for (const c of COLORS) out[c.family].push(c);
    return out;
  }, []);

  const matches = useMemo(() => {
    if (!active) {
      return PRODUCTS.filter((p) => p.badge === 'BESTSELLER' || p.badge === 'TIP').slice(0, 8);
    }
    const exact = PRODUCTS.filter((p) => p.colorCode === active.code);
    const family = PRODUCTS.filter((p) => p.family === active.family && p.colorCode !== active.code);
    return [...exact, ...family].slice(0, 8);
  }, [active]);

  return (
    <section id="stena" className="relative content-grid py-24 md:py-32">

      <div className="relative z-10">
        {/* The selected colour, sprayed on the wall behind the headline —
            painted before the type in DOM order so it stays underneath. */}
        <SprayMist
          uid="wall-mist"
          opacity={0.3}
          className="pointer-events-none absolute -left-44 -top-24 h-[24rem] w-[40rem] max-w-[150%]"
        />
        <SectionNumber n="02" label="Signature feature" className="mb-8" />
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display-tight display-stack type-slab relative">
            BAREVNÁ
            <br />
            <span style={{ color: 'var(--accent)' }}>STĚNA.</span>
          </h2>
          <p className="max-w-md leading-relaxed text-bone/70 md:text-right">
            Klikni na odstín a stránka se pod ním <span className="text-bone">obarví</span>. Pod
            stěnou rovnou ukážeme všechno, co k němu v krámě jede — od plechovek po fixy.
          </p>
        </div>
      </div>

      {/* ── READOUT — one line, no panels ──────────────────────── */}
      <div className="mb-6 flex items-end gap-4 md:gap-6">
        <div
          aria-hidden
          className="relative size-16 shrink-0 transition-colors duration-300 md:size-24"
          style={{
            background: focused?.hex ?? 'transparent',
            boxShadow: focused ? '6px 6px 0 var(--wall-deep)' : 'inset 0 0 0 2px var(--wall-edge)',
          }}
        >
          {!focused && (
            <span className="absolute inset-0 grid place-items-center text-wall-edge">
              <CrosshairBig />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="accent-guard truncate font-display text-3xl leading-none tracking-tightest md:text-5xl">
            {focused?.name ?? 'Vyber si odstín'}
          </div>
          <div className="mt-2 flex items-center gap-3 font-mono text-xs text-ash md:text-sm">
            <span>{focused?.code ?? 'MTN-····'}</span>
            <span className="size-1 rounded-full bg-wall-edge" />
            <span className="uppercase">{focused?.hex ?? '#······'}</span>
            {focused && (
              <span className="hidden md:inline">
                · {FAMILIES.find((f) => f.id === focused.family)?.label}
              </span>
            )}
          </div>
        </div>

        {active && (
          <button
            type="button"
            onClick={() => setActive(null)}
            className="shrink-0 self-center bg-bone px-3 py-2 font-display text-base leading-none tracking-tightest text-ink transition-transform duration-200 hover:-translate-y-0.5 md:px-4 md:text-lg"
          >
            Zrušit filtr ×
          </button>
        )}
      </div>

      {/* Hover changes the readout constantly, so only the actual selection is
          announced — a live region on the readout would narrate the pointer. */}
      <p aria-live="polite" className="sr-only">
        {active ? `Vybraná barva ${active.name}, ${active.code}. Stránka nese tuhle barvu.` : ''}
      </p>

      {/* ── THE WALL — a paint-chip rack ───────────────────────── */}
      <div
        ref={wallRef}
        role="listbox"
        aria-label="Barevná stěna Montana"
        className="relative overflow-hidden bg-wall-raised p-4 shadow-slab md:cursor-none md:p-8"
      >
        {/* mounting rail */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-wall-edge" />

        <div className="space-y-5 md:space-y-6">
          {FAMILIES.map((fam) => (
            <div
              key={fam.id}
              className="grid grid-cols-[4.25rem_1fr] items-center gap-3 md:grid-cols-[9rem_1fr] md:gap-6"
            >
              <div>
                <div className="font-display text-lg leading-none tracking-tightest md:text-3xl">
                  {fam.label}
                </div>
                <div className="mt-1.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash">
                  {grouped[fam.id].length}
                  <span className="hidden md:inline"> odstínů</span>
                </div>
              </div>

              {/* 14 chips per family, edge to edge — the ribbon is the point.
                  7 columns on phones so nothing orphans onto a ragged row. */}
              <div className="grid grid-cols-7 shadow-slab-sm sm:grid-cols-14">
                {grouped[fam.id].map((c) => {
                  const isActive = active?.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      aria-label={`${c.name} (${c.code}, ${c.hex})`}
                      onMouseEnter={() => setHovered(c)}
                      onMouseLeave={() => setHovered((h) => (h?.code === c.code ? null : h))}
                      onFocus={() => setHovered(c)}
                      onBlur={() => setHovered((h) => (h?.code === c.code ? null : h))}
                      onClick={() => setActive((curr) => (curr?.code === c.code ? null : c))}
                      className={`relative aspect-square transition-transform duration-200 ${
                        isActive
                          ? 'z-20 scale-[1.35]'
                          : 'hover:z-10 hover:scale-[1.35] hover:shadow-[0_10px_22px_rgba(0,0,0,0.6)]'
                      }`}
                      style={{
                        background: c.hex,
                        /* The selection ring is a shadow, not an outline: an
                           inline outline would beat the global focus-visible
                           rule and the wall would lose its keyboard ring. */
                        boxShadow: isActive
                          ? '0 0 0 3px #f2efe6, 0 12px 30px rgba(0,0,0,0.75)'
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          ref={cursorRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 hidden opacity-0 transition-opacity duration-200 md:block"
          style={{ willChange: 'transform' }}
        >
          <div
            className="flex size-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 backdrop-blur-sm transition-[background,border-color] duration-200"
            style={{
              background: hovered ? hovered.hex : 'rgba(239,236,228,0.08)',
              borderColor: hovered ? '#f2efe6' : 'rgba(242,239,230,0.4)',
              boxShadow: hovered
                ? `0 8px 40px ${hovered.hex}aa, 0 0 0 1px rgba(0,0,0,0.3)`
                : '0 6px 30px rgba(0,0,0,0.4)',
            }}
          >
            {hovered ? (
              <>
                <span
                  className="max-w-[80%] truncate font-display text-sm leading-none tracking-tightest"
                  style={{ color: textOn(hovered.hex) }}
                >
                  {hovered.name}
                </span>
                <span
                  className="mt-1 font-mono text-[0.5rem] uppercase leading-none tracking-[0.2em]"
                  style={{ color: textOn(hovered.hex), opacity: 0.7 }}
                >
                  {hovered.code}
                </span>
              </>
            ) : (
              <Crosshair className="text-bone/60" />
            )}
          </div>
        </div>
      </div>

      {/* ── MATCHING PRODUCTS ──────────────────────────────────── */}
      <Reveal className="mt-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h3 className="display-tight text-5xl md:text-6xl">
              {active ? 'V TÉ BARVĚ' : 'PRÁVĚ LETÍ'}
            </h3>
            {active && (
              <p className="mt-3 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ash">
                <span className="size-2.5" style={{ background: active.hex }} />
                {active.name} · {active.code}
              </p>
            )}
          </div>
          <a href="#katalog" className="hidden btn-ghost md:inline-flex">
            Celý katalog
          </a>
        </div>

        {matches.length === 0 ? (
          <p className="max-w-md py-10 text-lg text-ash">
            V téhle barvě teď nic skladem nemáme. Mrkni vedle, nebo nám napiš — doobjednáváme každé
            úterý.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} onQuickView={openQuickView} />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}


function CrosshairBig() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M24 4v40M4 24h40" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Crosshair({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
